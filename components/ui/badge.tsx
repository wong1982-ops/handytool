import type { ReactNode } from 'react'

interface BadgeProps {
  icon?: ReactNode
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
}

const variantStyles = {
  default: 'text-[var(--tk-color-primary-500)]',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
}

export function Badge({ icon, children, variant = 'default' }: BadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
      {icon && <span className={variantStyles[variant]} aria-hidden="true">{icon}</span>}
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{children}</span>
    </div>
  )
}
