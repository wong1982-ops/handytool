'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  label?: string
  href?: string
  className?: string
}

/** iOS-style back chevron — shown on mobile, hidden on md+ */
export function BackButton({ label = 'Home', href = '/tools', className = '' }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center gap-0.5 text-[#3D6AF2] text-[17px] font-normal cursor-pointer md:hidden ${className}`}
      aria-label={`Back to ${label}`}
    >
      <svg className="w-[22px] h-[22px] -ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}
