import { apiGet, apiPost, apiPostForm } from './client'

export type Role = 'customer' | 'technician' | 'dispatcher' | 'admin'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface LoginRequest {
  email:    string
  password: string
}

// Mirrors the backend LoginResponse schema (app/schemas/auth.py).
export interface LoginResponse {
  access_token:       string
  token_type:         string
  user_id:            number
  role:               Role
  // Only set for technicians; null otherwise.
  application_status: ApplicationStatus | null
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', data)
}

// Public registration only ever creates a customer — no role field.
export interface RegisterRequest {
  name:     string
  email:    string
  password: string
}

export interface RegisterResponse {
  user_id: number
  email:   string
  role:    Role
  message: string
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>('/auth/register', data)
}

export interface TechnicianApplicationResponse {
  user_id:            number
  technician_id:      number
  email:              string
  application_status: ApplicationStatus
  ai_match_score:     number | null
  message:            string
}

// Technician application: multipart because it carries the CV file.
export async function applyAsTechnician(data: {
  name:     string
  email:    string
  password: string
  skills:   string[]
  cv:       File
}): Promise<TechnicianApplicationResponse> {
  const form = new FormData()
  form.append('name', data.name)
  form.append('email', data.email)
  form.append('password', data.password)
  data.skills.forEach((s) => form.append('skills', s))
  form.append('cv', data.cv)
  return apiPostForm<TechnicianApplicationResponse>('/auth/apply', form)
}

export interface CurrentUser {
  user_id:            number
  email:              string
  role:               Role
  name:               string | null
  application_status: ApplicationStatus | null
}

export async function getMe(): Promise<CurrentUser> {
  return apiGet<CurrentUser>('/auth/me')
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/reset-password', {
    token,
    new_password: newPassword,
  })
}
