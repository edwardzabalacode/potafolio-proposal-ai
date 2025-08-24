export interface AnalyticsEvent {
  id?: string
  eventType:
    | 'page_view'
    | 'project_view'
    | 'blog_view'
    | 'contact_click'
    | 'project_click'
  eventData: {
    path?: string
    projectId?: string
    projectTitle?: string
    blogId?: string
    blogTitle?: string
    timestamp: Date
    userAgent?: string
    referrer?: string
  }
  userUID?: string
  createdAt: Date
}

export interface AnalyticsStats {
  totalPageViews: number
  uniqueVisitors: number
  topProjects: Array<{
    id: string
    title: string
    views: number
  }>
  topBlogPosts: Array<{
    id: string
    title: string
    views: number
  }>
  contactClicks: number
  recentActivity: AnalyticsEvent[]
}

export interface AnalyticsSummary {
  today: {
    pageViews: number
    uniqueVisitors: number
    contactClicks: number
  }
  thisWeek: {
    pageViews: number
    uniqueVisitors: number
    contactClicks: number
  }
  thisMonth: {
    pageViews: number
    uniqueVisitors: number
    contactClicks: number
  }
  allTime: {
    pageViews: number
    uniqueVisitors: number
    contactClicks: number
  }
}
