'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Github, Loader2 } from 'lucide-react'
import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import {
  BrutalistCard,
  BrutalistCardContent,
} from '@/components/ui/brutalist-card'
import { useBlogPost } from '@/lib/hooks/use-blog-post'

interface BlogPostPageProps {
  params: { slug: string }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { post, loading, error } = useBlogPost(params.slug)

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="flex min-h-screen items-center justify-center pt-24">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-green" />
            <p className="text-text-secondary">Loading article...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !post) {
    return (
      <>
        <Navigation />
        <main className="flex min-h-screen items-center justify-center pt-24">
          <div className="text-center">
            <p className="mb-4 text-red-400">{error || 'Article not found'}</p>
            <Link href="/#blog">
              <BrutalistButton>
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </BrutalistButton>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }
  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-20 pt-24">
        <div className="mx-auto max-w-4xl px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/#blog">
              <BrutalistButton variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </BrutalistButton>
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-8"
          >
            <header className="mb-8">
              <div className="mb-4 flex items-center gap-4">
                <span className="border-2 border-bg-primary bg-accent-green px-3 py-1 font-mono text-sm font-bold uppercase tracking-wider text-bg-primary">
                  {post.category}
                </span>
                <div className="flex items-center space-x-4 font-mono text-sm text-text-muted">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        post.publishedAt || post.createdAt
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-terminal-lg mb-4 font-mono text-text-primary">
                {post.title}
              </h1>

              <p className="font-mono text-lg text-text-secondary">
                {post.excerpt}
              </p>
            </header>

            {/* Article Content */}
            <BrutalistCard>
              <BrutalistCardContent>
                <div className="prose prose-invert max-w-none font-mono">
                  <div
                    className="leading-relaxed text-text-secondary"
                    dangerouslySetInnerHTML={{
                      __html: post.content.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
              </BrutalistCardContent>
            </BrutalistCard>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="border border-border bg-bg-tertiary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Author Info */}
            <motion.div
              className="mt-12 border-t border-border pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 font-mono font-bold text-text-primary">
                    Written by EdwardZabalaCode
                  </h3>
                  <p className="font-mono text-sm text-text-muted">
                    Full Stack Developer specialized in React and Node.js
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link
                    href="https://github.com/edwardzabalacode"
                    target="_blank"
                  >
                    <BrutalistButton variant="outline" size="sm">
                      <Github className="h-4 w-4" />
                    </BrutalistButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.article>
        </div>
      </main>

      <Footer />
    </>
  )
}
