import { useState, useCallback, useMemo } from "react";

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content[0].text;
}
 
async function fetchProspects({ industry, location, companySize }) {
  const sizeLabel = companySize === "any" ? "any size" : `${companySize} employees`;
  const prompt = `Generate 6 realistic small business prospects for a lead generation tool.
Industry: ${industry}, Location: ${location}, Size: ${sizeLabel}
Use 519/226 area codes, .ca domains, CAD revenue, realistic Ontario names.
Return ONLY a JSON array, no markdown:
[{"id":"x1","companyName":"","contactName":"","title":"","email":"","phone":"","website":"","industry":"","location":"","employees":"","revenue":"","founded":"","score":75,"tags":[],"linkedin":"","twitter":"","instagram":"","summary":""}]`;
  const raw = await callClaude(prompt);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
 
async function generateOutreachEmail(prospect, context) {
  const hint =
    context === "adjuster"
      ? "The sender is building referral relationships with insurance adjusters in SW Ontario."
      : context === "restoration"
      ? "The sender is building preferred-vendor relationships with restoration contractors in SW Ontario."
      : "The sender is a local business development professional in Chatham-Kent.";
  return callClaude(`Write a short personalized cold outreach email. Concise, warm, no buzzwords.
${hint}
Prospect: ${prospect.companyName} (${prospect.industry}), ${prospect.location}
Contact: ${prospect.contactName}, ${prospect.title}
Size: ${prospect.employees} employees | Revenue: ${prospect.revenue}
Context: ${prospect.summary}
Return subject line on first line, then body. Plain text only.`);
}