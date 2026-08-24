/**
 * server/routes/places.js
 * -----------------------------------------------------------------------
 * Proxies Serper.dev's Places search (https://serper.dev) instead of
 * calling Google's Places API directly. Serper wraps Google's local
 * search results behind a simple, single-call REST API — no separate
 * Details lookup is needed, since it already returns phone/website/
 * rating in one response.
 *
 * The API key never reaches the browser: it's attached server-side via
 * the `X-API-KEY` header and only `SERPER_API_KEY` needs to be set in
 * this server's environment.
 */
import { Router } from "express";

const router = Router();

const SERPER_PLACES_URL = "https://google.serper.dev/places";
const MAX_RESULTS = 8;

function requireKey(res) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing SERPER_API_KEY." });
    return null;
  }
  return apiKey;
}

/** Normalizes one Serper `places` entry into the shape the client expects. */
function normalizePlace(place) {
  return {
    placeId: place.cid || "",
    name: place.title || "",
    address: place.address || "",
    phone: place.phoneNumber || "",
    website: place.website || "",
    rating: place.rating ?? null,
    userRatingsTotal: place.ratingCount ?? null,
  };
}

/**
 * GET /api/places/search?industry=...&location=...
 * Returns up to MAX_RESULTS businesses matching the industry near the
 * given location, via a single Serper.dev Places call.
 */
router.get("/search", async (req, res) => {
  const { industry, location } = req.query;
  if (!industry || !location) {
    return res.status(400).json({ error: "Query params `industry` and `location` are required." });
  }

  const apiKey = requireKey(res);
  if (!apiKey) return;

  try {
    const upstream = await fetch(SERPER_PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({ q: `${industry} in ${location}` }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const message = data?.message || `Serper API returned status ${upstream.status}`;
      return res.status(upstream.status).json({ error: message });
    }

    const results = (data.places || []).slice(0, MAX_RESULTS).map(normalizePlace);
    res.json({ results });
  } catch (err) {
    console.error("Serper places proxy error:", err);
    res.status(502).json({ error: "Failed to reach the Serper Places API." });
  }
});

export default router;
