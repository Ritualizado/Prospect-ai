/**
 * server/routes/places.js
 * -----------------------------------------------------------------------
 * Proxies Google Places API (legacy "Places API" Text Search + Details
 * endpoints, widely available and simple to enable). Used to pull real
 * local businesses for a given industry/location instead of the fully
 * AI-generated prospects the original demo used. Only the fields the
 * app actually needs are passed back to the client — never the raw
 * Google payload or the API key.
 */
import { Router } from "express";

const router = Router();

const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

function requireKey(res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GOOGLE_PLACES_API_KEY." });
    return null;
  }
  return apiKey;
}

/**
 * GET /api/places/search?industry=...&location=...
 * Returns a de-duplicated list of businesses matching the industry near
 * the given location, with basic fields (no contact person/email — the
 * Places API doesn't expose that; Claude enrichment fills the gap).
 */
router.get("/search", async (req, res) => {
  const { industry, location } = req.query;
  if (!industry || !location) {
    return res.status(400).json({ error: "Query params `industry` and `location` are required." });
  }

  const apiKey = requireKey(res);
  if (!apiKey) return;

  const query = `${industry} in ${location}`;
  const url = new URL(TEXT_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return res.status(502).json({ error: data.error_message || `Places API returned status ${data.status}` });
    }

    const results = (data.results || []).slice(0, 8).map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? null,
      businessStatus: place.business_status ?? null,
      types: place.types || [],
    }));

    res.json({ results });
  } catch (err) {
    console.error("Places search proxy error:", err);
    res.status(502).json({ error: "Failed to reach the Google Places API." });
  }
});

/**
 * GET /api/places/details?placeId=...
 * Fetches phone/website/etc. for a single place. Text Search doesn't
 * return these fields, so the client calls this per-result it wants to
 * enrich (kept as a separate, cacheable call rather than bundled into
 * every search to control Places API cost).
 */
router.get("/details", async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ error: "Query param `placeId` is required." });
  }

  const apiKey = requireKey(res);
  if (!apiKey) return;

  const url = new URL(DETAILS_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,formatted_phone_number,website,formatted_address,url,opening_hours"
  );
  url.searchParams.set("key", apiKey);

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();

    if (data.status !== "OK") {
      return res.status(502).json({ error: data.error_message || `Places API returned status ${data.status}` });
    }

    const r = data.result || {};
    res.json({
      name: r.name,
      phone: r.formatted_phone_number || "",
      website: r.website || "",
      address: r.formatted_address || "",
      googleMapsUrl: r.url || "",
    });
  } catch (err) {
    console.error("Places details proxy error:", err);
    res.status(502).json({ error: "Failed to reach the Google Places API." });
  }
});

export default router;
