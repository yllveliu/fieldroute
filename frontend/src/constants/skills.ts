// The exact skills the company hires technicians for. Must match the backend
// list in app/core/roles.py (SKILLS).
export const SKILLS = [
  'plumbing',
  'electricity',
  'hvac',
  'carpentry',
  'drain cleaning',
  'solar panel install',
] as const

export type Skill = (typeof SKILLS)[number]
