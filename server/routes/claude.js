/**
 * server/routes/claude.js
 * -----------------------------------------------------------------------
 * Anthropic Messages API proxy, with two purpose-built routes on top of
 * a shared low-level helper:
 *
 *   POST /api/claude/enrich-prospects  — takes raw places data
 *     for one sector and returns scored, decision-maker-annotated
 *     Prospect fields. Priority-sector context (rank + expected
 *     decision-maker titles) lives here, server-side, since it's
 *     business logic tied directly to the prompt Claude receives.
 *
 *   POST /api/claude/outreach — drafts a personalized cold outreach
 *     email for a single enriched prospect.
 *
 *   POST /api/claude/messages — generic passthrough, kept for any
 *     future prompt type that doesn't warrant its own route.
 *
 * The API key never leaves this file.
 */
import { Router } from "express";

const router = Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callAnthropic(prompt, maxTokens = 1000) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error("Server is missing ANTHROPIC_API_KEY.");
    err.status = 500;
    throw err;
  }

  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: Math.min(Number(maxTokens) || 1000, 4096),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    const err = new Error(data?.error?.message || `Anthropic API request failed with status ${upstream.status}`);
    err.status = upstream.status;
    throw err;
  }

  const text = data?.content?.[0]?.text;
  if (!text) {
    const err = new Error("Anthropic API returned an empty response.");
    err.status = 502;
    throw err;
  }
  return text;
}

function parseJsonArray(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
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
    const text = await callAnthropic(prompt, maxTokens);
    res.json({ text });
  } catch (err) {
    console.error("Anthropic proxy error:", err);
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
    const raw = await callAnthropic(prompt, 2200);
    const parsed = parseJsonArray(raw);
    res.json({ prospects: parsed });
  } catch (err) {
    console.error("Claude enrich-prospects error:", err);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "Claude returned a response that couldn't be parsed as JSON." });
    }
    res.status(err.status || 502).json({ error: err.message });
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
    const text = await callAnthropic(prompt, 1000);
    res.json({ text });
  } catch (err) {
    console.error("Claude outreach error:", err);
    res.status(err.status || 502).json({ error: err.message });
  }
});

export default router;
