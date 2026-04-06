'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { estimateTax } from './tax-calculator'
import { NZ_TAX_BRACKETS, ACC_EARNER_LEVY_RATE } from './tax-data'
import type { ExpenseEntry, TaxCategory, TaxEstimate } from './types'

const LS_KEY = 'tradie-tax-entries'

function loadLocal(): ExpenseEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

export default function TaxEstimator() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ExpenseEntry[]>([])
  const [manualIncome, setManualIncome] = useState('')
  const [manualExpenses, setManualExpenses] = useState('')
  const [useManual, setUseManual] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (user) {
      try {
        const res = await fetch('/api/v1/tradie-tax/entries')
        if (res.ok) {
          const json = await res.json()
          const mapped: ExpenseEntry[] = (json.data?.entries || []).map((e: Record<string, unknown>) => ({
            id: e.id as string,
            date: e.date as string,
            description: e.description as string,
            amount: Number(e.amount),
            category: e.category as TaxCategory,
            type: e.entry_type as 'income' | 'expense',
            gstInclusive: e.gst_inclusive as boolean,
          }))
          setEntries(mapped)
          setLoading(false)
          return
        }
      } catch { /* fall through */ }
    }
    setEntries(loadLocal())
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

  const incomeForCalc = useManual ? (parseFloat(manualIncome) || 0) : totalIncome
  const expensesForCalc = useManual ? (parseFloat(manualExpenses) || 0) : totalExpenses

  const estimate: TaxEstimate = estimateTax(incomeForCalc, expensesForCalc)

  const maxBracketTax = Math.max(...estimate.bracketBreakdown.map((b) => b.taxInBracket), 1)

  if (loading) {
    return <div className="text-center py-20 text-slate-400 dark:text-[#70767f]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Source toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setUseManual(false)}
          className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
            !useManual ? 'bg-[#3D6AF2] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          From Entries ({entries.length})
        </button>
        <button
          onClick={() => setUseManual(true)}
          className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
            useManual ? 'bg-[#3D6AF2] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          Manual Input
        </button>
      </div>

      {/* Manual inputs */}
      {useManual && (
        <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Total Income (NZD)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={manualIncome}
              onChange={(e) => setManualIncome(e.target.value)}
              placeholder="e.g. 85000"
              className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Total Expenses (NZD)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={manualExpenses}
              onChange={(e) => setManualExpenses(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-[#1e2631] p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Taxable Income</p>
          <p className="text-lg font-bold text-white tabular-nums">
            ${estimate.taxableIncome.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Income Tax</p>
          <p className="text-lg font-bold text-red-400 tabular-nums">
            ${estimate.totalIncomeTax.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">ACC Levy</p>
          <p className="text-lg font-bold text-amber-400 tabular-nums">
            ${estimate.accLevy.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl border border-[#3D6AF2]/20 bg-[#3D6AF2]/5 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Provisional Tax</p>
          <p className="text-lg font-bold text-[#3D9DF2] tabular-nums">
            ${estimate.provisionalTax.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Bracket breakdown */}
      <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Tax Bracket Breakdown</h3>
        <div className="space-y-3">
          {estimate.bracketBreakdown.map((b, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">
                  {b.bracket.label} <span className="text-slate-500">({(b.bracket.rate * 100).toFixed(1)}%)</span>
                </span>
                <span className="text-slate-400 tabular-nums">
                  ${b.taxableInBracket.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
                  {' → '}
                  <span className="text-red-400">${b.taxInBracket.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] transition-all"
                  style={{ width: `${maxBracketTax > 0 ? (b.taxInBracket / maxBracketTax) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total owed */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Estimated Total Tax + ACC</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Income tax + ACC earner levy ({(ACC_EARNER_LEVY_RATE * 100).toFixed(2)}%)
          </p>
        </div>
        <p className="text-3xl font-bold text-red-400 tabular-nums">
          ${estimate.totalTaxOwed.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* NZ tax brackets reference */}
      <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">NZ Income Tax Brackets 2025/26</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 font-medium text-slate-300">Bracket</th>
                <th className="text-right py-2 font-medium text-slate-300">Rate</th>
              </tr>
            </thead>
            <tbody>
              {NZ_TAX_BRACKETS.map((b, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2">{b.label}</td>
                  <td className="text-right py-2 tabular-nums">{(b.rate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 dark:text-[#70767f] text-center leading-relaxed">
        This tool provides estimates only. Tax obligations may vary. Consult a qualified accountant or visit{' '}
        <a href="https://www.ird.govt.nz" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">ird.govt.nz</a>{' '}
        for official information.
      </p>
    </div>
  )
}
