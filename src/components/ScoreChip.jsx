const scoreColor = s => s >= 85 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";
function ScoreChip({ score }) {
  const color = scoreColor(score);
  return (
    <span className="score-chip" style={{ background: color + "22", color }}>
      {score}
    </span>
  );
}
export default ScoreChip;