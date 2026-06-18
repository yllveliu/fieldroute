import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

interface Props {
  children: ReactNode
  requiredRole?: 'dispatcher' | 'technician'
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuth, user } = useAuth()

  if (!isAuth) return <Navigate to="/login" replace />

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
