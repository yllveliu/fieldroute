import React from "react";
import InventoryStatusBadge from "./InventoryStatusBadge";

type Part = {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  reserved_qty?: number;
};

export default function InventoryTable({ parts }: { parts: Part[] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table className="inventory-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Name</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>SKU</th>
            <th style={{ textAlign: "right", padding: "0.5rem" }}>Stock</th>
            <th style={{ textAlign: "right", padding: "0.5rem" }}>Reserved</th>
            <th style={{ textAlign: "center", padding: "0.5rem" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: "0.75rem" }}>{p.name}</td>
              <td style={{ padding: "0.75rem" }}>{p.sku}</td>
              <td style={{ padding: "0.75rem", textAlign: "right" }}>{p.stock_quantity}</td>
              <td style={{ padding: "0.75rem", textAlign: "right" }}>{p.reserved_qty ?? 0}</td>
              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                <InventoryStatusBadge stock={p.stock_quantity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
