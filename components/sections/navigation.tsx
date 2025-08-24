'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#projects', label: 'projects' },
  { href: '#blog', label: 'blog' },
  { href: '#contact', label: 'contact' },
]

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <motion.nav
      className={cn(
        'fixed top-0 z-50 w-full border-b border-border backdrop-blur-sm',
        className
      )}
      animate={{
        height: isScrolled ? 60 : 80,
        backgroundColor: isScrolled
          ? 'rgba(10, 15, 10, 0.8)'
          : 'var(--bg-primary)',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="mx-auto h-full max-w-6xl px-6">
        <motion.div
          className="flex h-full items-center justify-center space-x-8"
          animate={{
            gap: isScrolled ? '1.5rem' : '2rem',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.a
            href="#about"
            onClick={e => handleSmoothScroll(e, '#about')}
            className="font-bold text-accent-green transition-colors duration-200 hover:text-accent-yellow"
            animate={{
              fontSize: isScrolled ? '1.25rem' : '1.5rem',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            /
          </motion.a>
          <motion.div
            className="hidden items-center space-x-8 md:flex"
            animate={{
              scale: isScrolled ? 0.9 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {navLinks.map(link => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={e => handleSmoothScroll(e, link.href)}
                className="nav-link color relative text-sm text-text-muted transition-colors duration-300 before:mr-1 before:content-['/'] hover:text-accent-green"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  )
}
