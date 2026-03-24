'use client'

import { useState, useCallback } from 'react'
import type { EnhanceResult } from './types'

export type EnhanceState = 'idle' | 'enhancing' | 'done' | 'rejected' | 'error'

interface UseAIEnhanceReturn {
  state: EnhanceState
  result: EnhanceResult | null
  error: string | null
  rejectReason: string | null
  enhance: (imageDataUrl: string) => Promise<void>
  reset: () => void
}

export function useAIEnhance(): UseAIEnhanceReturn {
  const [state, setState] = useState<EnhanceState>('idle')
  const [result, setResult] = useState<EnhanceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string | null>(null)

  const enhance = useCallback(async (imageDataUrl: string) => {
    setState('enhancing')
    setError(null)
    setRejectReason(null)
    setResult(null)

    try {
      const res = await fetch('/api/v1/id-photo/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      })

      const json = await res.json()

      if (res.status === 400 && json.code === 'PHOTO_REJECTED') {
        setState('rejected')
        setRejectReason(json.error || 'Photo not suitable for ID photo.')
        if (json.details?.analysis) {
          setResult({ analysis: json.details.analysis } as EnhanceResult)
        }
        return
      }

      if (!res.ok) {
        throw new Error(json.error || 'Enhancement failed')
      }

      setResult(json.data as EnhanceResult)
      setState('done')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Enhancement failed')
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError(null)
    setRejectReason(null)
  }, [])

  return { state, result, error, rejectReason, enhance, reset }
}
