'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StoredScores, TestScore, TestId } from './types'
import { STORAGE_KEY } from './constants'

const MAX_HISTORY = 50

function readScores(): StoredScores {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as StoredScores
  } catch {
    return {}
  }
}

function writeScores(scores: StoredScores): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {
    // localStorage may be full or unavailable — silently fail
  }
}

export function useTestScores() {
  const [scores, setScores] = useState<StoredScores>({})

  useEffect(() => {
    setScores(readScores())
  }, [])

  const saveScore = useCallback(
    (testId: TestId, score: number, lowerIsBetter?: boolean) => {
      setScores((prev) => {
        const existing = prev[testId]
        const entry = { score, date: new Date().toISOString() }

        let best: number
        if (!existing) {
          best = score
        } else if (lowerIsBetter) {
          best = Math.min(existing.best, score)
        } else {
          best = Math.max(existing.best, score)
        }

        const history = existing
          ? [entry, ...existing.history].slice(0, MAX_HISTORY)
          : [entry]

        const attempts = existing ? existing.attempts + 1 : 1

        const next: StoredScores = {
          ...prev,
          [testId]: { best, history, attempts },
        }

        writeScores(next)
        return next
      })
    },
    [],
  )

  const getScore = useCallback(
    (testId: TestId): TestScore | undefined => {
      return scores[testId]
    },
    [scores],
  )

  const clearHistory = useCallback((testId: TestId) => {
    setScores((prev) => {
      const next = { ...prev }
      delete next[testId]
      writeScores(next)
      return next
    })
  }, [])

  return { scores, saveScore, getScore, clearHistory }
}
