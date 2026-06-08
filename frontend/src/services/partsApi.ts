// Simple parts API service with a temporary mock fallback.
export async function fetchParts(): Promise<any[]> {
  const url = "http://localhost:8000/parts";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    // Temporary mock data when backend is not available.
    console.warn("Parts API fetch failed — using temporary mock data.", err);
    return [
      { id: 1, name: "Panel - Large", sku: "PL-001", stock_quantity: 12, reserved_qty: 2 },
      { id: 2, name: "Panel - Small", sku: "PL-003", stock_quantity: 3, reserved_qty: 1 },
      { id: 3, name: "Elbow Connector", sku: "EL-001", stock_quantity: 0, reserved_qty: 0 },
    ];
  }
}
