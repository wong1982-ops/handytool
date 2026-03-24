'use client'

import { useState, useCallback } from 'react'
import type { EnhanceResult } from './types'

export type EnhanceState = 'idle' | 'enhancing' | 'removing-bg' | 'done' | 'rejected' | 'error'

interface UseAIEnhanceReturn {
  state: EnhanceState
  result: EnhanceResult | null
  bgRemovedUrl: string | null
  error: string | null
  rejectReason: string | null
  enhance: (imageDataUrl: string, bgColor?: string) => Promise<void>
  reset: () => void
}

export function useAIEnhance(): UseAIEnhanceReturn {
  const [state, setState] = useState<EnhanceState>('idle')
  const [result, setResult] = useState<EnhanceResult | null>(null)
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string | null>(null)

  const enhance = useCallback(async (imageDataUrl: string, bgColor: string = '#FFFFFF') => {
    setState('enhancing')
    setError(null)
    setRejectReason(null)
    setResult(null)
    setBgRemovedUrl(null)

    try {
      // Step 1: Server-side analysis (Gemini)
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

      const enhanceResult = json.data as EnhanceResult
      setResult(enhanceResult)

      // Step 2: Client-side background removal
      setState('removing-bg')
      try {
        const { removeBackgroundClient, applyBackgroundColor } = await import('@/lib/id-photo/background-removal')
        const transparentUrl = await removeBackgroundClient(imageDataUrl)
        const withBgUrl = await applyBackgroundColor(transparentUrl, bgColor)
        setBgRemovedUrl(withBgUrl)
      } catch (bgErr) {
        console.error('[id-photo] Background removal failed:', bgErr)
        // Continue without BG removal — not a hard failure
      }

      setState('done')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Enhancement failed')
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setBgRemovedUrl(null)
    setError(null)
    setRejectReason(null)
  }, [])

  return { state, result, bgRemovedUrl, error, rejectReason, enhance, reset }
}
