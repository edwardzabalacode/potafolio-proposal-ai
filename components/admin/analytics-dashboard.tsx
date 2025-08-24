'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { analyticsService } from '@/lib/services/analytics-service'
import { AnalyticsStats, AnalyticsSummary } from '@/lib/types/analytics'
import { Card } from '@/components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary">
            {value.toLocaleString()}
          </p>
        </div>
        <Icon size={24} className={color} />
      </div>
    </Card>
  )
}

interface PeriodStatsProps {
  title: string
  stats: {
    pageViews: number
    uniqueVisitors: number
    contactClicks: number
  }
}

function PeriodStats({ title, stats }: PeriodStatsProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-text-primary">{title}</h4>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center">
          <p className="text-text-secondary">Page Views</p>
          <p className="font-bold text-text-primary">{stats.pageViews}</p>
        </div>
        <div className="text-center">
          <p className="text-text-secondary">Unique Visitors</p>
          <p className="font-bold text-text-primary">{stats.uniqueVisitors}</p>
        </div>
        <div className="text-center">
          <p className="text-text-secondary">Contact Clicks</p>
          <p className="font-bold text-text-primary">{stats.contactClicks}</p>
        </div>
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = useCallback(async () => {
    if (!user?.uid) return

    try {
      const [analyticsStats, analyticsSummary] = await Promise.all([
        analyticsService.getAnalyticsStats(),
        analyticsService.getAnalyticsSummary(),
      ])

      setStats(analyticsStats)
      setSummary(analyticsSummary)
    } catch (error) {
      // Silently handle analytics loading errors
      // Error is handled by showing fallback UI states
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.uid])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
  }

  useEffect(() => {
    loadAnalytics()
  }, [user?.uid, loadAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-green" />
          <p className="text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats || !summary) {
    return (
      <div className="py-12 text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-text-muted opacity-50" />
        <p className="text-text-muted">No analytics data available yet.</p>
        <p className="mt-2 text-sm text-text-muted">
          Analytics will appear as visitors interact with your site.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Analytics Dashboard
          </h2>
          <p className="text-text-secondary">
            Track your site performance and visitor engagement
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Overview
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Page Views"
            value={stats.totalPageViews}
            icon={Eye}
            color="text-blue-400"
          />
          <StatsCard
            title="Unique Visitors"
            value={stats.uniqueVisitors}
            icon={Users}
            color="text-green-400"
          />
          <StatsCard
            title="Contact Clicks"
            value={stats.contactClicks}
            icon={MousePointer}
            color="text-purple-400"
          />
          <StatsCard
            title="Project Views"
            value={stats.topProjects.reduce(
              (sum, project) => sum + project.views,
              0
            )}
            icon={TrendingUp}
            color="text-orange-400"
          />
        </div>
      </div>

      {/* Time Period Breakdown */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Time Period Breakdown
        </h3>
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PeriodStats title="Today" stats={summary.today} />
            <PeriodStats title="This Week" stats={summary.thisWeek} />
            <PeriodStats title="This Month" stats={summary.thisMonth} />
            <PeriodStats title="All Time" stats={summary.allTime} />
          </div>
        </Card>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Projects */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Top Projects
          </h3>
          <Card className="p-6">
            {stats.topProjects.length > 0 ? (
              <div className="space-y-4">
                {stats.topProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {project.title}
                      </p>
                      <p className="text-sm text-text-secondary">
                        #{index + 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-green">
                        {project.views}
                      </p>
                      <p className="text-sm text-text-secondary">views</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-text-muted opacity-50" />
                <p className="text-text-muted">No project views yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Top Blog Posts */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Top Blog Posts
          </h3>
          <Card className="p-6">
            {stats.topBlogPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.topBlogPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {post.title}
                      </p>
                      <p className="text-sm text-text-secondary">
                        #{index + 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-green">
                        {post.views}
                      </p>
                      <p className="text-sm text-text-secondary">views</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BarChart3 className="mx-auto mb-2 h-8 w-8 text-text-muted opacity-50" />
                <p className="text-text-muted">No blog post views yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Recent Activity
        </h3>
        <Card className="p-6">
          {stats.recentActivity.length > 0 ? (
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {stats.recentActivity.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded border border-border p-3"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {event.eventType === 'page_view' && (
                      <Eye className="h-4 w-4 text-blue-400" />
                    )}
                    {event.eventType === 'project_view' && (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    )}
                    {event.eventType === 'blog_view' && (
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                    )}
                    {event.eventType === 'contact_click' && (
                      <MousePointer className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">
                        {event.eventType === 'page_view' && 'Page View'}
                        {event.eventType === 'project_view' && 'Project View'}
                        {event.eventType === 'blog_view' && 'Blog View'}
                        {event.eventType === 'contact_click' && 'Contact Click'}
                      </p>
                      <span className="text-xs text-text-muted">
                        {event.eventData.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {event.eventType === 'page_view' && event.eventData.path}
                      {event.eventType === 'project_view' &&
                        event.eventData.projectTitle}
                      {event.eventType === 'blog_view' &&
                        event.eventData.blogTitle}
                      {event.eventType === 'contact_click' &&
                        'Upwork button clicked'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-text-muted opacity-50" />
              <p className="text-text-muted">No recent activity</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
