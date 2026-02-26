'use client'

import { useState } from 'react'
import { useRateAlerts } from './use-rate-alerts'

interface RateAlertsProps {
  from: string
  to: string
}

export function RateAlerts({ from, to }: RateAlertsProps) {
  const {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    hasPermission,
    requestPermission,
    notificationsSupported: notifSupported,
  } = useRateAlerts()

  const [targetRate, setTargetRate] = useState('')
  const [direction, setDirection] = useState<'above' | 'below'>('above')

  const activeAlerts = alerts.filter((a) => !a.triggered)
  const triggeredAlerts = alerts.filter((a) => a.triggered)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const rate = parseFloat(targetRate)
    if (isNaN(rate) || rate <= 0) return
    addAlert(from, to, rate, direction)
    setTargetRate('')
  }

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Rate Alerts</h3>

      {/* Notification permission banner */}
      {notifSupported && !hasPermission && (
        <button
          onClick={requestPermission}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer text-left"
        >
          <span className="font-semibold">Enable notifications</span> to get alerted when rates hit your target.
        </button>
      )}

      {!notifSupported && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          Browser notifications are not available. Alerts will show in-app only.
        </div>
      )}

      {/* Set Alert form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
            {from}/{to}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">goes</span>
          <div className="flex rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDirection('above')}
              className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                direction === 'above'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Above
            </button>
            <button
              type="button"
              onClick={() => setDirection('below')}
              className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                direction === 'below'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Below
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            min="0"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            placeholder="Target rate"
            required
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-[var(--tk-color-primary-500)] text-white text-sm font-medium hover:bg-[var(--tk-color-primary-500)]/90 transition-colors cursor-pointer shrink-0"
          >
            Set
          </button>
        </div>
      </form>

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Active ({activeAlerts.length})
          </h4>
          <div className="flex flex-col gap-1.5">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      alert.direction === 'above'
                        ? 'text-emerald-500'
                        : 'text-red-500'
                    }`}
                    aria-label={alert.direction === 'above' ? 'Above' : 'Below'}
                  >
                    {alert.direction === 'above' ? '\u2191' : '\u2193'}
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {alert.from}/{alert.to}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {alert.targetRate}
                  </span>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer shrink-0"
                  aria-label={`Remove alert for ${alert.from}/${alert.to} ${alert.direction} ${alert.targetRate}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggered alerts */}
      {triggeredAlerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Triggered ({triggeredAlerts.length})
            </h4>
            <button
              onClick={clearTriggered}
              className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-[var(--tk-color-primary-500)] transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50"
              >
                <span className="text-sm text-emerald-500 shrink-0" aria-label="Triggered">
                  &#10003;
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {alert.from}/{alert.to}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {alert.direction === 'above' ? '\u2191' : '\u2193'} {alert.targetRate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {alerts.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
          No alerts set. Enter a target rate above to get notified.
        </p>
      )}
    </div>
  )
}
