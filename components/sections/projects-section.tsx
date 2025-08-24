'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Eye, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardTitle,
  BrutalistCardDescription,
  BrutalistCardFooter,
} from '@/components/ui/brutalist-card'
import { ProjectTag } from '@/components/ui/project-tag'
import { ProjectModal } from '@/components/ui/project-modal'
import { usePublicProfile } from '@/lib/hooks/use-public-profile'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types/project'

interface ProjectsSectionProps {
  className?: string
}

export function ProjectsSection({ className }: ProjectsSectionProps) {
  const { data, loading, error } = usePublicProfile()
  const { trackProjectView } = useAnalytics()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewProject = (project: Project) => {
    // Track project view
    if (project.id) {
      trackProjectView(project.id, project.title)
    }
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  // Loading state
  if (loading) {
    return (
      <section id="projects" className={cn('px-6 py-20', className)}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-primary mb-12 text-center text-3xl font-bold md:text-4xl">
            Featured Projects
          </h2>
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-green" />
            <p className="text-text-secondary">Loading projects...</p>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <section id="projects" className={cn('px-6 py-20', className)}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-primary mb-12 text-center text-3xl font-bold md:text-4xl">
            Featured Projects
          </h2>
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <p className="mb-2 text-red-400">Error loading projects</p>
            <p className="text-sm text-text-muted">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  const projects = data?.projects || []
  const featuredProjects = projects
    .filter(project => project.featured)
    .slice(0, 6)

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: 30, y: 30 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
    },
  }

  return (
    <section id="projects" className={cn('px-6 py-20', className)}>
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="text-terminal-lg mb-12 text-center font-mono text-text-primary"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          projects
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featuredProjects.length > 0 ? (
            featuredProjects.map(project => (
              <motion.div key={project.id} variants={cardVariants}>
                <BrutalistCard>
                  <div className="relative mb-4 h-48 w-full">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="border-2 border-border object-cover transition-all duration-300 hover:border-accent-green"
                    />
                  </div>

                  <BrutalistCardHeader>
                    <BrutalistCardTitle className="font-mono text-text-primary">
                      {project.title}
                    </BrutalistCardTitle>
                    <BrutalistCardDescription className="font-mono font-bold uppercase tracking-wider text-accent-green">
                      {project.company}
                    </BrutalistCardDescription>
                  </BrutalistCardHeader>

                  <BrutalistCardFooter className="flex-col gap-4">
                    <div className="flex w-full flex-wrap gap-2">
                      {project.technologies.map((tag: string) => (
                        <ProjectTag key={tag}>{tag}</ProjectTag>
                      ))}
                    </div>
                    <BrutalistButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </BrutalistButton>
                  </BrutalistCardFooter>
                </BrutalistCard>
              </motion.div>
            ))
          ) : (
            // No projects available
            <div className="col-span-full py-12 text-center">
              <p className="mb-4 text-text-muted">No projects available yet.</p>
              <p className="text-sm text-text-muted">
                Projects will appear here once they are added from the admin
                panel.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  )
}
