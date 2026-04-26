import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return null // or a spinner

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}