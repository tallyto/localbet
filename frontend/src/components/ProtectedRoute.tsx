import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const redirect = `${location.pathname}${location.search}`
  return isAuthenticated ? <>{children}</> : <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
}
