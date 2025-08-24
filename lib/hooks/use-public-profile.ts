'use client'

import { useState, useEffect } from 'react'
import { profileService } from '@/lib/services/profile-service'
import { projectsService } from '@/lib/services/projects-service'
import { blogService } from '@/lib/services/blog-service'
import { ProfileData } from '@/lib/types/profile'
import { Project } from '@/lib/types/project'
import { BlogPost } from '@/lib/types/blog'

export interface PublicPortfolioData {
  profile: ProfileData | null
  projects: Project[]
  blogPosts: BlogPost[]
  userUID: string | null
}

export interface UsePublicProfileReturn {
  data: PublicPortfolioData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePublicProfile(): UsePublicProfileReturn {
  const [data, setData] = useState<PublicPortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, let's use a hardcoded userUID based on what I see in your Firebase
      // In a real-world scenario, this would be obtained from the first user or from configuration
      const userUID = '1Jqng7QUhQZXYDqBfZF50PFh6992' // Corrected userUID

      // Fetch all data in parallel
      const [profile, projects, blogPosts] = await Promise.all([
        profileService.getProfile(userUID).catch(error => {
          // eslint-disable-next-line no-console
          console.error('Profile fetch error:', error)
          return null
        }),
        projectsService
          .getProjects(userUID, { status: 'published' })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('Projects fetch error:', error)
            return []
          }),
        blogService.getPosts(userUID, { status: 'published' }).catch(error => {
          // eslint-disable-next-line no-console
          console.error('Blog posts fetch error:', error)
          return []
        }),
      ])

      setData({
        profile,
        projects,
        blogPosts,
        userUID,
      })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load portfolio data'
      setError(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Error fetching portfolio data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchPortfolioData()
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
