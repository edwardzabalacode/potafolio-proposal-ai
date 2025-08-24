import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProjectTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

const ProjectTag = React.forwardRef<HTMLSpanElement, ProjectTagProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-block cursor-default border-2 border-bg-primary bg-accent-green px-4 py-2 text-xs font-bold uppercase tracking-wider text-bg-primary shadow-brutal transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-accent-yellow hover:shadow-brutal-hover',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)
ProjectTag.displayName = 'ProjectTag'

export { ProjectTag }
