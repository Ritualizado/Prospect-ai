/**
 * utils/csvExport.js
 * -----------------------------------------------------------------------
 * Client-side CSV export for a list of prospects. Triggers a browser
 * download via an object URL — no server round-trip required.
 */
const CSV_HEADERS = [
  "Company",
  "Contact",
  "Title",
  "Email",
  "Phone",
  "Website",
  "Industry",
  "Location",
  "Employees",
  "Revenue",
  "Founded",
  "Score",
  "Tags",
  "LinkedIn",
  "Twitter",
  "Instagram",
  "Summary",
];

/**
 * Export an array of prospects to a downloaded CSV file.
 * @param {Array<Object>} prospects
 * @param {string} filename
 */
export function exportCSV(prospects, filename) {
  const rows = prospects.map((p) => [
    p.companyName,
    p.contactName,
    p.title,
    p.email,
    p.phone,
    p.website,
    p.industry,
    p.location,
    p.employees,
    p.revenue,
    p.founded,
    p.score,
    (p.tags || []).join("; "),
    p.linkedin,
    p.twitter,
    p.instagram,
    `"${(p.summary || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [CSV_HEADERS, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
