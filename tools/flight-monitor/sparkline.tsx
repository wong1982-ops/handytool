'use client'

interface SparklineProps {
  data: number[]
  height?: number
  highlightDrop?: boolean
}

export function Sparkline({ data, height = 32, highlightDrop = true }: SparklineProps) {
  if (data.length === 0) return null

  const avg = data.reduce((sum, v) => sum + v, 0) / data.length
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  return (
    <div
      className="flex items-end gap-[2px]"
      style={{ height }}
      aria-hidden="true"
    >
      {data.map((value, index) => {
        const isLast = index === data.length - 1
        const heightPct = 30 + ((value - min) / range) * 70
        const isDrop = highlightDrop && value < avg * 0.85
        const color = isDrop ? 'bg-[#10B981]' : 'bg-[#3D6AF2]'
        const opacity = isLast ? 'opacity-100' : 'opacity-60'

        return (
          <div
            key={index}
            className={`w-1 rounded-t ${color} ${opacity}`}
            style={{ height: `${heightPct}%` }}
          />
        )
      })}
    </div>
  )
}
