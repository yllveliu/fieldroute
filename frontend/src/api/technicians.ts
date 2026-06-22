import { apiGet } from './client'

export interface Technician {
  id: number
  name: string
  skills: string[]
  status: string
  current_job: number | null
}

export interface GetTechniciansOptions {
  status?: string
  // Exclude the technician who requested this job (so they aren't offered as
  // the assignee for their own request).
  excludeJobId?: number
  // Only active, approved technicians (for assignment candidate lists).
  assignableOnly?: boolean
}

export async function getTechnicians(opts: GetTechniciansOptions = {}): Promise<Technician[]> {
  const params = new URLSearchParams()
  if (opts.status) params.set('status', opts.status)
  if (opts.excludeJobId !== undefined) params.set('exclude_job_id', String(opts.excludeJobId))
  if (opts.assignableOnly) params.set('assignable_only', 'true')
  const query = params.toString()
  return apiGet<Technician[]>(`/technicians/${query ? `?${query}` : ''}`)
}

export async function getTechnicianById(id: number): Promise<Technician> {
  return apiGet<Technician>(`/technicians/${id}`)
}
