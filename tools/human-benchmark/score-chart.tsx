'use client'

import type { ScoreEntry } from './types'

interface ScoreChartProps {
  history: ScoreEntry[]
  color: string
  unit: string
  lowerIsBetter: boolean
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  let step: number
  if (norm <= 1.5) step = 1
  else if (norm <= 3) step = 2
  else if (norm <= 7) step = 5
  else step = 10
  return step * mag
}

export function ScoreChart({ history, color, unit, lowerIsBetter }: ScoreChartProps) {
  const data = history.slice(-20)

  if (data.length < 2) return null

  const scores = data.map((d) => d.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  // Best score index
  const bestScore = lowerIsBetter ? minScore : maxScore
  const bestIndex = scores.indexOf(bestScore)

  // Y-axis range with nice numbers
  const range = maxScore - minScore || 1
  const step = niceStep(range, 4)
  const yMin = Math.floor(minScore / step) * step
  const yMax = Math.ceil(maxScore / step) * step
  const yRange = yMax - yMin || 1

  // Build Y-axis tick values
  const yTicks: number[] = []
  for (let v = yMin; v <= yMax; v += step) {
    yTicks.push(v)
  }

  // Chart dimensions
  const svgW = 600
  const svgH = 200
  const padLeft = 50
  const padRight = 20
  const padTop = 20
  const padBottom = 30
  const chartW = svgW - padLeft - padRight
  const chartH = svgH - padTop - padBottom

  // Map data to chart coordinates
  const points = data.map((_, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW
    const y = padTop + chartH - ((scores[i] - yMin) / yRange) * chartH
    return { x, y }
  })

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  // Area path (fill under line)
  const areaPath = [
    `M${points[0].x},${padTop + chartH}`,
    `L${points[0].x},${points[0].y}`,
    ...points.slice(1).map((p) => `L${p.x},${p.y}`),
    `L${points[points.length - 1].x},${padTop + chartH}`,
    'Z',
  ].join(' ')

  const gradientId = `chart-grad-${color.replace('#', '')}`

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mt-6">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Score Trend
      </h3>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: 200 }}
        role="img"
        aria-label={`Score trend chart showing last ${data.length} attempts`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((v) => {
          const y = padTop + chartH - ((v - yMin) / yRange) * chartH
          return (
            <g key={v}>
              <line
                x1={padLeft}
                y1={y}
                x2={svgW - padRight}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-700/20"
                strokeDasharray="4 3"
                strokeWidth={1}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-400"
                fontSize={11}
              >
                {v}
              </text>
            </g>
          )
        })}

        {/* X-axis labels (attempt numbers) */}
        {data.map((_, i) => {
          // Show a subset of labels to avoid crowding
          const showLabel =
            data.length <= 10 ||
            i === 0 ||
            i === data.length - 1 ||
            i % Math.ceil(data.length / 8) === 0
          if (!showLabel) return null
          const x = padLeft + (i / (data.length - 1)) * chartW
          return (
            <text
              key={i}
              x={x}
              y={svgH - 6}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-slate-400"
              fontSize={11}
            >
              {i + 1}
            </text>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => {
          const isBest = i === bestIndex
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isBest ? 6 : 4}
              fill={isBest ? '#facc15' : color}
              stroke={isBest ? '#a16207' : 'white'}
              strokeWidth={isBest ? 2 : 1.5}
            />
          )
        })}

        {/* Best label */}
        {bestIndex >= 0 && (
          <text
            x={points[bestIndex].x}
            y={points[bestIndex].y - 12}
            textAnchor="middle"
            className="fill-amber-500 dark:fill-amber-400"
            fontSize={10}
            fontWeight={700}
          >
            Best: {bestScore}
            {unit}
          </text>
        )}
      </svg>
    </div>
  )
}
