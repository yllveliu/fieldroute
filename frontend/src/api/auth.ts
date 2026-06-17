import { apiPost } from './client'

export interface LoginRequest {
  email:    string
  password: string
}

// Mirrors the backend LoginResponse schema (app/schemas/auth.py).
export interface LoginResponse {
  access_token: string
  token_type:   string
  user_id:      number
  role:         'dispatcher' | 'technician' | 'admin'
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', data)
}
