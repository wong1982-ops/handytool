'use client'

export interface Adjustments {
  brightness: number
  contrast: number
  saturate: number
  hueRotate: number
}

export type FilterPreset = 'none' | 'grayscale' | 'sepia' | 'blur' | 'invert' | 'warm'

interface AdjustmentsPanelProps {
  adjustments: Adjustments
  onAdjustmentsChange: (adj: Adjustments) => void
  activeFilter: FilterPreset
  onFilterChange: (filter: FilterPreset) => void
  zoom: number
  onZoomChange: (z: number) => void
  imageSize: { width: number; height: number } | null
}

const FILTERS: { id: FilterPreset; label: string }[] = [
  { id: 'none', label: 'Natural' },
  { id: 'blur', label: 'Soft Focus' },
  { id: 'grayscale', label: 'Grayscale' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'invert', label: 'Invert' },
  { id: 'warm', label: 'Warm' },
]

export function AdjustmentsPanel({
  adjustments,
  onAdjustmentsChange,
  activeFilter,
  onFilterChange,
  zoom,
  onZoomChange,
  imageSize,
}: AdjustmentsPanelProps) {
  const updateAdj = (key: keyof Adjustments, value: number) => {
    onAdjustmentsChange({ ...adjustments, [key]: value })
  }

  return (
    <div className="flex flex-col">
      {/* Adjustments */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Adjustments
        </h3>
        <div className="space-y-4">
          <SliderControl label="Brightness" value={adjustments.brightness} min={-100} max={100} onChange={(v) => updateAdj('brightness', v)} />
          <SliderControl label="Contrast" value={adjustments.contrast} min={-100} max={100} onChange={(v) => updateAdj('contrast', v)} />
          <SliderControl label="Saturate" value={adjustments.saturate} min={-100} max={100} onChange={(v) => updateAdj('saturate', v)} />
          <SliderControl label="Hue Rotate" value={adjustments.hueRotate} min={0} max={360} suffix="°" onChange={(v) => updateAdj('hueRotate', v)} />
        </div>
      </div>

      {/* Filter Gallery */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Filter Gallery
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`p-2 rounded-lg text-center transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'ring-2 ring-[var(--ht-color-primary-500)] bg-[var(--ht-color-primary-500)]/10'
                  : 'hover:bg-slate-800'
              }`}
            >
              <div className="w-full aspect-square rounded bg-slate-700 mb-1.5 overflow-hidden flex items-center justify-center text-[10px] text-slate-400 font-mono">
                {f.id === 'none' ? 'Original' : f.label}
              </div>
              <span className="text-[10px] text-slate-400">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zoom */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Zoom</h3>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min={25}
            max={300}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-primary-500)]"
            aria-label="Zoom level"
          />
          <span className="text-[10px] text-slate-400 w-8 text-right">{zoom}%</span>
        </div>
      </div>

      {/* Image info */}
      {imageSize && (
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Image Info</h3>
          <p className="text-[11px] text-slate-400">{imageSize.width} × {imageSize.height} px</p>
        </div>
      )}
    </div>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-[var(--ht-color-primary-500)] font-bold">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-primary-500)]"
        aria-label={label}
      />
    </div>
  )
}

export { FILTERS }
