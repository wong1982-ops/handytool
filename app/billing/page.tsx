'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_PACKS } from '@/lib/stripe/config'
import Link from 'next/link'

interface Tier {
  id: string
  name: string
  monthly_credits: number
  price_cents: number
  features: string[]
}

interface Transaction {
  id: string
  type: 'subscription_grant' | 'purchase' | 'usage' | 'refund' | 'expiry'
  amount: number
  description: string
  created_at: string
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth()
  const { balance, loading: creditsLoading, refetch } = useCredits()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txPage, setTxPage] = useState(1)
  const [txTotal, setTxTotal] = useState(0)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  const txPerPage = 10

  // Fetch tiers
  useEffect(() => {
    fetch('/api/v1/credits/tiers')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { if (json?.data) setTiers(json.data) })
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
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (user) fetchTransactions(txPage)
  }, [user, txPage, fetchTransactions])

  // Purchase credit pack
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

  // Open Stripe customer portal
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

  const txTotalPages = Math.ceil(txTotal / txPerPage)

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in Required</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Please sign in to view your billing and credits.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Billing & Credits
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your subscription, purchase credits, and view transaction history.
          </p>
        </div>

        {/* Credit balance overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BalanceCard
            label="Subscription Credits"
            value={creditsLoading ? '...' : (balance?.subscription_balance ?? 0)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            subtitle={balance?.current_period_end ? `Resets ${new Date(balance.current_period_end).toLocaleDateString()}` : undefined}
            color="text-blue-500"
          />
          <BalanceCard
            label="Purchased Credits"
            value={creditsLoading ? '...' : (balance?.purchased_balance ?? 0)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            subtitle="Never expires"
            color="text-emerald-500"
          />
          <BalanceCard
            label="Total Available"
            value={creditsLoading ? '...' : (balance?.total ?? 0)}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.35 7.35 0 010-1H10a1 1 0 100-2H8.315c.134-.29.283-.56.421-.821z" />
              </svg>
            }
            color="text-[#3D6AF2]"
            highlight
          />
        </div>

        {/* Subscription tiers */}
        {tiers.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Subscription Plans
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                  <p className="text-2xl font-bold text-[#3D6AF2] mt-2">
                    ${(tier.price_cents / 100).toFixed(2)}
                    <span className="text-sm font-normal text-slate-500">/mo</span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {tier.monthly_credits.toLocaleString()} credits/month
                  </p>
                  <ul className="mt-4 space-y-2 flex-1">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleManageSubscription}
                    disabled={loadingPortal}
                    className="mt-4 w-full py-2.5 rounded-lg bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {loadingPortal ? 'Loading...' : 'Manage Subscription'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Credit packs */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Buy Credit Packs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/20 flex items-center justify-center text-[#3D6AF2] mb-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.35 7.35 0 010-1H10a1 1 0 100-2H8.315c.134-.29.283-.56.421-.821z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{pack.label}</h3>
                <p className="text-2xl font-bold text-[#3D6AF2] mt-1">
                  ${(pack.priceCents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ${(pack.priceCents / pack.credits).toFixed(1)}/credit
                </p>
                <button
                  onClick={() => handlePurchase(pack.id)}
                  disabled={purchasing === pack.id}
                  className="mt-4 w-full py-2.5 rounded-lg border-2 border-[#3D6AF2] text-[#3D6AF2] font-semibold text-sm hover:bg-[#3D6AF2] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {purchasing === pack.id ? 'Redirecting...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction history */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Transaction History
          </h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                No transactions yet.
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                        <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Date</th>
                        <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Type</th>
                        <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Description</th>
                        <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">Credits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className={`px-4 py-3 font-medium whitespace-nowrap ${typeColor[tx.type] || 'text-slate-500'}`}>
                            {typeLabel[tx.type] || tx.type}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {tx.description}
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile list */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className={typeColor[tx.type] || ''}>{typeLabel[tx.type] || tx.type}</span>
                          {' '}
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {txTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      className="text-sm text-[#3D6AF2] font-medium disabled:text-slate-300 dark:disabled:text-slate-700 cursor-pointer disabled:cursor-default"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Page {txPage} of {txTotalPages}
                    </span>
                    <button
                      onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                      disabled={txPage === txTotalPages}
                      className="text-sm text-[#3D6AF2] font-medium disabled:text-slate-300 dark:disabled:text-slate-700 cursor-pointer disabled:cursor-default"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function BalanceCard({
  label,
  value,
  icon,
  subtitle,
  color,
  highlight,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  subtitle?: string
  color: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'border-[#3D6AF2]/30 bg-[#3D6AF2]/5 dark:bg-[#3D6AF2]/10'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-[#3D6AF2]' : 'text-slate-900 dark:text-white'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
