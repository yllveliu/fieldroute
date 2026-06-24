// Split-host deploys (e.g. Vercel frontend + Render backend) inject the API's
// absolute URL at build time via VITE_API_URL. Locally it falls back to "/api",
// which the Vite dev server / nginx proxy forwards to the backend.
export const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Read the JWT from localStorage on each request so the API client stays in
// sync with AuthContext without a circular import.
function getToken(): string | null {
  return localStorage.getItem('fr_token')
}

// Build request headers, attaching the Authorization header when a token exists.
function authHeaders(withJson: boolean): Record<string, string> {
  const headers: Record<string, string> = {}
  if (withJson) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(false),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, body.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(true),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, err.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// POST multipart/form-data (file uploads). Deliberately does NOT set
// Content-Type so the browser adds the correct multipart boundary.
export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, err.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// GET a binary response (e.g. a CV PDF) with the auth header attached.
export async function apiGetBlob(path: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(false),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, err.detail ?? res.statusText)
  }
  return res.blob()
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, err.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(false),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, err.detail ?? res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
