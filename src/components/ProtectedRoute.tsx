import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>
            NRC <span>HALF</span>
          </h1>
          <p className="auth-setup-msg">
            Add your Supabase keys to <code>.env</code> (see <code>.env.example</code>), then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-loading">Loading…</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
