'use client'

import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import type { FontCharacter } from './types'

interface DownloadStepProps {
  characters: FontCharacter[]
  projectId: string
  stylePreset: string
  onStartOver: () => void
}

type DownloadingState = 'sheet' | 'zip' | 'svg' | null

export function DownloadStep({ characters, projectId, stylePreset: _stylePreset, onStartOver }: DownloadStepProps) {
  void _stylePreset // reserved for filename customization
  const [downloading, setDownloading] = useState<DownloadingState>(null)
  const [error, setError] = useState<string | null>(null)

  const sorted = [...characters].sort((a, b) => {
    const order = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return order.indexOf(a.char) - order.indexOf(b.char)
  })

  // --- Alphabet Sheet PNG ---
  const handleDownloadSheet = useCallback(async () => {
    setDownloading('sheet')
    setError(null)
    try {
      const cols = 6
      const rows = Math.ceil(sorted.length / cols)
      const cellSize = 200
      const padding = 16
      const canvasW = cols * cellSize + padding * 2
      const canvasH = rows * cellSize + padding * 2

      const canvas = document.createElement('canvas')
      canvas.width = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasW, canvasH)

      // Load all images
      const images = await Promise.all(
        sorted.map(
          (ch) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              img.onload = () => resolve(img)
              img.onerror = () => reject(new Error(`Failed to load ${ch.char}`))
              img.src = ch.imageUrl
            })
        )
      )

      images.forEach((img, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = padding + col * cellSize
        const y = padding + row * cellSize
        ctx.drawImage(img, x, y, cellSize, cellSize)
      })

      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to create PNG')
          setDownloading(null)
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `font-alphabet-sheet.png`
        a.click()
        URL.revokeObjectURL(url)
        setDownloading(null)
      }, 'image/png')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setDownloading(null)
    }
  }, [sorted])

  // --- Individual PNGs ZIP ---
  const handleDownloadZip = useCallback(async () => {
    setDownloading('zip')
    setError(null)
    try {
      const zip = new JSZip()

      const blobs = await Promise.all(
        sorted.map(async (ch) => {
          const res = await fetch(ch.imageUrl)
          if (!res.ok) throw new Error(`Failed to fetch ${ch.char}`)
          return { char: ch.char, blob: await res.blob() }
        })
      )

      blobs.forEach(({ char, blob }) => {
        const name = /[A-Z]/.test(char) ? `uppercase-${char}` : /[0-9]/.test(char) ? `digit-${char}` : char
        zip.file(`${name}.png`, blob)
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'font-characters.zip'
      a.click()
      URL.revokeObjectURL(url)
      setDownloading(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setDownloading(null)
    }
  }, [sorted])

  // --- SVG Pack ZIP ---
  const handleDownloadSvg = useCallback(async () => {
    setDownloading('svg')
    setError(null)
    try {
      const res = await fetch('/api/v1/font-generator/download-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          characters: sorted.map((c) => ({ char: c.char, imageUrl: c.imageUrl })),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'SVG download failed')
        setDownloading(null)
        return
      }

      const svgEntries: { char: string; svg: string }[] = json.data?.svgs ?? []
      const zip = new JSZip()
      svgEntries.forEach(({ char, svg }) => {
        const name = /[A-Z]/.test(char) ? `uppercase-${char}` : /[0-9]/.test(char) ? `digit-${char}` : char
        zip.file(`${name}.svg`, svg)
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'font-svg-pack.zip'
      a.click()
      URL.revokeObjectURL(url)
      setDownloading(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SVG download failed')
      setDownloading(null)
    }
  }, [sorted, projectId])

  return (
    <div className="space-y-8">
      {/* Alphabet preview */}
      <section>
        <h2 className="text-white font-semibold text-lg mb-3">Your Alphabet</h2>
        <div className="grid grid-cols-6 gap-2">
          {sorted.map((ch) => (
            <div
              key={ch.char}
              className="aspect-square rounded-lg bg-white flex items-center justify-center overflow-hidden"
            >
              <img
                src={ch.imageUrl}
                alt={ch.char}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Download options */}
      <section className="space-y-4">
        <h2 className="text-white font-semibold text-lg">Download Options</h2>

        {/* Alphabet Sheet PNG */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">Alphabet Sheet PNG</h3>
                <span className="text-xs text-emerald-400 font-medium">Free</span>
              </div>
              <p className="text-sm text-[#70767f]">All {sorted.length} characters in a single 6-column grid image.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSheet}
              disabled={downloading !== null}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0"
            >
              {downloading === 'sheet' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </>
              )}
            </button>
          </div>
        </div>

        {/* Individual PNGs ZIP */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">Individual PNGs ZIP</h3>
                <span className="text-xs text-emerald-400 font-medium">Free</span>
              </div>
              <p className="text-sm text-[#70767f]">Each character as a separate PNG file in a ZIP archive.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloading !== null}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0"
            >
              {downloading === 'zip' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Zipping...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ZIP
                </>
              )}
            </button>
          </div>
        </div>

        {/* SVG Pack ZIP */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">SVG Pack ZIP</h3>
                <span className="bg-[#7C3AED]/30 text-[#c084fc] text-xs px-2 py-0.5 rounded-full font-medium">1 credit</span>
              </div>
              <p className="text-sm text-[#70767f]">Scalable vector versions of each character, perfect for print.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={downloading !== null}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0"
            >
              {downloading === 'svg' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download SVGs
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Start Over */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] px-6 py-2.5 rounded-xl border border-[#1e2631] hover:border-[#3D6AF2]/30 text-[#70767f] hover:text-white text-sm font-medium transition-all cursor-pointer"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
