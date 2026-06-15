import { Avatar, SkillBadge } from '@/components/primitives'
import type { Technician } from '@/api'

interface TechnicianCardProps {
  technician: Technician
  matchedSkills?: string[]
}

export function TechnicianCard({ technician, matchedSkills = [] }: TechnicianCardProps) {
  const statusLabel =
    technician.status === 'available' ? 'Available' :
    technician.status === 'on_job'    ? 'On Job'    : 'Offline'

  const statusColor =
    technician.status === 'available' ? 'text-green-600' :
    technician.status === 'on_job'    ? 'text-amber-600' : 'text-slate-400'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex gap-3">
      <Avatar name={technician.name} status={technician.status} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {technician.name}
          </p>
          <span className={`text-xs font-medium shrink-0 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {technician.current_job && (
          <p className="mt-0.5 text-xs text-slate-500">
            Job #{technician.current_job}
          </p>
        )}

        {/* Skill badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          {technician.skills.map(skill => (
            <SkillBadge
              key={skill}
              skill={skill}
              matched={matchedSkills.includes(skill)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
