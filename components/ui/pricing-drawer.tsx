'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_PACKS } from '@/lib/stripe/config'
import { signInWithOAuth } from '@/lib/supabase/auth'

interface Tier {
  id: string
  name: string
  monthly_credits: number
  price_cents: number
  features: string[]
}

interface PricingDrawerProps {
  open: boolean
  onClose: () => void
}

export function PricingDrawer({ open, onClose }: PricingDrawerProps) {
  const { user } = useAuth()
  const { balance, loading: creditsLoading } = useCredits()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Fetch tiers when drawer opens
  useEffect(() => {
    if (!open) return
    fetch('/api/v1/credits/tiers')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { if (json?.data?.tiers) setTiers(json.data.tiers) })
      .catch(() => {})
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const requireAuth = useCallback(async (action: () => Promise<void>) => {
    if (!user) {
      await signInWithOAuth('google')
      return
    }
    await action()
  }, [user])

  const handlePurchase = useCallback(async (packId: string) => {
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
  }, [])

  const handleManageSubscription = useCallback(async () => {
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
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Pricing"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pricing</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Plans & credit packs</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close pricing"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Credit balance — signed-in users */}
          {user && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 mb-1">Subscription</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {creditsLoading ? '...' : (balance?.subscription_balance ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500 mb-1">Purchased</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {creditsLoading ? '...' : (balance?.purchased_balance ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-[#3D6AF2]/30 bg-[#3D6AF2]/5 dark:bg-[#3D6AF2]/10 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#3D6AF2] mb-1">Total</p>
                <p className="text-lg font-bold text-[#3D6AF2]">
                  {creditsLoading ? '...' : (balance?.total ?? 0)}
                </p>
              </div>
            </div>
          )}

          {/* Subscription tiers */}
          {tiers.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">
                Subscription Plans
              </h3>
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tier.name}</h4>
                      <p className="text-lg font-bold text-[#3D6AF2]">
                        ${(tier.price_cents / 100).toFixed(2)}
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {tier.monthly_credits.toLocaleString()} credits/month
                    </p>
                    <ul className="space-y-1.5 mb-3">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => requireAuth(handleManageSubscription)}
                      disabled={loadingPortal}
                      className="w-full py-2 rounded-lg bg-[#3D6AF2] text-white font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                      style={{ minHeight: '40px' }}
                    >
                      {loadingPortal ? 'Loading...' : user ? 'Manage Subscription' : 'Sign in to Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Credit packs */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">
              Credit Packs
            </h3>
            <div className="space-y-3">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/20 flex items-center justify-center text-[#3D6AF2] shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.35 7.35 0 010-1H10a1 1 0 100-2H8.315c.134-.29.283-.56.421-.821z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{pack.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ${(pack.priceCents / 100).toFixed(2)} &middot; ${(pack.priceCents / pack.credits).toFixed(1)}/credit
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => requireAuth(() => handlePurchase(pack.id))}
                    disabled={purchasing === pack.id}
                    className="shrink-0 px-4 py-2 rounded-lg border-2 border-[#3D6AF2] text-[#3D6AF2] font-semibold text-xs hover:bg-[#3D6AF2] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    {purchasing === pack.id ? '...' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* View full history link */}
          {user && (
            <a
              href="/billing"
              className="block text-center text-sm text-[#3D6AF2] font-medium hover:underline py-2"
            >
              View Transaction History
            </a>
          )}
        </div>
      </div>
    </>
  )
}
