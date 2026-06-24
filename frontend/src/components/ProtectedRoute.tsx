import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/context/AuthContext'

interface Props {
  children: ReactNode
  // One or more roles allowed to view the route. Omit to allow any logged-in user.
  allow?: Role[]
}

export function ProtectedRoute({ children, allow }: Props) {
  const { isAuth, user } = useAuth()

  if (!isAuth) return <Navigate to="/login" replace />

  // A technician whose application is not yet approved can log in but must be
  // funnelled to the status screen rather than any real page.
  if (
    user?.role === 'technician' &&
    user.applicationStatus &&
    user.applicationStatus !== 'approved'
  ) {
    return <Navigate to="/application-status" replace />
  }

  if (allow && user && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
