'use client'

import { useState, useCallback, useRef } from 'react'

interface StabilityGraphProps {
  downloadSamples: number[]
  uploadSamples: number[]
}

function samplesToPath(samples: number[], maxVal: number, width: number, height: number): string {
  if (samples.length === 0) return ''
  const stepX = width / Math.max(samples.length - 1, 1)
  return samples
    .map((v, i) => {
      const x = i * stepX
      const y = height - (v / maxVal) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function formatAxisLabel(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} Gbps`
  return `${Math.round(value)} Mbps`
}

function interpolate(samples: number[], ratio: number): number | null {
  if (samples.length === 0) return null
  const pos = ratio * (samples.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi || hi >= samples.length) return samples[Math.min(lo, samples.length - 1)]
  const t = pos - lo
  return samples[lo] + t * (samples[hi] - samples[lo])
}

export function StabilityGraph({ downloadSamples, uploadSamples }: StabilityGraphProps) {
  const allSamples = [...downloadSamples, ...uploadSamples]
  if (allSamples.length === 0) return null

  const maxVal = Math.max(...allSamples) * 1.2 || 100
  const W = 1000
  const H = 100

  const dlPath = samplesToPath(downloadSamples, maxVal, W, H)
  const ulPath = samplesToPath(uploadSamples, maxVal, W, H)

  const [hover, setHover] = useState<{ x: number; dl: number | null; ul: number | null } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const dl = interpolate(downloadSamples, ratio)
    const ul = interpolate(uploadSamples, ratio)
    setHover({ x: ratio * W, dl, ul })
  }, [downloadSamples, uploadSamples])

  const handleMouseLeave = useCallback(() => setHover(null), [])

  return (
    <div className="w-full bg-white dark:bg-[#16222a] p-6 rounded-xl border border-slate-200 dark:border-white/5 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">Connection Stability Graph</h3>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-tight">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--ht-color-secondary-500)]" aria-hidden="true" />
            <span className="text-slate-500 dark:text-slate-400">Download</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-slate-500 dark:text-slate-400">Upload</span>
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-48 w-full relative cursor-crosshair"
        role="img"
        aria-label="Connection stability graph showing download and upload speeds over time"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {dlPath && (
            <>
              <path d={`${dlPath} V ${H} H 0 Z`} fill="url(#graphGradFill)" opacity="0.1" />
              <path d={dlPath} fill="none" stroke="var(--ht-color-secondary-500, #25d1f4)" strokeWidth="2" />
            </>
          )}
          {ulPath && (
            <path d={ulPath} fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="4 2" />
          )}

          {/* Hover vertical line */}
          {hover && (
            <line
              x1={hover.x}
              y1={0}
              x2={hover.x}
              y2={H}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 2"
              className="text-slate-400 dark:text-slate-500"
            />
          )}

          {/* Hover dots on lines */}
          {hover?.dl != null && (
            <circle
              cx={hover.x}
              cy={H - (hover.dl / maxVal) * H}
              r="4"
              fill="var(--ht-color-secondary-500, #25d1f4)"
              stroke="white"
              strokeWidth="1.5"
            />
          )}
          {hover?.ul != null && (
            <circle
              cx={hover.x}
              cy={H - (hover.ul / maxVal) * H}
              r="4"
              fill="#34d399"
              stroke="white"
              strokeWidth="1.5"
            />
          )}

          <defs>
            <linearGradient id="graphGradFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ht-color-secondary-500, #25d1f4)" />
              <stop offset="100%" stopColor="var(--ht-color-secondary-500, #25d1f4)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover tooltip */}
        {hover && (
          <div
            className="absolute top-0 pointer-events-none -translate-x-1/2 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm"
            style={{ left: `${(hover.x / W) * 100}%` }}
          >
            {hover.dl != null && (
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[var(--ht-color-secondary-500)]" />
                <span className="text-slate-300">DL</span>
                <span className="font-bold tabular-nums">{hover.dl.toFixed(1)} Mbps</span>
              </div>
            )}
            {hover.ul != null && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">UL</span>
                <span className="font-bold tabular-nums">{hover.ul.toFixed(1)} Mbps</span>
              </div>
            )}
          </div>
        )}

        {/* Y-Axis Labels */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-slate-400 font-bold py-1 pointer-events-none">
          <span>{formatAxisLabel(maxVal)}</span>
          <span>{formatAxisLabel(maxVal / 2)}</span>
          <span>0</span>
        </div>
      </div>
    </div>
  )
}
