/**
 * features/history/HistoryTab.jsx
 * -----------------------------------------------------------------------
 * Log of past searches. "Repeat" re-populates the search form fields
 * and jumps back to the Search tab so the user can run it again.
 */
import React from "react";
import { useAppStore } from "../../store/useAppStore";

export default function HistoryTab() {
  const searchHistory = useAppStore((s) => s.searchHistory);
  const repeatSearch = useAppStore((s) => s.repeatSearch);

  return (
    <div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 20 }}>
        Search History
      </h2>

      {searchHistory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🕐</div>
          <p style={{ color: "#475569" }}>No searches yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {searchHistory.map((h, i) => (
            <div
              key={i}
              className="card"
              style={{
                background: "#0d1117",
                border: "1px solid #1f2937",
                borderRadius: 10,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontWeight: 500, fontSize: 14 }}>
                  {h.industry} · {h.location}
                </p>
                <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                  Size: {h.companySize === "any" ? "Any" : h.companySize} · {h.count} results · {h.time}
                </p>
              </div>
              <button className="btn btn-s" style={{ fontSize: 12 }} onClick={() => repeatSearch(h)}>
                🔄 Repeat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
