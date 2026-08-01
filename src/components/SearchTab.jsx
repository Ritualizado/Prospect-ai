/**
 * components/SearchTab.jsx
 * -----------------------------------------------------------------------
 * AI-powered prospect discovery: pick an industry/location/size, call
 * out to Claude via the searchProspects handler (owned by App.jsx so
 * results can also be recorded into search history), and browse results
 * with the same ProspectCard used elsewhere.
 */
import React from "react";
import ProspectCard from "./ProspectCard";
import { exportCSV } from "../utils/csvExport";
import { INDUSTRIES, LOCATIONS } from "../constants";

function SkeletonCard() {
  return (
    <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
      <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 13, width: "40%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 12, width: "80%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "65%" }} />
    </div>
  );
}

export default function SearchTab({
  industry,
  setIndustry,
  location,
  setLocation,
  companySize,
  setCompanySize,
  searchResults,
  loading,
  onSearch,
  savedLeads,
  onSaveProspect,
  onOpenDetail,
}) {
  return (
    <div>
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>
          Find Prospects
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
          AI-powered discovery for a specific industry and location.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
              Industry
            </label>
            <select className="inp" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
              Location
            </label>
            <select className="inp" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select location...</option>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
              Company Size
            </label>
            <select className="inp" value={companySize} onChange={(e) => setCompanySize(e.target.value)}>
              <option value="any">Any size</option>
              <option value="1-10">1–10 (Micro)</option>
              <option value="10-50">10–50 (Small)</option>
              <option value="50-200">50–200 (Mid)</option>
            </select>
          </div>
          <button className="btn btn-p" onClick={onSearch} disabled={loading || !industry || !location}>
            {loading ? "Searching..." : "Find Prospects"}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{searchResults.length}</span> prospects found
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-s"
                style={{ fontSize: 12 }}
                onClick={() => exportCSV(searchResults, `search-${industry}-${location}.csv`)}
              >
                ⬇ Export CSV
              </button>
              <button className="btn btn-s" style={{ fontSize: 12 }} onClick={onSearch}>
                🔄 Search Again
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
            {searchResults.map((p, i) => (
              <ProspectCard
                key={p.id}
                prospect={p}
                context="general"
                isSaved={Boolean(savedLeads.find((l) => l.id === p.id))}
                onSave={onSaveProspect}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </>
      )}

      {!loading && searchResults.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <p style={{ fontSize: 15, color: "#475569" }}>Select an industry and location to get started</p>
          <p style={{ fontSize: 13, color: "#334155", marginTop: 8 }}>
            Generates 519/226 numbers, .ca domains, and realistic Ontario business profiles
          </p>
        </div>
      )}
    </div>
  );
}
