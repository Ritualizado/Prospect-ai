/**
 * app/App.jsx
 * -----------------------------------------------------------------------
 * Top-level shell: renders the navbar, the active tab, and the two
 * cross-cutting modals. All shared state now lives in useAppStore
 * (see src/store/), so this component is pure routing/composition —
 * no props are threaded through it.
 */
import React from "react";
import Navbar from "../components/Navbar";
import CampaignsTab from "../features/campaigns/CampaignsTab";
import CampaignReportModal from "../features/campaigns/CampaignReportModal";
import SearchTab from "../features/search/SearchTab";
import LeadsTab from "../features/leads/LeadsTab";
import ProspectDetailModal from "../features/leads/ProspectDetailModal";
import HistoryTab from "../features/history/HistoryTab";
import { useAppStore } from "../store/useAppStore";

const TAB_COMPONENTS = {
  campaigns: CampaignsTab,
  search: SearchTab,
  leads: LeadsTab,
  history: HistoryTab,
};

export default function App() {
  const tab = useAppStore((s) => s.tab);
  const ActiveTab = TAB_COMPONENTS[tab] || CampaignsTab;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <ActiveTab />
      </div>

      <ProspectDetailModal />
      <CampaignReportModal />
    </div>
  );
}
