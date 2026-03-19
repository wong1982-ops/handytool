'use client'

import { FaviconConfig, FaviconShape, BgType, FontFamily, SHAPE_LABELS } from './types'

interface StyleControlsProps {
  config: FaviconConfig
  onConfigChange: (updates: Partial<FaviconConfig>) => void
  showFontOptions?: boolean
}

const SHAPES: FaviconShape[] = ['circle', 'square', 'rounded', 'hexagon']
const BG_TYPES: { value: BgType; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'transparent', label: 'Transparent' },
]
const FONTS: { value: FontFamily; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'handwritten', label: 'Hand' },
]

const SHAPE_ICONS: Record<FaviconShape, React.ReactNode> = {
  circle: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  square: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  rounded: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  hexagon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {children}
    </span>
  )
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked
          ? 'bg-[var(--tk-color-primary-500,#3D6AF2)]'
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function StyleControls({
  config,
  onConfigChange,
  showFontOptions = false,
}: StyleControlsProps) {
  return (
    <div className="space-y-4">
      {/* Shape */}
      <div className="space-y-1.5">
        <SectionLabel>Shape</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map((shape) => {
            const active = config.shape === shape
            return (
              <button
                key={shape}
                type="button"
                onClick={() => onConfigChange({ shape })}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors min-h-[44px] ${
                  active
                    ? 'bg-[var(--tk-color-primary-500,#3D6AF2)] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-pressed={active}
              >
                {SHAPE_ICONS[shape]}
                <span>{SHAPE_LABELS[shape]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-1.5">
        <SectionLabel>Background</SectionLabel>
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          {BG_TYPES.map(({ value, label }) => {
            const active = config.bgType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onConfigChange({ bgType: value })}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors min-h-[44px] ${
                  active
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                aria-pressed={active}
              >
                {label}
              </button>
            )
          })}
        </div>

        {config.bgType === 'solid' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.bgColor}
                onChange={(e) => onConfigChange({ bgColor: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">
                {config.bgColor}
              </span>
            </div>
          </div>
        )}

        {config.bgType === 'gradient' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.bgGradient.from}
                  onChange={(e) =>
                    onConfigChange({
                      bgGradient: { ...config.bgGradient, from: e.target.value },
                    })
                  }
                  className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">
                  {config.bgGradient.from}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.bgGradient.to}
                  onChange={(e) =>
                    onConfigChange({
                      bgGradient: { ...config.bgGradient, to: e.target.value },
                    })
                  }
                  className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">
                  {config.bgGradient.to}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Angle</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={config.bgGradient.angle}
                  onChange={(e) =>
                    onConfigChange({
                      bgGradient: {
                        ...config.bgGradient,
                        angle: Number(e.target.value),
                      },
                    })
                  }
                  className="w-24 accent-[var(--tk-color-primary-500,#3D6AF2)]"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">
                  {config.bgGradient.angle}&deg;
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Foreground Color */}
      <div className="flex items-center justify-between">
        <SectionLabel>Foreground Color</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.fgColor}
            onChange={(e) => onConfigChange({ fgColor: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">
            {config.fgColor}
          </span>
        </div>
      </div>

      {/* Font Options */}
      {showFontOptions && (
        <>
          <div className="space-y-1.5">
            <SectionLabel>Font</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map(({ value, label }) => {
                const active = config.fontFamily === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onConfigChange({ fontFamily: value })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] ${
                      active
                        ? 'bg-[var(--tk-color-primary-500,#3D6AF2)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <SectionLabel>Font Size</SectionLabel>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={50}
                max={100}
                value={config.fontSize}
                onChange={(e) =>
                  onConfigChange({ fontSize: Number(e.target.value) })
                }
                className="w-24 accent-[var(--tk-color-primary-500,#3D6AF2)]"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">
                {config.fontSize}%
              </span>
            </div>
          </div>
        </>
      )}

      {/* Padding */}
      <div className="flex items-center justify-between">
        <SectionLabel>Padding</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={40}
            value={config.padding}
            onChange={(e) => onConfigChange({ padding: Number(e.target.value) })}
            className="w-24 accent-[var(--tk-color-primary-500,#3D6AF2)]"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">
            {config.padding}%
          </span>
        </div>
      </div>

      {/* Border */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionLabel>Border</SectionLabel>
          <ToggleSwitch
            checked={config.border.enabled}
            onChange={(enabled) =>
              onConfigChange({ border: { ...config.border, enabled } })
            }
          />
        </div>
        {config.border.enabled && (
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.border.color}
                  onChange={(e) =>
                    onConfigChange({
                      border: { ...config.border, color: e.target.value },
                    })
                  }
                  className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">
                  {config.border.color}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Width</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={config.border.width}
                  onChange={(e) =>
                    onConfigChange({
                      border: { ...config.border, width: Number(e.target.value) },
                    })
                  }
                  className="w-24 accent-[var(--tk-color-primary-500,#3D6AF2)]"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">
                  {config.border.width}px
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shadow */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionLabel>Shadow</SectionLabel>
          <ToggleSwitch
            checked={config.shadow.enabled}
            onChange={(enabled) =>
              onConfigChange({ shadow: { ...config.shadow, enabled } })
            }
          />
        </div>
        {config.shadow.enabled && (
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.shadow.color}
                  onChange={(e) =>
                    onConfigChange({
                      shadow: { ...config.shadow, color: e.target.value },
                    })
                  }
                  className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Blur</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={config.shadow.blur}
                  onChange={(e) =>
                    onConfigChange({
                      shadow: { ...config.shadow, blur: Number(e.target.value) },
                    })
                  }
                  className="w-24 accent-[var(--tk-color-primary-500,#3D6AF2)]"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">
                  {config.shadow.blur}px
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Offset Y</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={config.shadow.offsetY}
                  onChange={(e) =>
                    onConfigChange({
                      shadow: {
                        ...config.shadow,
                        offsetY: Number(e.target.value),
                      },
                    })
                  }
                  className="w-24 accent-[var(--tk-color-primary-500,#3D6AF2)]"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">
                  {config.shadow.offsetY}px
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
