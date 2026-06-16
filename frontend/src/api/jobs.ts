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

export interface JobTrackingResponse {
  id:               number
  status:           string
  service_name:     string
  customer_name:    string
  eta_message:      string | null
  ai_service_type:  string | null
  ai_confidence:    number | null
  ai_explanation:   string | null
  technician?: {
    id:     number
    name:   string
    skills: string[]
    status: string
  } | null
}

export async function getJob(id: number): Promise<JobTrackingResponse> {
  return apiGet<JobTrackingResponse>(`/jobs/${id}`)
}

export async function classifyJob(id: number): Promise<ClassifyResult> {
  return apiPost<ClassifyResult>(`/jobs/${id}/classify`)
}

export interface AssignJobRequest {
  technician_id: number
  part_ids?: number[]
}

export interface AssignJobResponse {
  job_id: number
  technician_id: number
  new_job_status: string
  new_technician_status: string
  reserved_part_ids: number[]
}

export async function assignJob(
  jobId: number,
  data: AssignJobRequest
): Promise<AssignJobResponse> {
  return apiPost<AssignJobResponse>(`/jobs/${jobId}/assign`, data)
}
