export interface SkillConfig {
  category: string
  icon: string      // lucide-react icon component name
  color: string     // hex from --fr-* tokens
}

export const SKILL_CONFIG: Record<string, SkillConfig> = {
  plumbing:      { category: 'Plumbing',   icon: 'Wrench',      color: '#2563EB' },
  pipework:      { category: 'Plumbing',   icon: 'Wrench',      color: '#2563EB' },
  drainage:      { category: 'Plumbing',   icon: 'Droplets',    color: '#2563EB' },
  electrical:    { category: 'Electrical', icon: 'Zap',         color: '#D97706' },
  wiring:        { category: 'Electrical', icon: 'Zap',         color: '#D97706' },
  solar:         { category: 'Electrical', icon: 'Sun',         color: '#D97706' },
  HVAC:          { category: 'HVAC',       icon: 'Wind',        color: '#06B6D4' },
  refrigeration: { category: 'HVAC',       icon: 'Thermometer', color: '#06B6D4' },
  ventilation:   { category: 'HVAC',       icon: 'Wind',        color: '#06B6D4' },
}

export function getSkillConfig(skill: string): SkillConfig {
  return SKILL_CONFIG[skill] ?? {
    category: skill,
    icon: 'Wrench',
    color: '#64748B',
  }
}
