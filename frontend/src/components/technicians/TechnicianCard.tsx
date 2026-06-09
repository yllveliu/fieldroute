import React from "react";
import { Technician } from "../../services/techniciansApi";
import SkillBadge from "./SkillBadge";
import StatusBadge from "./StatusBadge";

export default function TechnicianCard({ tech }: { tech: Technician }) {
  return (
    <div className="technician-card">
      <div className="technician-card-header">
        <span className="technician-name">{tech.name}</span>
        <StatusBadge status={tech.status} />
      </div>
      <div className="technician-skills">
        {(tech.skills ?? []).map((skill) => (
          <SkillBadge key={skill} skill={skill} />
        ))}
        {(!tech.skills || tech.skills.length === 0) && (
          <span className="no-skills">No skills listed</span>
        )}
      </div>
    </div>
  );
}
