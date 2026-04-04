'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'
import { TermsSheetContent } from '@/components/mobile/sheets/terms-sheet-content'
import { PrivacySheetContent } from '@/components/mobile/sheets/privacy-sheet-content'
import { ContactSheetContent } from '@/components/mobile/sheets/contact-sheet-content'
import { BlogSheetContent } from '@/components/mobile/sheets/blog-sheet-content'
import ReferralSection from '@/tools/referral/referral-section'
import AnalyticsDashboard from '@/tools/admin/analytics-dashboard'

type ViewId = 'settings' | 'blog' | 'terms' | 'privacy' | 'contact' | 'signin'

const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 500

export function ProfileTab() {
  const { user, loading, signOut } = useAuth()
  const [activeView, setActiveView] = useState<ViewId>('settings')
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)

  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
    locked: 'x' | 'y' | null
  } | null>(null)

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

  // Push notification state
  const { state: pushState, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications()
  const [pushToggling, setPushToggling] = useState(false)

  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(true)
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch('/api/v1/notifications/prefs')
      .then(r => r.json())
      .then(({ prefs }) => {
        if (prefs) {
          setEmailNotif(prefs.email_on_book_complete)
        }
        setPrefsLoaded(true)
      })
      .catch(() => setPrefsLoaded(true))
  }, [user])

  const handlePushToggle = useCallback(async () => {
    if (pushToggling) return
    setPushToggling(true)
    try {
      if (pushState === 'subscribed') {
        await pushUnsubscribe()
        await fetch('/api/v1/notifications/prefs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ push_on_book_complete: false }),
        })
      } else {
        const ok = await pushSubscribe()
        if (ok) {
          await fetch('/api/v1/notifications/prefs', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ push_on_book_complete: true }),
          })
        }
      }
    } finally {
      setPushToggling(false)
    }
  }, [pushState, pushToggling, pushSubscribe, pushUnsubscribe])

  const handleEmailToggle = useCallback(async () => {
    const next = !emailNotif
    setEmailNotif(next)
    await fetch('/api/v1/notifications/prefs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_on_book_complete: next }),
    })
  }, [emailNotif])

  const navigateTo = useCallback((view: ViewId) => {
    setActiveView(view)
  }, [])

  const goBack = useCallback(() => {
    setActiveView('settings')
  }, [])

  // Swipe-to-go-back handlers (only active on sub-views)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (activeView === 'settings') return
    const touch = e.touches[0]
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      locked: null,
    }
    setSwiping(false)
    setSwipeX(0)
  }, [activeView])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (activeView === 'settings' || !touchRef.current) return
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

    // Horizontal swipe — stop propagation to prevent tab swipe
    e.stopPropagation()

    // Only allow swipe right (positive dx) to go back
    if (dx > 0) {
      setSwiping(true)
      setSwipeX(dx)
    }
  }, [activeView])

  const handleTouchEnd = useCallback(() => {
    if (activeView === 'settings' || !touchRef.current) return

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

  const LINKS: { label: string; icon: React.ReactNode; view: ViewId }[] = [
    {
      label: 'Blog',
      view: 'blog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      label: 'Terms of Service',
      view: 'terms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Privacy Policy',
      view: 'privacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: 'Contact Support',
      view: 'contact',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  const viewContent: Record<Exclude<ViewId, 'settings'>, React.ReactNode> = {
    blog: <BlogSheetContent />,
    terms: <TermsSheetContent />,
    privacy: <PrivacySheetContent />,
    contact: <ContactSheetContent />,
    signin: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Sign in to Toolk1t
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save your preferences and get personalized recommendations
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => signInWithOAuth('google')}
            className="flex items-center justify-center gap-3 w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm cursor-pointer min-h-[44px]"
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
            className="flex items-center justify-center gap-3 w-full px-5 py-3 rounded-xl bg-[#1877F2] text-white font-semibold text-sm hover:bg-[#166FE5] transition-colors shadow-sm cursor-pointer min-h-[44px]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    ),
  }

  const isDrillDown = activeView !== 'settings'
  const swipeOffset = swiping ? (swipeX / (typeof window !== 'undefined' ? window.innerWidth : 375)) * 100 : 0
  const translateX = isDrillDown ? -100 + swipeOffset : 0

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
        {/* Panel 1: Settings list */}
        <div className="w-full shrink-0 overflow-y-auto px-4 py-4 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>

          {/* User section */}
          {loading ? (
            <div className="h-16 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-white/5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#3D6AF2] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || 'User'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
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
              onClick={() => navigateTo('signin')}
              className="w-full py-3 rounded-xl bg-[#3D6AF2] text-white font-semibold text-sm cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Sign In
            </button>
          )}

          {/* Referral section */}
          {user && (
            <div className="px-1">
              <ReferralSection />
            </div>
          )}

          {/* Admin analytics dashboard */}
          {user && (() => {
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
            const isAdmin = adminEmails.length === 0 && process.env.NODE_ENV === 'development' || adminEmails.includes(user.email || '')
            return isAdmin ? (
              <div className="px-4 mt-6">
                <AnalyticsDashboard />
              </div>
            ) : null
          })()}

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-white/5">
            <span className="text-sm text-slate-900 dark:text-white font-medium">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${dark ? 'bg-[#3D6AF2]' : 'bg-slate-300'}`}
              role="switch"
              aria-checked={dark}
              aria-label="Toggle dark mode"
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Notification preferences */}
          {user && prefsLoaded && (
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-2">
                Notifications
              </h3>
              <div className="rounded-xl bg-slate-100 dark:bg-white/5 divide-y divide-slate-200 dark:divide-white/5">
                {/* Push notifications */}
                {pushState !== 'unsupported' && (
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-900 dark:text-white font-medium">Push Notifications</p>
                        {pushState === 'denied' && (
                          <p className="text-xs text-red-500">Blocked in browser settings</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handlePushToggle}
                      disabled={pushToggling || pushState === 'denied'}
                      className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                        pushState === 'subscribed' ? 'bg-[#3D6AF2]' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      role="switch"
                      aria-checked={pushState === 'subscribed'}
                      aria-label="Toggle push notifications"
                    >
                      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        pushState === 'subscribed' ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                )}

                {/* Email notifications */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">Email when book ready</p>
                  </div>
                  <button
                    onClick={handleEmailToggle}
                    className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                      emailNotif ? 'bg-[#3D6AF2]' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    role="switch"
                    aria-checked={emailNotif}
                    aria-label="Toggle email notifications"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      emailNotif ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Links — drill-down navigation */}
          <div className="rounded-xl bg-slate-100 dark:bg-white/5 divide-y divide-slate-200 dark:divide-white/5">
            {LINKS.map((link) => (
              <button
                key={link.view}
                onClick={() => navigateTo(link.view)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <span className="text-slate-400 dark:text-slate-500">{link.icon}</span>
                <span className="flex-1 text-left">{link.label}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Panel 2: Drill-down sub-view */}
        <div className="w-full shrink-0 overflow-y-auto">
          {/* Back button */}
          <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 px-2 py-3">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-[#3D6AF2] font-medium cursor-pointer px-2 py-1"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Settings
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
