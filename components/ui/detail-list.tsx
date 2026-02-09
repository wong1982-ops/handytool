import type { ReactNode } from 'react'

export interface DetailItem {
  label: string
  value: ReactNode
}

interface DetailListProps {
  title?: string
  items: DetailItem[]
}

export function DetailList({ title, items }: DetailListProps) {
  return (
    <div>
      {title && <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h2>}
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex justify-between items-center pb-2 ${
              i < items.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
            }`}
          >
            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
            <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
