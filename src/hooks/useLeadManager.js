import { useState, useCallback, useMemo } from "react";

function useLeadManager() {
  const [savedLeads, setSavedLeads] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState({});
  const [notes, setNotes] = useState({});
 
  const saveProspect = useCallback((prospect) => {
    setSavedLeads(prev => {
      if (prev.find(l => l.id === prospect.id)) return prev;
      return [...prev, prospect];
    });
    setLeadStatuses(prev => ({ ...prev, [prospect.id]: prev[prospect.id] || "New" }));
  }, []);
 
  const updateStatus = useCallback((id, status) => {
    setLeadStatuses(prev => ({ ...prev, [id]: status }));
  }, []);
 
  const addNote = useCallback((id, text) => {
    if (!text.trim()) return false;
    setNotes(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), { text, time: new Date().toLocaleTimeString() }]
    }));
    return true;
  }, []);
 
  const isSaved = useCallback((id) => savedLeads.some(l => l.id === id), [savedLeads]);
 
  return { savedLeads, leadStatuses, notes, saveProspect, updateStatus, addNote, isSaved };
}
export default useLeadManager;