'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { EXPENSE_CATEGORIES } from './tax-data'
import type { ExpenseEntry, TaxCategory } from './types'

const LS_KEY = 'tradie-tax-entries'

function loadLocal(): ExpenseEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
function saveLocal(entries: ExpenseEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries))
}

export default function IncomeExpenses() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ExpenseEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<TaxCategory>('income')
  const [entryType, setEntryType] = useState<'income' | 'expense'>('expense')
  const [gstInclusive, setGstInclusive] = useState(true)

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
            created_at: e.created_at as string,
          }))
          setEntries(mapped)
          setLoading(false)
          return
        }
      } catch { /* fall through to local */ }
    }
    setEntries(loadLocal())
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10))
    setDescription('')
    setAmount('')
    setCategory('income')
    setEntryType('expense')
    setGstInclusive(true)
    setShowForm(false)
  }

  const handleAdd = async () => {
    const amt = parseFloat(amount)
    if (!description.trim() || isNaN(amt) || amt <= 0) return

    const newEntry: ExpenseEntry = {
      id: crypto.randomUUID(),
      date,
      description: description.trim(),
      amount: amt,
      category: entryType === 'income' ? 'income' : category,
      type: entryType,
      gstInclusive,
    }

    if (user) {
      try {
        const res = await fetch('/api/v1/tradie-tax/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: newEntry.date,
            description: newEntry.description,
            amount: newEntry.amount,
            category: newEntry.category,
            entry_type: newEntry.type,
            gst_inclusive: newEntry.gstInclusive,
          }),
        })
        if (res.ok) {
          await fetchEntries()
          resetForm()
          return
        }
      } catch { /* fall through */ }
    }
    const updated = [newEntry, ...entries]
    setEntries(updated)
    saveLocal(updated)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (user) {
      try {
        await fetch(`/api/v1/tradie-tax/entries?id=${id}`, { method: 'DELETE' })
        await fetchEntries()
        return
      } catch { /* fall through */ }
    }
    const updated = entries.filter((e) => e.id !== id)
    setEntries(updated)
    saveLocal(updated)
  }

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const netProfit = totalIncome - totalExpenses

  // Category breakdown
  const categoryTotals = entries
    .filter((e) => e.type === 'expense')
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

  const expenseCategories = Object.keys(EXPENSE_CATEGORIES).filter((k) => k !== 'income') as TaxCategory[]

  if (loading) {
    return <div className="text-center py-20 text-slate-400 dark:text-[#70767f]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-[#70767f]">Total Income</p>
          <p className="text-2xl font-bold text-green-400 mt-1">${totalIncome.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-[#70767f]">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400 mt-1">${totalExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-[#70767f]">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${netProfit.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Add entry button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full min-h-[44px] rounded-xl border border-dashed border-slate-600 text-slate-300 hover:border-[#3D6AF2] hover:text-[#3D6AF2] transition-colors text-sm font-medium"
        >
          + Add Entry
        </button>
      )}

      {/* Add entry form */}
      {showForm && (
        <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">New Entry</h3>

          {/* Income/Expense toggle */}
          <div className="flex gap-2">
            {(['income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setEntryType(t)
                  if (t === 'income') setCategory('income')
                  else if (category === 'income') setCategory('tools')
                }}
                className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                  entryType === t
                    ? t === 'income'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Amount (NZD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Power tools from Bunnings"
              className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
            />
          </div>

          {entryType === 'expense' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaxCategory)}
                className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1e2631]">
                    {EXPENSE_CATEGORIES[cat].icon} {EXPENSE_CATEGORIES[cat].label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* GST inclusive toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gstInclusive}
              onChange={(e) => setGstInclusive(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#3D6AF2] focus:ring-[#3D6AF2]"
            />
            <span className="text-sm text-slate-300">GST inclusive</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 min-h-[44px] rounded-lg bg-[#3D6AF2] text-white text-sm font-medium hover:bg-[#3D79F2] transition-colors"
            >
              Add Entry
            </button>
            <button
              onClick={resetForm}
              className="min-h-[44px] px-4 rounded-lg bg-white/5 text-slate-400 text-sm hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Expense Breakdown</h3>
          {expenseCategories
            .filter((cat) => categoryTotals[cat])
            .sort((a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0))
            .map((cat) => {
              const catTotal = categoryTotals[cat] || 0
              const pct = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0
              const info = EXPENSE_CATEGORIES[cat]
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{info.icon} {info.label}</span>
                    <span className="text-slate-400">${catTotal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: info.color }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">
          Entries ({entries.length})
          {!user && entries.length > 0 && (
            <span className="text-xs font-normal text-slate-500 ml-2">Saved locally</span>
          )}
        </h3>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No entries yet. Add your first income or expense above.</p>
        ) : (
          entries.map((entry) => {
            const info = EXPENSE_CATEGORIES[entry.category] || EXPENSE_CATEGORIES['other-deduction']
            return (
              <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1e2631] p-3.5 group">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: info.color + '20' }}
                >
                  {info.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{entry.description}</p>
                  <p className="text-xs text-slate-500">{entry.date} &middot; {info.label}{entry.gstInclusive ? ' (GST incl.)' : ''}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 p-1"
                  aria-label={`Delete ${entry.description}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Sign-in prompt */}
      {!user && entries.length > 0 && (
        <div className="rounded-xl border border-[#3D6AF2]/30 bg-[#3D6AF2]/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Sign in to sync your entries</p>
            <p className="text-xs text-slate-400 mt-0.5">Your data is currently saved to this browser only.</p>
          </div>
          <button
            onClick={() => signInWithOAuth('google')}
            className="min-h-[44px] px-4 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 dark:text-[#70767f] text-center leading-relaxed">
        This tool provides estimates only. Tax obligations may vary. Consult a qualified accountant or visit{' '}
        <a href="https://www.ird.govt.nz" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">ird.govt.nz</a>{' '}
        for official information.
      </p>
    </div>
  )
}
