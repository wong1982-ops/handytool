'use client'

import { useEffect, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { CREDIT_PACKS } from '@/lib/stripe/config'

interface ActionGateProps {
  /** Credits this action will consume. Use 1 as a placeholder for auth-only gating. */
  cost: number
  /** Render the gated CTA. Only called when signed in AND has enough credits. */
  children: (state: { ready: true }) => ReactElement
  signInLabel?: string
  topUpLabel?: string
}

const DEFAULT_PACK = CREDIT_PACKS[0]

export function ActionGate({
  cost,
  children,
  signInLabel = 'Sign in to use AI generation',
  topUpLabel = "You're out of credits",
}: ActionGateProps) {
  const { user, loading: authLoading } = useAuth()
  const { balance, loading: creditsLoading, refetch } = useCredits()

  const totalCredits = balance?.total ?? 0
  const isShowingTopUp = !!user && !creditsLoading && totalCredits < cost

  // Refresh credits on window focus while showing the top-up card.
  // Catches return from Stripe Checkout opened in a new tab.
  useEffect(() => {
    if (!isShowingTopUp) return
    const onFocus = () => { void refetch() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isShowingTopUp, refetch])

  if (authLoading || creditsLoading) return <GateSkeleton />
  if (!user) return <SignInCard label={signInLabel} />
  if (totalCredits < cost) return <TopUpCard label={topUpLabel} />
  return children({ ready: true })
}

// ─────────────────────────────────────────────────────────────────────────────

function GateSkeleton() {
  return (
    <div
      aria-hidden
      className="h-10 w-full max-w-xs rounded-lg bg-slate-200 dark:bg-[#131a23] animate-pulse"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function SignInCard({ label }: { label: string }) {
  const [pending, setPending] = useState(false)

  async function handleSignIn() {
    setPending(true)
    try {
      await signInWithOAuth('google')
    } finally {
      // Note: on success the page redirects, so this rarely runs.
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1e2631] bg-slate-50 dark:bg-[#131a23] p-4 flex items-center gap-3">
      <LockIcon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-[#a6abb5]">
          Your work is saved — you&apos;ll come right back here.
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={handleSignIn}
        className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
      >
        <GoogleIcon />
        {pending ? 'Redirecting…' : 'Sign in'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function TopUpCard({ label }: { label: string }) {
  const [pending, setPending] = useState(false)
  const priceLabel = `$${(DEFAULT_PACK.priceCents / 100).toFixed(0)}`
  const buttonLabel = `Top up — ${DEFAULT_PACK.credits.toLocaleString()} credits (${priceLabel})`

  async function handleTopUp() {
    setPending(true)
    try {
      const res = await fetch('/api/v1/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: DEFAULT_PACK.id }),
      })
      const json = await res.json()
      const url = json?.data?.checkout_url as string | undefined
      if (url) window.open(url, '_blank')
    } catch {
      // ignore — user can retry or use the secondary link
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-3">
      <CoinIcon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {label}
        </p>
        <Link
          href="/billing"
          target="_blank"
          className="text-xs text-[#3D6AF2] hover:underline"
        >
          See all options →
        </Link>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={handleTopUp}
        className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-amber-500 text-white px-3 py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
      >
        {pending ? 'Opening…' : buttonLabel}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline so the component has zero external icon deps)

function LockIcon() {
  return (
    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4v4M5 11h14v10H5V11z" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h4a2 2 0 010 4h-4m0-4v8m0-8V8m4 0v2" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
