import { Metadata } from 'next'
import { BlogManagement } from '@/components/admin/blog-management'

export const metadata: Metadata = {
  title: 'Blog Management - Admin',
  description: 'Manage blog posts, create articles, and organize content',
}

export default function BlogPage() {
  return <BlogManagement />
}
