import type { ReactNode } from 'react'

interface IconBoxProps {
  children: ReactNode
  className?: string
}

export function IconBox({ children, className = '' }: IconBoxProps) {
  return (
    <div
      className={`w-10 h-10 rounded-lg bg-[var(--tk-color-primary-500)]/10 flex items-center justify-center text-[var(--tk-color-primary-500)] ${className}`}
    >
      {children}
    </div>
  )
}
