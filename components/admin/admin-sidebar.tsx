'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  User,
  FolderOpen,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  BarChart3,
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Profile',
    href: '/admin/profile',
    icon: User,
    description: 'Personal info & hero section',
  },
  {
    name: 'Projects',
    href: '/admin/projects',
    icon: FolderOpen,
    description: 'Portfolio projects',
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: FileText,
    description: 'Blog posts & articles',
  },
  {
    name: 'Proposals',
    href: '/admin/proposals',
    icon: MessageSquare,
    description: 'AI proposal generator',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Site performance',
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed:', error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed left-4 top-4 z-50 rounded-lg border-2 border-accent-green bg-bg-secondary p-2 text-accent-green transition-colors hover:bg-accent-green hover:text-bg-primary md:hidden"
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full transform border-r-2 border-accent-green bg-bg-secondary transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-80'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:transform-none ${className}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b-2 border-accent-green px-6 py-4">
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <div>
                  <h1 className="text-primary mb-1 text-2xl font-bold">
                    Admin Panel
                  </h1>
                  <div className="text-sm text-text-secondary">
                    Portfolio Management
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="mb-1 h-8"></div>
                  <div className="h-5"></div>
                </div>
              )}

              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden rounded-lg border border-accent-green p-2 text-accent-green transition-colors hover:bg-accent-green hover:text-bg-primary md:block"
                aria-label="Toggle sidebar"
              >
                <Menu size={16} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigationItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-4 rounded-lg border-2 p-3 transition-all duration-200 ${
                        isActive
                          ? 'bg-accent-green/10 border-accent-green text-accent-green'
                          : 'border-transparent text-text-secondary hover:border-accent-green hover:text-accent-green'
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="min-w-0">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-70">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t-2 border-accent-green p-4">
            {!isCollapsed && (
              <div className="mb-4 rounded-lg bg-bg-tertiary p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green text-bg-primary">
                    <User size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-primary truncate text-sm font-medium">
                      {user?.displayName || 'Admin User'}
                    </div>
                    <div className="truncate text-xs text-text-secondary">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogout}
              variant="outline"
              className={`w-full border-red-400 text-red-400 hover:border-red-300 hover:text-red-300 ${
                isCollapsed ? 'px-3' : 'gap-3'
              }`}
            >
              <LogOut size={16} />
              {!isCollapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
