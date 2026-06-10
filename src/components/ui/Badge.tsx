import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'
  className?: string
  children: React.ReactNode
}

const variants = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  outline: 'border border-border text-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
