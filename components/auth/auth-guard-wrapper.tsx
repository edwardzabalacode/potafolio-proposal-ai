'use client'

import { Suspense } from 'react'
import { AuthGuard, RequireAuth, RequireGuest } from './auth-guard'

// Loading component for auth pages
function AuthLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-green"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}

// Wrappers with Suspense boundaries
interface AuthGuardWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuardWrapper(props: AuthGuardWrapperProps) {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthGuard {...props} />
    </Suspense>
  )
}

interface RequireAuthWrapperProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export function RequireAuthWrapper(props: RequireAuthWrapperProps) {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <RequireAuth {...props} />
    </Suspense>
  )
}

export function RequireGuestWrapper(props: RequireAuthWrapperProps) {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <RequireGuest {...props} />
    </Suspense>
  )
}
