/**
 * server/routes/claude.js
 * -----------------------------------------------------------------------
 * AI enrichment/outreach routes, now backed by Google Gemini
 * (`@google/genai`) instead of the Anthropic Messages API — same route
 * paths and same response shapes, so nothing on the frontend needs to
 * change.
 *
 * NOTE ON IMPORT SYNTAX: this project runs as native ES Modules
 * (`"type": "module"` in package.json), so `require('@google/genai')`
 * isn't available here — `require` is a CommonJS-only global and
 * doesn't exist in an ESM file. The `import { GoogleGenAI } from
 * "@google/genai"` below is the ESM equivalent and behaves identically.
 *
 *   POST /api/claude/enrich-prospects  — takes raw places data for one
 *     sector and returns scored, decision-maker-annotated Prospect
 *     fields. Priority-sector context (rank + expected decision-maker
 *     titles) lives here, server-side, since it's business logic tied
 *     directly to the prompt Gemini receives.
 *
 *   POST /api/claude/outreach — drafts a personalized cold outreach
 *     email for a single enriched prospect.
 *
 *   POST /api/claude/messages — generic passthrough, kept for any
 *     future prompt type that doesn't warrant its own route.
 *
 * The route paths keep their original "/api/claude/*" prefix
 * deliberately, even though the underlying provider is now Gemini, so
 * src/services/api/anthropicClient.js doesn't need to change either.
 * The API key never leaves this file.
 */
import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const MODEL = "gemini-3.6-flash";

let genAI = null;
function getClient() {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("Server is missing GEMINI_API_KEY.");
    err.status = 500;
    throw err;
  }
  genAI = new GoogleGenAI({ apiKey });
  return genAI;
}

/**
 * Low-level Gemini call.
 * @param {string} promptText
 * @param {{ maxOutputTokens?: number, json?: boolean }} [options]
 * @returns {Promise<string>} the model's text response
 */
async function callGemini(promptText, { maxOutputTokens = 1000, json = false } = {}) {
  const ai = getClient();

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: promptText,
      config: {
        maxOutputTokens,
        // Enforces the model return raw JSON (no markdown fences/prose)
        // when the caller expects a structured payload.
        ...(json ? { responseMimeType: "application/json" } : {}),
      },
    });
  } catch (err) {
    const wrapped = new Error(err?.message || "Gemini API request failed.");
    wrapped.status = err?.status || 502;
    throw wrapped;
  }

  const text = response?.text;
  if (!text) {
    const err = new Error("Gemini API returned an empty response.");
    err.status = 502;
    throw err;
  }
  return text;
}

/**
 * POST /api/claude/messages
 * Generic passthrough: { prompt, maxTokens } -> { text }
 */
