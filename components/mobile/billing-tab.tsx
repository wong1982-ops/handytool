'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_PACKS } from '@/lib/stripe/config'
import { signInWithOAuth } from '@/lib/supabase/auth'

type ViewId = 'overview' | 'plans' | 'packs' | 'history'

const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 500

interface Tier {
  id: string
  name: string
  monthly_credits: number
  price_cents: number
  features: string[]
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  created_at: string
}

const typeLabel: Record<string, string> = {
  subscription_grant: 'Subscription',
  purchase: 'Purchase',
  usage: 'Usage',
  refund: 'Refund',
  expiry: 'Expired',
}

const typeColor: Record<string, string> = {
  subscription_grant: 'text-emerald-500',
  purchase: 'text-blue-500',
  usage: 'text-slate-500',
  refund: 'text-amber-500',
  expiry: 'text-red-500',
}

export function BillingTab() {
  const { user, loading: authLoading } = useAuth()
  const { balance, loading: creditsLoading } = useCredits()
  const [activeView, setActiveView] = useState<ViewId>('overview')
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)

  const [tiers, setTiers] = useState<Tier[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txPage, setTxPage] = useState(1)
  const [txTotal, setTxTotal] = useState(0)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  const txPerPage = 10

  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
    locked: 'x' | 'y' | null
  } | null>(null)

  // Fetch tiers
  useEffect(() => {
    fetch('/api/v1/credits/tiers')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) setTiers(json.data)
      })
      .catch(() => {})
  }, [])

  // Fetch transactions
  const fetchTransactions = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/v1/credits/transactions?page=${page}&limit=${txPerPage}`)
      if (!res.ok) return
      const json = await res.json()
      setTransactions(json.data || [])
      setTxTotal(json.meta?.total || 0)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (user) fetchTransactions(txPage)
  }, [user, txPage, fetchTransactions])

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId)
    try {
      const res = await fetch('/api/v1/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId }),
      })
      if (!res.ok) throw new Error('Purchase failed')
      const json = await res.json()
      if (json.data?.checkout_url) {
        window.location.href = json.data.checkout_url
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }

  const handleManageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/v1/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Portal failed')
      const json = await res.json()
      if (json.data?.url) {
        window.location.href = json.data.url
      }
    } catch {
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoadingPortal(false)
    }
  }

  const navigateTo = useCallback((view: ViewId) => {
    setActiveView(view)
  }, [])

  const goBack = useCallback(() => {
    setActiveView('overview')
  }, [])

  // Swipe-to-go-back handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (activeView === 'overview') return
      const touch = e.touches[0]
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        locked: null,
      }
      setSwiping(false)
      setSwipeX(0)
    },
    [activeView],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (activeView === 'overview' || !touchRef.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - touchRef.current.startX
      const dy = touch.clientY - touchRef.current.startY

      if (!touchRef.current.locked) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          touchRef.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        } else {
          return
        }
      }

      if (touchRef.current.locked === 'y') return
      e.stopPropagation()

      if (dx > 0) {
        setSwiping(true)
        setSwipeX(dx)
      }
    },
    [activeView],
  )

  const handleTouchEnd = useCallback(() => {
    if (activeView === 'overview' || !touchRef.current) return

    if (touchRef.current.locked === 'x') {
      const elapsed = (Date.now() - touchRef.current.startTime) / 1000
      const velocity = elapsed > 0 ? swipeX / elapsed : 0

      if (swipeX > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        goBack()
      }
    }

    touchRef.current = null
    setSwiping(false)
    setSwipeX(0)
  }, [activeView, swipeX, goBack])

  const txTotalPages = Math.ceil(txTotal / txPerPage)
  const isDrillDown = activeView !== 'overview'
  const swipeOffset = swiping
    ? (swipeX / (typeof window !== 'undefined' ? window.innerWidth : 375)) * 100
    : 0
  const translateX = isDrillDown ? -100 + swipeOffset : 0

  const MENU_ITEMS: { label: string; view: ViewId; icon: React.ReactNode; desc: string }[] = [
    {
      label: 'Subscription Plans',
      view: 'plans',
      desc: tiers.length > 0 ? `${tiers.length} plans available` : 'View plans',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      label: 'Buy Credit Packs',
      view: 'packs',
      desc: 'One-time purchases',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
    },
    {
      label: 'Transaction History',
      view: 'history',
      desc: txTotal > 0 ? `${txTotal} transactions` : 'No transactions yet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ]

  // Sub-view content
  const viewContent: Record<Exclude<ViewId, 'overview'>, React.ReactNode> = {
    plans: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subscription Plans</h2>
          <p className="text-xs text-slate-500 mt-1">Choose a plan that fits your usage.</p>
        </div>
        {tiers.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">No plans available yet.</div>
        ) : (
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div key={tier.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                  <span className="text-lg font-bold text-[#3D6AF2]">
                    ${(tier.price_cents / 100).toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {tier.monthly_credits.toLocaleString()} credits/month
                </p>
                <ul className="space-y-1.5 mb-3">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                  className="w-full py-2.5 rounded-lg bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {loadingPortal ? 'Loading...' : 'Manage Subscription'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    packs: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Buy Credit Packs</h2>
          <p className="text-xs text-slate-500 mt-1">One-time purchases. Credits never expire.</p>
        </div>
        <div className="space-y-3">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{pack.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ${(pack.priceCents / pack.credits).toFixed(1)}/credit
                </p>
              </div>
              <button
                onClick={() => handlePurchase(pack.id)}
                disabled={purchasing === pack.id}
                className="px-4 py-2 rounded-lg border-2 border-[#3D6AF2] text-[#3D6AF2] font-semibold text-sm hover:bg-[#3D6AF2] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                {purchasing === pack.id ? '...' : `$${(pack.priceCents / 100).toFixed(2)}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    ),
    history: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
          <p className="text-xs text-slate-500 mt-1">Your credit usage and purchases.</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              No transactions yet.
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => (
                  <div key={tx.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className={typeColor[tx.type] || ''}>{typeLabel[tx.type] || tx.type}</span>{' '}
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
              {txTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="text-sm text-[#3D6AF2] font-medium disabled:text-slate-300 dark:disabled:text-slate-700 cursor-pointer disabled:cursor-default"
                    style={{ minHeight: '44px' }}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{txPage} / {txTotalPages}</span>
                  <button
                    onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                    disabled={txPage === txTotalPages}
                    className="text-sm text-[#3D6AF2] font-medium disabled:text-slate-300 dark:disabled:text-slate-700 cursor-pointer disabled:cursor-default"
                    style={{ minHeight: '44px' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    ),
  }

  // Not signed in state
  if (!authLoading && !user) {
    return (
      <div className="px-4 py-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Credits</h2>
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-slate-100 dark:bg-white/5 text-center">
            <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Sign in to manage your credits and subscriptions.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => signInWithOAuth('google')}
                className="flex items-center justify-center gap-3 w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => signInWithOAuth('facebook')}
                className="flex items-center justify-center gap-3 w-full px-5 py-3 rounded-xl bg-[#1877F2] text-white font-semibold text-sm hover:bg-[#166FE5] transition-colors shadow-sm cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          willChange: 'transform',
        }}
      >
        {/* Panel 1: Overview */}
        <div className="w-full shrink-0 overflow-y-auto px-4 py-4 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Credits</h2>

          {/* Balance cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-white/5">
              <div>
                <span className="text-sm font-medium text-blue-500">Subscription</span>
                {balance?.current_period_end && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Resets {new Date(balance.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {creditsLoading ? '...' : (balance?.subscription_balance ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-white/5">
              <div>
                <span className="text-sm font-medium text-emerald-500">Purchased</span>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Never expires</p>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {creditsLoading ? '...' : (balance?.purchased_balance ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#3D6AF2]/5 dark:bg-[#3D6AF2]/10 border border-[#3D6AF2]/20">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Available</span>
              <span className="text-xl font-bold text-[#3D6AF2]">
                {creditsLoading ? '...' : (balance?.total ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="rounded-xl bg-slate-100 dark:bg-white/5 divide-y divide-slate-200 dark:divide-white/5">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Panel 2: Drill-down sub-view */}
        <div className="w-full shrink-0 overflow-y-auto">
          {/* Sticky back button */}
          <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 px-2 py-3">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-[#3D6AF2] font-medium cursor-pointer px-2 py-1"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Credits
            </button>
          </div>

          {/* Sub-view content */}
          <div className="px-4 pb-8">
            {isDrillDown && viewContent[activeView]}
          </div>
        </div>
      </div>
    </div>
  )
}
