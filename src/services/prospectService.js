/**
 * services/prospectService.js
 * -----------------------------------------------------------------------
 * Replaces the original demo's fully-hallucinated `searchProspects`
 * (Claude asked to "generate 6 realistic prospects" from nothing) with a
 * two-stage pipeline:
 *
 *   1. Google Places (services/api/placesClient) finds real local
 *      businesses matching the chosen industry + location — real names,
 *      addresses, phone numbers, websites, ratings.
 *   2. Claude (services/api/anthropicClient) enriches that real data
 *      into the app's Prospect shape: a lead score, tags, an outreach
 *      summary, and estimated firmographics Places doesn't expose
 *      (employee range, revenue range) — explicitly flagged as
 *      estimates rather than presented as fact.
 *
 * This is the "Separation of Concerns" boundary for lead search: UI
 * components never call Places or Claude directly, only this file.
 */
import { searchPlaces, getPlaceDetails } from "./api/placesClient";
import { callClaude } from "./api/anthropicClient";

const MAX_CANDIDATES = 6;

/**
 * @param {{ industry: string, location: string, companySize: string }} params
 * @returns {Promise<Array<Object>>} prospect objects, real contact fields
 *   sourced from Google, AI-derived fields clearly separated
 */
export async function searchProspects({ industry, location, companySize }) {
  const candidates = await searchPlaces({ industry, location });

  if (!candidates.length) {
    throw new Error(
      `No businesses found for "${industry}" in ${location}. Try a broader location or a different industry.`
    );
  }

  const shortlist = candidates.slice(0, MAX_CANDIDATES);
  const withDetails = await Promise.all(
    shortlist.map(async (place) => {
      try {
        const details = await getPlaceDetails(place.placeId);
        return { ...place, ...details };
      } catch {
        // Details lookup can fail independently (e.g. quota) without
        // sinking the whole search — fall back to text-search fields.
        return place;
      }
    })
  );

  const enriched = await enrichWithClaude(withDetails, { industry, location, companySize });
  return enriched;
}

async function enrichWithClaude(businesses, { industry, location, companySize }) {
  const sizeHint = companySize === "any" ? "unspecified" : companySize;

  const businessList = businesses
    .map(
      (b, i) =>
        `${i + 1}. name: ${b.name} | address: ${b.address || "unknown"} | phone: ${
          b.phone || "unknown"
        } | website: ${b.website || "unknown"} | rating: ${b.rating ?? "n/a"} (${
          b.userRatingsTotal ?? 0
        } reviews)`
    )
    .join("\n");

  const prompt = `You are enriching real local business listings into sales-ready B2B prospect profiles for a lead generation tool.
Industry focus: ${industry}. Location: ${location}. Target company size: ${sizeHint}.

Real businesses (do NOT change name, address, phone, or website — echo them back exactly):
${businessList}

For each business, add:
- "contactName": a realistic generic contact role since no named contact is available (e.g. "Owner", "General Manager", "Office Manager") — never invent a specific person's name
- "title": that same role
- "employees": an ESTIMATED range like "1-10", "10-25", "25-50", "50-200" based on rating volume/business type
- "revenue": an ESTIMATED CAD figure like "$1.2M CAD", clearly a rough estimate
- "founded": "Unknown" unless you have real reason to believe otherwise
- "score": a 0-100 lead score reflecting review volume, rating, and fit for the target industry/size
- "tags": 2-4 short descriptive tags
- "summary": 1-2 sentence outreach-relevant summary of why this business is a good prospect
- "linkedin", "twitter", "instagram": empty strings (not available from this data source)

Return ONLY a JSON array, no markdown, no commentary, one object per business, in the same order, with this exact shape:
[{"companyName":"","contactName":"","title":"","email":"","phone":"","website":"","industry":"${industry}","location":"","employees":"","revenue":"","founded":"","score":0,"tags":[],"linkedin":"","twitter":"","instagram":"","summary":""}]
Leave "email" as an empty string — it is filled in separately, do not invent one.`;

  const raw = await callClaude(prompt, 2000);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Claude returned a response that couldn't be parsed as JSON. Try searching again.");
  }

  return parsed.map((enrichedFields, i) => {
    const source = businesses[i] || {};
    return {
      id: source.placeId || `prospect-${i}-${Date.now()}`,
      ...enrichedFields,
      // Real, Google-sourced fields always win over anything the model
      // may have altered, per the prompt's instruction.
      companyName: source.name || enrichedFields.companyName,
      address: source.address || "",
      location,
      phone: source.phone || enrichedFields.phone || "Not publicly listed",
      website: source.website || enrichedFields.website || "",
      email: enrichedFields.email || "",
      rating: source.rating ?? null,
      userRatingsTotal: source.userRatingsTotal ?? null,
      sourceUrl: source.googleMapsUrl || "",
    };
  });
}
