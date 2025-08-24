import { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Portfolio',
  description: 'Admin dashboard for managing portfolio content',
}

export default function AdminPage() {
  return <AdminDashboard />
}
