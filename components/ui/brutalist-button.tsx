import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const brutalistButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 border font-mono',
  {
    variants: {
      variant: {
        default:
          'bg-bg-secondary text-accent-green border-accent-green hover:bg-accent-green hover:text-bg-primary',
        outline:
          'border-accent-green bg-transparent text-accent-green hover:bg-accent-green hover:text-bg-primary',
        secondary:
          'bg-bg-secondary text-text-primary border-border hover:bg-bg-tertiary hover:border-accent-green',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2',
        lg: 'h-14 px-8 py-4',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BrutalistButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
    >,
    VariantProps<typeof brutalistButtonVariants> {
  asChild?: boolean
}

const BrutalistButton = React.forwardRef<
  HTMLButtonElement,
  BrutalistButtonProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  if (asChild) {
    return (
      <Slot
        className={cn(brutalistButtonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }

  return (
    <motion.button
      className={cn(brutalistButtonVariants({ variant, size }), className)}
      ref={ref}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    />
  )
})
BrutalistButton.displayName = 'BrutalistButton'

export { BrutalistButton, brutalistButtonVariants }
