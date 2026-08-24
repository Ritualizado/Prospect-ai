# ProspectAI

A lead-generation and outreach tool: pulls real local businesses via Google
Places, has Claude enrich them into scored, summarized prospect profiles,
manages them through a save → status → notes pipeline, and drafts
personalized outreach emails.

## What changed from the demo

The original code was a single-file React demo with two problems it called
out itself in comments:

1. **Prospect search was fully hallucinated.** `searchProspects` asked
   Claude to invent 6 businesses from nothing — no real names, addresses,
   or phone numbers.
2. **The Anthropic API key shipped in the browser bundle** (`VITE_ANTHROPIC_API_KEY`),
   visible to anyone who opened devtools on a deployed site.

This version fixes both:

- **Real leads.** `services/prospectService.js` calls Serper.dev's Places
  search (via
  the backend) to find real businesses for the chosen industry + location,
  then sends that real data to Claude to score, tag, and summarize — Claude
  enriches, it doesn't invent. Company name, address, phone, and website
  come straight from Google; only the lead score, tags, summary, and
  estimated firmographics (employee/revenue range, since Places doesn't
  expose those) are AI-derived, and are labeled as estimates.
- **No key in the browser.** A small Express backend (`server/`) holds
  both `ANTHROPIC_API_KEY` and `SERPER_API_KEY` server-side and
  proxies the two external calls the client needs
  (`POST /api/claude/messages`, `POST /api/claude/enrich-prospects`,
  `POST /api/claude/outreach`, `GET /api/places/search`). The client
  never talks to Anthropic or Serper directly.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: add ANTHROPIC_API_KEY and SERPER_API_KEY
npm run dev
```

`npm run dev` runs the Vite dev server and the Express API together
(`concurrently`). The client proxies `/api/*` to the backend in dev
(`vite.config.js`), so you only ever open `http://localhost:5173`.

### Getting API keys

- **Anthropic**: https://console.anthropic.com/settings/keys
- **Serper.dev**: sign up at https://serper.dev and grab an API key
  from https://serper.dev/api-key — it wraps Google's local/places
  results behind a simple REST API, no Google Cloud project needed.

### Production

```bash
npm run build   # builds the client into dist/
npm start       # Express serves dist/ AND /api from one process/origin
```

Deploy this as one Node service (Render, Fly, a container, etc.) or split
`server/` into your platform's serverless functions if you prefer — the
route handlers in `server/routes/` are already isolated per external API
and don't depend on Express-specific features beyond routing/JSON body
parsing, so porting them is mechanical.

## Architecture

```text
server/                       # Backend — the only thing holding API keys
├── index.js                  # Express app: health check, static client, error handling
└── routes/
    ├── claude.js               # POST /api/claude/messages         → Anthropic Messages API
    │                           # POST /api/claude/enrich-prospects → Claude enrichment/scoring
    │                           # POST /api/claude/outreach         → Claude outreach drafting
    └── places.js               # GET  /api/places/search           → Serper.dev Places search

src/
├── services/                 # All external-API-shaped logic. Components never fetch.
│   ├── api/
│   │   ├── httpClient.js      # shared fetch wrapper → our backend, nothing else
│   │   ├── anthropicClient.js # callClaude(prompt, maxTokens)
│   │   └── placesClient.js    # searchPlaces(), getPlaceDetails()
│   ├── prospectService.js     # searchProspects(): Places + Claude enrichment pipeline
│   └── outreachService.js     # generateOutreach(prospect, context)
│
├── store/                    # Zustand, composed from feature slices
│   ├── useAppStore.js          # combines slices, persists CRM data to localStorage
│   └── slices/
│       ├── createUISlice.js       # active tab, modal open/close state
│       ├── createLeadsSlice.js    # saved leads, statuses, notes, filter
│       ├── createSearchSlice.js   # search form + results + history (calls prospectService)
│       └── createCampaignsSlice.js# active campaign client + report snapshot log
│
├── features/                 # One folder per user-facing area
│   ├── campaigns/
│   │   ├── CampaignsTab.jsx        # live, per-sector dashboard over saved leads
│   │   └── CampaignReportModal.jsx
│   ├── search/SearchTab.jsx
│   ├── leads/
│   │   ├── LeadsTab.jsx
│   │   ├── ProspectCard.jsx     # shared by Campaigns + Search grids
│   │   ├── ProspectDetailModal.jsx
│   │   └── OutreachButton.jsx
│   └── history/HistoryTab.jsx
│
├── components/Navbar.jsx     # only truly cross-feature UI component
├── constants/                # sectors.js (data dictionary), INDUSTRIES, LOCATIONS, STATUS_COLORS, LEAD_STATUSES
├── utils/csvExport.js
├── styles/index.css
└── app/App.jsx                # tab routing + modal composition, no local state
```

### Why Zustand, and why slices

State that used to live in `App.jsx` and get threaded through props now
lives in one store composed from per-feature "slice" files
(`store/slices/`). Adding a new feature — campaign reporting history,
lead assignment/ownership, follow-up reminders — means adding one new
`createXSlice.js` and spreading it into `useAppStore.js`; no existing
slice or component needs to change. Components subscribe with small
selectors (`useAppStore(s => s.savedLeads)`) so re-renders stay scoped to
what they actually read.

`createCampaignsSlice.js` already includes a `reportSnapshots` map and a
`saveReportSnapshot` action as a concrete extension point: each time a
report is printed it's logged there, ready for a future "Reports" view
that shows trends over time instead of only the always-live report in
`CampaignReportModal`.

### Priority sectors & live campaigns

`constants/sectors.js` is the canonical data dictionary: 17 priority
sectors (restoration companies ranked highest, transportation &
infrastructure lowest), each with its priority rank, the decision-maker
titles Claude should look for, and display metadata. `INDUSTRIES` (the
Search-tab dropdown list) is derived from it, so the two never drift.

The Campaigns tab is no longer pre-loaded mock data — it's a live
dashboard per sector, built entirely from whatever you've actually
searched and saved: counts, average score, and the prospect grid/report
are all filtered from the leads slice by `lead.industry`. There's nothing
to "replace before shipping" here anymore; run a search, save a few
leads, and the sector's stats populate.

### Behavioral notes preserved from the prior pass

- **`OutreachButton` owns its own loading state per instance** rather
  than one app-wide `generating` flag, so generating an email for one
  prospect never disables the button on another.
- **`scoreColor` has two different threshold sets** — `ProspectCard.jsx`
  uses ≥80/≥60, `CampaignReportModal.jsx` uses ≥85/≥75 — kept as
  separate, locally-scoped functions rather than unified, since merging
  them would silently change the report's color-coding.
- **No router.** Tab switching is a `tab` string in the UI slice, same
  approach as before — swap in a router later without touching tab
  components, since they read `tab`/call `setTab` through the store
  rather than via props.
