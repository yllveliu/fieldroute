import { apiDelete, apiGet, apiGetBlob, apiPatch, apiPost } from './client'
import type { Technician } from './technicians'
import type { Part } from './parts'

// ── Technician admin (KAN-61) ─────────────────────────────────────────────────

export interface CreateTechnicianPayload {
  name: string
  email: string
  password: string
  skills: string[]
  status: 'available' | 'on_job' | 'offline'
}

export interface UpdateTechnicianPayload {
  name?: string
  skills?: string[]
  status?: 'available' | 'on_job' | 'offline'
}

// POST /admin/technicians
export async function adminCreateTechnician(data: CreateTechnicianPayload): Promise<Technician> {
  return apiPost<Technician>('/admin/technicians', data)
}

// PATCH /admin/technicians/{id}
export async function adminUpdateTechnician(id: number, data: UpdateTechnicianPayload): Promise<Technician> {
  return apiPatch<Technician>(`/admin/technicians/${id}`, data)
}

// DELETE /admin/technicians/{id}  (soft-delete / deactivate)
export async function adminDeleteTechnician(id: number): Promise<void> {
  return apiDelete<void>(`/admin/technicians/${id}`)
}

// ── Parts admin (KAN-62) ──────────────────────────────────────────────────────

export interface CreatePartPayload {
  name: string
  sku: string
  stock_quantity: number
  reserved_qty: number
  low_stock_threshold: number
}

export interface UpdatePartPayload {
  stock_quantity?: number
  reserved_qty?: number
  low_stock_threshold?: number
}

// POST /admin/parts
export async function adminCreatePart(data: CreatePartPayload): Promise<Part> {
  return apiPost<Part>('/admin/parts', data)
}

// PATCH /admin/parts/{id}
export async function adminUpdatePart(id: number, data: UpdatePartPayload): Promise<Part> {
  return apiPatch<Part>(`/admin/parts/${id}`, data)
}

// ── Technician applications ───────────────────────────────────────────────────

export interface TechnicianApplication {
  id: number
  name: string
  email: string
  skills: string[]
  application_status: 'pending' | 'approved' | 'rejected'
  ai_match_score: number | null
  ai_match_summary: string | null
  cv_filename: string | null
  has_cv: boolean
}

// GET /admin/applications
export async function adminListApplications(): Promise<TechnicianApplication[]> {
  return apiGet<TechnicianApplication[]>('/admin/applications')
}

// POST /admin/applications/{id}/approve
export async function adminApproveApplication(id: number): Promise<Technician> {
  return apiPost<Technician>(`/admin/applications/${id}/approve`)
}

// POST /admin/applications/{id}/decline
export async function adminDeclineApplication(id: number): Promise<{ message: string }> {
  return apiPost<{ message: string }>(`/admin/applications/${id}/decline`)
}

// GET /admin/applications/{id}/cv — returns the PDF as a Blob.
export async function adminFetchApplicationCv(id: number): Promise<Blob> {
  return apiGetBlob(`/admin/applications/${id}/cv`)
}

// ── Dispatcher accounts ───────────────────────────────────────────────────────

export interface CreateDispatcherPayload {
  name: string
  email: string
  password: string
}

// POST /admin/dispatchers
export async function adminCreateDispatcher(data: CreateDispatcherPayload): Promise<{
  user_id: number
  email: string
  role: string
  message: string
}> {
  return apiPost('/admin/dispatchers', data)
}

export interface StaffListItem {
  user_id: number
  email: string
  role: string
}

// GET /admin/dispatchers
export async function adminListDispatchers(): Promise<StaffListItem[]> {
  return apiGet<StaffListItem[]>('/admin/dispatchers')
}

// DELETE /admin/dispatchers/{id}
export async function adminDeleteDispatcher(userId: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/admin/dispatchers/${userId}`)
}

export interface UpdateDispatcherPayload {
  email?: string
  password?: string
}

// PATCH /admin/dispatchers/{id}
export async function adminUpdateDispatcher(userId: number, data: UpdateDispatcherPayload): Promise<StaffListItem> {
  return apiPatch<StaffListItem>(`/admin/dispatchers/${userId}`, data)
}
