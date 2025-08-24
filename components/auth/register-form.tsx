'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface RegisterFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function RegisterForm({
  onSuccess,
  redirectTo = '/admin',
}: RegisterFormProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      return 'Display name is required'
    }
    if (!formData.email.trim()) {
      return 'Email is required'
    }
    if (!formData.password) {
      return 'Password is required'
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await register(formData.email, formData.password, formData.displayName)
      onSuccess?.()

      // Check for redirect parameter from URL, otherwise use default
      const redirectPath = searchParams.get('redirect') || redirectTo
      router.push(redirectPath)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-2 text-center text-2xl font-bold">
          Create Account
        </h1>
        <p className="text-secondary text-center">
          Sign up to access the admin dashboard
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
              htmlFor="displayName"
              className="text-primary mb-2 block text-sm font-medium"
            >
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              className="text-primary w-full rounded-lg border border-bg-tertiary bg-bg-secondary px-4 py-3 placeholder-text-secondary transition-colors focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
              placeholder="Enter your display name"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-primary mb-2 block text-sm font-medium"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="text-primary w-full rounded-lg border border-bg-tertiary bg-bg-secondary px-4 py-3 placeholder-text-secondary transition-colors focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
              placeholder="Enter your email"
              disabled={isLoading}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="text-primary w-full rounded-lg border border-bg-tertiary bg-bg-secondary px-4 py-3 placeholder-text-secondary transition-colors focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
              placeholder="Create a password"
              disabled={isLoading}
              required
            />
            <p className="mt-1 text-xs text-text-secondary">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-primary mb-2 block text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="text-primary w-full rounded-lg border border-bg-tertiary bg-bg-secondary px-4 py-3 placeholder-text-secondary transition-colors focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
              placeholder="Confirm your password"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-medium"
          disabled={isLoading}
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
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center">
          <div className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="hover:text-accent-green/80 text-accent-green transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </Card>
  )
}
