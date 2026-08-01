import { useState, useCallback, useMemo } from "react";

function exportCSV(prospects, filename = "prospects.csv") {
  const headers = [
    "Company","Contact","Title","Email","Phone","Website",
    "Industry","Location","Employees","Revenue","Founded","Score",
    "Tags","LinkedIn","Twitter","Instagram","Summary"
  ];
  const rows = prospects.map(p => [
    p.companyName, p.contactName, p.title, p.email, p.phone, p.website,
    p.industry, p.location, p.employees, p.revenue, p.founded, p.score,
    (p.tags||[]).join("; "), p.linkedin, p.twitter, p.instagram,
    `"${(p.summary||"").replace(/"/g,'""')}"`
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
export default exportCSV;