'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ImageMeta, VectorizationSettings, VectorResult, ConversionState } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface UseSvgTracerReturn {
  conversionState: ConversionState
  vectorResult: VectorResult | null
  error: string | null
  reprocess: () => void
  reset: () => void
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}

export function useSvgTracer(
  imageMeta: ImageMeta | null,
  settings: VectorizationSettings,
): UseSvgTracerReturn {
  const [conversionState, setConversionState] = useState<ConversionState>('idle')
  const [vectorResult, setVectorResult] = useState<VectorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const blobUrlRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cleanup = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const doConvert = useCallback(
    async (meta: ImageMeta, currentSettings: VectorizationSettings) => {
      // Abort any in-flight request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setConversionState('processing')
      setError(null)

      try {
        const file = await dataUrlToFile(meta.dataUrl, meta.name)

        const { liveProcessing, optimizeSvg, ...apiSettings } = currentSettings

        const formData = new FormData()
        formData.append('image', file)
        formData.append('settings', JSON.stringify(apiSettings))

        const response = await fetch(`${API_BASE}/api/v1/svg/vectorize`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || `Server error: ${response.status}`)
        }

        const { data } = await response.json()

        // Cleanup previous blob
        cleanup()

        let svgString: string = data.svg

        // Client-side SVGO post-processing (if enabled)
        if (currentSettings.optimizeSvg) {
          try {
            const { optimize } = await import('svgo/browser')
            const result = optimize(svgString, {
              multipass: true,
              plugins: ['preset-default'],
            })
            svgString = result.data
          } catch {
            // SVGO failure is non-fatal
          }
        }

        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const svgBlobUrl = URL.createObjectURL(blob)
        blobUrlRef.current = svgBlobUrl

        setVectorResult({
          svgString,
          svgBlobUrl,
          pathCount: data.pathCount,
          estimatedSize: blob.size,
          processingTimeMs: data.processingTimeMs,
        })
        setConversionState('ready')
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[SVG Converter] Conversion failed:', err)
        setError(err instanceof Error ? err.message : 'Conversion failed')
        setConversionState('error')
      }
    },
    [cleanup],
  )

  const reprocess = useCallback(() => {
    if (!imageMeta) return
    doConvert(imageMeta, settings)
  }, [imageMeta, settings, doConvert])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    cleanup()
    setVectorResult(null)
    setConversionState('idle')
    setError(null)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [cleanup])

  // Auto-convert when image loads for the first time
  const prevImageRef = useRef<string | null>(null)
  useEffect(() => {
    if (!imageMeta) return
    if (prevImageRef.current === imageMeta.dataUrl) return
    prevImageRef.current = imageMeta.dataUrl
    doConvert(imageMeta, settings)
  }, [imageMeta, settings, doConvert])

  // Live reprocessing on settings changes (debounced)
  const settingsJsonRef = useRef('')
  useEffect(() => {
    if (!imageMeta) return
    if (!settings.liveProcessing) return

    const json = JSON.stringify(settings)
    if (settingsJsonRef.current === json) return
    if (settingsJsonRef.current === '') {
      settingsJsonRef.current = json
      return
    }
    settingsJsonRef.current = json

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doConvert(imageMeta, settings)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [imageMeta, settings, doConvert])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      cleanup()
    }
  }, [cleanup])

  return { conversionState, vectorResult, error, reprocess, reset }
}
