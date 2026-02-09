import type { ReactNode } from 'react'
import { IconBox } from './icon-box'

interface InfoCardProps {
  icon: ReactNode
  label: string
  value: string
  subValue?: string
  status?: {
    text: string
    variant: 'success' | 'warning' | 'error' | 'default'
  }
}

const statusColors = {
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  default: 'text-slate-500 dark:text-slate-400',
}

const dotColors = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  default: 'bg-slate-400',
}

export function InfoCard({ icon, label, value, subValue, status }: InfoCardProps) {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm flex flex-col items-start">
      <IconBox className="mb-4">{icon}</IconBox>
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</h3>
      <p className="text-lg font-semibold truncate w-full text-slate-900 dark:text-white">{value}</p>
      {subValue && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{subValue}</p>
      )}
      {status && (
        <span className={`mt-2 text-xs font-medium flex items-center gap-1 ${statusColors[status.variant]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status.variant]}`} />
          {status.text}
        </span>
      )}
    </div>
  )
}
