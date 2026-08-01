import { useState, useCallback, useMemo } from "react";
import TOKEN from "./TOKEN";

const STATUS_COLORS = {
  "New": "#3b82f6",
  "Contacted": "#f59e0b",
  "Qualified": "#10b981",
  "Closed": "#6b7280"
};

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || TOKEN.textDim;
  return (
    <span className="status-badge" style={{ background: color + "22", color }}>
      {status || "New"}
    </span>
  );
}
export default StatusBadge;