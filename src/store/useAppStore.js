/**
 * store/useAppStore.js
 * -----------------------------------------------------------------------
 * Single Zustand store composed from feature slices (the "slices
 * pattern"). Adding a new feature area (e.g. campaign reporting,
 * advanced lead scoring/assignment) means adding one new
 * `createXSlice.js` file and spreading it in here — no other feature's
 * code needs to change. Components read state via small selector hooks
 * so re-renders stay scoped to what each component actually uses.
 *
 * CRM data (saved leads, statuses, notes, search history, active
 * client, report snapshots) persists to localStorage so a refresh
 * doesn't wipe the pipeline. Ephemeral UI state (open modals, in-flight
 * loading/error, current form field values) is intentionally excluded
 * from persistence.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createUISlice } from "./slices/createUISlice";
import { createLeadsSlice } from "./slices/createLeadsSlice";
import { createSearchSlice } from "./slices/createSearchSlice";
import { createCampaignsSlice } from "./slices/createCampaignsSlice";

export const useAppStore = create(
  persist(
    (set, get, api) => ({
      ...createUISlice(set, get, api),
      ...createLeadsSlice(set, get, api),
      ...createSearchSlice(set, get, api),
      ...createCampaignsSlice(set, get, api),
    }),
    {
      name: "prospect-ai-storage",
      partialize: (state) => ({
        savedLeads: state.savedLeads,
        leadStatuses: state.leadStatuses,
        notes: state.notes,
        searchHistory: state.searchHistory,
        activeClient: state.activeClient,
        reportSnapshots: state.reportSnapshots,
      }),
    }
  )
);
