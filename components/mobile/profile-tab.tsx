'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useState, useCallback } from 'react'
import { SignInModal } from '@/components/auth/sign-in-modal'

export function ProfileTab() {
  const { user, loading, signOut } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('ht-theme') !== 'light'
  })

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('ht-theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  const LINKS = [
    { label: 'Blog', href: '/blog' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Contact Support', href: '/contact' },
  ]

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>

      {/* User section */}
      {loading ? (
        <div className="h-16 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
      ) : user ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-white/5">
          <div className="w-12 h-12 rounded-full bg-[#3D6AF2] flex items-center justify-center text-white font-bold text-lg">
            {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-xs text-red-400 font-semibold cursor-pointer px-3 py-2"
            style={{ minHeight: '44px' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSignInOpen(true)}
          className="w-full py-3 rounded-xl bg-[#3D6AF2] text-white font-semibold text-sm cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign In
        </button>
      )}

      {/* Dark mode toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5">
        <span className="text-sm text-gray-900 dark:text-white font-medium">Dark Mode</span>
        <button
          onClick={toggleTheme}
          className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${dark ? 'bg-[#3D6AF2]' : 'bg-gray-300'}`}
          role="switch"
          aria-checked={dark}
          aria-label="Toggle dark mode"
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Links */}
      <div className="rounded-xl bg-gray-100 dark:bg-white/5 divide-y divide-gray-200 dark:divide-white/5">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {link.label}
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  )
}
