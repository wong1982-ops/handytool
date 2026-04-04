'use client'

import { useAuth } from '@/lib/hooks/use-auth'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  // In dev, if no ADMIN_EMAILS configured, allow all authenticated users
  const isDev = process.env.NODE_ENV === 'development'
  const isAdmin = user && (
    (ADMIN_EMAILS.length === 0 && isDev) ||
    ADMIN_EMAILS.includes(user.email || '')
  )

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <svg
          className="w-12 h-12 mx-auto text-slate-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-slate-300">Admin Access Required</h2>
        <p className="text-sm text-slate-500 mt-1">
          This feature is only available to administrators.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
