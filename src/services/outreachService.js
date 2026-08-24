/**
 * services/outreachService.js
 * -----------------------------------------------------------------------
 * Drafts a short, personalized cold outreach email for a single
 * prospect. Prompt logic now lives server-side (server/routes/claude.js
 * POST /outreach) — this file just calls it via anthropicClient.
 */
import { draftOutreach } from "./api/anthropicClient";

/**
 * @param {Object} prospect
 * @param {"adjuster"|"restoration"|"general"} outreachContext
 * @returns {Promise<string>} subject line on the first line, body after
 */
export async function generateOutreach(prospect, outreachContext = "general") {
  return draftOutreach(prospect, outreachContext);
}
