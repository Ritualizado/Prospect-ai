import { useState, useCallback, useMemo } from "react";
import TOKEN from "../components/TOKEN";
import exportCSV from "../utils/exportCSV.js";
import ProspectCard from "../components/ProspectCard.jsx";
import INDUSTRIES from "../data/industries.js";
import LOCATIONS from "../data/locations.js";

function SearchPage({ onOpenProspect, leadManager, setSearchHistory }) {
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [companySize, setCompanySize] = useState("any");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
 
  const search = async () => {
    if (!industry || !location) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await { industry, location, companySize }; // Replace with actual API call, e.g. axios.post("/api/search", { industry, location, companySize })  
      setResults(data);
      setSearchHistory(prev => [
        { industry, location, companySize, count: data.length, time: new Date().toLocaleTimeString() },
        ...prev
      ]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
 
  return (
    <div>
      {/* Search Panel */}
      <div style={{ background: TOKEN.surface, border: `1px solid ${TOKEN.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 className="section-title">AI Prospect Search</h2>
        <p className="section-sub" style={{ marginBottom: 20 }}>AI-powered discovery for any industry and location across SW Ontario.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: TOKEN.textDim, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Industry</label>
            <select className="inp" value={industry} onChange={e => setIndustry(e.target.value)}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: TOKEN.textDim, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</label>
            <select className="inp" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">Select location...</option>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: TOKEN.textDim, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Company Size</label>
            <select className="inp" value={companySize} onChange={e => setCompanySize(e.target.value)}>
              <option value="any">Any size</option>
              <option value="1-10">1–10 (Micro)</option>
              <option value="10-50">10–50 (Small)</option>
              <option value="50-200">50–200 (Mid)</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={search} disabled={loading || !industry || !location}>
            {loading ? "Searching..." : "🔍 Find Prospects"}
          </button>
        </div>
      </div>
 
      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: TOKEN.surface, border: `1px solid ${TOKEN.border}`, borderRadius: TOKEN.radius, padding: 18 }}>
              <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 13, width: "40%", marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 12, width: "80%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "65%" }} />
            </div>
          ))}
        </div>
      )}
 
      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: TOKEN.textDim, fontSize: 13 }}>
              <span style={{ color: TOKEN.text, fontWeight: 600 }}>{results.length} prospects</span> found for{" "}
              <span style={{ color: TOKEN.accent }}>{industry}</span> in{" "}
              <span style={{ color: TOKEN.accent }}>{location}</span>
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(results, "search-results.csv")}>⬇️ Export CSV</button>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setResults([]); }}>Clear</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {results.map((p, i) => (
              <ProspectCard key={p.id} prospect={p} isSaved={leadManager.isSaved}
                onSave={leadManager.saveProspect} onOpen={onOpenProspect} context="general" />
            ))}
          </div>
        </>
      )}
 
      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 15, color: "#475569" }}>Select an industry and location to generate prospects</p>
          <p style={{ fontSize: 13, color: "#334155", marginTop: 8 }}>Generates realistic Ontario businesses with 519/226 numbers and .ca domains</p>
        </div>
      )}
    </div>
  );
}
export default SearchPage;