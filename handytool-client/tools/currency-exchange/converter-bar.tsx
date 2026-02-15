'use client'

import { CurrencySelect, getFlag } from './currency-select'

interface ConverterBarProps {
  amount: string
  from: string
  to: string
  currencies: Record<string, string>
  result: { converted: number; rate: number; changePercent: number | null } | null
  loading: boolean
  onAmountChange: (amount: string) => void
  onFromChange: (code: string) => void
  onToChange: (code: string) => void
  onSwap: () => void
  onConvert: () => void
}

function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export { getFlag }

export function ConverterBar({
  amount,
  from,
  to,
  currencies,
  result,
  loading,
  onAmountChange,
  onFromChange,
  onToChange,
  onSwap,
  onConvert,
}: ConverterBarProps) {
  const fromName = currencies[from] || from
  const toName = currencies[to] || to

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Amount */}
        <div className="lg:col-span-3">
          <label htmlFor="amount" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400" aria-hidden="true">$</span>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onConvert() }}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--ht-color-primary-500)] focus:border-[var(--ht-color-primary-500)] outline-none text-lg font-bold"
            />
          </div>
        </div>

        {/* From */}
        <div className="lg:col-span-3">
          <label htmlFor="from-currency" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            From
          </label>
          <CurrencySelect
            id="from-currency"
            value={from}
            currencies={currencies}
            onChange={onFromChange}
          />
        </div>

        {/* Swap */}
        <div className="lg:col-span-1 flex justify-center pb-1">
          <button
            onClick={onSwap}
            aria-label="Swap currencies"
            className="bg-[var(--ht-color-primary-500)]/10 hover:bg-[var(--ht-color-primary-500)]/20 text-[var(--ht-color-primary-500)] p-3 rounded-full transition-all hover:rotate-180 duration-300 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="lg:col-span-3">
          <label htmlFor="to-currency" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            To
          </label>
          <CurrencySelect
            id="to-currency"
            value={to}
            currencies={currencies}
            onChange={onToChange}
          />
        </div>

        {/* Convert Button */}
        <div className="lg:col-span-2">
          <button
            onClick={onConvert}
            disabled={loading}
            className="w-full bg-[var(--ht-color-primary-500)] hover:bg-[var(--ht-color-primary-600)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-lg shadow-[var(--ht-color-primary-500)]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span>Convert</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {formatNumber(parseFloat(amount) || 0)} {fromName} =
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(result.converted)}{' '}
                <span className="text-slate-400 dark:text-slate-500 font-normal">{toName}</span>
              </p>
            </div>
            <div className="text-right">
              {result.changePercent !== null && (
                <p className={`text-sm font-medium flex items-center justify-end gap-1 ${result.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={result.changePercent >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                  </svg>
                  {result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}% today
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1 italic">
                1 {from} = {formatNumber(result.rate, 4)} {to}
              </p>
            </div>
          </div>

        </div>
      )}
    </section>
  )
}
