import { apiGet, apiPost } from './client'

export interface TechnicianSummary {
  id: number
  name: string
  status: string
}

export interface JobDetail {
  id: number
  status: string
  service_name: string | null
  problem_description: string | null
  eta_message: string | null
  technician: TechnicianSummary | null
  ai_service_type: string | null
  ai_confidence: number | null
  ai_explanation: string | null
}

export interface ClassifyResult {
  job_id: number
  previous_status: string
  new_status: string
  ai_service_type: string
  ai_confidence: number
  ai_explanation: string
}

export interface CreateJobRequest {
  customer_name: string
  phone: string
  address: string
  raw_description: string
}

export interface CreateJobResponse {
  job_id: number
  status: string
  message: string
}

export async function createJob(
  data: CreateJobRequest
): Promise<CreateJobResponse> {
  return apiPost<CreateJobResponse>('/jobs', data)
}

export async function getJobById(id: number): Promise<JobDetail> {
  return apiGet<JobDetail>(`/jobs/${id}`)
}

export async function classifyJob(id: number): Promise<ClassifyResult> {
  return apiPost<ClassifyResult>(`/jobs/${id}/classify`)
}
