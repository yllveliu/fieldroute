import { apiPatch } from './client'
import { getJobById, type JobDetail } from './jobs'
import { getTechnicians, getTechnicianById } from './technicians'
import type { AuthUser } from '@/context/AuthContext'

// Statuses a technician is allowed to set via PATCH /technician/jobs/{id}/status.
export type TechnicianJobStatus = 'en_route' | 'done'

/**
 * Advance a job's status as the assigned technician (KAN-59).
 * Returns the updated job so the UI can refresh immediately.
 */
export async function updateTechnicianJobStatus(
  jobId: number,
  status: TechnicianJobStatus
): Promise<JobDetail> {
  return apiPatch<JobDetail>(`/technician/jobs/${jobId}/status`, { status })
}

/**
 * Resolve the Technician record for the logged-in user.
 *
 * GAP: the backend has no user→technician link (the User model has no
 * technician_id and the Technician model has no user_id), so we cannot ask the
 * API "which technician am I?". As a best-effort bridge we match the logged-in
 * user's name against the technician roster. This is intentionally NOT business
 * logic — it is a placeholder for a proper endpoint.
 *
 * TODO: replace with a dedicated API call (e.g. GET /technician/me) once the
 * backend associates a User with a Technician.
 */
export async function resolveCurrentTechnicianId(
  user: AuthUser
): Promise<number | null> {
  const roster = await getTechnicians()
  const match = roster.find(
    (t) => t.name.trim().toLowerCase() === user.name.trim().toLowerCase()
  )
  return match?.id ?? null
}

/**
 * Load the technician's current job detail via the preferred path:
 * GET /technicians/{id} (returns current_job) -> GET /jobs/{job_id}.
 * Returns null when the technician has no active job assigned.
 */
export async function getCurrentTechnicianJob(
  technicianId: number
): Promise<JobDetail | null> {
  const tech = await getTechnicianById(technicianId)
  if (tech.current_job == null) return null
  return getJobById(tech.current_job)
}

/**
 * Clearly-separated mock fallback used only when the logged-in user cannot be
 * resolved to a technician (the gap above). Lets the page render and demo its
 * states without a real user→technician link. Status changes are simulated
 * locally in this mode — no PATCH is sent.
 */
export const mockTechnicianJob: JobDetail = {
  id: 0,
  status: 'assigned',
  service_name: 'HVAC Maintenance',
  problem_description: 'AC unit not cooling properly — thermostat reads 72°F but rooms stay warm.',
  eta_message: 'Customer expects arrival within the 2–4 PM window.',
  technician: { id: 0, name: 'Demo Technician', status: 'on_job' },
  ai_service_type: 'HVAC',
  ai_confidence: 0.92,
  ai_explanation: 'Keywords "AC", "cooling" indicate an HVAC service request.',
}
