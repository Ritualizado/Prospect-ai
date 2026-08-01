# ProspectAI — Modular Source

A Vite + React refactor of the ProspectAI lead-generation tool, split from
a single monolithic file into a feature-based `/src` structure.

## ⚠️ Read this first: reconstructed data

The source this was refactored from was extracted from a **PDF export of
a code screenshot**, and the PDF's column layout cut off a meaningful
amount of text mid-line — particularly inside the `ADJUSTER_PROSPECTS`
and `RESTORATION_PROSPECTS` arrays, the `CLIENTS` object's `pitch` copy,
and a few button labels in the Campaigns tab action row.

What's **preserved exactly** from what was visible: every function name,
every component's structure and behavior, all state variables, the full
CSV export logic, the full campaign report logic, the full search/outreach
prompt logic, and every company name / contact name / title that appeared
in the source.

What's **reconstructed** (filled in with realistic Chatham-Kent /
Windsor-Essex / Sarnia-Lambton placeholder values in the same style the
app's own AI prompts generate): prospect emails, phone numbers, websites,
revenue figures, founding years, tags, and social handles; the two
`CLIENTS[...].pitch` strings; and three of the four Campaigns-tab action
buttons (`Generate Report`, `Copy Emails` — the CSV export and "View
Leads" buttons were fully visible in the source).

**Before using this for real outreach, replace the placeholder contact
details in `src/constants/index.js` with your actual prospect data.**

## Setup

```bash
npm install
cp .env.example .env
# edit .env and add your Anthropic API key
npm run dev
```

## ⚠️ API key security

`src/services/claudeApi.js` calls the Anthropic API directly from the
browser using `import.meta.env.VITE_ANTHROPIC_API_KEY`. This means the
key ships inside your built JS bundle and is visible to anyone who opens
devtools on the deployed site. That's a reasonable trade-off for local
development or an internal tool behind its own auth layer — it is **not**
safe for a public production deployment. Before shipping publicly, move
the three exported functions in `claudeApi.js` behind a small backend (or
serverless/edge function) that holds the key server-side and proxies the
request.

## File tree

```text
src/
├── constants/
│   └── index.js            # INDUSTRIES, LOCATIONS, STATUS_COLORS,
│                            # ADJUSTER_PROSPECTS, RESTORATION_PROSPECTS,
│                            # CLIENTS, LEAD_STATUSES
├── services/
│   └── claudeApi.js         # callClaude, searchProspects, generateOutreach
├── utils/
│   └── csvExport.js         # exportCSV
├── components/
│   ├── Navbar.jsx
│   ├── ProspectCard.jsx     # also exports scoreColor() helper
│   ├── OutreachButton.jsx   # self-contained: calls claudeApi directly
│   ├── CampaignReportModal.jsx
│   ├── ProspectDetailModal.jsx
│   ├── CampaignsTab.jsx
│   ├── SearchTab.jsx
│   ├── LeadsTab.jsx
│   └── HistoryTab.jsx
├── App.jsx                  # central state + tab routing
├── main.jsx
└── index.css                 # global resets, fonts, shared .btn/.card/.tag/.modal classes
```

## Architecture notes

- **State stays lifted in `App.jsx`.** Anything read or written across
  more than one tab (saved leads, lead statuses, notes, search history,
  the selected-prospect modal) lives in `App.jsx` and flows down as
  props. Tab components are otherwise presentational.

- **`OutreachButton` is intentionally self-contained.** The original
  monolith used one app-wide `generating` boolean, which meant clicking
  "Generate Outreach Email" on one prospect would visually disable every
  other outreach button on screen. The refactored version has each
  `OutreachButton` instance own its own loading/email/open state and call
  `services/claudeApi` directly — multiple buttons no longer interfere
  with each other. This is the one deliberate behavioral improvement over
  the original; everything else preserves the source's behavior as
  written.

- **`scoreColor` has two different thresholds in the original app** —
  the prospect cards use `≥80 / ≥60`, while the campaign report modal
  uses `≥85 / ≥75`. Both are preserved as separate, locally-scoped
  functions (`ProspectCard.jsx` and `CampaignReportModal.jsx`) rather
  than unified, since collapsing them would silently change the report's
  color-coding behavior.

- **No react-router.** Tab switching stays a simple `tab` string in
  `App.jsx`'s state, matching the original's approach — swap in a router
  later without touching tab components, since they only receive
  `tab`/`setTab`-style props.

## Setup files included

- `package.json` — React 18, Vite 5, `@vitejs/plugin-react`
- `vite.config.js` — standard React plugin config
- `index.html` — Vite entry HTML
- `.env.example` — `VITE_ANTHROPIC_API_KEY` template
- `.gitignore` — excludes `node_modules`, `dist`, `.env`
# Prospect-ai
