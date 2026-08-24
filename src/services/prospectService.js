/**
 * services/prospectService.js
 * -----------------------------------------------------------------------
 * Live lead pipeline for the Search tab:
 *
 *   1. Serper.dev Places (services/api/placesClient, proxied through
 *      server/routes/places.js) finds real local businesses matching
 *      the chosen sector + location — real names, addresses, phone
 *      numbers, websites, ratings — in one call.
 *   2. Claude (services/api/anthropicClient.enrichProspects) enriches
 *      that real data into the app's Prospect shape: a priority-weighted
 *      lead score, a predicted decision-maker title drawn from the
 *      sector's data dictionary, tags, an outreach summary, and
 *      estimated firmographics the places lookup doesn't expose.
 *
 * UI components never call the places or Claude services directly —
 * only this file (and outreachService.js for the separate
 * outreach-drafting flow).
 */
import { searchPlaces } from "./api/placesClient";
import { enrichProspects } from "./api/anthropicClient";
import { getSectorByName } from "../constants/sectors";

/**
 * @param {{ industry: string, location: string, companySize: string }} params
 * @returns {Promise<Array<Object>>} prospect objects — real contact fields
 *   sourced from the places lookup, AI-derived fields clearly separated
 */
export async function searchProspects({ industry, location, companySize }) {
  const places = await searchPlaces({ industry, location });

  if (!places.length) {
    throw new Error(
      `No businesses found for "${industry}" in ${location}. Try a broader location or a different sector.`
    );
  }

  const sector = getSectorByName(industry);

  const enrichedFields = await enrichProspects({
    places,
    sector: industry,
    priorityRank: sector?.priorityRank ?? null,
    decisionMakerTitles: sector?.decisionMakerTitles ?? [],
    location,
    companySize,
  });

  return places.map((place, i) => {
    const fields = enrichedFields[i] || {};
    return {
      id: place.placeId || `prospect-${i}-${Date.now()}`,
      ...fields,
      // Real, sourced fields always win over anything the model may
      // have altered — enforced here as a second guarantee on top of
      // the server-side prompt instruction to echo them unchanged.
      companyName: place.name || fields.companyName,
      address: place.address || "",
      location,
      industry,
      priorityRank: sector?.priorityRank ?? null,
      phone: place.phone || fields.phone || "Not publicly listed",
      website: place.website || fields.website || "",
      email: fields.email || "",
      rating: place.rating ?? null,
      userRatingsTotal: place.userRatingsTotal ?? null,
    };
  });
}
