/**
 * components/ProspectCard.jsx
 * -----------------------------------------------------------------------
 * A single prospect's summary card. Used in the Campaigns tab grid and
 * the Search results grid — clicking it (outside the action buttons)
 * opens the ProspectDetailModal via onOpenDetail.
 */
import React from "react";

function scoreColor(s) {
  return s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
}

export default function ProspectCard({ prospect, context, isSaved, onSave, onOpenDetail }) {
  return (
    <div
      className="card pcard"
      style={{
        background: "#0d1117",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
      }}
      onClick={() => onOpenDetail(prospect, context)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div>
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
            {prospect.companyName}
          </h3>
          <p style={{ color: "#64748b", fontSize: 12 }}>
            {prospect.contactName} · {prospect.title}
          </p>
        </div>
        <div
          style={{
            background: scoreColor(prospect.score) + "20",
            color: scoreColor(prospect.score),
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {prospect.score}
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginBottom: 10,
        }}
      >
        <span>✉ {prospect.email}</span>
        <span>☎ {prospect.phone}</span>
        <span>
          📍 {prospect.location} · 👥 {prospect.employees} · {prospect.revenue}
        </span>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55, marginBottom: 10 }}>
        {prospect.summary}
      </p>

      <div style={{ marginBottom: 12 }}>
        {prospect.tags?.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-s"
          style={{ flex: 1, fontSize: 12, padding: "6px" }}
          onClick={(e) => {
            e.stopPropagation();
            onSave(prospect);
          }}
        >
          {isSaved ? "✓ Saved" : "+ Save"}
        </button>
        <button
          className="btn btn-p"
          style={{ flex: 1, fontSize: 12, padding: "6px" }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(prospect, context);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export { scoreColor };
