'use client'

import { useState, useEffect, useCallback } from 'react'
import { blogService } from '@/lib/services/blog-service'
import { BlogPost } from '@/lib/types/blog'

export interface UseBlogPostReturn {
  post: BlogPost | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBlogPost(slug: string): UseBlogPostReturn {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the same userUID as in usePublicProfile
      const userUID = '1Jqng7QUhQZXYDqBfZF50PFh6992'

      // Get all blog posts and find the one with matching slug
      const posts = await blogService.getPosts(userUID, {
        status: 'published',
      })

      const foundPost = posts.find(p => p.slug === slug)
      setPost(foundPost || null)

      if (!foundPost) {
        setError('Artículo no encontrado')
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load blog post'
      setError(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Error fetching blog post:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  const refetch = async () => {
    await fetchPost()
  }

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug, fetchPost])

  return {
    post,
    loading,
    error,
    refetch,
  }
}
