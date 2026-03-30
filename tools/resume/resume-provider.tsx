'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from 'react'
import {
  resumeReducer,
  createDefaultEditorState,
  type EditorState,
  type ResumeAction,
} from './resume-reducer'
import type { ResumeState } from './resume-types'
import { en } from './i18n/en'
import { zh } from './i18n/zh'
import type { I18nStrings } from './i18n/en'

// ── Storage helpers ─────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'resume_'

function loadFromLocalStorage(id?: string): ResumeState | null {
  if (typeof window === 'undefined') return null
  try {
    const key = id ? `${STORAGE_KEY_PREFIX}${id}` : null
    if (key) {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(STORAGE_KEY_PREFIX)) {
        const raw = localStorage.getItem(k)
        if (raw) return JSON.parse(raw)
      }
    }
  } catch {
    // Corrupted data
  }
  return null
}

function saveToLocalStorage(resume: ResumeState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${resume.id}`, JSON.stringify(resume))
  } catch {
    // Storage full
  }
}

// ── Cloud save helper ───────────────────────────────────────────

async function saveToCloud(resume: ResumeState): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/resume/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: resume.id,
        title: resume.title,
        locale: resume.locale,
        data: resume,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ── Context ─────────────────────────────────────────────────────

interface ResumeContextValue {
  state: EditorState
  dispatch: React.Dispatch<ResumeAction>
  t: I18nStrings
  saveToCloudManual: () => Promise<boolean>
  cloudSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

// ── Provider ────────────────────────────────────────────────────

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, undefined, () => {
    const saved = loadFromLocalStorage()
    if (saved) {
      return { ...createDefaultEditorState(), resume: saved }
    }
    return createDefaultEditorState()
  })

  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Auto-save to localStorage (debounced 1s)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (!state.isDirty) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveToLocalStorage(stateRef.current.resume)
    }, 1000)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state.isDirty, state.resume.updatedAt])

  // Save on page unload
  useEffect(() => {
    const handleUnload = () => {
      saveToLocalStorage(stateRef.current.resume)
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  // Manual cloud save
  const saveToCloudManual = useCallback(async () => {
    setCloudSaveStatus('saving')
    // Also save to localStorage first
    saveToLocalStorage(stateRef.current.resume)
    const ok = await saveToCloud(stateRef.current.resume)
    setCloudSaveStatus(ok ? 'saved' : 'error')
    // Reset status after 3s
    setTimeout(() => setCloudSaveStatus('idle'), 3000)
    return ok
  }, [])

  // i18n
  const t = useMemo(
    () => (state.resume.locale === 'zh' ? zh : en) as I18nStrings,
    [state.resume.locale]
  )

  const value = useMemo(
    () => ({ state, dispatch, t, saveToCloudManual, cloudSaveStatus }),
    [state, t, saveToCloudManual, cloudSaveStatus]
  )

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

// ── Hook ────────────────────────────────────────────────────────

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within ResumeProvider')
  return ctx
}
