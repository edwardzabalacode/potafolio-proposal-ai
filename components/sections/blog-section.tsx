'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardTitle,
  BrutalistCardContent,
  BrutalistCardFooter,
} from '@/components/ui/brutalist-card'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { usePublicProfile } from '@/lib/hooks/use-public-profile'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { cn } from '@/lib/utils'

interface BlogSectionProps {
  className?: string
}

export function BlogSection({ className }: BlogSectionProps) {
  const { data, loading, error } = usePublicProfile()
  const { trackBlogView } = useAnalytics()

  const handleBlogClick = (post: { id?: string; title: string }) => {
    if (post.id) {
      trackBlogView(post.id, post.title)
    }
  }

  // Loading state
  if (loading) {
    return (
      <section
        id="blog"
        className={cn('bg-bg-secondary px-6 py-20', className)}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-primary mb-12 text-center text-3xl font-bold md:text-4xl">
            Latest Posts
          </h2>
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-green" />
            <p className="text-text-secondary">Loading posts...</p>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <section
        id="blog"
        className={cn('bg-bg-secondary px-6 py-20', className)}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-primary mb-12 text-center text-3xl font-bold md:text-4xl">
            Latest Posts
          </h2>
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <p className="mb-2 text-red-400">Error loading posts</p>
            <p className="text-sm text-text-muted">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  const blogPosts = data?.blogPosts || []
  const recentPosts = blogPosts
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    )
    .slice(0, 3)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <section id="blog" className={cn('bg-bg-secondary px-6 py-20', className)}>
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="text-terminal-lg mb-12 text-center font-mono text-text-primary"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          viewport={{ once: true, amount: 0.3 }}
        >
          blog
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recentPosts.length > 0 ? (
            recentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <BrutalistCard className="h-full transition-all duration-300 hover:border-accent-green">
                  <BrutalistCardHeader>
                    <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
                      <span className="font-mono font-bold uppercase tracking-wider text-accent-green">
                        {post.category}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(
                              post.publishedAt?.toString() ||
                                post.createdAt.toString()
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <BrutalistCardTitle className="line-clamp-2 font-mono text-text-primary">
                      {post.title}
                    </BrutalistCardTitle>
                  </BrutalistCardHeader>

                  <BrutalistCardContent>
                    <p className="line-clamp-3 font-mono text-sm text-text-secondary">
                      {post.excerpt}
                    </p>
                  </BrutalistCardContent>

                  <BrutalistCardFooter>
                    <Link href={`/blog/${post.slug}`} className="w-full">
                      <BrutalistButton
                        variant="outline"
                        size="sm"
                        className="group w-full"
                        onClick={() => handleBlogClick(post)}
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </BrutalistButton>
                    </Link>
                  </BrutalistCardFooter>
                </BrutalistCard>
              </motion.div>
            ))
          ) : (
            // No posts available
            <div className="col-span-full py-12 text-center">
              <p className="mb-4 text-text-muted">No posts available yet.</p>
              <p className="text-sm text-text-muted">
                Posts will appear here once they are added from the admin panel.
              </p>
            </div>
          )}
        </div>

        {recentPosts.length > 0 && (
          <div className="mt-12 text-center">
            <BrutalistButton asChild>
              <Link href="/blog">
                View all posts
                <ArrowRight className="h-5 w-5" />
              </Link>
            </BrutalistButton>
          </div>
        )}
      </div>
    </section>
  )
}
