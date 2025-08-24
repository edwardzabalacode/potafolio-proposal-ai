'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from 'firebase/auth'
import { projectsService } from '@/lib/services/projects-service'
import { Project, ProjectFilter } from '@/lib/types/project'

export interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  featuredProjects: Project[]
}

export function useProjects(
  user: User | null = null,
  filter?: ProjectFilter
): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!user?.uid) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Filter for published projects only for public display
      const publicFilter: ProjectFilter = {
        ...filter,
        status: 'published',
      }

      const projectsData = await projectsService.getProjects(
        user.uid,
        publicFilter
      )
      setProjects(projectsData)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load projects'
      setError(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, filter])

  const refetch = async () => {
    await fetchProjects()
  }

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Get featured projects
  const featuredProjects = projects.filter(project => project.featured)

  return {
    projects,
    loading,
    error,
    refetch,
    featuredProjects,
  }
}
