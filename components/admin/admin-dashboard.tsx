'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { useProjects } from '@/lib/hooks/use-projects'
import { useBlogPosts } from '@/lib/hooks/use-blog-posts'
import { useEffect, useState } from 'react'
import { analyticsService } from '@/lib/services/analytics-service'
import { AnalyticsSummary, AnalyticsStats } from '@/lib/types/analytics'
import { Project } from '@/lib/types/project'
import { BlogPost } from '@/lib/types/blog'
import { Card } from '@/components/ui/card'
import {
  User,
  FolderOpen,
  FileText,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react'

export function AdminDashboard() {
  const { user } = useAuth()
  const { projects } = useProjects(user)
  const { posts: blogPosts } = useBlogPosts(user)
  const [analyticsSummary, setAnalyticsSummary] =
    useState<AnalyticsSummary | null>(null)
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(
    null
  )
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Load analytics summary
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.uid) return

      try {
        const [summary, stats] = await Promise.all([
          analyticsService.getAnalyticsSummary(),
          analyticsService.getAnalyticsStats(),
        ])
        setAnalyticsSummary(summary)
        setAnalyticsStats(stats)
      } catch (error) {
        // Silently handle analytics loading errors
        // Error is handled by showing fallback values in UI
      } finally {
        setAnalyticsLoading(false)
      }
    }

    loadAnalytics()
  }, [user?.uid])

  const quickActions = [
    {
      name: 'Manage Profile',
      href: '/admin/profile',
      icon: User,
      description: 'Update personal info & hero section',
      color: 'text-blue-400',
    },
    {
      name: 'Add Project',
      href: '/admin/projects',
      icon: FolderOpen,
      description: 'Create new portfolio project',
      color: 'text-green-400',
    },
    {
      name: 'Write Post',
      href: '/admin/blog',
      icon: FileText,
      description: 'Create new blog article',
      color: 'text-purple-400',
    },
    {
      name: 'Generate Proposal',
      href: '/admin/proposals',
      icon: MessageSquare,
      description: 'AI-powered proposal creation',
      color: 'text-orange-400',
    },
    {
      name: 'View Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Check site performance',
      color: 'text-cyan-400',
    },
  ]

  // Calculate real stats
  const totalProjects = projects?.length || 0
  const totalBlogPosts = blogPosts?.length || 0
  const publishedProjects =
    projects?.filter((p: Project) => p.status === 'published').length || 0
  const publishedBlogPosts =
    blogPosts?.filter((p: BlogPost) => p.status === 'published').length || 0
  const totalPageViews = analyticsSummary?.allTime.pageViews || 0

  const stats = [
    {
      name: 'Total Projects',
      value: totalProjects.toString(),
      icon: FolderOpen,
      change:
        publishedProjects > 0
          ? `${publishedProjects} published`
          : 'No published projects',
      changeType: 'positive' as const,
    },
    {
      name: 'Blog Posts',
      value: totalBlogPosts.toString(),
      icon: FileText,
      change:
        publishedBlogPosts > 0
          ? `${publishedBlogPosts} published`
          : 'No published posts',
      changeType: 'positive' as const,
    },
    {
      name: 'Site Views',
      value: analyticsLoading ? '-' : totalPageViews.toString(),
      icon: TrendingUp,
      change: analyticsSummary
        ? `${analyticsSummary.thisMonth.pageViews} this month`
        : analyticsLoading
          ? 'Loading...'
          : 'No data yet',
      changeType: 'positive' as const,
    },
    {
      name: 'Contact Clicks',
      value: analyticsLoading
        ? '-'
        : (analyticsSummary?.allTime.contactClicks || 0).toString(),
      icon: MessageSquare,
      change: analyticsSummary
        ? `${analyticsSummary.thisMonth.contactClicks} this month`
        : analyticsLoading
          ? 'Loading...'
          : 'No data yet',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg border-2 border-accent-green bg-bg-secondary p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent-green text-bg-primary">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-primary mb-2 text-2xl font-bold">
              Welcome back, {user?.displayName || 'Admin'}!
            </h2>
            <p className="text-text-secondary">
              Manage your portfolio content, generate proposals, and track your
              site performance.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h3 className="text-primary mb-4 text-lg font-semibold">Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.name} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.name}</p>
                    <div className="flex items-center gap-2">
                      {analyticsLoading &&
                      (stat.name === 'Site Views' ||
                        stat.name === 'Contact Clicks') ? (
                        <Loader2 className="h-5 w-5 animate-spin text-accent-green" />
                      ) : (
                        <p className="text-primary text-2xl font-bold">
                          {stat.value}
                        </p>
                      )}
                    </div>
                  </div>
                  <Icon size={24} className="text-accent-green" />
                </div>
                <div className="mt-4 flex items-center">
                  <span
                    className={
                      stat.changeType === 'positive'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="ml-2 text-sm text-text-secondary">
                    from last month
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-primary mb-4 text-lg font-semibold">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(action => {
            const Icon = action.icon
            return (
              <Card
                key={action.name}
                className="group p-6 transition-all hover:border-accent-green"
              >
                <Link href={action.href} className="block">
                  <div className="flex items-center gap-4">
                    <Icon
                      size={24}
                      className={`${action.color} transition-colors group-hover:text-accent-green`}
                    />
                    <div>
                      <h4 className="text-primary font-medium transition-colors group-hover:text-accent-green">
                        {action.name}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-primary mb-4 text-lg font-semibold">
          Recent Activity
        </h3>
        <Card className="p-6">
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-accent-green" />
                <p className="text-text-secondary">
                  Loading recent activity...
                </p>
              </div>
            </div>
          ) : analyticsStats?.recentActivity &&
            analyticsStats.recentActivity.length > 0 ? (
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {analyticsStats.recentActivity.slice(0, 5).map((event, index) => (
                <div
                  key={index}
                  className="border-border/50 flex items-start gap-3 rounded border p-3"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {event.eventType === 'page_view' && (
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    )}
                    {event.eventType === 'project_view' && (
                      <FolderOpen className="h-4 w-4 text-green-400" />
                    )}
                    {event.eventType === 'blog_view' && (
                      <FileText className="h-4 w-4 text-purple-400" />
                    )}
                    {event.eventType === 'contact_click' && (
                      <MessageSquare className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary">
                        {event.eventType === 'page_view' && 'Page visited'}
                        {event.eventType === 'project_view' && 'Project viewed'}
                        {event.eventType === 'blog_view' && 'Blog post read'}
                        {event.eventType === 'contact_click' &&
                          'Contact button clicked'}
                      </p>
                      <span className="ml-2 flex-shrink-0 text-xs text-text-muted">
                        {event.eventData.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="truncate text-sm text-text-secondary">
                      {event.eventType === 'page_view' && event.eventData.path}
                      {event.eventType === 'project_view' &&
                        event.eventData.projectTitle}
                      {event.eventType === 'blog_view' &&
                        event.eventData.blogTitle}
                      {event.eventType === 'contact_click' &&
                        'Visitor interested in hiring'}
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-border/50 border-t pt-2">
                <Link
                  href="/admin/analytics"
                  className="hover:text-accent-green/80 text-sm font-medium text-accent-green"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              <div className="text-center">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-2">No recent activity yet</p>
                <p className="text-sm">
                  Activity will appear as visitors interact with your site
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
