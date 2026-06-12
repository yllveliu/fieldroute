import type { JobDetail } from './jobs'
import type { Technician } from './technicians'

export interface DispatchSummary {
  jobs: JobDetail[]
  technicians: Technician[]
}

export async function getDispatchSummary(): Promise<DispatchSummary> {
  const { getTechnicians } = await import('./technicians')
  const technicians = await getTechnicians()
  // jobs list endpoint may not exist yet — return empty array as fallback
  let jobs: JobDetail[] = []
  try {
    const { apiGet } = await import('./client')
    jobs = await apiGet<JobDetail[]>('/jobs')
  } catch {
    jobs = []
  }
  return { jobs, technicians }
}
