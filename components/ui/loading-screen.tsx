'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  const text = 'EdwardZabalaCode'
  const letters = text.split('')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 200,
      },
    },
  }

  const screenVariants = {
    visible: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }

  useEffect(() => {
    // Calculate total animation time: 0.3s delay + (15 letters * 0.1s stagger) + 0.5s buffer
    const totalDuration = 300 + letters.length * 100 + 500

    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, totalDuration)

    return () => clearTimeout(timer)
  }, [letters.length])

  useEffect(() => {
    if (animationComplete) {
      const exitTimer = setTimeout(() => {
        onComplete()
      }, 500) // Match exit animation duration

      return () => clearTimeout(exitTimer)
    }
  }, [animationComplete, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      variants={screenVariants}
      initial="visible"
      animate={animationComplete ? 'exit' : 'visible'}
    >
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-center font-mono text-4xl font-bold tracking-wider md:text-6xl">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="inline-block"
              style={{
                color: 'var(--accent-green)',
                fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
