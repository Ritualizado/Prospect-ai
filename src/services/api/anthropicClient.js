/**
 * services/api/anthropicClient.js
 * -----------------------------------------------------------------------
 * Low-level Claude calls. The API key lives server-side (see
 * server/routes/claude.js) — the browser only ever calls these three
 * backend routes, never Anthropic directly.
 */
import { httpClient } from "./httpClient";

/**
 * Enrich raw places-lookup results into scored Prospect fields.
 * @param {{ places: Array<Object>, sector: string, priorityRank: number,
 *   decisionMakerTitles: string[], location: string, companySize: string }} params
 * @returns {Promise<Array<Object>>} enriched prospect field sets, same order/length as `places`
 */
export async function enrichProspects({ places, sector, priorityRank, decisionMakerTitles, location, companySize }) {
  const data = await httpClient.post("/claude/enrich-prospects", {
    places,
    sector,
    priorityRank,
    decisionMakerTitles,
    location,
    companySize,
  });
  return data.prospects;
}

/**
 * Draft a personalized cold outreach email for a single prospect.
 * @param {Object} prospect
 * @param {"adjuster"|"restoration"|"general"} outreachContext
 * @returns {Promise<string>} subject line on the first line, body after
 */
export async function draftOutreach(prospect, outreachContext = "general") {
  const data = await httpClient.post("/claude/outreach", { prospect, outreachContext });
  return data.text;
}

/**
 * Generic escape hatch for any future prompt that doesn't warrant its
 * own backend route.
 * @param {string} prompt
 * @param {number} [maxTokens=1000]
 * @returns {Promise<string>}
 */
export async function callClaude(prompt, maxTokens = 1000) {
  const data = await httpClient.post("/claude/messages", { prompt, maxTokens });
  return data.text;
}
