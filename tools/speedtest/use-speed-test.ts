'use client'

import { useState, useCallback, useRef } from 'react'

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete'

export interface SpeedTestResult {
  ping: number
  jitter: number
  download: number
  upload: number
  downloadSamples: number[]
  uploadSamples: number[]
}

interface UseSpeedTestReturn {
  phase: TestPhase
  currentSpeed: number
  result: SpeedTestResult | null
  start: () => void
  stop: () => void
}

const round1 = (v: number) => Math.round(v * 10) / 10

// --- Measurement helpers ---

async function measurePing(signal: AbortSignal): Promise<{ ping: number; jitter: number }> {
  const samples: number[] = []
  const PING_COUNT = 10

  for (let i = 0; i < PING_COUNT; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    const t0 = performance.now()
    await fetch('/api/v1/speedtest/ping', { cache: 'no-store', signal })
    const t1 = performance.now()
    if (i > 0) samples.push(t1 - t0) // skip first (TCP warm-up)
  }

  const avg = samples.reduce((a, b) => a + b, 0) / samples.length

  let jitterSum = 0
  for (let i = 1; i < samples.length; i++) {
    jitterSum += Math.abs(samples[i] - samples[i - 1])
  }
  const jitter = samples.length > 1 ? jitterSum / (samples.length - 1) : 0

  return { ping: Math.round(avg), jitter: round1(jitter) }
}

/**
 * Download test: fetch large payloads repeatedly for DURATION seconds.
 * Emits a per-second interval sample (speed in that 1s window).
 * Final result = average of all interval samples.
 */
async function measureDownload(
  signal: AbortSignal,
  onSpeed: (mbps: number) => void,
  onSample: (mbps: number) => void,
): Promise<number> {
  const DURATION_MS = 10_000 // run for 10 seconds
  const SAMPLE_INTERVAL = 1_000 // 1 sample per second
  const DOWNLOAD_SIZE_MB = 50 // fetch 50MB per request

  const intervalSamples: number[] = []
  const globalStart = performance.now()
  let intervalStart = globalStart
  let intervalBytes = 0

  async function streamOne() {
    const res = await fetch(`/api/v1/speedtest/download?size=${DOWNLOAD_SIZE_MB}`, { cache: 'no-store', signal })
    const reader = res.body!.getReader()

    while (true) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break

      intervalBytes += value.byteLength
      const now = performance.now()

      // Emit interval sample every SAMPLE_INTERVAL ms
      if (now - intervalStart >= SAMPLE_INTERVAL) {
        const intervalElapsed = (now - intervalStart) / 1000
        const intervalSpeed = round1((intervalBytes * 8) / (intervalElapsed * 1_000_000))
        intervalSamples.push(intervalSpeed)
        onSample(intervalSpeed)
        onSpeed(intervalSpeed)
        intervalStart = now
        intervalBytes = 0
      }
    }
  }

  // Keep fetching until DURATION elapses
  while (performance.now() - globalStart < DURATION_MS) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    await streamOne()
  }

  // Flush remaining bytes as a final sample if significant
  if (intervalBytes > 0) {
    const intervalElapsed = (performance.now() - intervalStart) / 1000
    if (intervalElapsed > 0.2) { // at least 200ms of data
      const intervalSpeed = round1((intervalBytes * 8) / (intervalElapsed * 1_000_000))
      intervalSamples.push(intervalSpeed)
      onSample(intervalSpeed)
      onSpeed(intervalSpeed)
    }
  }

  // Average of all interval samples
  if (intervalSamples.length === 0) return 0
  return round1(intervalSamples.reduce((a, b) => a + b, 0) / intervalSamples.length)
}

/**
 * Upload test: POST blobs repeatedly for DURATION seconds.
 * Each completed upload produces a sample.
 * Final result = average of all samples.
 */
async function measureUpload(
  signal: AbortSignal,
  onSpeed: (mbps: number) => void,
  onSample: (mbps: number) => void,
): Promise<number> {
  const DURATION_MS = 10_000 // run for 10 seconds
  const UPLOAD_SIZE = 5 * 1024 * 1024 // 5 MB per round (smaller = more samples)

  const samples: number[] = []
  const globalStart = performance.now()

  while (performance.now() - globalStart < DURATION_MS) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')

    const blob = new Blob([new ArrayBuffer(UPLOAD_SIZE)])
    const t0 = performance.now()

    await fetch('/api/v1/speedtest/upload', {
      method: 'POST',
      body: blob,
      signal,
    })

    const elapsed = (performance.now() - t0) / 1000
    if (elapsed > 0) {
      const speed = round1((UPLOAD_SIZE * 8) / (elapsed * 1_000_000))
      samples.push(speed)
      onSpeed(speed)
      onSample(speed)
    }
  }

  if (samples.length === 0) return 0
  return round1(samples.reduce((a, b) => a + b, 0) / samples.length)
}

// --- Hook ---

export function useSpeedTest(): UseSpeedTestReturn {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [result, setResult] = useState<SpeedTestResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase('idle')
    setCurrentSpeed(0)
  }, [])

  const start = useCallback(async () => {
    if (abortRef.current) {
      stop()
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    const { signal } = controller

    setResult(null)
    setCurrentSpeed(0)

    const downloadSamples: number[] = []
    const uploadSamples: number[] = []

    try {
      // Phase 1: Ping
      setPhase('ping')
      const pingResult = await measurePing(signal)

      // Phase 2: Download (~10s)
      setPhase('download')
      const downloadSpeed = await measureDownload(
        signal,
        (s) => setCurrentSpeed(s),
        (s) => downloadSamples.push(s),
      )

      // Phase 3: Upload (~10s)
      setPhase('upload')
      setCurrentSpeed(0)
      const uploadSpeed = await measureUpload(
        signal,
        (s) => setCurrentSpeed(s),
        (s) => uploadSamples.push(s),
      )

      // Complete
      setResult({
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        download: downloadSpeed,
        upload: uploadSpeed,
        downloadSamples,
        uploadSamples,
      })
      setPhase('complete')
      setCurrentSpeed(0)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.error('Speed test error:', err)
      setPhase('idle')
      setCurrentSpeed(0)
    } finally {
      abortRef.current = null
    }
  }, [stop])

  return { phase, currentSpeed, result, start, stop }
}
