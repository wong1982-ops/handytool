import type { HTMLAttributes, ReactNode } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: boolean
}

export function GlassCard({ children, glow = false, className = '', ...props }: GlassCardProps) {
  return (
    <div className="relative group">
      {glow && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--tk-color-primary-500)]/20 to-[var(--tk-color-secondary-400)]/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      )}
      <div
        className={`relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-xl ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}
