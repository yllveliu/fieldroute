import React, { useEffect, useState } from "react";
import InventoryTable from "../components/inventory/InventoryTable";
import { fetchParts } from "../services/partsApi";

export default function InventoryPage(): React.ReactElement {
  const [parts, setParts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchParts()
      .then((data) => {
        if (!mounted) return;
        setParts(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        setParts([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-container">
      <div className="page-card">
        <h1>Inventory</h1>
        <p className="subtitle">Track parts, stock and reserved quantities.</p>

        {loading && <p className="placeholder">Loading parts...</p>}
        {error && (
          <p style={{ color: "#c0392b" }}>Error loading parts: {error}</p>
        )}

        {!loading && !error && parts && parts.length === 0 && (
          <p className="placeholder">No parts found.</p>
        )}

        {!loading && !error && parts && parts.length > 0 && (
          <InventoryTable parts={parts} />
        )}
      </div>
    </div>
  );
}
