import React, { useEffect, useState } from "react";
import { fetchTechnicians, Technician } from "../services/techniciansApi";
import TechnicianCard from "../components/technicians/TechnicianCard";

const ALL_STATUSES = ["available", "on_job", "off"];

export default function TechniciansPage(): React.ReactElement {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTechnicians()
      .then((data) => {
        if (!mounted) return;
        setTechnicians(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const filtered = technicians.filter((t) => {
    const skillMatch = skillFilter
      ? (t.skills ?? []).some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
      : true;
    const statusMatch = statusFilter ? t.status === statusFilter : true;
    return skillMatch && statusMatch;
  });

  return (
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 800 }}>
        <h1>Technicians</h1>
        <p className="subtitle">Browse and filter available field technicians.</p>

        <div className="technician-filters">
          <input
            className="filter-input"
            type="text"
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {loading && <p className="placeholder">Loading technicians...</p>}
        {error && <p style={{ color: "#c0392b" }}>Error loading technicians: {error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="placeholder">No technicians match the current filters.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="technician-list">
            {filtered.map((tech) => (
              <TechnicianCard key={tech.id} tech={tech} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
