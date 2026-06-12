import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getSkillConfig } from '@/data'

interface SkillBadgeProps {
  skill: string
  matched?: boolean
}

export function SkillBadge({ skill, matched = false }: SkillBadgeProps) {
  const config = getSkillConfig(skill)
  const IconComponent = Icons[config.icon as keyof typeof Icons] as LucideIcon | undefined

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors
        ${matched
          ? 'bg-blue-100 text-blue-800 border-blue-300'
          : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
    >
      {IconComponent && <IconComponent className="w-3 h-3" />}
      {skill}
    </span>
  )
}
