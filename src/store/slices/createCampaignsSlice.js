/**
 * store/slices/createCampaignsSlice.js
 * -----------------------------------------------------------------------
 * Owns which priority sector is active on the Campaigns dashboard. Now
 * that Campaigns aggregates real saved leads (grouped by
 * `lead.industry`) instead of a static mock list, `activeClient` holds
 * a sector name from constants/sectors.js rather than a hardcoded key.
 * Kept as its own slice so future campaign-level features — saved
 * report snapshots, per-sector goals/targets — have an obvious home
 * without reshuffling other state.
 */
import { SECTORS } from "../../constants/sectors";

export const createCampaignsSlice = (set) => ({
  activeClient: SECTORS[0].name,
  setActiveClient: (activeClient) => set({ activeClient }),

  // Each time a report is printed (CampaignReportModal), a lightweight
  // snapshot is logged here, so a future "Reports" view can show trends
  // over time rather than only the always-live, recalculated report.
  reportSnapshots: {},
  saveReportSnapshot: (clientKey, snapshot) =>
    set((state) => ({
      reportSnapshots: {
        ...state.reportSnapshots,
        [clientKey]: [...(state.reportSnapshots[clientKey] || []), snapshot],
      },
    })),
});
