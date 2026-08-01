import { useState, useCallback, useMemo } from "react";

function CampaignReport({ clientKey, prospects, leadStatuses, notes, onClose }) {
  const client = CLIENTS[clientKey];
  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const avgScore = Math.round(prospects.reduce((a, p) => a + p.score, 0) / prospects.length);
  const statusCounts = prospects.reduce((acc, p) => {
    const s = leadStatuses[p.id] || "New";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const topProspects = [...prospects].sort((a, b) => b.score - a.score).slice(0, 3);
 
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${TOKEN.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: 18 }}>Campaign Report</h2>
            <p style={{ color: TOKEN.textDim, fontSize: 13 }}>{client.icon} {client.label} · {date}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(prospects, `${clientKey}-report.csv`)}>⬇️ CSV</button>
            <button onClick={onClose} style={{ background: TOKEN.surface, border: `1px solid ${TOKEN.border}`, color: TOKEN.textMid, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        </div>
 
        {/* Body */}
        <div style={{ overflowY: "auto", padding: 24 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { num: prospects.length, label: "Total Prospects" },
              { num: avgScore, label: "Avg Lead Score" },
              { num: statusCounts["Qualified"] || 0, label: "Qualified" },
              { num: statusCounts["Contacted"] || 0, label: "Contacted" },
            ].map(s => (
              <div key={s.label} style={{ background: TOKEN.bg, border: `1px solid ${TOKEN.border}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
                <p style={{ fontSize: 30, fontWeight: 800, color: client.color, fontFamily: TOKEN.fontDisplay }}>{s.num}</p>
                <p style={{ fontSize: 11, color: TOKEN.textDim, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              </div>
            ))}
          </div>
 
          {/* Top Prospects */}
          <h3 style={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🏆 Top Prospects by Score</h3>
          <div style={{ marginBottom: 24 }}>
            {topProspects.map((p, i) => (
              <div key={p.id} style={{
                background: TOKEN.bg, border: `1px solid ${i === 0 ? client.color + "55" : TOKEN.border}`,
                borderRadius: 10, padding: "14px 16px", marginBottom: 10
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: TOKEN.textDim, fontWeight: 700 }}>#{i + 1}</span>
                      <h4 style={{ fontWeight: 700, fontSize: 15, color: TOKEN.text }}>{p.companyName}</h4>
                      {i === 0 && <span style={{ background: client.color + "22", color: client.color, fontSize: 10, padding: "1px 7px", borderRadius: 3, fontWeight: 700 }}>TOP PICK</span>}
                    </div>
                    <p style={{ color: TOKEN.textDim, fontSize: 12 }}>{p.contactName} · {p.title}</p>
                  </div>
                  <ScoreChip score={p.score} />
                </div>
                <p style={{ fontSize: 12, color: TOKEN.textMid, lineHeight: 1.6, marginTop: 8 }}>{p.summary}</p>
              </div>
            ))}
          </div>
 
          {/* Full Table */}
          <h3 style={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📋 All Prospects</h3>
          <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${TOKEN.border}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: TOKEN.bg }}>
                  {["Company","Contact","Location","Email","Score","Status","Tags"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: TOKEN.textDim, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospects.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? TOKEN.bg : TOKEN.surface }}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}`, color: TOKEN.text, fontWeight: 600 }}>{p.companyName}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}`, color: TOKEN.textDim }}>{p.contactName}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}`, color: TOKEN.textDim }}>{p.location}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}`, color: TOKEN.textDim }}>{p.email}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}` }}><ScoreChip score={p.score} /></td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}` }}><StatusBadge status={leadStatuses[p.id] || "New"} /></td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${TOKEN.border}` }}>
                      {p.tags?.map(t => <span key={t} className="tag" style={{ margin: "1px" }}>{t}</span>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CampaignReport;