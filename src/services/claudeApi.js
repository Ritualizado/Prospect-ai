/**
 * services/claudeApi.js
 * -----------------------------------------------------------------------
 * All Anthropic API interaction lives here. Two consumer-facing
 * functions — searchProspects and generateOutreach — build their own
 * prompts and call the shared low-level callClaude() helper.
 *
 * ⚠️ SECURITY NOTE: this calls the Anthropic API directly from the
 * browser using a Vite env var (import.meta.env.VITE_ANTHROPIC_API_KEY),
 * which means the API key ships in your client bundle and is visible to
 * anyone who opens devtools. That's acceptable for local development or
 * an internal tool behind auth, but before shipping this publicly you
 * should proxy these calls through a small backend (or an edge function)
 * that holds the key server-side instead. The `anthropic-dangerous-
 * direct-browser-access` header below is what Anthropic requires you to
 * set to acknowledge that trade-off for direct browser calls.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

/**
 * Low-level call to the Claude Messages API with a single user prompt.
 * @param {string} prompt
 * @param {number} [maxTokens=1000]
 * @returns {Promise<string>} the model's text response
 */
export async function callClaude(prompt, maxTokens = 1000) {
  if (!API_KEY) {
    throw new Error(
      "Missing VITE_ANTHROPIC_API_KEY. Add it to your .env file (see .env.example) and restart the dev server."
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const message =
      errBody?.error?.message || `Claude API request failed with status ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) {
    throw new Error("Claude API returned an empty response.");
  }
  return text;
}

/**
 * Ask Claude to generate a batch of realistic prospect leads for a given
 * industry/location/company-size combination.
 *
 * @param {{ industry: string, location: string, companySize: string }} params
 * @returns {Promise<Array<Object>>} parsed prospect objects
 */
export async function searchProspects({ industry, location, companySize }) {
  const sizeHint = companySize === "any" ? "any size" : `${companySize} employees`;

  const prompt = `Generate 6 realistic small business prospects for a lead generation tool.
Industry: ${industry}, Location: ${location}, Size: ${sizeHint}.
Use 519/226 area codes, .ca domains, CAD revenue, realistic Ontario business names.
Return ONLY a JSON array, no markdown, no commentary:
[{"id":"x1","companyName":"","contactName":"","title":"","email":"","phone":"","website":"","industry":"","location":"","employees":"","revenue":"","founded":"","score":0,"tags":[],"linkedin":"","twitter":"","instagram":"","summary":""}]`;

  const raw = await callClaude(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      "Claude returned a response that couldn't be parsed as JSON. Try searching again."
    );
  }
}

/**
 * Ask Claude to draft a short, personalized cold outreach email for a
 * single prospect, tailored by which campaign context it came from.
 *
 * @param {Object} prospect
 * @param {"adjuster"|"restoration"|"general"} outreachContext
 * @returns {Promise<string>} subject line on the first line, body after
 */
export async function generateOutreach(prospect, outreachContext = "general") {
  const hint =
    outreachContext === "adjuster"
      ? "The sender's client is looking to build business relationships with insurance adjusters and claims professionals who can refer restoration and repair work."
      : outreachContext === "restoration"
      ? "The sender's client is looking to build business relationships with restoration contractors who need reliable adjuster referrals."
      : "The sender is a local business development professional in Chatham-Kent looking to build a general business relationship.";

  const prompt = `Write a short personalized cold outreach email. Concise, warm, professional — no generic filler.
${hint}
Prospect: ${prospect.companyName} (${prospect.industry}), ${prospect.location}
Contact: ${prospect.contactName}, ${prospect.title}
Size: ${prospect.employees} employees | Revenue: ${prospect.revenue}
Context: ${prospect.summary}
Return subject line on first line, then body. Plain text only.`;

  return callClaude(prompt);
}
