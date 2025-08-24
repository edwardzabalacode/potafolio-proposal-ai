'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pageNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/profile': 'Profile Management',
  '/admin/projects': 'Projects',
  '/admin/blog': 'Blog Management',
  '/admin/proposals': 'Proposal Generator',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

interface AdminHeaderProps {
  className?: string
}

export function AdminHeader({ className = '' }: AdminHeaderProps) {
  const pathname = usePathname()
  const currentPageName = pageNames[pathname] || 'Admin Panel'

  // Generate breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const name = segment === 'admin' ? 'Admin' : pageNames[path] || segment
    return { name, path }
  })

  return (
    <header
      className={`border-b-2 border-accent-green bg-bg-secondary px-6 py-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Page title and breadcrumbs */}
        <div>
          <h1 className="text-primary mb-1 text-2xl font-bold">
            {currentPageName}
          </h1>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-text-secondary">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center space-x-2">
                {index > 0 && <span>/</span>}
                <Link
                  href={crumb.path}
                  className="transition-colors hover:text-accent-green"
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* View Site Button */}
          <Button
            asChild
            variant="outline"
            className="border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary"
          >
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </Button>

          {/* Home Button */}
          <Button
            asChild
            variant="outline"
            className="border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary"
          >
            <Link href="/admin" className="flex items-center gap-2">
              <Home size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
