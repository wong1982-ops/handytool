'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_PACKS } from '@/lib/stripe/config'
import { signInWithOAuth } from '@/lib/supabase/auth'

interface PricingDrawerProps {
  open: boolean
  onClose: () => void
}

export function PricingDrawer({ open, onClose }: PricingDrawerProps) {
  const { user } = useAuth()
  const { balance, loading: creditsLoading } = useCredits()
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

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


  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Drawer panel — slides from left */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-white dark:bg-[#0d1117] shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Pricing"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pricing</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Buy credit packs</p>
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
    </>,
    document.body,
  )
}
