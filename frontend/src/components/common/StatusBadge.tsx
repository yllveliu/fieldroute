import React from "react";

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  open:        { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  categorized: { backgroundColor: "#fef3c7", color: "#92400e" },
  assigned:    { backgroundColor: "#ede9fe", color: "#5b21b6" },
  en_route:    { backgroundColor: "#d1fae5", color: "#065f46" },
  completed:   { backgroundColor: "#f0fdf4", color: "#15803d" },
  new:         { backgroundColor: "#dbeafe", color: "#1d4ed8" },
};

const LABELS: Record<string, string> = {
  open:        "Open",
  categorized: "Categorized",
  assigned:    "Assigned",
  en_route:    "En Route",
  completed:   "Completed",
  new:         "Open",
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] ?? { backgroundColor: "#f3f4f6", color: "#374151" };
  const label = LABELS[key] ?? status;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.55rem",
        borderRadius: "4px",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        ...style,
      }}
    >
      {label}
    </span>
  );
}
