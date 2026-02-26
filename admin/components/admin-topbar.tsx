'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth'

interface Props {
  email: string
  sidebarCollapsed: boolean
  onMenuToggle: () => void
}

export function AdminTopbar({ email, sidebarCollapsed, onMenuToggle }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 flex items-center px-4 gap-4 transition-all duration-200
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
    >
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400 hidden sm:inline">{email}</span>
        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors min-h-[44px]"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
