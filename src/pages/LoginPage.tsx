import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import {
  hasFieldErrors,
  validateLoginForm,
  type AuthFieldErrors,
} from '../lib/authValidation'

export function LoginPage() {
  const { signIn, session, loading, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!configured) {
    return (
      <AuthLayout
        title="Log in"
        subtitle="Supabase is not configured yet."
        footer={<p>Copy .env.example to .env and add your project keys.</p>}
      >
        <p className="auth-setup-msg">
          Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart{' '}
          <code>npm run dev</code>.
        </p>
      </AuthLayout>
    )
  }

  if (!loading && session) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const errors = validateLoginForm(email, password)
    setFieldErrors(errors)
    if (hasFieldErrors(errors)) return

    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      setFormError(error)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Sign in to access your half marathon training plan."
      footer={
        <p>
          No account? <Link to="/signup">Create one</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="login-email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          />
          {fieldErrors.password && (
            <p id="login-password-error" className="field-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}
