import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getTechnicians } from "../api/technicians";
import type { Technician } from "../api/technicians";
import TechnicianCard from "../components/technicians/TechnicianCard";
import { getSkillConfig } from "../data/skillConfig";

const SKILL_CHIPS = ["Plumbing", "Electrical", "HVAC", "Carpentry"] as const;

const STATUS_CHIPS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Available", value: "available" },
  { label: "On Job", value: "on_job" },
];

function techMatchesSkill(tech: Technician, category: string): boolean {
  return (tech.skills ?? []).some(
    (s) => getSkillConfig(s).category.toLowerCase() === category.toLowerCase()
  );
}

export default function TechniciansPage(): React.ReactElement {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    getTechnicians()
      .then((data) => {
        if (!mounted) return;
        setTechnicians(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = technicians.filter((t) => {
    const skillOk = activeSkill ? techMatchesSkill(t, activeSkill) : true;
    const statusOk = activeStatus ? t.status === activeStatus : true;
    return skillOk && statusOk;
  });

  const hasActiveFilter = activeSkill !== null || activeStatus !== "";

  return (
    <div className="tech-page">
      <div className="tech-page-header">
        <h1 className="tech-page-title">Technicians</h1>
        <p className="tech-page-subtitle">
          Browse and filter field technicians by skill and availability.
        </p>
      </div>

      {/* ── Filter chips ── */}
      <div className="filter-section">
        <div className="filter-group">
          <span className="filter-label">Skill</span>
          <div className="chip-row">
            <button
              type="button"
              className={`filter-chip${activeSkill === null ? " filter-chip--active" : ""}`}
              onClick={() => setActiveSkill(null)}
            >
              All Skills
            </button>
            {SKILL_CHIPS.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`filter-chip${activeSkill === skill ? " filter-chip--active" : ""}`}
                onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Availability</span>
          <div className="chip-row">
            {STATUS_CHIPS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                className={`filter-chip${activeStatus === value ? " filter-chip--active" : ""}`}
                onClick={() => setActiveStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <p className="placeholder" style={{ paddingTop: "2rem" }}>
          Loading technicians…
        </p>
      )}

      {!loading && error && (
        <p style={{ color: "#c0392b", paddingTop: "2rem" }}>
          Error loading technicians: {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="technician-empty">
          <Users size={40} className="technician-empty-icon" />
          <p className="technician-empty-title">No technicians found</p>
          <p className="technician-empty-sub">
            {hasActiveFilter
              ? "Try adjusting your filters."
              : "No technicians have been added yet."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="tech-result-count">
            {filtered.length} technician{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="technician-grid">
            {filtered.map((tech) => (
              <TechnicianCard key={tech.id} tech={tech} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
