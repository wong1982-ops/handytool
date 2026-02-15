'use client'

import { useState, useCallback, useRef } from 'react'
import type { FaceAnalysisResult } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error'

interface UseFaceAnalysisReturn {
  state: AnalysisState
  result: FaceAnalysisResult | null
  error: string | null
  analyze: (file: File) => Promise<void>
  reset: () => void
}

export function useFaceAnalysis(): UseFaceAnalysisReturn {
  const [state, setState] = useState<AnalysisState>('idle')
  const [result, setResult] = useState<FaceAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const analyze = useCallback(async (file: File) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState('analyzing')
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE}/api/v1/id-photo/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      const json = await response.json()

      if (!response.ok) {
        const msg = json.details?.message || json.error || 'Analysis failed'
        setState('error')
        setError(msg)
        return
      }

      setResult(json.data as FaceAnalysisResult)
      setState('done')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setState('error')
      setError('Failed to connect to analysis server.')
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState('idle')
    setResult(null)
    setError(null)
  }, [])

  return { state, result, error, analyze, reset }
}
