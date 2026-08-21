/**
 * store/slices/createUISlice.js
 * -----------------------------------------------------------------------
 * Cross-cutting UI state: which tab is active, and the two modals that
 * can be opened from more than one feature (prospect detail, campaign
 * report). Kept separate from feature slices because "which modal is
 * open" isn't owned by any one feature — Search, Campaigns, and Leads
 * all open the same ProspectDetailModal.
 */
export const createUISlice = (set) => ({
  tab: "campaigns",
  setTab: (tab) => set({ tab }),

  // Prospect detail modal
  selectedProspect: null,
  outreachContext: "general",
  openProspectDetail: (prospect, context = "general") =>
    set({ selectedProspect: prospect, outreachContext: context }),
  closeProspectDetail: () => set({ selectedProspect: null }),

  // Campaign report modal
  showReport: false,
  reportClient: "adjuster",
  openCampaignReport: (clientKey) => set({ showReport: true, reportClient: clientKey }),
  closeCampaignReport: () => set({ showReport: false }),
});
