'use client'

import { useState, useMemo, useCallback } from 'react'
import type { TaxTransaction, TaxCategory } from './types'
import { TAX_CATEGORIES } from './types'

// ─── Props ─────────────────────────────────────────────────────────

interface TransactionTableProps {
  transactions: TaxTransaction[]
  categories: TaxCategory[]
  onUpdate: (id: string, updates: Partial<TaxTransaction>) => void
  onDelete: (id: string) => void
  onApproveAll: () => void
  onRecategorise: () => void
}

// ─── Types ─────────────────────────────────────────────────────────

type SortField = 'date' | 'description' | 'amount' | 'gst_amount' | 'category' | 'approved'
type SortDir = 'asc' | 'desc'
type FilterApproval = 'all' | 'approved' | 'pending'
type FilterType = 'all' | 'income' | 'expense'

// ─── Helpers ───────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(Math.abs(amount))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' })
}

function confidenceIndicator(confidence: string): string {
  switch (confidence) {
    case 'high':
    case 'manual':
      return '\u2705'  // checkmark
    case 'medium':
      return '\u26A0\uFE0F' // warning
    default:
      return '\u2753'  // question mark
  }
}

function getCategoryLabel(categoryId: string | null): string {
  if (!categoryId) return 'Uncategorised'
  const cat = TAX_CATEGORIES.find((c) => c.id === categoryId)
  return cat?.label ?? categoryId
}

// ─── Component ─────────────────────────────────────────────────────

