'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function LoginForm({
  onSuccess,
  redirectTo = '/admin',
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is temporarily blocked
    if (isBlocked) {
      setError(
        'Too many failed attempts. Please wait 5 minutes before trying again.'
      )
      return
    }

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Prevent rapid-fire login attempts
    if (loginAttempts >= 5) {
      setIsBlocked(true)
      setError(
        'Too many failed attempts. Please wait 5 minutes before trying again.'
      )
      setTimeout(
        () => {
          setIsBlocked(false)
          setLoginAttempts(0)
        },
        5 * 60 * 1000
      ) // 5 minutes
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      // Reset login attempts on successful login
      setLoginAttempts(0)
      onSuccess?.()

      // Validate redirect parameter to prevent open redirect attacks
      const redirectPath = searchParams.get('redirect') || redirectTo
      // Only allow internal redirects (starting with / but not //)
      const safeRedirectPath =
        redirectPath.startsWith('/') && !redirectPath.startsWith('//')
          ? redirectPath
          : redirectTo

      router.push(safeRedirectPath)
    } catch (error) {
      // Increment login attempts on failure
      setLoginAttempts(prev => prev + 1)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-2 text-center text-2xl font-bold">
          Admin Login
        </h1>
        <p className="text-secondary text-center">
          Sign in to access the dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-primary mb-2 block text-sm font-medium"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="text-primary w-full rounded-lg border border-bg-tertiary bg-bg-secondary px-4 py-3 placeholder-text-secondary transition-colors focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
              placeholder="Enter your email"
              disabled={isLoading || isBlocked}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-primary mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="text-primary w-full rounded-lg border border-bg-tertiary bg-bg-secondary px-4 py-3 placeholder-text-secondary transition-colors focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
              placeholder="Enter your password"
              disabled={isLoading || isBlocked}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-medium"
          disabled={isLoading || isBlocked}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/auth/forgot-password"
            className="hover:text-accent-green/80 text-sm text-accent-green transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </Card>
  )
}
