'use client'

import React from 'react'
import { SimpleIcon } from 'simple-icons'
import { cn } from '@/lib/utils'

interface SimpleIconProps {
  icon: SimpleIcon
  className?: string
  size?: number
  title?: string
}

export function SimpleIconComponent({
  icon,
  className,
  size = 24,
  title,
}: SimpleIconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn('fill-current', className)}
      aria-label={title || icon.title}
    >
      <title>{title || icon.title}</title>
      <path d={icon.path} />
    </svg>
  )
}
