'use client'

import React from 'react'
import { siUpwork, siGithub } from 'simple-icons'
import { SocialIcon } from '@/components/ui/social-icon'
import { SimpleIconComponent } from '@/components/ui/simple-icon'
import { usePublicProfile } from '@/lib/hooks/use-public-profile'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const { data } = usePublicProfile()
  const contactInfo = data?.profile?.contactInfo

  return (
    <footer
      className={cn(
        'border-t-4 border-accent-green bg-bg-secondary px-6 py-8',
        className
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center space-x-6">
            {contactInfo?.github && (
              <SocialIcon href={contactInfo.github}>
                <SimpleIconComponent
                  icon={siGithub}
                  size={24}
                  className="transition-colors"
                />
              </SocialIcon>
            )}
            {contactInfo?.upwork && (
              <SocialIcon href={contactInfo.upwork}>
                <SimpleIconComponent
                  icon={siUpwork}
                  size={24}
                  className="transition-colors"
                />
              </SocialIcon>
            )}
          </div>
          <p className="font-mono text-sm font-bold uppercase text-text-muted">
            © 2025 Edwardzabalacode ♥
          </p>
        </div>
      </div>
    </footer>
  )
}
