import React from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "#27ae60" },
  on_job:    { label: "On Job",    color: "#e67e22" },
  off:       { label: "Off",       color: "#95a5a6" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "#95a5a6" };
  return (
    <span className="status-badge" style={{ backgroundColor: config.color }}>
      <span className="status-dot" />
      {config.label}
    </span>
  );
}
