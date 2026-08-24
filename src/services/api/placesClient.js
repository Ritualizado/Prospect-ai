/**
 * services/api/placesClient.js
 * -----------------------------------------------------------------------
 * Low-level places lookup, proxied through our backend (see
 * server/routes/places.js, which calls Serper.dev) so the Serper API
 * key never reaches the browser. `searchPlaces` returns fully-resolved
 * listings — phone, website, and rating already included in the single
 * search response — so the client makes exactly one request per search.
 */
import { httpClient } from "./httpClient";

/**
 * @param {{ industry: string, location: string }} params
 * @returns {Promise<Array<{placeId,name,address,phone,website,rating,userRatingsTotal}>>}
 */
export async function searchPlaces({ industry, location }) {
  const data = await httpClient.get("/places/search", { industry, location });
  return data.results;
}
