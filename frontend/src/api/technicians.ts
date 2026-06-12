import { apiGet } from './client'

export interface Technician {
  id: number
  name: string
  skills: string[]
  status: string
  current_job: number | null
}

export async function getTechnicians(status?: string): Promise<Technician[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiGet<Technician[]>(`/technicians${query}`)
}

export async function getTechnicianById(id: number): Promise<Technician> {
  return apiGet<Technician>(`/technicians/${id}`)
}