router.post("/messages", async (req, res) => {
  const { prompt, maxTokens = 1000 } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Request body must include a string `prompt`." });
  }
  try {
    const text = await callGemini(prompt, { maxOutputTokens: Math.min(Number(maxTokens) || 1000, 4096) });
    res.json({ text });
  } catch (err) {
    console.error("Gemini proxy error:", err);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * POST /api/claude/enrich-prospects
 * Body: { places: [{name,address,phone,website,rating,userRatingsTotal}],
 *         sector: string, priorityRank: number, decisionMakerTitles: string[],
 *         location: string, companySize: string }
 * Returns: { prospects: [...] } — one enriched object per input place,
 * same order, with the raw place fields echoed back untouched.
 *
 * Unlike /messages and /outreach, this route calls the SDK directly
 * (rather than going through callGemini) and wraps generation + text
 * extraction + markdown cleanup + JSON.parse in a single try/catch, so
 * any failure at any of those steps is caught, logged in full server-
 * side, and surfaced to the client with the real error message instead
 * of a generic failure.
 */
router.post("/enrich-prospects", async (req, res) => {
  const { places, sector, priorityRank, decisionMakerTitles = [], location, companySize } = req.body || {};

  if (!Array.isArray(places) || places.length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty `places` array." });
  }
  if (!sector) {
    return res.status(400).json({ error: "Request body must include `sector`." });
  }

  const sizeHint = !companySize || companySize === "any" ? "unspecified" : companySize;
  const titleHint = decisionMakerTitles.length
    ? decisionMakerTitles.join(", ")
    : "an appropriate owner/manager-level role";

  const businessList = places
    .map(
      (b, i) =>
        `${i + 1}. name: ${b.name} | address: ${b.address || "unknown"} | phone: ${
          b.phone || "unknown"
        } | website: ${b.website || "unknown"} | rating: ${b.rating ?? "n/a"} (${b.userRatingsTotal ?? 0} reviews)`
    )
    .join("\n");

  const prompt = `You are enriching real local business listings into sales-ready B2B prospect profiles for a lead generation tool targeting the "${sector}" sector, which is priority rank ${priorityRank ?? "unranked"} of 17 (1 = highest priority for outreach).
Location: ${location || "unspecified"}. Target company size: ${sizeHint}.

Likely decision-maker roles at businesses in this sector: ${titleHint}.

Real businesses (do NOT change name, address, phone, or website — echo them back exactly):
${businessList}

For each business, add:
- "contactName": pick the single most likely decision-maker title from the list above (or a close equivalent) as a role placeholder, since no named contact is available — never invent a specific person's name
- "title": the same role as contactName
- "employees": an ESTIMATED range like "1-10", "10-25", "25-50", "50-200" based on rating volume/business type
- "revenue": an ESTIMATED CAD figure like "$1.2M CAD", clearly a rough estimate
- "founded": "Unknown" unless you have real reason to believe otherwise
- "score": a 0-100 lead score. Weight it favorably for lower (better) priority ranks — a rank-1 sector business should score higher than an equally-reviewed rank-17 sector business, all else equal — combined with review volume, rating, and fit for the target company size
- "tags": 2-4 short descriptive tags
- "summary": 1-2 sentence outreach-relevant summary of why this business is a good prospect, referencing the sector's priority where relevant
- "linkedin", "twitter", "instagram": empty strings (not available from this data source)

Return ONLY a JSON array, no markdown, no commentary, one object per business, in the same order, with this exact shape:
[{"companyName":"","contactName":"","title":"","email":"","phone":"","website":"","industry":"${sector}","location":"","employees":"","revenue":"","founded":"","score":0,"tags":[],"linkedin":"","twitter":"","instagram":"","summary":""}]
Leave "email" as an empty string — it is not available from this data source, do not invent one.`;

  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        // Raised from an earlier, tighter cap: gemini-3.6-flash's internal
        // "thinking" tokens count against maxOutputTokens even in JSON
        // mode, and enriching up to 8 businesses' worth of fields can get
        // silently truncated (empty response.text) if this is too low.
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      const finishReason = response.candidates?.[0]?.finishReason ?? "unknown";
      throw new Error(
        `Gemini returned no text (finishReason: ${finishReason}). If this is MAX_TOKENS, raise maxOutputTokens further.`
      );
    }

    const cleanText = response.text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .trim();

    const prospects = JSON.parse(cleanText);

    if (!Array.isArray(prospects)) {
      throw new Error("Gemini's JSON response was not an array of prospects.");
    }

    res.json({ prospects });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/claude/outreach
 * Body: { prospect: Prospect, outreachContext: "adjuster"|"restoration"|"general" }
 * Returns: { text } — subject line on the first line, body after.
 */
router.post("/outreach", async (req, res) => {
  const { prospect, outreachContext = "general" } = req.body || {};
  if (!prospect || !prospect.companyName) {
    return res.status(400).json({ error: "Request body must include a `prospect` with at least a companyName." });
  }

  const hint =
    outreachContext === "adjuster"
      ? "The sender's client is looking to build business relationships with insurance adjusters and claims professionals who can refer restoration and repair work."
      : outreachContext === "restoration"
      ? "The sender's client is looking to build business relationships with restoration contractors who need reliable adjuster referrals."
      : "The sender is a local business development professional looking to build a general business relationship.";

  const prompt = `Write a short personalized cold outreach email. Concise, warm, professional — no generic filler.
${hint}
Prospect: ${prospect.companyName} (${prospect.industry}), ${prospect.location}
Contact: ${prospect.contactName}, ${prospect.title}
Size: ${prospect.employees} employees | Revenue: ${prospect.revenue}
Context: ${prospect.summary}
Return subject line on first line, then body. Plain text only.`;

  try {
    const text = await callGemini(prompt, { maxOutputTokens: 1000 });
    res.json({ text });
  } catch (err) {
    console.error("Gemini outreach error:", err);
    res.status(err.status || 502).json({ error: err.message });
  }
});

export default router;
