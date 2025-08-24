import * as React from 'react'
import { cn } from '@/lib/utils'

const BrutalistCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden rounded-xl border border-border bg-bg-secondary p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-green',
      className
    )}
    {...props}
  />
))
BrutalistCard.displayName = 'BrutalistCard'

const BrutalistCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-6 flex flex-col space-y-1.5', className)}
    {...props}
  />
))
BrutalistCardHeader.displayName = 'BrutalistCardHeader'

const BrutalistCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold text-text-primary', className)}
    {...props}
  />
))
BrutalistCardTitle.displayName = 'BrutalistCardTitle'

const BrutalistCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm font-medium text-text-secondary', className)}
    {...props}
  />
))
BrutalistCardDescription.displayName = 'BrutalistCardDescription'

const BrutalistCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pb-6', className)} {...props} />
))
BrutalistCardContent.displayName = 'BrutalistCardContent'

const BrutalistCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
))
BrutalistCardFooter.displayName = 'BrutalistCardFooter'

export {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardFooter,
  BrutalistCardTitle,
  BrutalistCardDescription,
  BrutalistCardContent,
}
