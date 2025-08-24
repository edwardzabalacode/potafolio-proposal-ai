import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { RequireGuestWrapper } from '@/components/auth/auth-guard-wrapper'

export const metadata: Metadata = {
  title: 'Login - Portfolio Admin',
  description: 'Sign in to access the admin dashboard',
}

export default function LoginPage() {
  return (
    <RequireGuestWrapper>
      <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
        <LoginForm />
      </div>
    </RequireGuestWrapper>
  )
}
