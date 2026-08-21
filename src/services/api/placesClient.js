/**
 * services/api/placesClient.js
 * -----------------------------------------------------------------------
 * Low-level Google Places calls, proxied through our backend (see
 * server/routes/places.js) so the Places API key never reaches the
 * browser. Two calls: a text search for candidate businesses, and a
 * per-place details lookup for phone/website (Text Search doesn't
 * return those fields).
 */
import { httpClient } from "./httpClient";

/**
 * @param {{ industry: string, location: string }} params
 * @returns {Promise<Array<{placeId,name,address,rating,userRatingsTotal,businessStatus,types}>>}
 */
export async function searchPlaces({ industry, location }) {
  const data = await httpClient.get("/places/search", { industry, location });
  return data.results;
}

/**
 * @param {string} placeId
 * @returns {Promise<{name,phone,website,address,googleMapsUrl}>}
 */
export async function getPlaceDetails(placeId) {
  return httpClient.get("/places/details", { placeId });
}
