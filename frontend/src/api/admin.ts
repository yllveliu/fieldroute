import { apiDelete, apiPatch, apiPost } from './client'
import type { Technician } from './technicians'
import type { Part } from './parts'

// ── Technician admin (KAN-61) ─────────────────────────────────────────────────

export interface CreateTechnicianPayload {
  name: string
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
