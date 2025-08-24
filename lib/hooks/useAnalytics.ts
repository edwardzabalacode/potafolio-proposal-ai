'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { analyticsService } from '@/lib/services/analytics-service'

export const useAnalytics = () => {
  const pathname = usePathname()

  // Helper function to check if current route should be tracked
  const shouldTrack = useCallback(() => {
    return !pathname.startsWith('/admin') && !pathname.startsWith('/auth')
  }, [pathname])

  // Get user UID for analytics
  const getAnalyticsUID = () => {
    // For public routes, we use global analytics (no userUID)
    // This ensures visitor data goes to global analytics collection
    return undefined
  }

  // Note: Page view tracking is handled by AnalyticsProvider
  // This hook only provides manual tracking functions

  return {
    trackPageView: (path: string) => {
      if (shouldTrack()) {
        analyticsService.trackPageView(path, getAnalyticsUID())
      }
    },
    trackProjectView: (projectId: string, projectTitle: string) => {
      if (shouldTrack()) {
        analyticsService.trackProjectView(
          projectId,
          projectTitle,
          getAnalyticsUID()
        )
      }
    },
    trackBlogView: (blogId: string, blogTitle: string) => {
      if (shouldTrack()) {
        analyticsService.trackBlogView(blogId, blogTitle, getAnalyticsUID())
      }
    },
    trackContactClick: () => {
      if (shouldTrack()) {
        analyticsService.trackContactClick(getAnalyticsUID())
      }
    },
  }
}
