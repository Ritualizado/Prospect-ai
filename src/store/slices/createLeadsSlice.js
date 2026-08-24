/**
 * store/slices/createLeadsSlice.js
 * -----------------------------------------------------------------------
 * Owns the saved-leads CRM pipeline: which prospects are saved, their
 * status, free-text notes, and the leads-tab status filter. This is the
 * slice most likely to grow (e.g. tags, owners, follow-up dates,
 * reminders) — each lead is stored by id so new per-lead fields can be
 * added to `leadStatuses`/`notes`-style maps, or new sibling maps added,
 * without touching other slices.
 */
export const createLeadsSlice = (set, get) => ({
  savedLeads: [],
  leadStatuses: {},
  notes: {},
  noteInput: "",
  statusFilter: "All",

  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setNoteInput: (noteInput) => set({ noteInput }),

  saveProspect: (prospect) => {
    const { savedLeads } = get();
    if (savedLeads.find((l) => l.id === prospect.id)) return;
    set((state) => ({
      savedLeads: [...state.savedLeads, prospect],
      leadStatuses: { ...state.leadStatuses, [prospect.id]: "New" },
    }));
  },

  updateLeadStatus: (id, status) =>
    set((state) => ({ leadStatuses: { ...state.leadStatuses, [id]: status } })),

  addNote: (id) => {
    const { noteInput } = get();
    if (!noteInput.trim()) return;
    set((state) => ({
      notes: {
        ...state.notes,
        [id]: [
          ...(state.notes[id] || []),
          {
            text: noteInput,
            time: new Date().toLocaleString("en-CA", { dateStyle: "short", timeStyle: "short" }),
          },
        ],
      },
      noteInput: "",
    }));
  },

  // Derived selector-style helper, not stored state — recomputed from
  // savedLeads/leadStatuses/statusFilter on read.
  getFilteredLeads: () => {
    const { savedLeads, leadStatuses, statusFilter } = get();
    return savedLeads.filter((l) => statusFilter === "All" || leadStatuses[l.id] === statusFilter);
  },

  // Used by CampaignsTab to aggregate real, live-fetched leads per
  // priority sector instead of reading from a static mock list.
  getLeadsBySector: (sectorName) => {
    const { savedLeads } = get();
    return savedLeads.filter((l) => l.industry === sectorName);
  },
});
