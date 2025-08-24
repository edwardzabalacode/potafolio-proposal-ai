import { Metadata } from 'next'
import { ProfileManagement } from '@/components/admin/profile-management'

export const metadata: Metadata = {
  title: 'Profile Management - Admin',
  description: 'Manage hero section content and personal information',
}

export default function ProfilePage() {
  return <ProfileManagement />
}
