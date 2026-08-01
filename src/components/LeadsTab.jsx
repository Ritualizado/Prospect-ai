/**
 * components/LeadsTab.jsx
 * -----------------------------------------------------------------------
 * The customer's saved leads pipeline: filter by status, change status
 * inline, preview the two most recent notes per lead, export filtered
 * results to CSV.
 */
import React from "react";
import { exportCSV } from "../utils/csvExport";
import { STATUS_COLORS, LEAD_STATUSES } from "../constants";

export default function LeadsTab({
  savedLeads,
  filteredLeads,
  leadStatuses,
  notes,
  statusFilter,
  setStatusFilter,
  onUpdateStatus,
  onOpenDetail,
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>
            Leads
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
            {savedLeads.length} lead{savedLeads.length === 1 ? "" : "s"} in your pipeline
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {savedLeads.length > 0 && (
            <button
              className="btn btn-s"
              style={{ fontSize: 12 }}
              onClick={() => exportCSV(filteredLeads, `leads-${statusFilter.toLowerCase()}.csv`)}
            >
              ⬇ Export {statusFilter === "All" ? "All" : statusFilter} CSV
            </button>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", ...LEAD_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: statusFilter === s ? (STATUS_COLORS[s] || "#6366f1") + "22" : "transparent",
                  color: statusFilter === s ? STATUS_COLORS[s] || "#6366f1" : "#64748b",
                  border: `1px solid ${statusFilter === s ? STATUS_COLORS[s] || "#6366f1" : "#1f2937"}`,
                  padding: "5px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ color: "#475569", fontSize: 15 }}>
            {savedLeads.length === 0 ? "No leads yet — save a prospect to get started" : "No leads match this filter"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="card"
              style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: 18, cursor: "pointer" }}
              onClick={() => onOpenDetail(lead, "general")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      background: "linear-gradient(135deg,#1e293b,#334155)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {lead.companyName?.[0]}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 15 }}>{lead.companyName}</h3>
                    <p style={{ color: "#64748b", fontSize: 12 }}>
                      {lead.contactName} · {lead.title}
                    </p>
                    <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>✉ {lead.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                  <select
                    value={leadStatuses[lead.id] || "New"}
                    onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                    style={{
                      background: (STATUS_COLORS[leadStatuses[lead.id]] || "#1e293b") + "22",
                      color: STATUS_COLORS[leadStatuses[lead.id]] || "#94a3b8",
                      border: `1px solid ${STATUS_COLORS[leadStatuses[lead.id]] || "#334155"}`,
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-p"
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() => onOpenDetail(lead, "general")}
                  >
                    View
                  </button>
                </div>
              </div>

              {notes[lead.id]?.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1f2937" }}>
                  {notes[lead.id].slice(-2).map((n, i) => (
                    <p key={i} style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>
                      <span style={{ color: "#475569" }}>{n.time}:</span> {n.text}
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
