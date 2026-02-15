'use client'

interface StatsRowProps {
  data: { date: string; rate: number }[]
  to: string
  loading: boolean
}

function computeStats(data: { date: string; rate: number }[]) {
  if (data.length === 0) return null
  const rates = data.map((d) => d.rate)
  const high = Math.max(...rates)
  const low = Math.min(...rates)
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length
  const volatility = ((high - low) / avg) * 100

  const highDate = data.find((d) => d.rate === high)?.date || ''
  const lowDate = data.find((d) => d.rate === low)?.date || ''

  let volatilityLabel: string
  let volatilityColor: string
  if (volatility < 1) {
    volatilityLabel = 'Low'
    volatilityColor = 'text-green-600 dark:text-green-400'
  } else if (volatility < 3) {
    volatilityLabel = 'Medium'
    volatilityColor = 'text-amber-600 dark:text-amber-400'
  } else {
    volatilityLabel = 'High'
    volatilityColor = 'text-red-600 dark:text-red-400'
  }

  return { high, low, highDate, lowDate, volatility, volatilityLabel, volatilityColor }
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function StatsRow({ data, to, loading }: StatsRowProps) {
  const stats = computeStats(data)

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-busy={loading}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm"
          >
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
            <div className="h-2 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Period High */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Period High</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{stats.high.toFixed(4)}</span>
          <span className="text-sm font-medium text-slate-400">{to}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Reached on {formatDate(stats.highDate)}</p>
      </div>

      {/* Period Low */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Period Low</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{stats.low.toFixed(4)}</span>
          <span className="text-sm font-medium text-slate-400">{to}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Reached on {formatDate(stats.lowDate)}</p>
      </div>

      {/* Volatility */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm border-l-4 border-l-[var(--ht-color-primary-500)]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Volatility Score</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${stats.volatilityColor}`}>{stats.volatilityLabel}</span>
          <span className="text-sm font-medium text-slate-400">{stats.volatility.toFixed(2)}%</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Range: {stats.low.toFixed(4)} &ndash; {stats.high.toFixed(4)}
        </p>
      </div>
    </div>
  )
}
