'use client'

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { idbGet, idbSet, idbDel } from '@/lib/idb-kv'

/**
 * Like `useDraft` but persists to IndexedDB instead of localStorage.
 * Use this for drafts that include large binary data (base64 images,
 * canvas snapshots) which would exceed localStorage's ~5MB quota.
 *
 * Restoration is async — state is patched on the next tick after mount.
 *
 * Usage:
 *   const [state, setState] = useState(DEFAULT)
 *   const draft = useIdbDraft('id-photo:draft', state, setState, ['toast', 'downloading'])
 *   // draft.clear() to wipe on Start Over
 */
export function useIdbDraft<T extends object>(
  key: string,
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  omit: ReadonlyArray<keyof T> = [],
): { clear: () => Promise<void> } {
  const restoredRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    idbGet<Partial<T>>(key).then((saved) => {
      if (cancelled) return
      if (saved && typeof saved === 'object') {
        setState((prev) => ({ ...prev, ...saved }))
      }
      restoredRef.current = true
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!restoredRef.current) return
    const persistable: Partial<T> = { ...state }
    for (const k of omit) delete persistable[k]
    void idbSet(key, persistable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, key])

  return {
    clear: async () => {
      await idbDel(key)
    },
  }
}

/**
 * Snapshot variant for components with multiple `useState` calls.
 * Same async-restore-once + save-on-change semantics.
 */
export function useIdbDraftSnapshot<T extends object>(
  key: string,
  values: T,
  restore: (saved: Partial<T>) => void,
): { clear: () => Promise<void> } {
  const restoredRef = useRef(false)
  const restoreRef = useRef(restore)
  restoreRef.current = restore

  useEffect(() => {
    let cancelled = false
    idbGet<Partial<T>>(key).then((saved) => {
      if (cancelled) return
      if (saved && typeof saved === 'object') {
        restoreRef.current(saved)
      }
      restoredRef.current = true
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!restoredRef.current) return
    void idbSet(key, values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...Object.values(values)])

  return {
    clear: async () => {
      await idbDel(key)
    },
  }
}
