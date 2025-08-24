'use client'

import { Navigation } from '@/components/sections/navigation'
import { HeroSection } from '@/components/sections/hero-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { BlogSection } from '@/components/sections/blog-section'
import { ContactSection } from '@/components/sections/contact-section'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </>
  )
}
