'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from 'firebase/auth'
import { blogService } from '@/lib/services/blog-service'
import { BlogPost, BlogFilter } from '@/lib/types/blog'

export interface UseBlogPostsReturn {
  posts: BlogPost[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  featuredPosts: BlogPost[]
  recentPosts: BlogPost[]
}

export function useBlogPosts(
  user: User | null = null,
  filter?: BlogFilter
): UseBlogPostsReturn {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    if (!user?.uid) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Filter for published posts only for public display
      const publicFilter: BlogFilter = {
        ...filter,
        status: 'published',
      }

      const postsData = await blogService.getPosts(user.uid, publicFilter)
      setPosts(postsData)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load blog posts'
      setError(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, filter])

  const refetch = async () => {
    await fetchPosts()
  }

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Get featured and recent posts
  const featuredPosts = posts.filter(post => post.featured)
  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    )
    .slice(0, 3)

  return {
    posts,
    loading,
    error,
    refetch,
    featuredPosts,
    recentPosts,
  }
}
