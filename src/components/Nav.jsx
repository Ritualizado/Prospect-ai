import { useState, useCallback, useMemo } from "react";
import TOKEN from "./TOKEN";

function Nav({ tab, setTab, leadsCount }) {
  const tabs = [
    { key: "campaigns", label: "🎯 Campaigns" },
    { key: "search",    label: "🔍 Search" },
    { key: "leads",     label: leadsCount > 0 ? `📋 Leads (${leadsCount})` : "📋 Leads" },
    { key: "history",   label: "🕒 History" },
  ];
  return (
    <nav style={{
      background: TOKEN.surface, borderBottom: `1px solid ${TOKEN.border}`,
      padding: "0 24px", position: "sticky", top: 0, zIndex: 50
    }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16
          }}>🎯</div>
          <span style={{ fontFamily: TOKEN.fontDisplay, fontWeight: 800, fontSize: 18, color: TOKEN.text }}>
            ProspectAI
          </span>
          <span style={{
            background: "#1e293b", color: TOKEN.accent,
            fontSize: 10, fontWeight: 700, padding: "2px 8px",
            borderRadius: 4, letterSpacing: "0.05em"
          }}>BETA</span>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`nav-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >{t.label}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}
export default Nav;