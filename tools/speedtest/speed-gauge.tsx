'use client'

interface SpeedGaugeProps {
  speed: number
  maxSpeed: number
  unit?: string
  status: string
  isRunning: boolean
  onStart: () => void
}

export function SpeedGauge({ speed, maxSpeed, unit = 'Mbps', status, isRunning, onStart }: SpeedGaugeProps) {
  // Calculate gauge fill: 75% of circle is the track, progress fills proportionally
  const circumference = 2 * Math.PI * 45 // r=45
  const trackLength = circumference * 0.75 // 75% arc
  const gapLength = circumference - trackLength
  const progress = Math.min(speed / maxSpeed, 1)
  const progressLength = trackLength * progress

  return (
    <div className="relative flex flex-col items-center justify-center py-8 md:py-4 w-full max-w-2xl">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[var(--tk-color-secondary-500)]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Speedometer */}
      <div className="relative size-72 sm:size-80 lg:size-[340px] flex items-center justify-center">
        {/* SVG Gauge */}
        <svg className="absolute inset-0 w-full h-full -rotate-[135deg] transform" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${trackLength} ${gapLength}`}
            strokeLinecap="round"
            className="text-slate-200 dark:text-white/5"
          />
          {/* Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="4"
            strokeDasharray={`${progressLength} ${circumference - progressLength}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{ filter: 'drop-shadow(0 0 15px rgba(37, 209, 244, 0.4))' }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--tk-color-secondary-500)" />
              <stop offset="100%" stopColor="#00ffff" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="mb-2">
            <span className="text-6xl lg:text-7xl font-bold tracking-tighter tabular-nums text-slate-900 dark:text-white">
              {speed}
            </span>
            <span className="text-xl lg:text-2xl font-light text-slate-500 dark:text-[var(--tk-color-secondary-500)]/70 block -mt-1">
              {unit}
            </span>
          </div>

          {/* GO Button */}
          <button
            onClick={onStart}
            className="group relative mt-3 flex size-20 lg:size-24 items-center justify-center rounded-full bg-[var(--tk-color-secondary-500)] text-[#0b0e14] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              boxShadow: isRunning
                ? '0 0 20px rgba(37,209,244,0.5), 0 0 60px rgba(37,209,244,0.25), inset 0 0 20px rgba(255,255,255,0.15)'
                : '0 0 30px rgba(37,209,244,0.45), 0 0 80px rgba(37,209,244,0.2), inset 0 0 25px rgba(255,255,255,0.1)',
              transition: 'box-shadow 0.6s ease, transform 0.2s ease',
            }}
            aria-label={isRunning ? 'Stop speed test' : 'Start speed test'}
          >
            {isRunning && (
              <span className="absolute inset-0 rounded-full border-4 border-[var(--tk-color-secondary-500)] animate-ping opacity-40" />
            )}
            <span className="text-xl lg:text-2xl font-black tracking-widest">
              {isRunning ? 'STOP' : 'GO'}
            </span>
          </button>
        </div>
      </div>

      {/* Test Status */}
      <div className="mt-4 md:mt-2 flex flex-col items-center gap-1.5">
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase text-xs">Test Status</p>
        <div className="flex items-center gap-3">
          {isRunning && (
            <span className="size-2 rounded-full bg-[var(--tk-color-secondary-500)] animate-pulse" aria-hidden="true" />
          )}
          <p className="text-lg font-bold text-slate-900 dark:text-white" aria-live="polite">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}
