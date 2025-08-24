'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TechIcon } from '@/components/ui/tech-icon'
import { cn } from '@/lib/utils'

const techCategories = [
  {
    title: 'Frontend',
    technologies: [
      { name: 'HTML5', color: 'bg-orange-500', short: 'H5' },
      { name: 'CSS3', color: 'bg-blue-500', short: 'C3' },
      { name: 'JavaScript', color: 'bg-yellow-500', short: 'JS' },
      { name: 'React', color: 'bg-cyan-500', short: 'R' },
    ],
  },
  {
    title: 'Backend',
    technologies: [
      { name: 'TypeScript', color: 'bg-blue-600', short: 'TS' },
      { name: 'Node.js', color: 'bg-green-500', short: 'JS' },
      { name: 'PHP', color: 'bg-red-600', short: 'PHP' },
      { name: 'Python', color: 'bg-blue-800', short: 'PY' },
      { name: 'Go', color: 'bg-teal-500', short: 'GO' },
      { name: 'C#', color: 'bg-purple-600', short: 'C#' },
    ],
  },
  {
    title: 'Framework',
    technologies: [
      { name: 'Next.js', color: 'bg-gray-800', short: 'N' },
      { name: 'Nuxt.js', color: 'bg-green-600', short: 'NU' },
      { name: 'FastAPI', color: 'bg-yellow-600', short: '⚡' },
    ],
  },
  {
    title: 'Database',
    technologies: [
      { name: 'MySQL', color: 'bg-yellow-600', short: '⚡' },
      { name: 'PostgreSQL', color: 'bg-blue-600', short: 'PG' },
      { name: 'MongoDB', color: 'bg-green-700', short: 'MG' },
    ],
  },
  {
    title: 'Tools',
    technologies: [
      { name: 'Git', color: 'bg-gray-800', short: '⚡' },
      { name: 'VS Code', color: 'bg-green-600', short: 'VS' },
      { name: 'GitHub', color: 'bg-orange-600', short: '🐙' },
      { name: 'Figma', color: 'bg-purple-600', short: '🎯' },
      { name: 'Vercel', color: 'bg-yellow-600', short: '△' },
      { name: 'Heroku', color: 'bg-blue-700', short: 'H' },
    ],
  },
]

interface TechSectionProps {
  className?: string
}

export function TechSection({ className }: TechSectionProps) {
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
    <section id="tech" className={cn('bg-bg-secondary px-6 py-20', className)}>
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="text-terminal-lg mb-12 text-center font-mono text-text-primary"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          tech:stack
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {techCategories.map(category => (
            <motion.div
              key={category.title}
              variants={cardVariants}
              className="mb-8 border-2 border-border bg-bg-tertiary p-6 shadow-brutal-large"
            >
              <h3 className="relative mb-4 pl-6 font-mono text-xl font-bold uppercase tracking-widest text-accent-green before:absolute before:left-0 before:text-2xl before:font-black before:text-accent-yellow before:content-['>']">
                {category.title}
              </h3>

              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {category.technologies.map(tech => (
                  <TechIcon key={tech.name} title={tech.name}>
                    <div
                      className={`h-8 w-8 ${tech.color} flex items-center justify-center rounded text-sm font-bold text-white`}
                    >
                      {tech.short}
                    </div>
                  </TechIcon>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
