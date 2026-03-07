// tools/story-studio/use-story-book.ts
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook, StoryInput, WizardStep, Page } from './types'

const STORAGE_KEY = 'toolk1t-story-studio'

function generateId(): string {
  return `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): StoryBook | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(book: StoryBook | null) {
  try {
    if (book) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage full — silently fail
  }
}

export function useStoryBook() {
  const [book, setBook] = useState<StoryBook | null>(null)
  const [step, setStep] = useState<WizardStep>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage()
    if (saved) {
      setBook(saved)
      // Restore wizard step based on book status
      if (saved.status === 'complete') setStep('editor')
      else if (saved.status === 'illustrating') setStep('illustrations')
      else if (saved.status === 'story-approved') setStep('illustrations')
      else setStep('story')
    }
  }, [])

  // Auto-save on changes
  useEffect(() => {
    saveToStorage(book)
  }, [book])

  const updateBook = useCallback((updates: Partial<StoryBook>) => {
    setBook(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null)
  }, [])

  const updatePage = useCallback((sequence: number, updates: Partial<Page>) => {
    setBook(prev => {
      if (!prev) return null
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        pages: prev.pages.map(p =>
          p.sequence === sequence ? { ...p, ...updates } : p
        ),
      }
    })
  }, [])

  const createBook = useCallback((input: StoryInput): StoryBook => {
    const now = new Date().toISOString()
    const newBook: StoryBook = {
      id: generateId(),
      title: input.title || '',
      audience: input.audience,
      format: input.format,
      style: input.style,
      theme: '',
      setting: '',
      characters: [],
      pages: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    setBook(newBook)
    return newBook
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setBook(null)
    setStep('input')
    setLoading(false)
    setError(null)
    saveToStorage(null)
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  return {
    book,
    step,
    setStep,
    loading,
    setLoading,
    error,
    setError,
    abortRef,
    createBook,
    updateBook,
    updatePage,
    reset,
    abort,
  }
}
