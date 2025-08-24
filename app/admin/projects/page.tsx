import { Metadata } from 'next'
import { ProjectsManagement } from '@/components/admin/projects-management'

export const metadata: Metadata = {
  title: 'Projects Management - Admin',
  description:
    'Manage portfolio projects, add new projects, and organize content',
}

export default function ProjectsPage() {
  return <ProjectsManagement />
}
