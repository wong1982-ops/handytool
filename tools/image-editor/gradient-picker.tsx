'use client'

interface GradientPickerProps {
  type: 'linear' | 'radial'
  angle: number
  colorStart: string
  colorEnd: string
  onTypeChange: (type: 'linear' | 'radial') => void
  onAngleChange: (angle: number) => void
  onColorStartChange: (color: string) => void
  onColorEndChange: (color: string) => void
}

export function GradientPicker({
  type,
  angle,
  colorStart,
  colorEnd,
  onTypeChange,
  onAngleChange,
  onColorStartChange,
  onColorEndChange,
}: GradientPickerProps) {
  return (
    <div className="p-3 space-y-3 w-56">
      {/* Type toggle */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
        <button
          onClick={() => onTypeChange('linear')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            type === 'linear' ? 'bg-[var(--tk-color-primary-500)] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => onTypeChange('radial')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            type === 'radial' ? 'bg-[var(--tk-color-primary-500)] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Radial
        </button>
      </div>

      {/* Preview */}
      <div
        className="w-full h-8 rounded-lg border border-slate-700"
        style={{
          background: type === 'linear'
            ? `linear-gradient(${angle}deg, ${colorStart}, ${colorEnd})`
            : `radial-gradient(circle, ${colorStart}, ${colorEnd})`,
        }}
      />

      {/* Angle (linear only) */}
      {type === 'linear' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 w-10">Angle</label>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--tk-color-primary-500)]"
          />
          <input
            type="number"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
            className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-white text-center"
          />
        </div>
      )}

      {/* Color stops */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 w-10">Start</label>
        <label className="flex-1 h-7 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: colorStart }}>
          <input type="color" value={colorStart} onChange={(e) => onColorStartChange(e.target.value)} className="sr-only" />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 w-10">End</label>
        <label className="flex-1 h-7 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: colorEnd }}>
          <input type="color" value={colorEnd} onChange={(e) => onColorEndChange(e.target.value)} className="sr-only" />
        </label>
      </div>
    </div>
  )
}
