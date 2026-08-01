const TOKEN = {
  bg: "#08090e",
  surface: "#0d1117",
  surfaceAlt: "#111827",
  border: "#1f2937",
  borderMid: "#2d3748",
  text: "#e2e8f0",
  textMid: "#94a3b8",
  textDim: "#64748b",
  accent: "#6366f1",
  accentHover: "#4f46e5",
  fontDisplay: "'Syne', 'Space Grotesk', sans-serif",
  fontBody: "'DM Sans', 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  radius: "10px",
  radiusLg: "16px",
};
 
const scoreColor = s => s >= 85 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";

export default TOKEN;
export { scoreColor };