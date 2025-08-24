'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  fallback,
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      // For protected routes, redirect to login with current path as redirect param
      const redirectUrl = new URL(redirectTo, window.location.origin)
      redirectUrl.searchParams.set('redirect', pathname)
      router.push(redirectUrl.toString().replace(window.location.origin, ''))
      return
    }

    if (!requireAuth && user) {
      // For guest routes, check if there's a redirect parameter
      const redirectPath = searchParams.get('redirect') || '/admin'
      router.push(redirectPath)
      return
    }

    setShouldRender(true)
  }, [user, loading, requireAuth, redirectTo, router, searchParams, pathname])

  if (loading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-bg-primary">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-green"></div>
            <p className="text-text-secondary">Loading...</p>
          </div>
        </div>
      )
    )
  }

  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}

// Specific guards for common use cases
export function RequireAuth({
  children,
  redirectTo,
  fallback,
}: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} redirectTo={redirectTo} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function RequireGuest({
  children,
  redirectTo,
  fallback,
}: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={false} redirectTo={redirectTo} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}
