import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>
          NRC <span>HALF</span>
        </h1>
        <h2 className="auth-title">{title}</h2>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <div className="auth-footer">{footer}</div>
      </div>
    </div>
  )
}

export function AuthLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <Link to={to} className="auth-link">
      {children}
    </Link>
  )
}
