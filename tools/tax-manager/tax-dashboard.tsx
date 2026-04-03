'use client'

import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

type Tab = 'overview' | 'upload' | 'transactions' | 'gst' | 'tax' | 'settings'

const TAB_ICONS: Record<Tab, ReactNode> = {
  overview: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  ),
  transactions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  gst: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
    </svg>
  ),
  tax: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'upload', label: 'Upload' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'gst', label: 'GST Return' },
  { id: 'tax', label: 'Income Tax' },
  { id: 'settings', label: 'Settings' },
]

export default function TaxDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [entities, setEntities] = useState<TaxEntity[]>([])
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [taxYear, setTaxYear] = useState(getCurrentTaxYear)
  const [transactions, setTransactions] = useState<TaxTransaction[]>([])
  const [documents, setDocuments] = useState<TaxDocument[]>([])
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Tab from URL: /tools/tax-manager?tab=transactions
  const activeTab: Tab = useMemo(() => {
    const param = searchParams.get('tab') as Tab | null
    if (param && TABS.some((t) => t.id === param)) return param
    return 'overview'
  }, [searchParams])

  const setActiveTab = useCallback((tab: Tab) => {
    router.push(`/tools/tax-manager?tab=${tab}`, { scroll: false })
  }, [router])

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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          NZ Tax{' '}
          <span className="bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] bg-clip-text text-transparent">
            Manager
          </span>
        </h1>
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500 dark:text-[#a6abb5] text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Title ────────────────────────────────────────────────────── */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
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
            className="flex-1 min-w-0 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
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
            className="rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
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
            className="rounded-xl border border-slate-200 dark:border-[#1e2631] text-slate-500 dark:text-[#a6abb5] hover:text-white hover:border-[#3D6AF2] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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

      {/* ── Tab Navigation ──────────────────────────────────────────── */}
      {entities.length > 0 && (
        <nav className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-slate-50 dark:bg-[#131a23] text-slate-400 dark:text-[#70767f] hover:text-white hover:bg-slate-200 dark:hover:bg-[#1e2631]'
              }`}
            >
              {TAB_ICONS[tab.id]}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── Settings Tab / First-time Setup ──────────────────────── */}
      {(activeTab === 'settings' || entities.length === 0) && (
        <SettingsPanel
          entities={entities}
          selectedEntityId={selectedEntityId}
          onEntityCreated={(entity) => { handleEntityCreated(entity); setActiveTab('overview') }}
          onEntityUpdated={handleEntityUpdated}
          onEntitySelect={handleEntitySelect}
        />
      )}

      {/* ── Tab Content (only when entity is selected) ────────────── */}
      {selectedEntity && activeTab !== 'settings' && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <PeriodSummary transactions={transactions} />
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <DocumentUpload
              entityId={selectedEntity.id}
              taxYear={taxYear}
              onDocumentUploaded={handleDocumentUploaded}
            />
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <TransactionTable
              transactions={transactions}
              categories={TAX_CATEGORIES}
              onUpdate={handleTransactionUpdate}
              onDelete={handleTransactionDelete}
              onApproveAll={handleApproveAll}
              onRecategorise={handleRecategorise}
            />
          )}

          {/* GST Tab */}
          {activeTab === 'gst' && (
            <GstSummaryPanel
              transactions={transactions}
              entity={selectedEntity}
              onGenerateForm={handleGenerateGst}
            />
          )}

          {/* Income Tax Tab */}
          {activeTab === 'tax' && (
            <IncomeTaxSummaryPanel
              transactions={transactions}
              entity={selectedEntity}
              taxYear={taxYear}
              onGenerateForm={handleGenerateIR}
            />
          )}
        </>
      )}
    </div>
  )
}
