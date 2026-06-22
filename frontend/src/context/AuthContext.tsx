import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Role = 'customer' | 'technician' | 'dispatcher' | 'admin'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface AuthUser {
  id:    number
  email: string
  name:  string
  role:  Role
  // Only meaningful for technicians; null/undefined for everyone else.
  applicationStatus?: ApplicationStatus | null
}

interface AuthContextValue {
  user:   AuthUser | null
  token:  string | null
  login:  (token: string, user: AuthUser) => void
  logout: () => void
  isAuth: boolean
}

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('fr_token')
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('fr_user')
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem('fr_token', newToken)
    localStorage.setItem('fr_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('fr_token')
    localStorage.removeItem('fr_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
