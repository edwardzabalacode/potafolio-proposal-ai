import * as React from 'react'
import { cn } from '@/lib/utils'

interface SocialIconProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

const SocialIcon = React.forwardRef<HTMLAnchorElement, SocialIconProps>(
  ({ className, href, children, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex h-12 w-12 items-center justify-center border-2 border-border bg-bg-secondary text-text-muted shadow-brutal transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-text-primary hover:bg-accent-green hover:text-bg-primary hover:shadow-brutal-hover',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
)
SocialIcon.displayName = 'SocialIcon'

export { SocialIcon }
