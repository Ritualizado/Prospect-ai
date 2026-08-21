/**
 * store/slices/createCampaignsSlice.js
 * -----------------------------------------------------------------------
 * Owns which pre-loaded campaign client list is active. Kept as its own
 * slice (rather than folded into UI) so future campaign-level features —
 * saved report snapshots, per-campaign goals/targets, campaign-specific
 * settings — have an obvious home without reshuffling other state.
 */
export const createCampaignsSlice = (set) => ({
  activeClient: "adjuster",
  setActiveClient: (activeClient) => set({ activeClient }),

  // Placeholder for future campaign reporting: generated reports could
  // be snapshotted here (e.g. { [clientKey]: [{ generatedAt, stats }] })
  // so History/Reporting views can show trends over time rather than
  // only the live, always-recalculated report in CampaignReportModal.
  reportSnapshots: {},
  saveReportSnapshot: (clientKey, snapshot) =>
    set((state) => ({
      reportSnapshots: {
        ...state.reportSnapshots,
        [clientKey]: [...(state.reportSnapshots[clientKey] || []), snapshot],
      },
    })),
});
