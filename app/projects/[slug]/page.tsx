'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Users,
  Code,
  Loader2,
} from 'lucide-react'
import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardTitle,
  BrutalistCardContent,
} from '@/components/ui/brutalist-card'
import { ProjectTag } from '@/components/ui/project-tag'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { useProject } from '@/lib/hooks/use-project'

interface ProjectPageProps {
  params: { slug: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { project, loading, error } = useProject(params.slug)

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="flex min-h-screen items-center justify-center pt-24">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-green" />
            <p className="text-text-secondary">Loading project...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Navigation />
        <main className="flex min-h-screen items-center justify-center pt-24">
          <div className="text-center">
            <p className="mb-4 text-red-400">{error || 'Project not found'}</p>
            <Link href="/#projects">
              <BrutalistButton>
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
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
        <div className="mx-auto max-w-6xl px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/#projects">
              <BrutalistButton variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </BrutalistButton>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Project Header */}
              <motion.header
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="border-2 border-bg-primary bg-accent-green px-3 py-1 font-mono text-sm font-bold uppercase tracking-wider text-bg-primary">
                    {project.company}
                  </span>
                  <span className="border border-border bg-bg-tertiary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {project.status}
                  </span>
                </div>

                <h1 className="text-terminal-lg mb-4 font-mono text-text-primary">
                  {project.title}
                </h1>

                <p className="mb-6 font-mono text-lg text-text-secondary">
                  {project.description}
                </p>

                <div className="mb-6 flex flex-wrap gap-4">
                  {project.liveUrl && (
                    <Link href={project.liveUrl} target="_blank">
                      <BrutalistButton>
                        <ExternalLink className="h-4 w-4" />
                        View Project
                      </BrutalistButton>
                    </Link>
                  )}
                  {project.githubUrl && (
                    <Link href={project.githubUrl} target="_blank">
                      <BrutalistButton variant="outline">
                        <Github className="h-4 w-4" />
                        View Code
                      </BrutalistButton>
                    </Link>
                  )}
                </div>
              </motion.header>

              {/* Project Images */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="mb-8"
              >
                <ImageCarousel
                  images={
                    project.images && project.images.length > 0
                      ? project.images
                      : [project.image]
                  }
                  title={project.title}
                  className="w-full"
                />
              </motion.div>

              {/* Project Description */}
              {project.longDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                >
                  <BrutalistCard>
                    <BrutalistCardContent>
                      <div className="prose prose-invert max-w-none font-mono">
                        <div
                          className="leading-relaxed text-text-secondary"
                          dangerouslySetInnerHTML={{
                            __html: project.longDescription.replace(
                              /\n/g,
                              '<br />'
                            ),
                          }}
                        />
                      </div>
                    </BrutalistCardContent>
                  </BrutalistCard>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Project Info */}
                <BrutalistCard>
                  <BrutalistCardHeader>
                    <BrutalistCardTitle className="font-mono text-text-primary">
                      Project Information
                    </BrutalistCardTitle>
                  </BrutalistCardHeader>
                  <BrutalistCardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-accent-green" />
                      <div className="font-mono text-sm">
                        <div className="text-text-muted">Creation Date</div>
                        <div className="text-text-secondary">
                          {new Date(project.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Code className="h-4 w-4 text-accent-green" />
                      <div className="font-mono text-sm">
                        <div className="text-text-muted">Category</div>
                        <div className="text-text-secondary">
                          {project.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-accent-green" />
                      <div className="font-mono text-sm">
                        <div className="text-text-muted">Company</div>
                        <div className="text-text-secondary">
                          {project.company}
                        </div>
                      </div>
                    </div>
                  </BrutalistCardContent>
                </BrutalistCard>

                {/* Technologies */}
                <BrutalistCard>
                  <BrutalistCardHeader>
                    <BrutalistCardTitle className="font-mono text-text-primary">
                      Technologies
                    </BrutalistCardTitle>
                  </BrutalistCardHeader>
                  <BrutalistCardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <motion.div
                          key={tech}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6 + index * 0.1,
                          }}
                        >
                          <ProjectTag>{tech}</ProjectTag>
                        </motion.div>
                      ))}
                    </div>
                  </BrutalistCardContent>
                </BrutalistCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
