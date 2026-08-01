/**
 * components/CampaignsTab.jsx
 * -----------------------------------------------------------------------
 * Pre-loaded campaign lists (Insurance Adjusters / Restoration
 * Contractors). Lets the user switch between client types, see a pitch
 * summary, export/report/copy actions, and browse the prospect grid.
 */
import React from "react";
import ProspectCard from "./ProspectCard";
import { exportCSV } from "../utils/csvExport";
import { CLIENTS } from "../constants";

export default function CampaignsTab({
  activeClient,
  setActiveClient,
  savedLeads,
  onSaveProspect,
  onOpenDetail,
  onGenerateReport,
  setTab,
}) {
  const client = CLIENTS[activeClient];

  const handleCopyEmails = () => {
    const emails = client.prospects.map((p) => p.email).join(", ");
    navigator.clipboard.writeText(emails);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>
          Campaigns
        </h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Pre-loaded prospect lists for your active outreach campaigns.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {Object.entries(CLIENTS).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setActiveClient(key)}
            style={{
              background: activeClient === key ? c.color + "18" : "#0d1117",
              border: `1px solid ${activeClient === key ? c.color : "#1f2937"}`,
              color: activeClient === key ? c.color : "#64748b",
              padding: "12px 22px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#0d1117",
          border: `1px solid ${client.color}33`,
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <p style={{ fontSize: 11, color: client.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {client.label}
          </p>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{client.pitch}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn btn-s"
            style={{ fontSize: 12 }}
            onClick={() => exportCSV(client.prospects, `${activeClient}-prospects.csv`)}
          >
            ⬇ Export CSV
          </button>
          <button
            className="btn btn-s"
            style={{ fontSize: 12, borderColor: "#6366f155", color: "#6366f1" }}
            onClick={() => onGenerateReport(activeClient)}
          >
            📊 Generate Report
          </button>
          <button className="btn btn-s" style={{ fontSize: 12 }} onClick={handleCopyEmails}>
            📋 Copy Emails
          </button>
          <button className="btn btn-p" style={{ fontSize: 12 }} onClick={() => setTab("leads")}>
            View Leads →
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {client.prospects.map((p, i) => (
          <ProspectCard
            key={p.id}
            prospect={p}
            context={activeClient}
            isSaved={Boolean(savedLeads.find((l) => l.id === p.id))}
            onSave={onSaveProspect}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
}
