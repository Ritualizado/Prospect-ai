import { useState, useCallback, useMemo } from "react";
import TOKEN from "../components/TOKEN";
import exportCSV from "../utils/exportCSV.js";
import ProspectCard from "../components/ProspectCard.jsx";
import ScoreChip from "../components/ScoreChip.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STATUS_COLORS = {
  "New": "#3b82f6",
  "Contacted": "#f59e0b",
  "Qualified": "#10b981",
  "Closed": "#6b7280"
};

function LeadsPage({ leadManager, onOpenProspect }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const { savedLeads, leadStatuses, notes, updateStatus, isSaved, saveProspect } = leadManager;
 
  const filtered = useMemo(() =>
    savedLeads.filter(l => statusFilter === "All" || leadStatuses[l.id] === statusFilter),
    [savedLeads, leadStatuses, statusFilter]
  );
 
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="section-title">My Leads</h2>
          <p className="section-sub">{savedLeads.length} leads saved · {filtered.length} shown</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {savedLeads.length > 0 && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(filtered, `leads-${statusFilter.toLowerCase()}.csv`)}>
              ⬇️ Export {statusFilter === "All" ? "All" : statusFilter}
            </button>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            {["All","New","Contacted","Qualified","Closed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                background: statusFilter === s ? (STATUS_COLORS[s] || TOKEN.accent) + "22" : "transparent",
                color: statusFilter === s ? (STATUS_COLORS[s] || TOKEN.accent) : TOKEN.textDim,
                border: `1px solid ${statusFilter === s ? (STATUS_COLORS[s] || TOKEN.accent) : TOKEN.border}`,
                padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                transition: "all 0.15s"
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
 
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ color: "#475569", fontSize: 15 }}>
            {savedLeads.length === 0 ? "No leads yet — save prospects from Campaigns or Search." : `No leads with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(lead => (
            <div key={lead.id} className="fade-up" style={{
              background: TOKEN.surface, border: `1px solid ${TOKEN.border}`,
              borderRadius: 12, padding: "16px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, #1e293b, #0f172a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, border: `1px solid ${TOKEN.border}`
                  }}>🏢</div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 15, color: TOKEN.text }}>{lead.companyName}</h3>
                    <p style={{ color: TOKEN.textDim, fontSize: 12 }}>{lead.contactName} · {lead.title}</p>
                    <p style={{ color: TOKEN.textDim, fontSize: 12, marginTop: 2 }}>✉️ {lead.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <ScoreChip score={lead.score} />
                  <select
                    value={leadStatuses[lead.id] || "New"}
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    style={{
                      background: (STATUS_COLORS[leadStatuses[lead.id]] || "#1e293b") + "22",
                      color: STATUS_COLORS[leadStatuses[lead.id]] || TOKEN.textMid,
                      border: `1px solid ${STATUS_COLORS[leadStatuses[lead.id]] || TOKEN.border}`,
                      padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", outline: "none"
                    }}
                  >
                    {["New","Contacted","Qualified","Closed"].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() => onOpenProspect(lead, "general")}>
                    Details →
                  </button>
                </div>
              </div>
              {notes[lead.id]?.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${TOKEN.border}` }}>
                  {notes[lead.id].slice(-2).map((n, i) => (
                    <p key={i} style={{ fontSize: 12, color: TOKEN.textDim, marginBottom: 3 }}>
                      <span style={{ color: TOKEN.accent, marginRight: 6 }}>◆</span>{n.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeadsPage;