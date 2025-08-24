'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-md p-8">
        <div className="text-center">
          <div className="bg-accent-green/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              className="h-8 w-8 text-accent-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-primary mb-2 text-2xl font-bold">Email Sent</h1>

          <p className="mb-6 text-text-secondary">
            We&apos;ve sent a password reset link to{' '}
            <span className="text-primary font-medium">{email}</span>
          </p>

          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Check your email and follow the instructions to reset your
              password. If you don&apos;t see the email, check your spam folder.
            </p>

            <Link href="/auth/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-2 text-center text-2xl font-bold">
          Reset Password
        </h1>
        <p className="text-secondary text-center">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

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
            disabled={isLoading}
            required
          />
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
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="hover:text-accent-green/80 text-sm text-accent-green transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </Card>
  )
}
