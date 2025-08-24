import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { logEvent } from 'firebase/analytics'
import { db, analytics } from '@/lib/firebase/config'
import {
  AnalyticsEvent,
  AnalyticsStats,
  AnalyticsSummary,
} from '@/lib/types/analytics'

export class AnalyticsService {
  private lastPageViewTime = new Map<string, number>()

  private getAnalyticsRef(userUID?: string) {
    if (userUID) {
      // User-specific analytics (for admin dashboard)
      return collection(db, 'stores', userUID, 'analytics')
    }
    // Global analytics
    return collection(db, 'analytics')
  }

  private createDocData(eventData: AnalyticsEvent): Record<string, unknown> {
    const docData: Record<string, unknown> = {
      eventType: eventData.eventType,
      eventData: {
        ...eventData.eventData,
        timestamp: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
    }

    // Only include userUID if it's not undefined
    if (eventData.userUID) {
      docData.userUID = eventData.userUID
    }

    return docData
  }

  // Track page views
  async trackPageView(path: string, userUID?: string): Promise<void> {
    try {
      // Prevent duplicate tracking within 2 seconds for the same path
      const cacheKey = `${path}_${userUID || 'anonymous'}`
      const now = Date.now()
      const lastTime = this.lastPageViewTime.get(cacheKey)

      if (lastTime && now - lastTime < 2000) {
        return
      }

      this.lastPageViewTime.set(cacheKey, now)
      const eventData: AnalyticsEvent = {
        eventType: 'page_view',
        eventData: {
          path,
          timestamp: new Date(),
          userAgent:
            typeof window !== 'undefined' ? window.navigator.userAgent : '',
          referrer: typeof window !== 'undefined' ? document.referrer : '',
        },
        userUID,
        createdAt: new Date(),
      }

      // Store in Firestore
      const analyticsRef = this.getAnalyticsRef(userUID)
      const docData = this.createDocData(eventData)
      await addDoc(analyticsRef, docData)

      // Also log to Firebase Analytics if available
      if (analytics) {
        logEvent(analytics, 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
        })
      }
    } catch (error) {
      // Silently handle tracking errors to avoid disrupting user experience
      // Analytics failures should not affect app functionality
    }
  }

  // Track project clicks/views
  async trackProjectView(
    projectId: string,
    projectTitle: string,
    userUID?: string
  ): Promise<void> {
    try {
      const eventData: AnalyticsEvent = {
        eventType: 'project_view',
        eventData: {
          projectId,
          projectTitle,
          timestamp: new Date(),
        },
        userUID,
        createdAt: new Date(),
      }

      const analyticsRef = this.getAnalyticsRef(userUID)
      const docData = this.createDocData(eventData)
      await addDoc(analyticsRef, docData)

      if (analytics) {
        logEvent(analytics, 'select_content', {
          content_type: 'project',
          content_id: projectId,
        })
      }
    } catch (error) {
      // Silently handle tracking errors to avoid disrupting user experience
    }
  }

  // Track blog post views
  async trackBlogView(
    blogId: string,
    blogTitle: string,
    userUID?: string
  ): Promise<void> {
    try {
      const eventData: AnalyticsEvent = {
        eventType: 'blog_view',
        eventData: {
          blogId,
          blogTitle,
          timestamp: new Date(),
        },
        userUID,
        createdAt: new Date(),
      }

      const analyticsRef = this.getAnalyticsRef(userUID)
      const docData = this.createDocData(eventData)
      await addDoc(analyticsRef, docData)

      if (analytics) {
        logEvent(analytics, 'select_content', {
          content_type: 'blog',
          content_id: blogId,
        })
      }
    } catch (error) {
      // Silently handle tracking errors to avoid disrupting user experience
    }
  }

  // Track contact button clicks
  async trackContactClick(userUID?: string): Promise<void> {
    try {
      const eventData: AnalyticsEvent = {
        eventType: 'contact_click',
        eventData: {
          timestamp: new Date(),
        },
        userUID,
        createdAt: new Date(),
      }

      const analyticsRef = this.getAnalyticsRef(userUID)
      const docData = this.createDocData(eventData)
      await addDoc(analyticsRef, docData)

      if (analytics) {
        logEvent(analytics, 'contact', {
          method: 'upwork_button',
        })
      }
    } catch (error) {
      // Silently handle tracking errors to avoid disrupting user experience
    }
  }

