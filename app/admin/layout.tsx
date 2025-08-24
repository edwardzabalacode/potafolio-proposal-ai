import { RequireAuthWrapper } from '@/components/auth/auth-guard-wrapper'
import { AdminLayout } from '@/components/admin/admin-layout'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminRootLayout({ children }: AdminLayoutProps) {
  return (
    <RequireAuthWrapper>
      <AdminLayout>{children}</AdminLayout>
    </RequireAuthWrapper>
  )
}
