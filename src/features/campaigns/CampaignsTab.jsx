/**
 * features/campaigns/CampaignsTab.jsx
 * -----------------------------------------------------------------------
 * Live campaign dashboard, one per priority sector (constants/sectors.js).
 * Unlike the old version, this reads real, live-fetched leads from the
 * leads slice (grouped by `lead.industry`) instead of a static mock
 * prospect list — stats, the prospect grid, and report generation are
 * all derived from whatever the user has actually searched and saved.
 */
import React from "react";
import ProspectCard from "../leads/ProspectCard";
import { exportCSV } from "../../utils/csvExport";
import { SECTORS, getSectorByName } from "../../constants/sectors";
import { useAppStore } from "../../store/useAppStore";

export default function CampaignsTab() {
  const activeClient = useAppStore((s) => s.activeClient);
  const setActiveClient = useAppStore((s) => s.setActiveClient);
  const setIndustry = useAppStore((s) => s.setIndustry);
  const setTab = useAppStore((s) => s.setTab);
  const openCampaignReport = useAppStore((s) => s.openCampaignReport);
  const leadStatuses = useAppStore((s) => s.leadStatuses);
  const leadsForSector = useAppStore((s) => s.getLeadsBySector(activeClient));

  const sector = getSectorByName(activeClient) || SECTORS[0];
  const avgScore = leadsForSector.length
    ? Math.round(leadsForSector.reduce((sum, p) => sum + (p.score || 0), 0) / leadsForSector.length)
    : null;
  const qualifiedCount = leadsForSector.filter((p) => leadStatuses[p.id] === "Qualified").length;

  const handleCopyEmails = () => {
    const emails = leadsForSector.map((p) => p.email).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails || "No saved leads with an email in this sector yet.");
  };

  const handleSearchSector = () => {
    setIndustry(sector.name);
    setTab("search");
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>
          Campaigns
        </h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Live lead stats per priority sector, built from your saved search results.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {SECTORS.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveClient(c.name)}
            title={`Priority ${c.priorityRank} of ${SECTORS.length}`}
            style={{
              background: activeClient === c.name ? c.color + "18" : "#0d1117",
              border: `1px solid ${activeClient === c.name ? c.color : "#1f2937"}`,
              color: activeClient === c.name ? c.color : "#64748b",
              padding: "10px 16px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#0d1117",
          border: `1px solid ${sector.color}33`,
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 11, color: sector.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {sector.icon} {sector.name} · Priority {sector.priorityRank} of {SECTORS.length}
          </p>
          <p style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>
            Target roles: {sector.decisionMakerTitles.slice(0, 3).join(", ")}
            {sector.decisionMakerTitles.length > 3 ? "…" : ""}
          </p>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
            {leadsForSector.length} saved lead{leadsForSector.length === 1 ? "" : "s"}
            {avgScore !== null ? ` · avg score ${avgScore}` : ""}
            {qualifiedCount > 0 ? ` · ${qualifiedCount} qualified` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-p" style={{ fontSize: 12 }} onClick={handleSearchSector}>
            🔍 Search This Sector
          </button>
          {leadsForSector.length > 0 && (
            <>
              <button
                className="btn btn-s"
                style={{ fontSize: 12 }}
                onClick={() => exportCSV(leadsForSector, `${sector.name.toLowerCase().replace(/\s+/g, "-")}-leads.csv`)}
              >
                ⬇ Export CSV
              </button>
              <button
                className="btn btn-s"
                style={{ fontSize: 12, borderColor: "#6366f155", color: "#6366f1" }}
                onClick={() => openCampaignReport(sector.name)}
              >
                📊 Generate Report
              </button>
              <button className="btn btn-s" style={{ fontSize: 12 }} onClick={handleCopyEmails}>
                📋 Copy Emails
              </button>
            </>
          )}
          <button className="btn btn-s" style={{ fontSize: 12 }} onClick={() => setTab("leads")}>
            View All Leads →
          </button>
        </div>
      </div>

      {leadsForSector.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{sector.icon}</div>
          <p style={{ fontSize: 15, color: "#475569" }}>No saved leads yet in {sector.name}</p>
          <p style={{ fontSize: 13, color: "#334155", marginTop: 8, marginBottom: 20 }}>
            Run a live search for this sector to pull real businesses from Google Places.
          </p>
          <button className="btn btn-p" onClick={handleSearchSector}>
            🔍 Search {sector.name}
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {leadsForSector.map((p) => (
            <ProspectCard key={p.id} prospect={p} context="general" />
          ))}
        </div>
      )}
    </div>
  );
}
