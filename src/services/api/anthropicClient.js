/**
 * services/api/anthropicClient.js
 * -----------------------------------------------------------------------
 * Low-level Claude call. Replaces the old direct-to-Anthropic browser
 * fetch (which required shipping VITE_ANTHROPIC_API_KEY in the client
 * bundle) with a call to our own backend at POST /api/claude/messages,
 * where the real API key lives server-side (see server/routes/claude.js).
 *
 * @param {string} prompt
 * @param {number} [maxTokens=1000]
 * @returns {Promise<string>} the model's text response
 */
import { httpClient } from "./httpClient";

export async function callClaude(prompt, maxTokens = 1000) {
  const data = await httpClient.post("/claude/messages", { prompt, maxTokens });
  return data.text;
}
