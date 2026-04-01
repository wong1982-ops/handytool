'use client'

interface BonusMeterProps {
  meterName: string
  scatterCount: number    // 0, 1, 2, or 3+
  triggerCount: number    // usually 3
  accentColor: string
}

export function BonusMeter({ meterName, scatterCount, triggerCount, accentColor }: BonusMeterProps) {
  const progress = Math.min(100, (scatterCount / triggerCount) * 100)
  const isNearTrigger = progress > 66

  return (
    <div
      className="mx-3 rounded-lg overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: `1px solid ${accentColor}40`,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Meter name */}
        <span
          className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
          style={{ color: accentColor }}
        >
          {meterName}
        </span>

        {/* Progress bar */}
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
              boxShadow: progress > 0 ? `0 0 8px ${accentColor}60` : 'none',
            }}
          />
        </div>

        {/* BONUS label */}
        <span
          className={`text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
            isNearTrigger ? 'animate-pulse' : ''
          }`}
          style={{
            color: isNearTrigger ? '#ffd700' : 'rgba(255,255,255,0.3)',
            textShadow: isNearTrigger ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
          }}
        >
          BONUS!
        </span>
      </div>
    </div>
  )
}
