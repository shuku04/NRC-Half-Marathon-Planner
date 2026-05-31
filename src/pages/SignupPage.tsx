import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import {
  hasFieldErrors,
  validateSignupForm,
  type AuthFieldErrors,
} from '../lib/authValidation'

export function SignupPage() {
  const { signUp, session, loading, configured } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!configured) {
    return (
      <AuthLayout
        title="Sign up"
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
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    const errors = validateSignupForm(email, password, confirmPassword)
    setFieldErrors(errors)
    if (hasFieldErrors(errors)) return

    setSubmitting(true)
    const { error, needsEmailConfirm } = await signUp(email, password)
    setSubmitting(false)

    if (error) {
      setFormError(error)
      return
    }

    if (needsEmailConfirm) {
      setSuccessMessage('Check your email to confirm your account, then log in.')
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Sign up"
      subtitle="Create an account to save and sync your training progress."
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="signup-email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
          />
          {fieldErrors.password && (
            <p id="signup-password-error" className="field-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="signup-confirm">Confirm password</label>
          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? 'signup-confirm-error' : undefined
            }
          />
          {fieldErrors.confirmPassword && (
            <p id="signup-confirm-error" className="field-error" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        {successMessage && (
          <p className="form-success" role="status">
            {successMessage}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  )
}
