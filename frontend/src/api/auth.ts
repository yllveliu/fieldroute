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

export interface RegisterRequest {
  name:     string
  email:    string
  password: string
  role:     'dispatcher' | 'technician'
}

export interface RegisterResponse {
  user_id: number
  role:    'dispatcher' | 'technician'
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>('/auth/register', data)
}
