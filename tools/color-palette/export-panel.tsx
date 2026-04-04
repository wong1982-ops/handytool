'use client'

import { useState, useCallback, useRef } from 'react'
import type { PaletteColor } from './types'
import { COLOR_NAMES } from './types'
import { generateTintShadeScale, suggestTextColor } from './color-utils'
import { encodeAse } from './ase-encoder'

type ExportFormat = 'CSS' | 'Tailwind' | 'SCSS' | 'JSON' | 'ASE' | 'PNG'

const FORMATS: ExportFormat[] = ['CSS', 'Tailwind', 'SCSS', 'JSON', 'ASE', 'PNG']

interface ExportPanelProps {
  colors: PaletteColor[]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateScales(colors: PaletteColor[]) {
  return colors.map((c, i) => ({
    name: COLOR_NAMES[i] ?? `color-${i + 1}`,
    scale: generateTintShadeScale(c.hex),
  }))
}

function generateCss(colors: PaletteColor[]): string {
  const scales = generateScales(colors)
  const lines = [':root {']
  for (const { name, scale } of scales) {
    for (const step of scale) {
      lines.push(`  --color-${name}-${step.step}: ${step.hex};`)
    }
  }
  lines.push('}')
  return lines.join('\n')
}

function generateTailwind(colors: PaletteColor[]): string {
  const scales = generateScales(colors)
  const lines = ['// tailwind.config.js colors', '{']
  for (let i = 0; i < scales.length; i++) {
    const { name, scale } = scales[i]
    const entries = scale.map((s) => `    ${s.step}: '${s.hex}'`).join(',\n')
    const comma = i < scales.length - 1 ? ',' : ''
    lines.push(`  ${name}: {\n${entries}\n  }${comma}`)
  }
  lines.push('}')
  return lines.join('\n')
}

function generateScss(colors: PaletteColor[]): string {
  const scales = generateScales(colors)
  const lines: string[] = []
  for (const { name, scale } of scales) {
    for (const step of scale) {
      lines.push(`$color-${name}-${step.step}: ${step.hex};`)
    }
  }
  return lines.join('\n')
}

function generateJson(colors: PaletteColor[]): string {
  const scales = generateScales(colors)
  const obj: Record<string, Record<string, string>> = {}
  for (const { name, scale } of scales) {
    obj[name] = {}
    for (const step of scale) {
      obj[name][String(step.step)] = step.hex
    }
  }
  return JSON.stringify(obj, null, 2)
}

export function ExportPanel({ colors }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('CSS')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getTextOutput = useCallback(() => {
    switch (format) {
      case 'CSS':
        return generateCss(colors)
      case 'Tailwind':
        return generateTailwind(colors)
      case 'SCSS':
        return generateScss(colors)
      case 'JSON':
        return generateJson(colors)
      default:
        return ''
    }
  }, [format, colors])

  async function handleCopy() {
    const text = getTextOutput()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleAseDownload() {
    const aseColors = colors.map((c, i) => ({
      name: COLOR_NAMES[i] ?? `color-${i + 1}`,
      hex: c.hex,
    }))
    const blob = encodeAse(aseColors)
    downloadBlob(blob, 'palette.ase')
  }

  function handlePngDownload() {
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const barWidth = 1200 / colors.length

    colors.forEach((c, i) => {
      const x = i * barWidth

      // Draw color bar
      ctx.fillStyle = c.hex
      ctx.fillRect(x, 0, barWidth, 630)

      // Draw hex label
      const textColor = suggestTextColor(c.hex)
      ctx.fillStyle = textColor
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(c.hex, x + barWidth / 2, 630 / 2)
    })

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'palette.png')
    }, 'image/png')
  }

  const isTextFormat = format === 'CSS' || format === 'Tailwind' || format === 'SCSS' || format === 'JSON'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-[#1e2631] bg-slate-50 dark:bg-[#131a23] p-4">
      <h3 className="text-sm font-semibold text-white">Export</h3>

      {/* Format pills */}
      <div className="flex flex-wrap gap-1.5">
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors cursor-pointer ${
              format === f
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-slate-200 dark:bg-[#1e2631] text-white hover:bg-slate-200 dark:hover:bg-[#1e2631]/80'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Text formats: code block + copy */}
      {isTextFormat && (
        <div className="relative">
          <pre className="max-h-[300px] overflow-y-auto rounded-lg bg-white dark:bg-[#090f16] border border-slate-200 dark:border-[#1e2631] p-3 text-xs font-mono text-slate-900 dark:text-white">
            <code>{getTextOutput()}</code>
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 px-3 py-1.5 min-h-[36px] rounded-lg bg-slate-200 dark:bg-[#1e2631] text-xs font-medium text-white hover:bg-slate-200 dark:hover:bg-[#1e2631]/80 transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* ASE download */}
      {format === 'ASE' && (
        <button
          type="button"
          onClick={handleAseDownload}
          className="w-full py-3 min-h-[44px] rounded-xl bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download palette.ase
        </button>
      )}

      {/* PNG download */}
      {format === 'PNG' && (
        <>
          <button
            type="button"
            onClick={handlePngDownload}
            className="w-full py-3 min-h-[44px] rounded-xl bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download palette.png
          </button>
          <p className="text-xs text-slate-400 dark:text-[#70767f] text-center">
            1200 x 630 — optimized for social sharing
          </p>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  )
}
