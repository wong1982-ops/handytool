'use client'

import { useRef, useEffect, useCallback } from 'react'

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null
  isPlaying: boolean
}

const BAR_COUNT = 48
const BAR_GAP = 2
const GRADIENT_START = '#3D6AF2'
const GRADIENT_END = '#7C3AED'

export function WaveformVisualizer({ analyserNode, isPlaying }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, GRADIENT_START)
    gradient.addColorStop(1, GRADIENT_END)

    if (isPlaying && analyserNode && dataArrayRef.current) {
      analyserNode.getByteFrequencyData(dataArrayRef.current)

      for (let i = 0; i < BAR_COUNT; i++) {
        // Map bar index to frequency bin (skip very low frequencies)
        const dataIndex = Math.floor((i / BAR_COUNT) * dataArrayRef.current.length * 0.8) + 2
        const value = dataArrayRef.current[dataIndex] ?? 0
        const barHeight = Math.max(4, (value / 255) * height)

        const x = i * (barWidth + BAR_GAP)
        const y = height - barHeight

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 2)
        ctx.fill()
      }
    } else {
      // Idle state: flat subtle bars
      ctx.globalAlpha = 0.2
      for (let i = 0; i < BAR_COUNT; i++) {
        const barHeight = 4 + Math.sin(i * 0.3) * 2
        const x = i * (barWidth + BAR_GAP)
        const y = height - barHeight

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [analyserNode, isPlaying])

  // Set up data array when analyser changes
  useEffect(() => {
    if (analyserNode) {
      dataArrayRef.current = new Uint8Array(new ArrayBuffer(analyserNode.frequencyBinCount))
    } else {
      dataArrayRef.current = null
    }
  }, [analyserNode])

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width } = entry.contentRect
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = 80 * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = '80px'
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Animation loop
  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="h-20 w-full rounded-xl bg-[#0d1117]"
      />
    </div>
  )
}
