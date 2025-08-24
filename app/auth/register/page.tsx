import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { RequireGuestWrapper } from '@/components/auth/auth-guard-wrapper'

export const metadata: Metadata = {
  title: 'Register - Portfolio Admin',
  description: 'Create an account to access the admin dashboard',
}

export default function RegisterPage() {
  return (
    <RequireGuestWrapper>
      <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
        <RegisterForm />
      </div>
    </RequireGuestWrapper>
  )
}
