export type AuthFieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required'
  if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address'
  return undefined
}

export function validatePassword(password: string, forSignup = false): string | undefined {
  if (!password) return 'Password is required'
  if (forSignup && password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  return undefined
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return undefined
}

export function validateLoginForm(email: string, password: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  return errors
}

export function validateSignupForm(
  email: string,
  password: string,
  confirmPassword: string,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password, true)
  const confirmError = validateConfirmPassword(password, confirmPassword)
  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  if (confirmError) errors.confirmPassword = confirmError
  return errors
}

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
