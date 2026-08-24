/**
 * constants/sectors.js
 * -----------------------------------------------------------------------
 * Canonical priority-sector data dictionary. This replaces the old
 * flat INDUSTRIES string list as the single source of truth: each
 * sector carries its priority rank (1 = highest priority), the
 * decision-maker titles Claude should look for when enriching leads,
 * and display metadata (icon/color) used by the Campaigns dashboard.
 *
 * `priorityRank` feeds directly into lead scoring in
 * services/prospectService.js (via server/routes/claude.js's
 * /enrich-prospects prompt) and into the priority badges shown on
 * ProspectCard / LeadsTab.
 */
export const SECTORS = [
  {
    name: "Restoration Companies",
    priorityRank: 1,
    icon: "🛠️",
    color: "#22d3ee",
    decisionMakerTitles: [
      "Branch Manager",
      "Operations Manager",
      "Fire/Water Restoration Manager",
      "Disaster Recovery Manager",
      "Mold Remediation Specialist",
      "Emergency Response Coordinator",
    ],
  },
  {
    name: "Insurance Companies",
    priorityRank: 2,
    icon: "🗂️",
    color: "#f59e0b",
    decisionMakerTitles: [
      "Vendor Manager",
      "Property Claims Manager",
      "Regional Claims Director",
      "Catastrophe Manager",
    ],
  },
  {
    name: "Demolition & Abatement Contractors",
    priorityRank: 3,
    icon: "🏚️",
    color: "#ef4444",
    decisionMakerTitles: [
      "Owner / Principal",
      "Project Manager",
      "Asbestos Abatement Supervisor",
      "Hazardous Materials Manager",
      "Selective Demolition Lead",
    ],
  },
  {
    name: "Property Management",
    priorityRank: 4,
    icon: "🏢",
    color: "#a855f7",
    decisionMakerTitles: [
      "Commercial Property Manager",
      "Facility Manager",
      "Apartment/Condo Manager",
      "Social Housing Program Manager",
    ],
  },
  {
    name: "General Contractors & Construction",
    priorityRank: 5,
    icon: "👷",
    color: "#f97316",
    decisionMakerTitles: [
      "Renovation Contractor",
      "Commercial Builder",
      "Construction Manager",
      "Estimator",
    ],
  },
  {
    name: "Real Estate & Development",
    priorityRank: 6,
    icon: "🏗️",
    color: "#eab308",
    decisionMakerTitles: ["Developer", "REIT Asset Manager", "Commercial Real Estate Principal", "Property Investor"],
  },
  {
    name: "Municipal & Provincial Government",
    priorityRank: 7,
    icon: "🏛️",
    color: "#64748b",
    decisionMakerTitles: ["Public Works Director", "Municipal Facilities Manager", "Housing Department Manager"],
  },
  {
    name: "Education",
    priorityRank: 8,
    icon: "🎓",
    color: "#3b82f6",
    decisionMakerTitles: ["Facilities Manager", "Maintenance Manager", "Director of Operations"],
  },
  {
    name: "Engineering & Architecture",
    priorityRank: 9,
    icon: "📐",
    color: "#06b6d4",
    decisionMakerTitles: [
      "Building Science Consultant",
      "Civil Engineer",
      "Structural Engineer",
      "Architect",
      "Project Manager",
    ],
  },
  {
    name: "Industrial & Manufacturing",
    priorityRank: 10,
    icon: "🏭",
    color: "#78716c",
    decisionMakerTitles: ["Plant Manager", "Health & Safety Manager", "Facility Manager"],
  },
  {
    name: "Healthcare & Senior Living",
    priorityRank: 11,
    icon: "🏥",
    color: "#14b8a6",
    decisionMakerTitles: ["Facilities Director", "Hospital Operations Manager", "Long-Term Care Administrator"],
  },
  {
    name: "Independent Adjusting Firms",
    priorityRank: 12,
    icon: "📋",
    color: "#f59e0b",
    decisionMakerTitles: ["Branch Manager", "Senior Property Adjuster", "Environmental Loss Specialist"],
  },
  {
    name: "Legal & Financial",
    priorityRank: 13,
    icon: "⚖️",
    color: "#6366f1",
    decisionMakerTitles: ["Environmental Lawyer", "Construction Lawyer", "Mortgage Lender", "Insolvency Professional"],
  },
  {
    name: "Hospitality & Retail",
    priorityRank: 14,
    icon: "🏨",
    color: "#ec4899",
    decisionMakerTitles: ["Hotel Operations Manager", "Retail Property Owner", "Franchise Operator"],
  },
  {
    name: "Nonprofit & Community",
    priorityRank: 15,
    icon: "🤝",
    color: "#22c55e",
    decisionMakerTitles: ["Executive Director", "Community Center Manager", "Non-Profit Housing Manager"],
  },
  {
    name: "Agriculture",
    priorityRank: 16,
    icon: "🌾",
    color: "#84cc16",
    decisionMakerTitles: ["Farm Owner/Operator", "Greenhouse Manager", "Processing Facility Manager"],
  },
  {
    name: "Transportation & Infrastructure",
    priorityRank: 17,
    icon: "🚛",
    color: "#0ea5e9",
    decisionMakerTitles: ["Utilities Manager", "Transit Operations Manager", "Logistics Facility Manager"],
  },
];

export function getSectorByName(name) {
  return SECTORS.find((s) => s.name === name) || null;
}

/** Priority tier for badge coloring: 1-5 high, 6-11 medium, 12-17 standard. */
export function priorityTier(rank) {
  if (rank <= 5) return { label: "High Priority", color: "#10b981" };
  if (rank <= 11) return { label: "Medium Priority", color: "#f59e0b" };
  return { label: "Standard Priority", color: "#64748b" };
}
