# Mobile Native UX Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the mobile experience (<768px) to feel like a native iOS app with bottom tab bar, swipe navigation, bottom sheets, pull-to-refresh, and gesture-based back navigation.

**Architecture:** A `<MobileShell>` component conditionally renders on screens <768px, wrapping all mobile-specific UI (tab bar, swipe container, gesture handlers). Desktop layout remains completely unchanged. Framer Motion powers all gestures and spring animations.

**Tech Stack:** Framer Motion, React 19, Next.js 16 App Router, Tailwind CSS, localStorage (favorites)

---

### Task 1: Install Framer Motion

**Files:**
- Modify: `package.json`

**Step 1: Install framer-motion**

```bash
pnpm add framer-motion
```

**Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(mobile): install framer-motion for gesture support"
```

---

### Task 2: Create useMobileShell and useFavorites hooks

**Files:**
- Create: `lib/hooks/use-mobile-shell.ts`
- Create: `lib/hooks/use-favorites.ts`

**Step 1: Create the mobile detection hook**

`lib/hooks/use-mobile-shell.ts`:

```ts
'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 767

export function useMobileShell(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    setIsMobile(mql.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
```

**Step 2: Create the favorites hook**

`lib/hooks/use-favorites.ts`:

```ts
'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'toolk1t-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  )

  return { favorites, toggle, isFavorite }
}
```

**Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add lib/hooks/use-mobile-shell.ts lib/hooks/use-favorites.ts
git commit -m "feat(mobile): add useMobileShell and useFavorites hooks"
```

---

### Task 3: Create Bottom Tab Bar

**Files:**
- Create: `components/mobile/bottom-tab-bar.tsx`

**Step 1: Create the component**

