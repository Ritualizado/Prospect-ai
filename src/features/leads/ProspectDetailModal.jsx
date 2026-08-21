/**
 * features/leads/ProspectDetailModal.jsx
 * -----------------------------------------------------------------------
 * Full-detail view of a single prospect. Handles save/status changes,
 * per-prospect notes (only visible once a prospect is saved as a lead),
 * CSV export of just this prospect, and hosts the OutreachButton.
 */
import React from "react";
import { exportCSV } from "../../utils/csvExport";
import { STATUS_COLORS, LEAD_STATUSES } from "../../constants";
import { useAppStore } from "../../store/useAppStore";
import OutreachButton from "./OutreachButton";
import { scoreColor } from "./ProspectCard";

export default function ProspectDetailModal() {
  const prospect = useAppStore((s) => s.selectedProspect);
  const outreachContext = useAppStore((s) => s.outreachContext);
  const closeProspectDetail = useAppStore((s) => s.closeProspectDetail);
  const isSaved = useAppStore((s) =>
    prospect ? Boolean(s.savedLeads.find((l) => l.id === prospect.id)) : false
  );
  const currentStatus = useAppStore((s) => (prospect ? s.leadStatuses[prospect.id] : undefined));
  const prospectNotes = useAppStore((s) => (prospect ? s.notes[prospect.id] : undefined));
  const noteInput = useAppStore((s) => s.noteInput);
  const setNoteInput = useAppStore((s) => s.setNoteInput);
  const addNote = useAppStore((s) => s.addNote);
  const saveProspect = useAppStore((s) => s.saveProspect);
  const updateLeadStatus = useAppStore((s) => s.updateLeadStatus);

  if (!prospect) return null;

  return (
    <div className="modal-bg" onClick={closeProspectDetail}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20 }}>
                {prospect.companyName}
              </h2>
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                {prospect.industry} · {prospect.location}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  background: scoreColor(prospect.score) + "20",
                  color: scoreColor(prospect.score),
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {prospect.score}
              </div>
              <button
                onClick={closeProspectDetail}
                style={{ background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, width: 32, height: 32, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              ["Contact", prospect.contactName],
              ["Title", prospect.title],
              ["Employees", prospect.employees],
              ["Founded", prospect.founded],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#0d1117", borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{val}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "#0d1117", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
            <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Contact Details
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>✉ {prospect.email || "Not publicly listed"}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>☎ {prospect.phone}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>🌐 {prospect.website || "—"}</span>
            </div>
          </div>

          <div style={{ background: "#0d1117", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
            <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Social
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>💼 {prospect.linkedin || "—"}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>🐦 {prospect.twitter || "—"}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>📸 {prospect.instagram || "—"}</span>
            </div>
          </div>

          <div style={{ background: "#0d1117", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Summary
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{prospect.summary}</p>
          </div>

          <div style={{ marginBottom: 14 }}>
            {prospect.tags?.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>

          {isSaved && (
            <div style={{ background: "#0d1117", borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Notes
              </p>
              {prospectNotes?.map((n, i) => (
                <p key={i} style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>
                  <span style={{ color: "#475569" }}>{n.time}:</span> {n.text}
                </p>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  className="inp"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a note..."
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addNote(prospect.id);
                  }}
                />
                <button className="btn btn-p" style={{ padding: "7px 16px", fontSize: 13 }} onClick={() => addNote(prospect.id)}>
                  Add
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
            {!isSaved ? (
              <button className="btn btn-p" onClick={() => saveProspect(prospect)}>
                + Save as Lead
              </button>
            ) : (
              <select
                value={currentStatus || "New"}
                onChange={(e) => updateLeadStatus(prospect.id, e.target.value)}
                style={{
                  background: (STATUS_COLORS[currentStatus] || "#1e293b") + "22",
                  color: STATUS_COLORS[currentStatus] || "#94a3b8",
                  border: `1px solid ${STATUS_COLORS[currentStatus] || "#334155"}`,
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}
            <button
              className="btn btn-s"
              style={{ fontSize: 12 }}
              onClick={() => exportCSV([prospect], `${prospect.companyName.replace(/\s+/g, "-")}.csv`)}
            >
              ⬇ Export CSV
            </button>
          </div>

          <OutreachButton prospect={prospect} outreachContext={outreachContext} />
        </div>
      </div>
    </div>
  );
}
