'use client'

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'

/**
 * Variant for tools that hold draft fields in multiple discrete useStates.
 * Pass an object of current values and a single `restore` callback that
 * applies the saved snapshot. Restores once on mount; saves on every change.
 *
 * Usage:
 *   useDraftSnapshot('mood-board:draft', { theme, mood, colorPreference }, (s) => {
 *     if (s.theme !== undefined) setTheme(s.theme)
 *     if (s.mood !== undefined) setMood(s.mood)
 *     if (s.colorPreference !== undefined) setColorPreference(s.colorPreference)
 *   })
 */
export function useDraftSnapshot<T extends object>(
  key: string,
  values: T,
  restore: (saved: Partial<T>) => void,
): { clear: () => void } {
  const restoredRef = useRef(false)
  const restoreRef = useRef(restore)
  restoreRef.current = restore

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<T>
        restoreRef.current(saved)
      }
    } catch {
      // ignore
    } finally {
      restoredRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!restoredRef.current) return
    try {
      localStorage.setItem(key, JSON.stringify(values))
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...Object.values(values)])

  return {
    clear: () => {
      if (typeof window === 'undefined') return
      try { localStorage.removeItem(key) } catch {}
    },
  }
}

/**
 * Persists React state to localStorage so it survives reloads (e.g. sign-in
 * redirects). On mount, restores any saved draft. On every state change,
 * writes back. Use `omit` to exclude transient fields like `loading`/`error`.
 *
 * Usage:
 *   const [project, setProject] = useState(DEFAULT)
 *   useDraft('font-generator:draft', project, setProject, ['loading', 'error'])
 */
export function useDraft<T extends object>(
  key: string,
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  omit: ReadonlyArray<keyof T> = [],
): { clear: () => void } {
  const restoredRef = useRef(false)

  // Restore once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<T>
        setState((prev) => ({ ...prev, ...saved }))
      }
    } catch {
      // ignore corrupt draft
    } finally {
      restoredRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist on every change (after restore has run)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!restoredRef.current) return
    try {
      const persistable: Partial<T> = { ...state }
      for (const k of omit) delete persistable[k]
      localStorage.setItem(key, JSON.stringify(persistable))
    } catch {
      // quota / serialization errors — ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, key])

  return {
    clear: () => {
      if (typeof window === 'undefined') return
      try { localStorage.removeItem(key) } catch {}
    },
  }
}
