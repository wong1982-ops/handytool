'use client'

import { useState, useCallback, useRef } from 'react'

interface PdfWorkerProgress {
  percent: number
  label: string
}

interface UsePdfWorkerReturn {
  isProcessing: boolean
  progress: PdfWorkerProgress
  cancel: () => void
}

export function usePdfWorker(): UsePdfWorkerReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<PdfWorkerProgress>({ percent: 0, label: '' })
  const cancelledRef = useRef(false)

  const cancel = useCallback(() => {
    cancelledRef.current = true
  }, [])

  return {
    isProcessing,
    progress,
    cancel,
  }
}
