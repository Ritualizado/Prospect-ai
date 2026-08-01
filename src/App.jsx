/**
 * App.jsx
 * -----------------------------------------------------------------------
 * Top-level container. Owns all shared state (tab, active client, search
 * state, saved leads, statuses, notes, modals) and passes it down to tab
 * components as props. Tab components stay presentational; anything that
 * mutates cross-tab state (saving a lead, updating status, adding a
 * note, running a search) lives here as a single handler each tab can
 * call.
 */
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import CampaignsTab from "./components/CampaignsTab";
import SearchTab from "./components/SearchTab";
import LeadsTab from "./components/LeadsTab";
import HistoryTab from "./components/HistoryTab";
import ProspectDetailModal from "./components/ProspectDetailModal";
import CampaignReportModal from "./components/CampaignReportModal";
import { searchProspects as searchProspectsApi } from "./services/claudeApi";
import { CLIENTS } from "./constants";

export default function App() {
  const [tab, setTab] = useState("campaigns");
  const [activeClient, setActiveClient] = useState("adjuster");

  // Search tab state
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [companySize, setCompanySize] = useState("any");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  // Prospect detail modal state
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [outreachContext, setOutreachContext] = useState("general");

  // Leads / CRM state
  const [savedLeads, setSavedLeads] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState({});
  const [notes, setNotes] = useState({});
  const [noteInput, setNoteInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Campaign report modal state
  const [showReport, setShowReport] = useState(false);
  const [reportClient, setReportClient] = useState("adjuster");

  const handleSearch = async () => {
    if (!industry || !location) return;
    setLoading(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const results = await searchProspectsApi({ industry, location, companySize });
      setSearchResults(results);
      setSearchHistory((prev) => [
        {
          industry,
          location,
          companySize,
          count: results.length,
          time: new Date().toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } catch (err) {
      setSearchError(err.message || "Search failed. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleRepeatSearch = (historyEntry) => {
    setIndustry(historyEntry.industry);
    setLocation(historyEntry.location);
    setCompanySize(historyEntry.companySize);
    setTab("search");
  };

  const handleOpenDetail = (prospect, context) => {
    setOutreachContext(context);
    setSelectedProspect(prospect);
  };

  const handleSaveProspect = (p) => {
    if (!savedLeads.find((l) => l.id === p.id)) {
      setSavedLeads((prev) => [...prev, p]);
      setLeadStatuses((prev) => ({ ...prev, [p.id]: "New" }));
    }
  };

  const handleUpdateStatus = (id, status) =>
    setLeadStatuses((prev) => ({ ...prev, [id]: status }));

  const handleAddNote = (id) => {
    if (!noteInput.trim()) return;
    setNotes((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] || []),
        { text: noteInput, time: new Date().toLocaleString("en-CA", { dateStyle: "short", timeStyle: "short" }) },
      ],
    }));
    setNoteInput("");
  };

  const handleGenerateReport = (clientKey) => {
    setReportClient(clientKey);
    setShowReport(true);
  };

  const filteredLeads = savedLeads.filter(
    (l) => statusFilter === "All" || leadStatuses[l.id] === statusFilter
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0" }}>
      <Navbar tab={tab} setTab={setTab} savedLeadsCount={savedLeads.length} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "campaigns" && (
          <CampaignsTab
            activeClient={activeClient}
            setActiveClient={setActiveClient}
            savedLeads={savedLeads}
            onSaveProspect={handleSaveProspect}
            onOpenDetail={handleOpenDetail}
            onGenerateReport={handleGenerateReport}
            setTab={setTab}
          />
        )}

        {tab === "search" && (
          <div>
            <SearchTab
              industry={industry}
              setIndustry={setIndustry}
              location={location}
              setLocation={setLocation}
              companySize={companySize}
              setCompanySize={setCompanySize}
              searchResults={searchResults}
              loading={loading}
              onSearch={handleSearch}
              savedLeads={savedLeads}
              onSaveProspect={handleSaveProspect}
              onOpenDetail={handleOpenDetail}
            />
            {searchError && (
              <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, textAlign: "center" }}>
                {searchError}
              </p>
            )}
          </div>
        )}

        {tab === "leads" && (
          <LeadsTab
            savedLeads={savedLeads}
            filteredLeads={filteredLeads}
            leadStatuses={leadStatuses}
            notes={notes}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onUpdateStatus={handleUpdateStatus}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {tab === "history" && (
          <HistoryTab searchHistory={searchHistory} onRepeatSearch={handleRepeatSearch} />
        )}
      </div>

      {selectedProspect && (
        <ProspectDetailModal
          prospect={selectedProspect}
          outreachContext={outreachContext}
          isSaved={Boolean(savedLeads.find((l) => l.id === selectedProspect.id))}
          currentStatus={leadStatuses[selectedProspect.id]}
          prospectNotes={notes[selectedProspect.id]}
          noteInput={noteInput}
          onNoteInputChange={setNoteInput}
          onAddNote={handleAddNote}
          onSave={handleSaveProspect}
          onUpdateStatus={handleUpdateStatus}
          onClose={() => setSelectedProspect(null)}
        />
      )}

      {showReport && (
        <CampaignReportModal
          clientKey={reportClient}
          prospects={CLIENTS[reportClient].prospects}
          leadStatuses={leadStatuses}
          notes={notes}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