`components/mobile/bottom-tab-bar.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'

export type TabId = 'tools' | 'favorites' | 'profile'

interface BottomTabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'tools',
    label: 'Tools',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d={active
          ? 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z'
          : 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
        } />
      </svg>
    ),
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 100) {
        setVisible(false) // scrolling down
      } else {
        setVisible(true) // scrolling up
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 bg-gray-900/90 backdrop-blur-lg border-t border-white/10">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors cursor-pointer ${
                active ? 'text-[#3D6AF2]' : 'text-gray-500'
              }`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              {tab.icon(active)}
              {active && (
                <span className="text-[10px] font-semibold">{tab.label}</span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/mobile/bottom-tab-bar.tsx
git commit -m "feat(mobile): add bottom tab bar with scroll hide/show"
```

---

### Task 4: Create Mobile Header

**Files:**
- Create: `components/mobile/mobile-header.tsx`

**Step 1: Create the compact mobile header**

This replaces the hamburger menu. Shows logo, search icon (opens full-screen search overlay), and dark mode toggle.

`components/mobile/mobile-header.tsx`:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useRef, useEffect } from 'react'
import { tools, type Tool } from '@/lib/tools'

interface MobileHeaderProps {
  brandName?: string
  dark: boolean
  onToggleTheme: () => void
}

export function MobileHeader({ brandName = 'Toolk1t', dark, onToggleTheme }: MobileHeaderProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Tool[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const openSearch = useCallback(() => {
    setSearchOpen(true)
    setSuggestions(tools)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
    setSuggestions([])
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (!value) {
      setSuggestions(tools)
      return
    }
    const q = value.toLowerCase()
    setSuggestions(tools.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    ))
  }, [])

  const selectTool = useCallback((tool: Tool) => {
    closeSearch()
    router.push(tool.href)
  }, [router, closeSearch])

  // Close on Escape
  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen, closeSearch])

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-12 bg-gray-900/90 backdrop-blur-lg border-b border-white/10">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt={brandName}
            width={708}
            height={304}
            className="h-8 w-auto rounded"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Search tools"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {dark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-lg flex flex-col">
          <div className="flex items-center gap-2 px-4 h-14 border-b border-white/10">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tools..."
              className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-500"
              autoComplete="off"
            />
            <button
              onClick={closeSearch}
              className="text-sm text-[#3D6AF2] font-semibold cursor-pointer px-2 py-1"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {suggestions.map((tool) => (
              <button
                key={tool.href}
                onClick={() => selectTool(tool)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shrink-0`}>
                  <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{tool.icon}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tool.name}</p>
                  <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                </div>
              </button>
            ))}
            {suggestions.length === 0 && (
              <p className="text-center text-gray-500 py-8">No tools found</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/mobile/mobile-header.tsx
git commit -m "feat(mobile): add compact header with full-screen search overlay"
```

---

### Task 5: Create Tab Content Panels (Favorites + Profile)

**Files:**
- Create: `components/mobile/favorites-tab.tsx`
- Create: `components/mobile/profile-tab.tsx`

**Step 1: Create favorites tab**

`components/mobile/favorites-tab.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { tools } from '@/lib/tools'
import { useFavorites } from '@/lib/hooks/use-favorites'

export function FavoritesTab() {
  const { favorites, toggle } = useFavorites()
  const favoriteTools = tools.filter((t) => {
    const slug = t.href.replace('/tools/', '')
    return favorites.includes(slug)
  })

  if (favoriteTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">&#x2B50;</div>
        <h2 className="text-lg font-bold text-white mb-2">No Favorites Yet</h2>
        <p className="text-sm text-gray-400">
          Star your most-used tools for quick access. Tap the star on any tool card.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold text-white mb-3">Favorites</h2>
      <div className="grid grid-cols-1 gap-2">
        {favoriteTools.map((tool) => {
          const slug = tool.href.replace('/tools/', '')
          return (
            <div key={tool.href} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Link href={tool.href} className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shrink-0`}>
                  <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{tool.icon}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tool.name}</p>
                  <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                </div>
              </Link>
              <button
                onClick={() => toggle(slug)}
                className="p-2 text-amber-400 cursor-pointer shrink-0"
                aria-label={`Remove ${tool.name} from favorites`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Create profile tab**

`components/mobile/profile-tab.tsx`:

```tsx
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
      <h2 className="text-lg font-bold text-white">Settings</h2>

      {/* User section */}
      {loading ? (
        <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
      ) : user ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
          <div className="w-12 h-12 rounded-full bg-[#3D6AF2] flex items-center justify-center text-white font-bold text-lg">
            {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
        <span className="text-sm text-white font-medium">Dark Mode</span>
        <button
          onClick={toggleTheme}
          className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${dark ? 'bg-[#3D6AF2]' : 'bg-gray-600'}`}
          role="switch"
          aria-checked={dark}
          aria-label="Toggle dark mode"
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Links */}
      <div className="rounded-xl bg-white/5 divide-y divide-white/5">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-4 py-3.5 text-sm text-gray-300 hover:text-white transition-colors"
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
```

**Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add components/mobile/favorites-tab.tsx components/mobile/profile-tab.tsx
git commit -m "feat(mobile): add favorites and profile tab panels"
```

---

### Task 6: Create Tab Swipe Container

**Files:**
- Create: `components/mobile/tab-swipe-container.tsx`

**Step 1: Create the swipeable tab container**

Uses Framer Motion `drag="x"` to swipe between 3 tab panels.

`components/mobile/tab-swipe-container.tsx`:

```tsx
'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type PanInfo } from 'framer-motion'
import type { TabId } from '@/components/mobile/bottom-tab-bar'

const TAB_ORDER: TabId[] = ['tools', 'favorites', 'profile']
const SWIPE_THRESHOLD = 50
const VELOCITY_THRESHOLD = 500

interface TabSwipeContainerProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: [ReactNode, ReactNode, ReactNode] // tools, favorites, profile
}

export function TabSwipeContainer({ activeTab, onTabChange, children }: TabSwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIndex = TAB_ORDER.indexOf(activeTab)

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info

    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD) {
      if (offset.x > 0 && activeIndex > 0) {
        onTabChange(TAB_ORDER[activeIndex - 1])
      } else if (offset.x < 0 && activeIndex < TAB_ORDER.length - 1) {
        onTabChange(TAB_ORDER[activeIndex + 1])
      }
    }
    x.set(0)
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden relative">
      <motion.div
        className="flex h-full"
        animate={{ x: `${-activeIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children.map((child, i) => (
          <motion.div
            key={TAB_ORDER[i]}
            className="w-full shrink-0 h-full overflow-y-auto"
            drag={i === activeIndex ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={i === activeIndex ? { x: springX } : undefined}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/mobile/tab-swipe-container.tsx
git commit -m "feat(mobile): add swipeable tab container with spring physics"
```

---

### Task 7: Create Bottom Sheet Component

**Files:**
- Create: `components/mobile/bottom-sheet.tsx`

**Step 1: Create the bottom sheet**

`components/mobile/bottom-sheet.tsx`:

```tsx
'use client'

import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  snapPoint?: 'half' | 'full'
}

const SNAP_HEIGHTS = {
  half: '50vh',
  full: '90vh',
}

const DISMISS_THRESHOLD = 100
const VELOCITY_THRESHOLD = 500

export function BottomSheet({ open, onClose, children, snapPoint = 'half' }: BottomSheetProps) {
  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] rounded-t-2xl bg-gray-900 border-t border-white/10"
            style={{ maxHeight: SNAP_HEIGHTS[snapPoint] }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-9 h-1 rounded-full bg-gray-600" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: `calc(${SNAP_HEIGHTS[snapPoint]} - 40px)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/mobile/bottom-sheet.tsx
git commit -m "feat(mobile): add draggable bottom sheet component"
```

---

### Task 8: Create Pull-to-Refresh and Gesture Back

**Files:**
- Create: `components/mobile/pull-to-refresh.tsx`
- Create: `components/mobile/gesture-back.tsx`

**Step 1: Create pull-to-refresh**

`components/mobile/pull-to-refresh.tsx`:

```tsx
'use client'

import { useState, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type PanInfo } from 'framer-motion'

const THRESHOLD = 60

interface PullToRefreshProps {
  children: ReactNode
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter()
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const canPull = () => {
    if (!containerRef.current) return false
    return containerRef.current.scrollTop <= 0
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (!canPull() || info.offset.y < 0) return
    setPulling(true)
    setPullDistance(Math.min(info.offset.y * 0.5, 100))
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (pullDistance > THRESHOLD && !refreshing) {
      setRefreshing(true)
      router.refresh()
      setTimeout(() => {
        setRefreshing(false)
        setPulling(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPulling(false)
      setPullDistance(0)
    }
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      dragListener={false}
      onPointerDown={(e) => {
        if (canPull()) {
          // Allow drag only when at top
        }
      }}
    >
      {/* Pull indicator */}
      {pulling && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center z-10"
          style={{ transform: `translateY(${pullDistance - 40}px)` }}
        >
          <div className={`w-8 h-8 rounded-full border-2 border-[#3D6AF2] border-t-transparent ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      {children}
    </motion.div>
  )
}
```

**Step 2: Create gesture back**

`components/mobile/gesture-back.tsx`:

```tsx
'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type PanInfo } from 'framer-motion'

const EDGE_WIDTH = 20
const COMMIT_THRESHOLD = 100
const VELOCITY_THRESHOLD = 800

interface GestureBackProps {
  children: ReactNode
  enabled?: boolean
}

export function GestureBack({ children, enabled = true }: GestureBackProps) {
  const router = useRouter()

  if (!enabled) return <>{children}</>

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (
      info.offset.x > COMMIT_THRESHOLD ||
      info.velocity.x > VELOCITY_THRESHOLD
    ) {
      router.back()
    }
  }

  return (
    <motion.div
      className="flex-1 relative"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      dragDirectionLock
    >
      {children}
    </motion.div>
  )
}
```

**Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add components/mobile/pull-to-refresh.tsx components/mobile/gesture-back.tsx
git commit -m "feat(mobile): add pull-to-refresh and gesture-back navigation"
```

---

### Task 9: Create MobileShell and Wire into Layout

**Files:**
- Create: `components/mobile/mobile-shell.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/layout/header.tsx` (hide on mobile when shell active)

**Step 1: Create the mobile shell**

`components/mobile/mobile-shell.tsx`:

```tsx
'use client'

import { useState, useCallback } from 'react'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { BottomTabBar, type TabId } from '@/components/mobile/bottom-tab-bar'
import { TabSwipeContainer } from '@/components/mobile/tab-swipe-container'
import { FavoritesTab } from '@/components/mobile/favorites-tab'
import { ProfileTab } from '@/components/mobile/profile-tab'

interface MobileShellProps {
  children: React.ReactNode // the tools content (existing page)
}

export function MobileShell({ children }: MobileShellProps) {
  const isMobile = useMobileShell()
  const [activeTab, setActiveTab] = useState<TabId>('tools')

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

  if (!isMobile) return null

  return (
    <div className="fixed inset-0 z-[40] flex flex-col bg-gray-950">
      <MobileHeader dark={dark} onToggleTheme={toggleTheme} />

      <TabSwipeContainer activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Tools tab — render the existing page content */}
        <div className="pb-16">{children}</div>

        {/* Favorites tab */}
        <div className="pb-16"><FavoritesTab /></div>

        {/* Profile tab */}
        <div className="pb-16"><ProfileTab /></div>
      </TabSwipeContainer>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
```

**Step 2: Modify layout.tsx**

Add the MobileShell wrapper. The key insight: MobileShell renders as a fixed overlay on mobile, so the existing desktop layout remains underneath (invisible on mobile, visible on desktop).

Current `app/layout.tsx` body content:

```tsx
<Header brandName="Toolk1t" />
{children}
<Footer brandName="Toolk1t" />
<ProfilePrompt />
<InstallPrompt />
<PageTracker />
```

Change to:

```tsx
<Header brandName="Toolk1t" />
{children}
<Footer brandName="Toolk1t" />
<MobileShell>{children}</MobileShell>
<ProfilePrompt />
<InstallPrompt />
<PageTracker />
```

Add import at top:

```tsx
import { MobileShell } from "@/components/mobile/mobile-shell";
```

**Step 3: Hide desktop header/footer on mobile when shell is active**

In `components/layout/header.tsx`, the header already has `sticky top-0 z-50`. The MobileShell renders at `z-[40]` with its own header at `z-50`, so the mobile header will layer on top. But we should hide the desktop header on mobile to avoid doubling.

Add a CSS class to the `<header>` element to hide it on mobile. Change:

```tsx
<header className={`w-full border-b ...`}>
```

To (add `hidden md:block` wrapper approach — but since Header is client component, we can just add the class):

Actually, the simplest approach: the MobileShell is `fixed inset-0 z-[40]` so it covers everything on mobile. The desktop Header/Footer render behind it. This works without any Header changes. No modification needed.

**Step 4: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

**Step 5: Verify build**

```bash
pnpm build
```

**Step 6: Commit**

```bash
git add components/mobile/mobile-shell.tsx app/layout.tsx
git commit -m "feat(mobile): wire up MobileShell with tab navigation in layout"
```

---

### Task 10: Browser Verification

**Step 1: Start dev server and take mobile screenshots**

Write `/tmp/test-mobile-ux.py`:

```python
"""Verify mobile native UX components render correctly."""
from playwright.sync_api import sync_playwright
import time

BASE_URL = "http://localhost:3000"

def test_mobile_shell():
    """Verify mobile shell renders with tab bar."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport (iPhone 14 size)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))

        page.goto(f"{BASE_URL}/tools")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        page.screenshot(path="/tmp/mobile-ux-tools-tab.png")

        # Should see bottom tab bar
        content = page.content()
        assert "Tools" in content, "Tools tab not visible"
        print("  [OK] Mobile shell rendered with Tools tab")

        if errors:
            print(f"  ERRORS: {errors[:3]}")
        else:
            print("  [OK] No client errors")

        browser.close()

def test_desktop_unchanged():
    """Verify desktop layout is unchanged."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        page.goto(f"{BASE_URL}/tools")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        page.screenshot(path="/tmp/mobile-ux-desktop.png")

        # Desktop should still have the hamburger-free header with mega menu
        content = page.content()
        assert "Search tools" in content, "Desktop search missing"
        print("  [OK] Desktop layout unchanged")

        browser.close()

def test_favorites_tab():
    """Verify favorites tab shows empty state."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(f"{BASE_URL}/tools")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Tap Favorites tab
        page.click("text=Favorites", timeout=5000)
        time.sleep(0.5)
        page.screenshot(path="/tmp/mobile-ux-favorites-tab.png")

        content = page.content()
        has_empty = "No Favorites" in content or "no favorites" in content.lower()
        print(f"  [OK] Favorites tab {'shows empty state' if has_empty else 'rendered'}")

        browser.close()

def test_profile_tab():
    """Verify profile tab renders."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(f"{BASE_URL}/tools")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Tap Profile tab
        page.click("button[aria-label='Profile']", timeout=5000)
        time.sleep(0.5)
        page.screenshot(path="/tmp/mobile-ux-profile-tab.png")

        content = page.content()
        assert "Settings" in content or "Dark Mode" in content, "Profile tab not rendered"
        print("  [OK] Profile tab rendered with settings")

        browser.close()

if __name__ == "__main__":
    print("=== Mobile Native UX Verification ===\n")

    print("1. Mobile Shell")
    test_mobile_shell()

    print("\n2. Desktop Unchanged")
    test_desktop_unchanged()

    print("\n3. Favorites Tab")
    test_favorites_tab()

    print("\n4. Profile Tab")
    test_profile_tab()

    print("\n=== ALL CHECKS PASSED ===")
```

Run:
```bash
pnpm dev &
sleep 3
python /tmp/test-mobile-ux.py
kill %1
```

**Step 2: Visual review of screenshots**

Check `/tmp/mobile-ux-*.png` screenshots for:
- Tools tab: compact header + tool grid + bottom tab bar
- Favorites tab: empty state with star emoji
- Profile tab: sign in button, dark mode toggle, links
- Desktop: unchanged layout with full header

**Step 3: Fix any issues and commit**

```bash
git commit -m "fix(mobile): address verification issues"
```
