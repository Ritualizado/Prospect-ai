/**
 * server/routes/claude.js
 * -----------------------------------------------------------------------
 * Thin proxy in front of the Anthropic Messages API. The browser sends
 * { prompt, maxTokens }; this route attaches the server-side API key and
 * forwards to Anthropic, returning just the model's text back to the
 * client. Keeping the prompt-building logic on the client (in
 * src/services) and only the secret + transport here keeps this route
 * generic and reusable for future prompt types.
 */
import { Router } from "express";

const router = Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

router.post("/messages", async (req, res) => {
  const { prompt, maxTokens = 1000 } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Request body must include a string `prompt`." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  }

  try {
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
      const message = data?.error?.message || `Anthropic API request failed with status ${upstream.status}`;
      return res.status(upstream.status).json({ error: message });
    }

    const text = data?.content?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "Anthropic API returned an empty response." });
    }

    res.json({ text });
  } catch (err) {
    console.error("Anthropic proxy error:", err);
    res.status(502).json({ error: "Failed to reach the Anthropic API." });
  }
});

export default router;
