'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react'
import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'
import {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardTitle,
  BrutalistCardContent,
  BrutalistCardFooter,
} from '@/components/ui/brutalist-card'
import { BrutalistButton } from '@/components/ui/brutalist-button'

// Mock data expandido - en una app real vendría de una API
const allBlogPosts = [
  {
    id: 1,
    title: 'Building Scalable React Applications',
    excerpt:
      'EXPLORING BEST PRACTICES FOR CREATING REACT APPLICATIONS THAT SCALE EFFICIENTLY AND MAINTAIN CLEAN CODE.',
    date: '2024-01-15',
    readTime: '8 min',
    slug: 'building-scalable-react-applications',
    category: 'React',
  },
  {
    id: 2,
    title: 'Optimizing Database Performance',
    excerpt:
      'ADVANCED TECHNIQUES TO IMPROVE DATABASE PERFORMANCE AND REDUCE RESPONSE TIMES IN WEB APPLICATIONS.',
    date: '2024-01-10',
    readTime: '12 min',
    slug: 'optimizing-database-performance',
    category: 'Backend',
  },
  {
    id: 3,
    title: 'Modern CSS Animations',
    excerpt:
      'CREATING SMOOTH AND ATTRACTIVE ANIMATIONS WITH MODERN CSS AND LIBRARIES LIKE FRAMER MOTION TO IMPROVE UX.',
    date: '2024-01-05',
    readTime: '6 min',
    slug: 'modern-css-animations',
    category: 'Frontend',
  },
  {
    id: 4,
    title: 'API Design Best Practices',
    excerpt:
      'COMPLETE GUIDE TO DESIGNING ROBUST, SCALABLE AND MAINTAINABLE RESTFUL APIS FOLLOWING INDUSTRY STANDARDS.',
    date: '2023-12-28',
    readTime: '10 min',
    slug: 'api-design-best-practices',
    category: 'Backend',
  },
  {
    id: 5,
    title: 'TypeScript in Practice',
    excerpt:
      'IMPLEMENTING TYPESCRIPT IN REAL PROJECTS AND MAKING THE MOST OF ITS TYPE SYSTEM FOR SAFER CODE.',
    date: '2023-12-20',
    readTime: '7 min',
    slug: 'typescript-in-practice',
    category: 'TypeScript',
  },
  {
    id: 6,
    title: 'Deployment Strategies',
    excerpt:
      'MODERN DEPLOYMENT STRATEGIES WITH CI/CD, DOCKER AND CLOUD SERVICES FOR PRODUCTION APPLICATIONS.',
    date: '2023-12-15',
    readTime: '12 min',
    slug: 'deployment-strategies',
    category: 'DevOps',
  },
  {
    id: 7,
    title: 'State Management Patterns',
    excerpt:
      'COMPARISON OF DIFFERENT STATE MANAGEMENT PATTERNS IN REACT APPLICATIONS: CONTEXT, REDUX, ZUSTAND AND MORE.',
    date: '2023-12-10',
    readTime: '9 min',
    slug: 'state-management-patterns',
    category: 'React',
  },
  {
    id: 8,
    title: 'Security in Web Applications',
    excerpt:
      'IMPLEMENTING ESSENTIAL SECURITY MEASURES IN WEB APPLICATIONS TO PROTECT DATA AND PREVENT VULNERABILITIES.',
    date: '2023-12-01',
    readTime: '11 min',
    slug: 'security-in-web-applications',
    category: 'Security',
  },
  {
    id: 9,
    title: 'Testing Strategies for React',
    excerpt:
      'COMPLETE TESTING STRATEGIES FOR REACT APPLICATIONS: UNIT TESTS, INTEGRATION TESTS AND E2E TESTING.',
    date: '2023-11-25',
    readTime: '13 min',
    slug: 'testing-strategies-for-react',
    category: 'Testing',
  },
]

const categories = [
  'All',
  'React',
  'Backend',
  'Frontend',
  'TypeScript',
  'DevOps',
  'Security',
  'Testing',
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredPosts = allBlogPosts.filter(post => {
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-20 pt-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-12 text-center"
          >
            <h1 className="text-terminal-lg mb-4 font-mono text-text-primary">
              blog
            </h1>
            <p className="mx-auto max-w-2xl font-mono text-lg text-text-secondary">
              ARTICLES ABOUT WEB DEVELOPMENT, BEST PRACTICES AND MODERN
              TECHNOLOGIES
            </p>
          </motion.header>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="mb-12"
          >
            <BrutalistCard>
              <BrutalistCardContent>
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full border-2 border-border bg-bg-tertiary py-3 pl-12 pr-4 font-mono text-sm text-text-primary transition-colors duration-200 focus:border-accent-green focus:outline-none"
                    />
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`border-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                          selectedCategory === category
                            ? 'border-bg-primary bg-accent-green text-bg-primary'
                            : 'border-border bg-bg-tertiary text-text-muted hover:border-accent-green hover:text-accent-green'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </BrutalistCardContent>
            </BrutalistCard>
          </motion.div>

          {/* Results Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mb-8"
          >
            <p className="font-mono text-sm text-text-muted">
              {filteredPosts.length} article
              {filteredPosts.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </motion.div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + index * 0.1,
                  ease: 'easeOut',
                }}
              >
                <BrutalistCard className="h-full">
                  <BrutalistCardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="border-2 border-bg-primary bg-accent-green px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider text-bg-primary">
                        {post.category}
                      </span>
                      <div className="flex items-center space-x-2 font-mono text-xs text-text-muted">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <BrutalistCardTitle className="line-clamp-2 font-mono text-text-primary">
                      {post.title}
                    </BrutalistCardTitle>
                  </BrutalistCardHeader>

                  <BrutalistCardContent>
                    <p className="mb-4 line-clamp-3 font-mono text-sm font-medium text-text-secondary">
                      {post.excerpt}
                    </p>
                  </BrutalistCardContent>

                  <BrutalistCardFooter className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 font-mono text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <BrutalistButton size="sm" variant="outline">
                        Read
                        <ArrowRight className="h-3 w-3" />
                      </BrutalistButton>
                    </Link>
                  </BrutalistCardFooter>
                </BrutalistCard>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
              className="py-12 text-center"
            >
              <BrutalistCard>
                <BrutalistCardContent>
                  <h3 className="mb-2 font-mono font-bold text-text-primary">
                    NO ARTICLES FOUND
                  </h3>
                  <p className="font-mono text-sm text-text-muted">
                    Try different search terms or categories
                  </p>
                </BrutalistCardContent>
              </BrutalistCard>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
