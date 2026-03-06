'use client'

import { useCredits } from '@/lib/hooks/use-credits'
import Link from 'next/link'

export function CreditBadge() {
  const { balance, loading } = useCredits()
  if (loading || !balance) return null

  const total = balance.total
  const color = total > 50 ? 'text-emerald-500' : total > 10 ? 'text-amber-500' : 'text-red-500'
  const bgColor = total > 50
    ? 'bg-emerald-500/10 dark:bg-emerald-500/20'
    : total > 10
    ? 'bg-amber-500/10 dark:bg-amber-500/20'
    : 'bg-red-500/10 dark:bg-red-500/20'

  return (
    <Link
      href="/billing"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${color} ${bgColor} hover:opacity-80 transition-opacity`}
      title={`${balance.subscription_balance} subscription + ${balance.purchased_balance} purchased credits`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.35 7.35 0 010-1H10a1 1 0 100-2H8.315c.134-.29.283-.56.421-.821z" />
      </svg>
      {total}
    </Link>
  )
}
