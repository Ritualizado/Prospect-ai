/**
 * components/Navbar.jsx
 * -----------------------------------------------------------------------
 * App header: brand mark + primary tab navigation. The Leads tab shows
 * a live count badge of saved leads.
 */
import React from "react";

const TABS = [
  ["campaigns", "🎯 Campaigns"],
  ["search", "🔍 Search"],
  ["leads", "📋 Leads"],
  ["history", "🕐 History"],
];

export default function Navbar({ tab, setTab, savedLeadsCount }) {
  return (
    <div style={{ background: "#0d1117", borderBottom: "1px solid #1f2937", padding: "0 24px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg,#6366f1,#22d3ee)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
              color: "#0a0a0f",
            }}
          >
            P
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>
            ProspectAI
          </span>
          <span
            style={{
              background: "#1e293b",
              color: "#6366f1",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Beta
          </span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: tab === id ? "#1e293b" : "transparent",
                border: "none",
                color: tab === id ? "#e2e8f0" : "#64748b",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {id === "leads" ? `${label}${savedLeadsCount > 0 ? ` (${savedLeadsCount})` : ""}` : label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
