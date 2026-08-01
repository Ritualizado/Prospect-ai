import { useState, useCallback, useMemo } from "react";
import TOKEN from "../components/TOKEN";
import CLIENTS from "../data/Clients.js";
import ProspectCard from "../components/ProspectCard.jsx";
import exportCSV  from "../utils/exportCSV.js";

function CampaignsPage({ onOpenProspect, leadManager, setTab, setShowReport, setReportClient }) {
  const [activeClient, setActiveClient] = useState("adjuster");
  const client = CLIENTS[activeClient];
 
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title">Active Campaigns</h2>
        <p className="section-sub">Pre-loaded prospect lists for your active client campaigns.</p>
      </div>
 
      {/* Client Selector */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {Object.entries(CLIENTS).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setActiveClient(key)}
            style={{
              background: activeClient === key ? c.color + "18" : TOKEN.surface,
              border: `1px solid ${activeClient === key ? c.color : TOKEN.border}`,
              color: activeClient === key ? c.color : TOKEN.textDim,
              padding: "12px 22px", borderRadius: 10, cursor: "pointer",
              fontWeight: 600, fontSize: 13, transition: "all 0.18s"
            }}
          >{c.icon} {c.label}</button>
        ))}
      </div>
 
      {/* Campaign Banner */}
      <div style={{
        background: TOKEN.surface, border: `1px solid ${client.color}33`,
        borderRadius: 12, padding: "16px 20px", marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
      }}>
        <div>
          <p style={{ fontSize: 11, color: client.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Active Campaign
          </p>
          <p style={{ fontWeight: 600, fontSize: 14, color: TOKEN.text, marginTop: 2 }}>{client.pitch}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(client.prospects, `${activeClient}-prospects.csv`)}>
            ⬇️ Export CSV
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12, borderColor: TOKEN.accent + "55", color: TOKEN.accent }}
            onClick={() => { setReportClient(activeClient); setShowReport(true); }}>
            📊 Campaign Report
          </button>
          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setTab("leads")}>
            📋 View Leads →
          </button>
        </div>
      </div>
 
      {/* Prospect Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {client.prospects.map((p, i) => (
          <ProspectCard
            key={p.id} prospect={p} isSaved={leadManager.isSaved}
            onSave={leadManager.saveProspect} onOpen={onOpenProspect} context={activeClient}
          />
        ))}
      </div>
    </div>
  );
}
export default CampaignsPage;