'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github } from 'lucide-react'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import type { Project } from '@/lib/types/project'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!project) return null

  const projectImages =
    project.images && project.images.length > 0
      ? project.images
      : [project.image]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-4 z-50 flex items-center justify-center md:inset-8"
          >
            <div className="relative h-full w-full max-w-7xl overflow-hidden rounded-none border-4 border-accent-green bg-bg-primary">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-none border-2 border-border bg-bg-tertiary p-2 text-text-muted transition-colors hover:border-accent-green hover:text-accent-green"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Content */}
              <div className="flex h-full">
                {/* Left Column - Project Info (Fixed) */}
                <div className="flex w-1/2 flex-col border-r-4 border-accent-green bg-bg-secondary p-8">
                  <div className="mb-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="border-2 border-bg-primary bg-accent-green px-3 py-1 font-mono text-sm font-bold uppercase tracking-wider text-bg-primary">
                        {project.company}
                      </span>
                      <span className="border border-border bg-bg-tertiary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
                        {project.status}
                      </span>
                    </div>

                    <h2 className="text-terminal-lg mb-4 font-mono text-text-primary">
                      {project.title}
                    </h2>

                    <p className="mb-6 font-mono text-lg text-text-secondary">
                      {project.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="mb-8 flex flex-wrap gap-4">
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
                      <Link href={`/projects/${project.slug}`}>
                        <BrutalistButton variant="outline">
                          Full Details
                        </BrutalistButton>
                      </Link>
                    </div>
                  </div>

                  {/* Empty space for layout */}
                  <div className="flex-1"></div>
                </div>

                {/* Right Column - Images (Scrollable) */}
                <div className="w-1/2 bg-bg-primary">
                  <div className="h-full overflow-y-auto p-8">
                    <div className="space-y-6">
                      {projectImages.map((imageUrl, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="relative aspect-video w-full"
                        >
                          <Image
                            src={imageUrl}
                            alt={`${project.title} - Image ${index + 1}`}
                            fill
                            className="border-2 border-border object-cover transition-all duration-300 hover:border-accent-green"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
