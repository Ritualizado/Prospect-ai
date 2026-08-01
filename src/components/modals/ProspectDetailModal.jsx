import { useState, useCallback, useMemo } from "react";

function ProspectDetailModal({ prospect, isSaved, onSave, onClose, updateStatus, leadStatuses, notes, addNote }) {
  const p = prospect;
  const [noteInput, setNoteInput] = useState("");
 
  const handleAddNote = () => {
    const success = addNote(p.id, noteInput);
    if (success) setNoteInput("");
  };
 
  const infoFields = [
    ["Contact", p.contactName], ["Title", p.title],
    ["Email", p.email], ["Phone", p.phone],
    ["Location", p.location], ["Website", p.website],
    ["Employees", p.employees], ["Revenue", p.revenue],
    ["Industry", p.industry], ["Founded", p.founded],
  ];
 
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${TOKEN.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: 18, color: TOKEN.text }}>{p.companyName}</h2>
            <p style={{ color: TOKEN.textDim, fontSize: 12, marginTop: 3 }}>{p.industry} · {p.location}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ScoreChip score={p.score} />
            <button
              onClick={onClose}
              style={{ background: TOKEN.surface, border: `1px solid ${TOKEN.border}`, color: TOKEN.textMid, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}
            >×</button>
          </div>
        </div>
 
        {/* Modal Body */}
        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
 
          {/* Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {infoFields.map(([label, value]) => (
              <div key={label} className="info-cell">
                <div className="label">{label}</div>
                <div className="value">{value || "—"}</div>
              </div>
            ))}
          </div>
 
          {/* Social */}
          {(p.linkedin || p.twitter || p.instagram) && (
            <div className="info-cell" style={{ marginBottom: 14 }}>
              <div className="label">Social</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                {p.linkedin && <span style={{ fontSize: 13, color: TOKEN.textMid }}>🔗 {p.linkedin}</span>}
                {p.twitter && <span style={{ fontSize: 13, color: TOKEN.textMid }}>🐦 {p.twitter}</span>}
                {p.instagram && <span style={{ fontSize: 13, color: TOKEN.textMid }}>📸 {p.instagram}</span>}
              </div>
            </div>
          )}
 
          {/* Summary */}
          <div className="info-cell" style={{ marginBottom: 14 }}>
            <div className="label">Summary</div>
            <p style={{ fontSize: 13, color: TOKEN.textMid, lineHeight: 1.6, marginTop: 4 }}>{p.summary}</p>
          </div>
 
          {/* Tags */}
          <div style={{ marginBottom: 16 }}>
            {p.tags?.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
 
          {/* Notes */}
          {isSaved(p.id) && (
            <div className="info-cell" style={{ marginBottom: 16 }}>
              <div className="label" style={{ marginBottom: 8 }}>Notes</div>
              {notes[p.id]?.map((n, i) => (
                <p key={i} style={{ fontSize: 12, color: TOKEN.textDim, marginBottom: 4 }}>
                  <span style={{ color: TOKEN.accent, marginRight: 6 }}>◆</span>
                  {n.text}
                  <span style={{ color: "#334155", marginLeft: 8 }}>{n.time}</span>
                </p>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  className="inp"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={e => e.key === "Enter" && handleAddNote()}
                />
                <button className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 12, whiteSpace: "nowrap" }} onClick={handleAddNote}>
                  Add
                </button>
              </div>
            </div>
          )}
 
          {/* Outreach */}
          <OutreachButton prospect={p} context="general" />
        </div>
 
        {/* Modal Footer */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${TOKEN.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {!isSaved(p.id) ? (
            <button className="btn btn-primary" onClick={() => onSave(p)}>+ Save Lead</button>
          ) : (
            <select
              value={leadStatuses[p.id] || "New"}
              onChange={e => updateStatus(p.id, e.target.value)}
              style={{
                background: (STATUS_COLORS[leadStatuses[p.id]] || "#1e293b") + "22",
                color: STATUS_COLORS[leadStatuses[p.id]] || TOKEN.textMid,
                border: `1px solid ${STATUS_COLORS[leadStatuses[p.id]] || TOKEN.border}`,
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                outline: "none"
              }}
            >
              {["New","Contacted","Qualified","Closed"].map(s => <option key={s}>{s}</option>)}
            </select>
          )}
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV([p], `${p.companyName}.csv`)}>
            ⬇️ Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProspectDetailModal;