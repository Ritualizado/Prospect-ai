/**
 * constants/industries.js
 * -----------------------------------------------------------------------
 * Flat, priority-ordered list of industry names for dropdowns and for
 * the places search query. Derived from constants/sectors.js (the
 * canonical data dictionary with priority rank + decision-maker
 * titles) so the two never drift out of sync — update sectors.js only.
 */
import { SECTORS } from "./sectors";

export const INDUSTRIES = SECTORS.map((s) => s.name);
