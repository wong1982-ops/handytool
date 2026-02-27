'use client'

import { useCallback, useRef, useState } from 'react'

interface ShareResultProps {
  testName: string
  score: number
  unit: string
  color: string // hex color for the test theme
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 61, g: 106, b: 242 }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function ShareResult({ testName, score, unit, color }: ShareResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    canvas.width = 600
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Clip to rounded rectangle
    drawRoundedRect(ctx, 0, 0, 600, 400, 24)
    ctx.clip()

    // Background gradient using theme color
    const rgb = hexToRgb(color)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(
      0,
      `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`
    )
    gradient.addColorStop(
      1,
      `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`
    )
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 400)

    // Subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    for (let i = 0; i < 600; i += 40) {
      for (let j = 0; j < 400; j += 40) {
        ctx.beginPath()
        ctx.arc(i, j, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // "Human Benchmark" subtitle near top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.font = '16px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Human Benchmark', 300, 60)

    // Test name centered
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
    ctx.fillText(testName, 300, 120)

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 155)
    ctx.lineTo(400, 155)
    ctx.stroke()

    // Score value large and prominent
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
    ctx.fillText(score.toLocaleString(), 300, 230)

    // Unit below score
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillText(unit, 300, 280)

    // Branding at bottom center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '13px system-ui, -apple-system, sans-serif'
    ctx.fillText('toolk1t.com', 300, 370)

    return canvas.toDataURL('image/png')
  }, [testName, score, unit, color])

  const handleGenerate = useCallback(() => {
    if (showPreview) {
      setShowPreview(false)
      return
    }
    const url = generateImage()
    if (url) {
      setImageUrl(url)
      setShowPreview(true)
    }
  }, [showPreview, generateImage])

  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = `${testName.toLowerCase().replace(/\s+/g, '-')}-result.png`
    link.href = imageUrl
    link.click()
  }, [imageUrl, testName])

  const handleCopy = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )
      if (!blob) return

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: clipboard API may not be available
      console.warn('Clipboard write not supported')
    }
  }, [])

  return (
    <div className="w-full">
      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Share button */}
      <button
        onClick={handleGenerate}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share Result
      </button>

      {/* Preview panel */}
      {showPreview && imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Share Your Result
            </span>
            <button
              onClick={() => setShowPreview(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close share panel"
            >
              &times;
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 p-4">
            <img
              src={imageUrl}
              alt={`${testName} result: ${score} ${unit}`}
              className="max-w-full rounded-lg"
              style={{ maxWidth: 600 }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PNG
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