  // Get analytics statistics
  async getAnalyticsStats(): Promise<AnalyticsStats> {
    try {
      // Always read from global analytics (not user-specific)
      const analyticsRef = this.getAnalyticsRef()
      const allEventsQuery = query(
        analyticsRef,
        orderBy('createdAt', 'desc'),
        limit(1000)
      )
      const eventsSnap = await getDocs(allEventsQuery)

      const events: AnalyticsEvent[] = eventsSnap.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp).toDate(),
            eventData: {
              ...doc.data().eventData,
              timestamp: (doc.data().eventData.timestamp as Timestamp).toDate(),
            },
          }) as AnalyticsEvent
      )

      // Calculate statistics
      const totalPageViews = events.filter(
        e => e.eventType === 'page_view'
      ).length
      const uniqueVisitors = new Set(
        events
          .filter(e => e.eventType === 'page_view')
          .map(e => e.eventData.userAgent)
      ).size

      // Top projects
      const projectViews = events.filter(e => e.eventType === 'project_view')
      const projectStats = new Map<string, { title: string; count: number }>()

      projectViews.forEach(event => {
        const { projectId, projectTitle } = event.eventData
        if (projectId && projectTitle) {
          const current = projectStats.get(projectId) || {
            title: projectTitle,
            count: 0,
          }
          projectStats.set(projectId, { ...current, count: current.count + 1 })
        }
      })

      const topProjects = Array.from(projectStats.entries())
        .map(([id, data]) => ({ id, title: data.title, views: data.count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      // Top blog posts
      const blogViews = events.filter(e => e.eventType === 'blog_view')
      const blogStats = new Map<string, { title: string; count: number }>()

      blogViews.forEach(event => {
        const { blogId, blogTitle } = event.eventData
        if (blogId && blogTitle) {
          const current = blogStats.get(blogId) || {
            title: blogTitle,
            count: 0,
          }
          blogStats.set(blogId, { ...current, count: current.count + 1 })
        }
      })

      const topBlogPosts = Array.from(blogStats.entries())
        .map(([id, data]) => ({ id, title: data.title, views: data.count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      const contactClicks = events.filter(
        e => e.eventType === 'contact_click'
      ).length

      return {
        totalPageViews,
        uniqueVisitors,
        topProjects,
        topBlogPosts,
        contactClicks,
        recentActivity: events.slice(0, 20),
      }
    } catch (error) {
      // Return empty stats on error instead of logging
      return {
        totalPageViews: 0,
        uniqueVisitors: 0,
        topProjects: [],
        topBlogPosts: [],
        contactClicks: 0,
        recentActivity: [],
      }
    }
  }

  // Get analytics summary with time periods
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      // Always read from global analytics (not user-specific)
      const analyticsRef = this.getAnalyticsRef()
      const now = new Date()

      // Calculate date ranges
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      )

      // Helper function to get stats for a date range
      const getStatsForPeriod = async (startDate: Date, endDate?: Date) => {
        let q = query(
          analyticsRef,
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          orderBy('createdAt', 'desc')
        )

        if (endDate) {
          q = query(
            analyticsRef,
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<', Timestamp.fromDate(endDate)),
            orderBy('createdAt', 'desc')
          )
        }

        const eventsSnap = await getDocs(q)
        const events = eventsSnap.docs.map(doc => doc.data() as AnalyticsEvent)

        const pageViews = events.filter(e => e.eventType === 'page_view').length
        const uniqueVisitors = new Set(
          events
            .filter(e => e.eventType === 'page_view')
            .map(e => e.eventData.userAgent)
        ).size
        const contactClicks = events.filter(
          e => e.eventType === 'contact_click'
        ).length

        return { pageViews, uniqueVisitors, contactClicks }
      }

      // Get stats for different periods
      const todayStats = await getStatsForPeriod(
        today,
        new Date(today.getTime() + 24 * 60 * 60 * 1000)
      )
      const weekStats = await getStatsForPeriod(weekAgo)
      const monthStats = await getStatsForPeriod(monthAgo)
      const allTimeStats = await getStatsForPeriod(new Date(0)) // From epoch

      return {
        today: todayStats,
        thisWeek: weekStats,
        thisMonth: monthStats,
        allTime: allTimeStats,
      }
    } catch (error) {
      // Return empty summary on error instead of logging
      return {
        today: { pageViews: 0, uniqueVisitors: 0, contactClicks: 0 },
        thisWeek: { pageViews: 0, uniqueVisitors: 0, contactClicks: 0 },
        thisMonth: { pageViews: 0, uniqueVisitors: 0, contactClicks: 0 },
        allTime: { pageViews: 0, uniqueVisitors: 0, contactClicks: 0 },
      }
    }
  }
}

export const analyticsService = new AnalyticsService()
