'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { siUpwork } from 'simple-icons'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { SimpleIconComponent } from '@/components/ui/simple-icon'
import {
  BrutalistCard,
  BrutalistCardContent,
} from '@/components/ui/brutalist-card'
import { usePublicProfile } from '@/lib/hooks/use-public-profile'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { cn } from '@/lib/utils'

interface ContactSectionProps {
  className?: string
}

export function ContactSection({ className }: ContactSectionProps) {
  const { data } = usePublicProfile()
  const { trackContactClick } = useAnalytics()
  const contactInfo = data?.profile?.contactInfo

  const handleContactClick = () => {
    trackContactClick()
  }

  return (
    <section id="contact" className={cn('px-6 py-20', className)}>
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2
          className="text-terminal-lg mb-8 font-mono text-text-primary"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          viewport={{ once: true, amount: 0.3 }}
        >
          Have a project in mind?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <BrutalistCard className="mb-8">
            <BrutalistCardContent>
              <p className="mb-8 font-mono text-lg font-bold uppercase tracking-wider text-text-secondary">
                I&apos;M AVAILABLE FOR FREELANCE PROJECTS. LET&apos;S TALK ABOUT
                YOUR IDEA!
              </p>
            </BrutalistCardContent>
          </BrutalistCard>
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {contactInfo?.upwork && (
            <BrutalistButton asChild>
              <a
                href={contactInfo.upwork}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleContactClick}
              >
                <SimpleIconComponent
                  icon={siUpwork}
                  size={20}
                  className="transition-colors"
                />
                Hire me on Upwork
              </a>
            </BrutalistButton>
          )}
        </motion.div>
      </div>
    </section>
  )
}
