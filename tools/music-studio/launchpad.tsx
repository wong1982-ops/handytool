'use client'

import { MODE_PRESETS, INSTRUMENTS, type StudioMode } from './types'

interface LaunchpadProps {
  mode: StudioMode
  activeButtons: Set<string>
  activeInstruments: Set<string>
  onToggleButton: (id: string) => void
  onToggleInstrument: (id: string) => void
  onModeChange: (mode: StudioMode) => void
}

const MODES: { value: StudioMode; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'jingles', label: 'Jingles' },
  { value: 'sfx', label: 'SFX' },
]

export function Launchpad({
  mode,
  activeButtons,
  activeInstruments,
  onToggleButton,
  onToggleInstrument,
  onModeChange,
}: LaunchpadProps) {
  const presets = MODE_PRESETS[mode]

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1.5 rounded-xl bg-[#131a23] p-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onModeChange(m.value)}
            className={`min-h-[44px] flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              mode === m.value
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] text-[#70767f] hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Genre/mood grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {presets.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => onToggleButton(btn.id)}
            className={`relative h-12 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br ${btn.gradient} transition-shadow ${
              activeButtons.has(btn.id)
                ? 'shadow-[0_0_0_3px_#3D6AF2,0_0_15px_rgba(61,106,242,0.4)]'
                : ''
            }`}
          >
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-medium text-white">
              <span>{btn.emoji}</span>
              <span>{btn.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Instrument row */}
      <div className="flex flex-wrap gap-2">
        {INSTRUMENTS.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => onToggleInstrument(inst.id)}
            className={`min-h-[44px] cursor-pointer rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
              activeInstruments.has(inst.id)
                ? 'bg-[#3D6AF2]/20 text-[#3D6AF2] ring-1 ring-[#3D6AF2]/30'
                : 'bg-[#131a23] text-[#70767f] hover:text-white'
            }`}
          >
            {inst.emoji} {inst.label}
          </button>
        ))}
      </div>
    </div>
  )
}
