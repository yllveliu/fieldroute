import { apiGet } from './client'

export interface JobsByStatus {
  new?:         number
  categorized?: number
  assigned?:    number
  en_route?:    number
  done?:        number
  [key: string]: number | undefined
}

export interface AnalyticsResponse {
  jobs_today:                 number
  jobs_by_status:             JobsByStatus
  available_technicians:      number
  avg_resolution_hours:       number
  technician_utilization_pct: number
}

// TODO: remove once GET /dispatcher/analytics (KAN-63) is confirmed live in all envs.
export const MOCK_ANALYTICS: AnalyticsResponse = {
  jobs_today:                 8,
  jobs_by_status:             { new: 2, categorized: 3, assigned: 1, en_route: 1, done: 1 },
  available_technicians:      4,
  avg_resolution_hours:       2.3,
  technician_utilization_pct: 62,
}

// TODO: replace with API call — GET /dispatcher/analytics (KAN-63)
export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  return apiGet<AnalyticsResponse>('/dispatcher/analytics')
}
