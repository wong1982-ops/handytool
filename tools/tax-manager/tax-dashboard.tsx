'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrentTaxYear, TAX_CATEGORIES } from './types'
import type {
  TaxEntity,
  TaxTransaction,
  TaxDocument,
  CategoryRule,
  GstSummary,
  IncomeTaxSummary,
} from './types'
import { createRule } from './category-rules'
import { generateGst101A, generateIR3, generateIR4 } from './form-generator'
import SettingsPanel from './settings-panel'
import PeriodSummary from './period-summary'
import DocumentUpload from './document-upload'
import TransactionTable from './transaction-table'
import GstSummaryPanel from './gst-summary'
import IncomeTaxSummaryPanel from './income-tax-summary'

// ─── Tax Year Options ───────────────────────────────────────────────

function getTaxYearOptions(): string[] {
  const current = getCurrentTaxYear()
  const [startStr] = current.split('-')
  const start = Number(startStr)
  const options: string[] = []
  for (let y = start; y >= start - 4; y--) {
    options.push(`${y}-${String(y + 1).slice(2)}`)
  }
  return options
}

// ─── Component ──────────────────────────────────────────────────────

export default function TaxDashboard() {
  const [entities, setEntities] = useState<TaxEntity[]>([])
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [taxYear, setTaxYear] = useState(getCurrentTaxYear)
  const [transactions, setTransactions] = useState<TaxTransaction[]>([])
  const [documents, setDocuments] = useState<TaxDocument[]>([])
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) ?? null
  const taxYearOptions = getTaxYearOptions()

  // ─── Fetch entities on mount ────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/tax-manager/entities')
        if (!res.ok) throw new Error('Failed to load entities')
        const json = await res.json()
        const list = (json.data?.entities ?? []) as TaxEntity[]
        setEntities(list)
        if (list.length > 0) {
          setSelectedEntityId(list[0].id)
        } else {
          setShowSettings(true)
        }
      } catch {
        // Entity fetch failed — show settings for setup
        setShowSettings(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ─── Fetch transactions + documents when entity/year changes ────

  const fetchData = useCallback(async (entityId: string, year: string) => {
    try {
      const [txRes, docRes, rulesRes] = await Promise.all([
        fetch(`/api/v1/tax-manager/transactions?entity_id=${entityId}&tax_year=${year}`),
        fetch(`/api/v1/tax-manager/documents?entity_id=${entityId}&tax_year=${year}`),
        fetch(`/api/v1/tax-manager/entities?include_rules=true&entity_id=${entityId}`),
      ])

      if (txRes.ok) {
        const txJson = await txRes.json()
        setTransactions((txJson.data?.transactions ?? []) as TaxTransaction[])
      }

      if (docRes.ok) {
        const docJson = await docRes.json()
        setDocuments((docJson.data?.documents ?? []) as TaxDocument[])
      }

      if (rulesRes.ok) {
        const rulesJson = await rulesRes.json()
        const rulesData = rulesJson.data
        if (Array.isArray(rulesData?.rules)) {
          setCategoryRules(rulesData.rules as CategoryRule[])
        } else if (Array.isArray(rulesData?.entities)) {
          // Rules may come from entity response
          setCategoryRules([])
        }
      }
    } catch {
      // Non-blocking — data will be empty
    }
  }, [])

  useEffect(() => {
    if (selectedEntityId) {
      fetchData(selectedEntityId, taxYear)
    }
  }, [selectedEntityId, taxYear, fetchData])

  // ─── Transaction Handlers ─────────────────────────────────────────

  const handleTransactionUpdate = useCallback(
    async (id: string, updates: Partial<TaxTransaction>) => {
      // Optimistic update
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
      )

      // If category was changed by user, create a category rule
      if (updates.category) {
        const tx = transactions.find((t) => t.id === id)
        if (tx && tx.category !== updates.category) {
          const rule = createRule(tx.description, updates.category)
          // Save rule to API (fire and forget)
          fetch('/api/v1/tax-manager/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'category-rule',
              entity_id: selectedEntityId,
              ...rule,
            }),
          }).catch(() => {})

          // Update local rules
          setCategoryRules((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              user_id: '',
              entity_id: selectedEntityId,
              ...rule,
              created_at: new Date().toISOString(),
            },
          ])
        }
      }

      try {
        await fetch('/api/v1/tax-manager/transactions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        })
      } catch {
        // Revert on failure — refetch
        if (selectedEntityId) fetchData(selectedEntityId, taxYear)
      }
    },
    [transactions, selectedEntityId, taxYear, fetchData],
  )

  const handleTransactionDelete = useCallback(
    async (id: string) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id))

      try {
        await fetch(`/api/v1/tax-manager/transactions?id=${id}`, {
          method: 'DELETE',
        })
      } catch {
        if (selectedEntityId) fetchData(selectedEntityId, taxYear)
      }
    },
    [selectedEntityId, taxYear, fetchData],
  )

  const handleApproveAll = useCallback(async () => {
    const unapproved = transactions.filter((tx) => !tx.approved)
    if (unapproved.length === 0) return

    // Optimistic update
    setTransactions((prev) =>
      prev.map((tx) => ({ ...tx, approved: true })),
    )

    try {
      await fetch('/api/v1/tax-manager/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          ids: unapproved.map((tx) => tx.id),
          updates: { approved: true },
        }),
      })
    } catch {
      if (selectedEntityId) fetchData(selectedEntityId, taxYear)
    }
  }, [transactions, selectedEntityId, taxYear, fetchData])

  const handleRecategorise = useCallback(async () => {
    const pending = transactions.filter((tx) => !tx.approved)
    if (pending.length === 0) return

    try {
      const res = await fetch('/api/v1/tax-manager/categorise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: selectedEntityId,
          transactions: pending.map((tx) => ({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
          })),
        }),
      })

      if (res.ok) {
        const catJson = await res.json()
        const catData = catJson.data?.categories ?? catJson.data
        if (Array.isArray(catData)) {
          setTransactions((prev) =>
            prev.map((tx) => {
              const updated = catData.find(
                (d: { id: string; category: string; confidence: string }) => d.id === tx.id,
              )
              if (updated) {
                return {
                  ...tx,
                  category: updated.category,
                  category_confidence: updated.confidence,
                }
              }
              return tx
            }),
          )
        }
      }
    } catch {
      // Non-blocking
    }
  }, [transactions, selectedEntityId])

  // ─── Form Generation Handlers ─────────────────────────────────────

  const handleGenerateGst = useCallback(
    (summary: GstSummary) => {
      if (!selectedEntity) return
      const periodLabel = `${summary.periodStart} to ${summary.periodEnd}`
      generateGst101A(summary, selectedEntity, periodLabel)
    },
    [selectedEntity],
  )

  const handleGenerateIR = useCallback(
    (summary: IncomeTaxSummary) => {
      if (!selectedEntity) return
      if (selectedEntity.type === 'company') {
        generateIR4(summary, selectedEntity, taxYear)
      } else {
        generateIR3(summary, selectedEntity, taxYear)
      }
    },
    [selectedEntity, taxYear],
  )

  // ─── Entity Callbacks ─────────────────────────────────────────────

  const handleEntityCreated = useCallback((entity: TaxEntity) => {
    setEntities((prev) => [...prev, entity])
    setSelectedEntityId(entity.id)
    setShowSettings(false)
  }, [])

  const handleEntityUpdated = useCallback((entity: TaxEntity) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === entity.id ? entity : e)),
    )
    setShowSettings(false)
  }, [])

  const handleEntitySelect = useCallback((id: string) => {
    setSelectedEntityId(id)
  }, [])

  const handleDocumentUploaded = useCallback(() => {
    if (selectedEntityId) {
      fetchData(selectedEntityId, taxYear)
    }
  }, [selectedEntityId, taxYear, fetchData])

  // ─── Loading State ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          NZ Tax{' '}
          <span className="bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] bg-clip-text text-transparent">
            Manager
          </span>
        </h1>
        <div className="flex items-center justify-center py-20">
          <div className="text-[#a6abb5] text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Title ────────────────────────────────────────────────────── */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        NZ Tax{' '}
        <span className="bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] bg-clip-text text-transparent">
          Manager
        </span>
      </h1>

      {/* ── Top Bar: Entity Selector + Tax Year + Settings ───────────── */}
      {entities.length > 0 && !showSettings && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedEntityId ?? ''}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            aria-label="Select entity"
            className="flex-1 min-w-0 rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.type === 'sole-trader' ? 'Sole Trader' : 'Company'})
              </option>
            ))}
          </select>

          <select
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value)}
            aria-label="Select tax year"
            className="rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
          >
            {taxYearOptions.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
            className="rounded-xl border border-[#1e2631] text-[#a6abb5] hover:text-white hover:border-[#3D6AF2] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* ── Settings Panel ──────────────────────────────────────────── */}
      {(showSettings || entities.length === 0) && (
        <SettingsPanel
          entities={entities}
          selectedEntityId={selectedEntityId}
          onEntityCreated={handleEntityCreated}
          onEntityUpdated={handleEntityUpdated}
          onEntitySelect={handleEntitySelect}
        />
      )}

      {/* ── Main Content (only when entity is selected) ──────────── */}
      {selectedEntity && !showSettings && (
        <>
          {/* Period Summary */}
          <PeriodSummary transactions={transactions} />

          {/* Document Upload */}
          <DocumentUpload
            entityId={selectedEntity.id}
            taxYear={taxYear}
            onDocumentUploaded={handleDocumentUploaded}
          />

          {/* Transaction Table */}
          <TransactionTable
            transactions={transactions}
            categories={TAX_CATEGORIES}
            onUpdate={handleTransactionUpdate}
            onDelete={handleTransactionDelete}
            onApproveAll={handleApproveAll}
            onRecategorise={handleRecategorise}
          />

          {/* GST Summary (expandable) */}
          <GstSummaryPanel
            transactions={transactions}
            entity={selectedEntity}
            onGenerateForm={handleGenerateGst}
          />

          {/* Income Tax Summary (expandable) */}
          <IncomeTaxSummaryPanel
            transactions={transactions}
            entity={selectedEntity}
            taxYear={taxYear}
            onGenerateForm={handleGenerateIR}
          />
        </>
      )}
    </div>
  )
}
