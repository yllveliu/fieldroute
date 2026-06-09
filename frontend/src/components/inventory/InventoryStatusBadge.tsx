import React from "react";

export default function InventoryStatusBadge({ stock }: { stock: number }) {
  const low = stock <= 5;
  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "0.25rem 0.5rem",
    borderRadius: 6,
    fontSize: "0.9rem",
    color: "#fff",
    backgroundColor: low ? "#e74c3c" : "#27ae60",
  };
  return <span style={style}>{low ? "Low Stock" : "In Stock"}</span>;
}