export default function TransactionTable({
  transactions,
  onUpdate,
  onDelete,
  onApproveAll,
  onRecategorise,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterApproval, setFilterApproval] = useState<FilterApproval>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState('')

  // ─── Sort & Filter ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...transactions]

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((tx) => tx.category === filterCategory)
    }

    // Approval filter
    if (filterApproval === 'approved') {
      result = result.filter((tx) => tx.approved)
    } else if (filterApproval === 'pending') {
      result = result.filter((tx) => !tx.approved)
    }

    // Income/expense filter
    if (filterType === 'income') {
      result = result.filter((tx) => tx.amount > 0)
    } else if (filterType === 'expense') {
      result = result.filter((tx) => tx.amount < 0)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'date':
          cmp = a.date.localeCompare(b.date)
          break
        case 'description':
          cmp = a.description.localeCompare(b.description)
          break
        case 'amount':
          cmp = a.amount - b.amount
          break
        case 'gst_amount':
          cmp = (a.gst_amount ?? 0) - (b.gst_amount ?? 0)
          break
        case 'category':
          cmp = (a.category ?? '').localeCompare(b.category ?? '')
          break
        case 'approved':
          cmp = Number(a.approved) - Number(b.approved)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [transactions, filterCategory, filterApproval, filterType, sortField, sortDir])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }, [sortField])

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null
    return <span className="ml-1 text-[#3D6AF2]">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  }

  const handleNoteSubmit = useCallback((txId: string) => {
    onUpdate(txId, { notes: editingNote })
    setExpandedNote(null)
    setEditingNote('')
  }, [editingNote, onUpdate])

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="rounded-xl bg-[#131a23] border border-[#1e2631] overflow-hidden">
      {/* ── Header / Toolbar ──────────────────────────────────────── */}
      <div className="p-4 border-b border-[#1e2631] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-medium text-[#a6abb5]">
            Transactions
            <span className="ml-2 text-xs text-[#70767f]">
              {filtered.length} of {transactions.length}
            </span>
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRecategorise}
              className="border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer"
            >
              Re-categorise
            </button>
            <button
              type="button"
              onClick={onApproveAll}
              className="bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 text-sm cursor-pointer"
            >
              Approve All
            </button>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-xl bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-xs px-3 py-2 focus:border-[#3D6AF2] outline-none cursor-pointer min-h-[44px]"
          >
            <option value="all">All Categories</option>
            {TAX_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value as FilterApproval)}
            aria-label="Filter by approval status"
            className="rounded-xl bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-xs px-3 py-2 focus:border-[#3D6AF2] outline-none cursor-pointer min-h-[44px]"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            aria-label="Filter by type"
            className="rounded-xl bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-xs px-3 py-2 focus:border-[#3D6AF2] outline-none cursor-pointer min-h-[44px]"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* ── Desktop Table ─────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2631] text-[#70767f] text-xs">
              {([
                ['date', 'Date'],
                ['description', 'Description'],
                ['amount', 'Amount'],
                ['gst_amount', 'GST'],
                ['category', 'Category'],
                ['approved', 'Approved'],
              ] as [SortField, string][]).map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-3 py-2.5 font-medium text-left cursor-pointer hover:text-[#3D6AF2] transition-colors select-none"
                >
                  {label}{sortIndicator(field)}
                </th>
              ))}
              <th className="px-3 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2631]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[#70767f] text-sm">
                  No transactions found
                </td>
              </tr>
            )}
            {filtered.map((tx) => (
              <tr
                key={tx.id}
                className={`transition-colors ${
                  !tx.approved ? 'bg-amber-500/5' : 'hover:bg-[#1e2631]/50'
                }`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap text-[#a6abb5]">
                  {formatDate(tx.date)}
                </td>
                <td className="px-3 py-2.5 text-white max-w-[250px]">
                  <div className="truncate">{tx.description}</div>
                  {/* Expandable notes */}
                  {expandedNote === tx.id ? (
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 rounded-lg bg-[#090f16] border border-[#1e2631] text-white text-xs px-2 py-1 placeholder:text-[#4a5060] focus:border-[#3D6AF2] outline-none"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNoteSubmit(tx.id) }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleNoteSubmit(tx.id)}
                        className="text-xs text-[#3D6AF2] hover:underline cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedNote(tx.id)
                        setEditingNote(tx.notes ?? '')
                      }}
                      className="text-xs text-[#70767f] hover:text-[#3D6AF2] cursor-pointer mt-0.5"
                    >
                      {tx.notes ? tx.notes : '+ Note'}
                    </button>
                  )}
                </td>
                <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${
                  tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {tx.amount >= 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-[#a6abb5]">
                  {tx.gst_amount != null ? formatCurrency(tx.gst_amount) : '-'}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{confidenceIndicator(tx.category_confidence)}</span>
                    <select
                      value={tx.category ?? ''}
                      onChange={(e) => onUpdate(tx.id, { category: e.target.value || null })}
                      aria-label={`Category for ${tx.description}`}
                      className="rounded-lg bg-[#090f16] border border-[#1e2631] text-[#a6abb5] text-xs px-2 py-1 focus:border-[#3D6AF2] outline-none cursor-pointer max-w-[160px]"
                    >
                      <option value="">Uncategorised</option>
                      {TAX_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tx.approved}
                      onChange={(e) => onUpdate(tx.id, { approved: e.target.checked })}
                      aria-label={`Approve ${tx.description}`}
                      className="w-4 h-4 rounded border-[#1e2631] bg-[#090f16] text-[#3D6AF2] focus:ring-[#3D6AF2] cursor-pointer"
                    />
                  </label>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(tx.id)}
                    aria-label={`Delete ${tx.description}`}
                    className="text-[#70767f] hover:text-red-400 transition-colors cursor-pointer p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card Layout ────────────────────────────────────── */}
      <div className="md:hidden divide-y divide-[#1e2631]">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[#70767f] text-sm">
            No transactions found
          </div>
        )}
        {filtered.map((tx) => (
          <div
            key={tx.id}
            className={`p-4 space-y-2 ${!tx.approved ? 'bg-amber-500/5' : ''}`}
          >
            {/* Top row: date + amount */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">{formatDate(tx.date)}</span>
              <span className={`text-sm font-semibold ${
                tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {tx.amount >= 0 ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-white truncate">{tx.description}</p>

            {/* Category pill + confidence + GST */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs">
                {confidenceIndicator(tx.category_confidence)}
              </span>
              <select
                value={tx.category ?? ''}
                onChange={(e) => onUpdate(tx.id, { category: e.target.value || null })}
                aria-label={`Category for ${tx.description}`}
                className="rounded-full bg-[#090f16] border border-[#1e2631] text-[#a6abb5] text-xs px-3 py-1.5 focus:border-[#3D6AF2] outline-none cursor-pointer min-h-[44px]"
              >
                <option value="">Uncategorised</option>
                {TAX_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>

              {tx.gst_amount != null && (
                <span className="text-xs text-[#70767f]">
                  GST: {formatCurrency(tx.gst_amount)}
                </span>
              )}
            </div>

            {/* Bottom row: notes + actions */}
            <div className="flex items-center justify-between">
              {/* Note */}
              {expandedNote === tx.id ? (
                <div className="flex-1 flex gap-2 mr-3">
                  <input
                    type="text"
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 rounded-lg bg-[#090f16] border border-[#1e2631] text-white text-xs px-2 py-1 placeholder:text-[#4a5060] focus:border-[#3D6AF2] outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNoteSubmit(tx.id) }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleNoteSubmit(tx.id)}
                    className="text-xs text-[#3D6AF2] hover:underline cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setExpandedNote(tx.id)
                    setEditingNote(tx.notes ?? '')
                  }}
                  className="text-xs text-[#70767f] hover:text-[#3D6AF2] cursor-pointer"
                >
                  {tx.notes ? tx.notes : '+ Note'}
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center">
                  <input
                    type="checkbox"
                    checked={tx.approved}
                    onChange={(e) => onUpdate(tx.id, { approved: e.target.checked })}
                    aria-label={`Approve ${tx.description}`}
                    className="w-4 h-4 rounded border-[#1e2631] bg-[#090f16] text-[#3D6AF2] focus:ring-[#3D6AF2] cursor-pointer"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onDelete(tx.id)}
                  aria-label={`Delete ${tx.description}`}
                  className="text-[#70767f] hover:text-red-400 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
