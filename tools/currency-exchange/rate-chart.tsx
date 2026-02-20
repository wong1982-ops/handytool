'use client'

import { useState, useMemo, useCallback } from 'react'

export type Period = '1W' | '1M' | '3M' | '6M' | '1Y'

interface RateChartProps {
  data: { date: string; rate: number }[]
  from: string
  to: string
  period: Period
  onPeriodChange: (period: Period) => void
  loading: boolean
}

const PERIODS: Period[] = ['1W', '1M', '3M', '6M', '1Y']

const CHART_W = 900
const CHART_H = 300
const PAD_L = 60
const PAD_R = 20
const PAD_T = 20
const PAD_B = 40

export function RateChart({ data, from, to, period, onPeriodChange, loading }: RateChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const { points, minRate, maxRate, xLabels } = useMemo(() => {
    if (data.length === 0) return { points: '', minRate: 0, maxRate: 0, xLabels: [] as { x: number; label: string }[] }

    const rates = data.map((d) => d.rate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const range = max - min || 0.0001

    const plotW = CHART_W - PAD_L - PAD_R
    const plotH = CHART_H - PAD_T - PAD_B

    const pts = data.map((d, i) => {
      const x = PAD_L + (i / (data.length - 1 || 1)) * plotW
      const y = PAD_T + plotH - ((d.rate - min) / range) * plotH
      return { x, y }
    })

    const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(' ')

    // X-axis labels — show 5 evenly spaced
    const labelCount = Math.min(5, data.length)
    const labels: { x: number; label: string }[] = []
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.round((i / (labelCount - 1 || 1)) * (data.length - 1))
      const d = new Date(data[idx].date)
      labels.push({
        x: pts[idx].x,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }

    return { points: pointsStr, minRate: min, maxRate: max, xLabels: labels }
  }, [data])

  const hoverPoint = useMemo(() => {
    if (hoverIdx === null || data.length === 0) return null
    const rates = data.map((d) => d.rate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const range = max - min || 0.0001
    const plotW = CHART_W - PAD_L - PAD_R
    const plotH = CHART_H - PAD_T - PAD_B
    const x = PAD_L + (hoverIdx / (data.length - 1 || 1)) * plotW
    const y = PAD_T + plotH - ((data[hoverIdx].rate - min) / range) * plotH
    return { x, y, date: data[hoverIdx].date, rate: data[hoverIdx].rate }
  }, [hoverIdx, data])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (data.length === 0) return
      const svg = e.currentTarget
      const rect = svg.getBoundingClientRect()
      const relX = ((e.clientX - rect.left) / rect.width) * CHART_W
      const plotW = CHART_W - PAD_L - PAD_R
      const ratio = (relX - PAD_L) / plotW
      const idx = Math.round(ratio * (data.length - 1))
      if (idx >= 0 && idx < data.length) {
        setHoverIdx(idx)
      }
    },
    [data.length]
  )

  const areaPoints = useMemo(() => {
    if (!points) return ''
    const plotH = CHART_H - PAD_T - PAD_B
    const bottomY = PAD_T + plotH
    const firstX = PAD_L
    const lastX = PAD_L + (CHART_W - PAD_L - PAD_R)
    return `${firstX},${bottomY} ${points} ${lastX},${bottomY}`
  }, [points])

  // Y-axis labels — 4 evenly spaced
  const yLabels = useMemo(() => {
    if (data.length === 0) return []
    const plotH = CHART_H - PAD_T - PAD_B
    const range = maxRate - minRate || 0.0001
    return Array.from({ length: 4 }, (_, i) => {
      const ratio = i / 3
      const rate = minRate + ratio * range
      const y = PAD_T + plotH - ratio * plotH
      return { y, label: rate.toFixed(4) }
    })
  }, [data.length, minRate, maxRate])

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Exchange Rate Trend</h2>
          <p className="text-sm text-slate-500">{from} to {to} historical conversion rates</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg" role="tablist" aria-label="Chart period">
          {PERIODS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                period === p
                  ? 'bg-white dark:bg-slate-700 text-[var(--tk-color-primary-500)] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 relative" style={{ minHeight: 340 }}>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]" aria-busy="true" aria-label="Loading chart">
            <svg className="w-8 h-8 animate-spin text-[var(--tk-color-primary-500)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-slate-400">
            No data available for this period
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
            aria-label={`${from} to ${to} exchange rate chart for ${period}`}
            role="img"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--tk-color-primary-500)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--tk-color-primary-500)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yLabels.map((yl, i) => (
              <line
                key={i}
                x1={PAD_L}
                x2={CHART_W - PAD_R}
                y1={yl.y}
                y2={yl.y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels */}
            {yLabels.map((yl, i) => (
              <text
                key={i}
                x={PAD_L - 8}
                y={yl.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {yl.label}
              </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((xl, i) => (
              <text
                key={i}
                x={xl.x}
                y={CHART_H - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] uppercase font-bold"
              >
                {xl.label}
              </text>
            ))}

            {/* Area */}
            <polygon points={areaPoints} fill="url(#chartGrad)" />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="var(--tk-color-primary-500)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover crosshair + tooltip */}
            {hoverPoint && (
              <>
                <line
                  x1={hoverPoint.x}
                  x2={hoverPoint.x}
                  y1={PAD_T}
                  y2={CHART_H - PAD_B}
                  stroke="var(--tk-color-primary-500)"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  opacity="0.5"
                />
                <circle
                  cx={hoverPoint.x}
                  cy={hoverPoint.y}
                  r="5"
                  fill="var(--tk-color-primary-500)"
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Tooltip background */}
                <rect
                  x={hoverPoint.x - 70}
                  y={Math.max(PAD_T, hoverPoint.y - 50)}
                  width="140"
                  height="36"
                  rx="6"
                  className="fill-slate-900 dark:fill-slate-100"
                />
                <text
                  x={hoverPoint.x}
                  y={Math.max(PAD_T, hoverPoint.y - 50) + 14}
                  textAnchor="middle"
                  className="fill-white dark:fill-slate-900 text-[10px] font-bold"
                >
                  {new Date(hoverPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </text>
                <text
                  x={hoverPoint.x}
                  y={Math.max(PAD_T, hoverPoint.y - 50) + 28}
                  textAnchor="middle"
                  className="fill-white dark:fill-slate-900 text-[10px]"
                >
                  1 {from} = {hoverPoint.rate.toFixed(4)} {to}
                </text>
              </>
            )}
          </svg>
        )}
      </div>
    </div>
  )
}
