/**
 * services/outreachService.js
 * -----------------------------------------------------------------------
 * Drafts a short, personalized cold outreach email for a single
 * prospect, tailored by which campaign context it came from. Prompt
 * logic preserved from the original services/claudeApi.js; the
 * transport now goes through the backend proxy (services/api/anthropicClient)
 * instead of calling Anthropic directly from the browser.
 */
import { callClaude } from "./api/anthropicClient";

/**
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
      : "The sender is a local business development professional looking to build a general business relationship.";

  const prompt = `Write a short personalized cold outreach email. Concise, warm, professional — no generic filler.
${hint}
Prospect: ${prospect.companyName} (${prospect.industry}), ${prospect.location}
Contact: ${prospect.contactName}, ${prospect.title}
Size: ${prospect.employees} employees | Revenue: ${prospect.revenue}
Context: ${prospect.summary}
Return subject line on first line, then body. Plain text only.`;

  return callClaude(prompt);
}
