import { useState, useCallback, useMemo } from "react";

function HistoryPage({ searchHistory, onRerun }) {
  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: 20 }}>Search History</h2>
      {searchHistory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🕒</div>
          <p style={{ color: "#475569" }}>No searches yet. Use the Search tab to find prospects.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {searchHistory.map((h, i) => (
            <div key={i} className="fade-up" style={{
              background: TOKEN.surface, border: `1px solid ${TOKEN.border}`,
              borderRadius: 10, padding: "14px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 14, color: TOKEN.text }}>
                  {h.industry} · <span style={{ color: TOKEN.accent }}>{h.location}</span>
                </p>
                <p style={{ color: TOKEN.textDim, fontSize: 12, marginTop: 3 }}>
                  Size: {h.companySize} · {h.count} prospects · {h.time}
                </p>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => onRerun(h)}>
                🔁 Rerun
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default HistoryPage;