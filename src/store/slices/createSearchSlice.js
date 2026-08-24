/**
 * store/slices/createSearchSlice.js
 * -----------------------------------------------------------------------
 * Owns the Search tab: form fields, the current result set, loading /
 * error state, and the search history log. `runSearch` is the one
 * place that calls out to prospectService, so components (SearchTab,
 * HistoryTab) never talk to services directly — they call store actions.
 */
import { searchProspects } from "../../services/prospectService";

export const createSearchSlice = (set, get) => ({
  industry: "",
  location: "",
  companySize: "any",
  searchResults: [],
  isSearching: false,
  searchError: "",
  searchHistory: [],

  setIndustry: (industry) => set({ industry }),
  setLocation: (location) => set({ location }),
  setCompanySize: (companySize) => set({ companySize }),

  runSearch: async () => {
    const { industry, location, companySize } = get();
    if (!industry || !location) return;

    set({ isSearching: true, searchError: "", searchResults: [] });
    try {
      const results = await searchProspects({ industry, location, companySize });
      set((state) => ({
        searchResults: results,
        searchHistory: [
          {
            industry,
            location,
            companySize,
            count: results.length,
            time: new Date().toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }),
          },
          ...state.searchHistory,
        ],
      }));
    } catch (err) {
      set({ searchError: err.message || "Search failed. Please try again." });
      console.error(err);
    } finally {
      set({ isSearching: false });
    }
  },

  repeatSearch: (historyEntry) => {
    set({
      industry: historyEntry.industry,
      location: historyEntry.location,
      companySize: historyEntry.companySize,
      tab: "search",
    });
  },
});
