'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const { trackPageView } = useAnalytics()
  const lastTrackedPath = useRef<string>('')

  useEffect(() => {
    // Only track if the path actually changed and it's different from last tracked
    if (pathname !== lastTrackedPath.current) {
      // Use setTimeout to debounce in case of rapid route changes
      const timeoutId = setTimeout(() => {
        trackPageView(pathname)
        lastTrackedPath.current = pathname
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [pathname, trackPageView])

  return <>{children}</>
}
