import * as React from 'react'
import { cn } from '@/lib/utils'

interface TechIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TechIcon = React.forwardRef<HTMLDivElement, TechIconProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-16 w-16 items-center justify-center border-2 border-border bg-bg-primary shadow-brutal transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:border-accent-green hover:shadow-brutal-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TechIcon.displayName = 'TechIcon'

export { TechIcon }
