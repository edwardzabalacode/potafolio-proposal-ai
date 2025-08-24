'use client'

import Image from 'next/image'
import { Github, Linkedin, Briefcase, ArrowRight, Eye } from 'lucide-react'
import { ProfileFormData } from '@/lib/types/profile'
import { Card } from '@/components/ui/card'
import { BrutalistButton } from '@/components/ui/brutalist-button'

interface ProfilePreviewProps {
  data: ProfileFormData
}

export function ProfilePreview({ data }: ProfilePreviewProps) {
  return (
    <Card className="sticky top-6">
      <div className="border-b-2 border-accent-green bg-bg-tertiary p-4">
        <div className="flex items-center space-x-3">
          <Eye className="h-5 w-5 text-accent-green" />
          <h3 className="text-primary text-lg font-semibold">Live Preview</h3>
        </div>
        <p className="text-sm text-text-secondary">
          How your hero section will appear on the public site
        </p>
      </div>

      <div className="p-6">
        {/* Mini Hero Section Preview */}
        <div className="space-y-6 text-center">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src={
                  data.personalInfo.profileImage ||
                  'https://picsum.photos/400/400?random=profile'
                }
                alt="Profile Preview"
                width={120}
                height={120}
                className="rounded-full border-2 border-accent-green object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://picsum.photos/400/400?random=profile'
                }}
              />
            </div>
          </div>

          {/* Name and Title */}
          <div>
            <h1 className="mb-2 text-2xl font-bold text-accent-green">
              {data.personalInfo.name || 'tu_nombre'}
            </h1>
            <p className="text-lg text-text-secondary">
              {data.personalInfo.title || 'Full Stack Developer'}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-4">
            {data.contactInfo.github && (
              <a
                href={data.contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-accent-green text-accent-green transition-all hover:bg-accent-green hover:text-bg-primary"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {data.contactInfo.linkedin && (
              <a
                href={data.contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-accent-green text-accent-green transition-all hover:bg-accent-green hover:text-bg-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {data.contactInfo.upwork && (
              <a
                href={data.contactInfo.upwork}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-accent-green text-accent-green transition-all hover:bg-accent-green hover:text-bg-primary"
              >
                <Briefcase className="h-5 w-5" />
              </a>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4 text-left">
            {data.heroContent.introduction && (
              <div className="rounded-lg bg-bg-tertiary p-4">
                <h4 className="mb-2 text-sm font-semibold text-accent-green">
                  Introduction
                </h4>
                <p className="text-sm text-text-secondary">
                  {data.heroContent.introduction}
                </p>
              </div>
            )}

            {data.heroContent.description && (
              <div className="rounded-lg bg-bg-tertiary p-4">
                <h4 className="mb-2 text-sm font-semibold text-accent-green">
                  About Me
                </h4>
                <p className="text-sm text-text-secondary">
                  {data.heroContent.description}
                </p>
              </div>
            )}

            {data.heroContent.hobbies && (
              <div className="rounded-lg bg-bg-tertiary p-4">
                <h4 className="mb-2 text-sm font-semibold text-accent-green">
                  Personal Interests
                </h4>
                <p className="text-sm text-text-secondary">
                  {data.heroContent.hobbies}
                </p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <BrutalistButton size="sm" className="pointer-events-none">
              Ver mis Proyectos
              <ArrowRight className="h-4 w-4" />
            </BrutalistButton>
          </div>
        </div>
      </div>
    </Card>
  )
}
