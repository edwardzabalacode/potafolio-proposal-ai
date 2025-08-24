'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, LinkedinIcon } from 'lucide-react'
import { siGithub, siUpwork } from 'simple-icons'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { SimpleIconComponent } from '@/components/ui/simple-icon'
import { usePublicProfile } from '@/lib/hooks/use-public-profile'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const { data, loading, error } = usePublicProfile()

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  // Loading state
  if (loading) {
    return (
      <section
        id="about"
        className={cn(
          'flex min-h-screen items-center justify-center px-6 pt-20',
          className
        )}
      >
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-green" />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </section>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <section
        id="about"
        className={cn(
          'flex min-h-screen items-center justify-center px-6 pt-20',
          className
        )}
      >
        <div className="text-center">
          <p className="mb-4 text-red-400">Error loading profile</p>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      </section>
    )
  }

  // Get profile data or use defaults
  const profile = data?.profile
  const personalInfo = profile?.personalInfo
  const contactInfo = profile?.contactInfo
  const heroContent = profile?.heroContent

  return (
    <section
      id="about"
      className={cn(
        'flex min-h-screen items-center justify-center px-6 pt-20',
        className
      )}
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Image
            src={
              personalInfo?.profileImage ||
              'https://picsum.photos/400/400?random=profile'
            }
            alt="Profile"
            width={200}
            height={200}
            className="profile-image border-3 mx-auto mb-6 rounded-full border-accent-green object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <h1 className="text-terminal-lg mb-4 text-accent-green">
            {personalInfo?.name || 'tu_nombre'}
          </h1>
          <p className="mb-6 text-xl text-text-secondary">
            {personalInfo?.title || 'Full Stack Developer'}
          </p>

          <div className="mb-8 flex items-center justify-center space-x-6">
            {contactInfo?.github && (
              <a
                href={contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="GitHub Profile"
              >
                <SimpleIconComponent
                  icon={siGithub}
                  size={24}
                  className="transition-colors hover:text-accent-green"
                />
              </a>
            )}
            {contactInfo?.linkedin && (
              <a
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="h-6 w-6 transition-colors hover:text-accent-green" />
              </a>
            )}
            {contactInfo?.upwork && (
              <a
                href={contactInfo.upwork}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Upwork Profile"
              >
                <SimpleIconComponent
                  icon={siUpwork}
                  size={24}
                  className="transition-colors hover:text-accent-green"
                />
              </a>
            )}
          </div>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          {heroContent?.introduction && (
            <p className="mx-auto mb-6 max-w-2xl text-lg text-text-secondary">
              {heroContent.introduction}
            </p>
          )}
          {heroContent?.description && (
            <p className="mx-auto mb-6 max-w-2xl text-text-muted">
              {heroContent.description}
            </p>
          )}
          {heroContent?.hobbies && (
            <p className="mx-auto max-w-2xl text-text-muted">
              {heroContent.hobbies}
            </p>
          )}

          {/* Fallback content when no profile data is available */}
          {!heroContent && (
            <>
              <p className="mx-auto mb-6 max-w-2xl text-lg text-text-secondary">
                Hi! My name is{' '}
                <strong>{personalInfo?.name || 'Your Name'}</strong> and
                I&apos;m a Full Stack Developer specialized in web and mobile
                development with over 5 years of experience.
              </p>
              <p className="mx-auto mb-6 max-w-2xl text-text-muted">
                I&apos;m a developer passionate about creating stunning visual
                experiences and solving complex problems. Whether it&apos;s a
                website or a mobile application, I strive to deliver software
                that is both elegant and effective.
              </p>
              <p className="mx-auto max-w-2xl text-text-muted">
                Besides programming, I enjoy art, gaming, photography, animation
                and more.
              </p>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <BrutalistButton asChild>
            <a
              href="#projects"
              onClick={e => handleSmoothScroll(e, '#projects')}
            >
              View My Projects
              <ArrowRight className="h-4 w-4" />
            </a>
          </BrutalistButton>
        </motion.div>
      </div>
    </section>
  )
}
