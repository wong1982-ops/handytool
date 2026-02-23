'use client'

interface StatCardsProps {
  average?: number
  best?: number
  attempts: number
  unit: string
}

interface StatItem {
  icon: string
  label: string
  value: string
}

export function StatCards({ average, best, attempts, unit }: StatCardsProps) {
  const stats: StatItem[] = [
    {
      icon: '\u{1F4CA}',
      label: 'Average',
      value: average !== undefined ? `${average} ${unit}` : '\u2014',
    },
    {
      icon: '\u{1F3C6}',
      label: 'Personal Best',
      value: best !== undefined ? `${best} ${unit}` : '\u2014',
    },
    {
      icon: '\u{1F3AF}',
      label: 'Attempts',
      value: `${attempts}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl" role="img" aria-label={stat.label}>
              {stat.icon}
            </span>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
