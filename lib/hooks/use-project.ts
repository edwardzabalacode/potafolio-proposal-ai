'use client'

import { useState, useEffect, useCallback } from 'react'
import { projectsService } from '@/lib/services/projects-service'
import { Project } from '@/lib/types/project'

export interface UseProjectReturn {
  project: Project | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProject(slug: string): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the same userUID as in usePublicProfile
      const userUID = '1Jqng7QUhQZXYDqBfZF50PFh6992'

      // Get all projects and find the one with matching slug
      const projects = await projectsService.getProjects(userUID, {
        status: 'published',
      })

      const foundProject = projects.find(p => p.slug === slug)
      setProject(foundProject || null)

      if (!foundProject) {
        setError('Proyecto no encontrado')
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load project'
      setError(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Error fetching project:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  const refetch = async () => {
    await fetchProject()
  }

  useEffect(() => {
    if (slug) {
      fetchProject()
    }
  }, [slug, fetchProject])

  return {
    project,
    loading,
    error,
    refetch,
  }
}
