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
    <span className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
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
      className={`relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked
          ? 'bg-[#3D6AF2]'
          : 'bg-[#1e2631]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform mt-[3px] ml-[3px] ${
          checked ? 'translate-x-[18px]' : 'translate-x-0'
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
      <div className="space-y-2">
        <SectionLabel>Shape</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map((shape) => {
            const active = config.shape === shape
            return (
              <button
                key={shape}
                type="button"
                onClick={() => onConfigChange({ shape })}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all min-h-[56px] ${
                  active
                    ? 'bg-[#3D6AF2] text-white'
                    : 'bg-[#1e2631] text-[#a6abb5] hover:bg-[#1e2a3a]'
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
      <div className="space-y-2">
        <SectionLabel>Background</SectionLabel>
        <div className="flex gap-1 rounded-lg bg-[#090f16] p-1">
          {BG_TYPES.map(({ value, label }) => {
            const active = config.bgType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onConfigChange({ bgType: value })}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all min-h-[36px] ${
                  active
                    ? 'bg-[#3D6AF2] text-white'
                    : 'text-[#70767f] hover:text-[#a6abb5]'
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
            <span className="text-xs text-[#70767f]">Color</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.bgColor }}>
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => onConfigChange({ bgColor: e.target.value })}
                  className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-[#70767f] font-mono w-16">
                {config.bgColor}
              </span>
            </div>
          </div>
        )}

        {config.bgType === 'gradient' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">From</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.bgGradient.from }}>
                  <input
                    type="color"
                    value={config.bgGradient.from}
                    onChange={(e) =>
                      onConfigChange({
                        bgGradient: { ...config.bgGradient, from: e.target.value },
                      })
                    }
                    className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-[#70767f] font-mono w-16">
                  {config.bgGradient.from}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">To</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.bgGradient.to }}>
                  <input
                    type="color"
                    value={config.bgGradient.to}
                    onChange={(e) =>
                      onConfigChange({
                        bgGradient: { ...config.bgGradient, to: e.target.value },
                      })
                    }
                    className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-[#70767f] font-mono w-16">
                  {config.bgGradient.to}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">Angle</span>
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
                  className="w-24 accent-[#3D6AF2]"
                />
                <span className="text-xs text-[#70767f] font-mono w-10 text-right">
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
          <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.fgColor }}>
            <input
              type="color"
              value={config.fgColor}
              onChange={(e) => onConfigChange({ fgColor: e.target.value })}
              className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-[#70767f] font-mono w-16">
            {config.fgColor}
          </span>
        </div>
      </div>

      {/* Divider before font options */}
      {showFontOptions && <div className="border-t border-[#1e2631]" />}

      {/* Font Options */}
      {showFontOptions && (
        <>
          <div className="space-y-2">
            <SectionLabel>Font</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map(({ value, label }) => {
                const active = config.fontFamily === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onConfigChange({ fontFamily: value })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all min-h-[36px] ${
                      active
                        ? 'bg-[#3D6AF2] text-white'
                        : 'bg-[#1e2631] text-[#a6abb5] hover:bg-[#1e2a3a]'
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
                className="w-24 accent-[#3D6AF2]"
              />
              <span className="text-xs text-[#70767f] font-mono w-10 text-right">
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
            className="w-24 accent-[#3D6AF2]"
          />
          <span className="text-xs text-[#70767f] font-mono w-10 text-right">
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
          <div className="space-y-2 pl-3 border-l-2 border-[#1e2631]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">Color</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.border.color }}>
                  <input
                    type="color"
                    value={config.border.color}
                    onChange={(e) =>
                      onConfigChange({
                        border: { ...config.border, color: e.target.value },
                      })
                    }
                    className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-[#70767f] font-mono w-16">
                  {config.border.color}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">Width</span>
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
                  className="w-24 accent-[#3D6AF2]"
                />
                <span className="text-xs text-[#70767f] font-mono w-10 text-right">
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
          <div className="space-y-2 pl-3 border-l-2 border-[#1e2631]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">Color</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.shadow.color }}>
                  <input
                    type="color"
                    value={config.shadow.color}
                    onChange={(e) =>
                      onConfigChange({
                        shadow: { ...config.shadow, color: e.target.value },
                      })
                    }
                    className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">Blur</span>
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
                  className="w-24 accent-[#3D6AF2]"
                />
                <span className="text-xs text-[#70767f] font-mono w-10 text-right">
                  {config.shadow.blur}px
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#70767f]">Offset Y</span>
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
                  className="w-24 accent-[#3D6AF2]"
                />
                <span className="text-xs text-[#70767f] font-mono w-10 text-right">
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
