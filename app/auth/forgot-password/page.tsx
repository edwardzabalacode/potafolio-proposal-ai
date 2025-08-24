import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { RequireGuestWrapper } from '@/components/auth/auth-guard-wrapper'

export const metadata: Metadata = {
  title: 'Reset Password - Portfolio Admin',
  description: 'Reset your password to access the admin dashboard',
}

export default function ForgotPasswordPage() {
  return (
    <RequireGuestWrapper>
      <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
        <ForgotPasswordForm />
      </div>
    </RequireGuestWrapper>
  )
}
