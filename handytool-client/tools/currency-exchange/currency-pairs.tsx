'use client'

interface CurrencyPair {
  from: string
  to: string
  label: string
  sublabel: string
  rate: number | null
  changePercent: number | null
}

interface CurrencyPairsProps {
  pairs: CurrencyPair[]
  loading: boolean
  onPairClick: (from: string, to: string) => void
}

const FLAG_MAP: Record<string, string> = {
  AUD: '\u{1F1E6}\u{1F1FA}', EUR: '\u{1F1EA}\u{1F1FA}', GBP: '\u{1F1EC}\u{1F1E7}',
  JPY: '\u{1F1EF}\u{1F1F5}', USD: '\u{1F1FA}\u{1F1F8}', CAD: '\u{1F1E8}\u{1F1E6}',
  CHF: '\u{1F1E8}\u{1F1ED}', CNY: '\u{1F1E8}\u{1F1F3}', NZD: '\u{1F1F3}\u{1F1FF}',
}

function getFlag(code: string): string {
  return FLAG_MAP[code] || '\u{1F3F3}\u{FE0F}'
}

export function CurrencyPairs({ pairs, loading, onPairClick }: CurrencyPairsProps) {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-white">Top Currency Pairs</h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </div>
                  <div>
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                    <div className="h-2.5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                  <div className="h-2.5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
                </div>
              </div>
            ))
          : pairs.map((pair) => (
              <button
                key={`${pair.from}${pair.to}`}
                onClick={() => onPairClick(pair.from, pair.to)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1 text-lg" aria-hidden="true">
                    <span>{getFlag(pair.from)}</span>
                    <span>{getFlag(pair.to)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{pair.label}</p>
                    <p className="text-[10px] font-medium text-slate-400">{pair.sublabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {pair.rate !== null ? pair.rate.toFixed(4) : '—'}
                  </p>
                  {pair.changePercent !== null && (
                    <p
                      className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                        pair.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={pair.changePercent >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                      {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                    </p>
                  )}
                </div>
              </button>
            ))}
      </div>
    </div>
  )
}

export type { CurrencyPair }
