'use client'

import { SCALES, SCALE_LABELS, type LyriaConfig } from './types'

interface ControlsPanelProps {
  config: LyriaConfig
  customPrompt: string
  onConfigChange: (partial: Partial<LyriaConfig>) => void
  onPromptChange: (prompt: string) => void
}

export function ControlsPanel({
  config,
  customPrompt,
  onConfigChange,
  onPromptChange,
}: ControlsPanelProps) {
  const GEN_MODES: { value: LyriaConfig['generationMode']; label: string }[] = [
    { value: 'QUALITY', label: 'Quality' },
    { value: 'DIVERSITY', label: 'Diversity' },
    { value: 'VOCALIZATION', label: 'Vocal' },
  ]

  return (
    <div className="space-y-5 p-4">
      {/* BPM */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#a6abb5]">BPM</label>
          <span className="text-xs font-semibold text-white">{config.bpm}</span>
        </div>
        <input
          type="range"
          min={60}
          max={200}
          value={config.bpm}
          onChange={(e) => onConfigChange({ bpm: Number(e.target.value) })}
          className="min-h-[44px] w-full cursor-pointer accent-[#3D6AF2]"
        />
        <div className="flex justify-between text-[10px] text-[#70767f]">
          <span>60</span><span>200</span>
        </div>
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#a6abb5]">Brightness</label>
          <span className="text-xs font-semibold text-white">
            {Math.round(config.brightness * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(config.brightness * 100)}
          onChange={(e) => onConfigChange({ brightness: Number(e.target.value) / 100 })}
          className="min-h-[44px] w-full cursor-pointer accent-[#3D6AF2]"
        />
        <div className="flex justify-between text-[10px] text-[#70767f]">
          <span>Dark</span><span>Bright</span>
        </div>
      </div>

      {/* Density */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#a6abb5]">Density</label>
          <span className="text-xs font-semibold text-white">
            {Math.round(config.density * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(config.density * 100)}
          onChange={(e) => onConfigChange({ density: Number(e.target.value) / 100 })}
          className="min-h-[44px] w-full cursor-pointer accent-[#3D6AF2]"
        />
        <div className="flex justify-between text-[10px] text-[#70767f]">
          <span>Sparse</span><span>Dense</span>
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a6abb5]">Scale</label>
        <select
          value={config.scale}
          onChange={(e) => onConfigChange({ scale: e.target.value })}
          className="min-h-[44px] w-full cursor-pointer rounded-lg border border-[#1e2631] bg-[#0d1117] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#3D6AF2]"
        >
          {SCALES.map((scale) => (
            <option key={scale} value={scale}>
              {SCALE_LABELS[scale] ?? scale}
            </option>
          ))}
        </select>
      </div>

      {/* Generation Mode */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a6abb5]">Generation Mode</label>
        <div className="flex gap-1 rounded-lg bg-[#0d1117] border border-[#1e2631] p-1">
          {GEN_MODES.map((gm) => (
            <button
              key={gm.value}
              type="button"
              onClick={() => onConfigChange({ generationMode: gm.value })}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                config.generationMode === gm.value
                  ? 'bg-[#3D6AF2] text-white'
                  : 'text-[#70767f] hover:text-white'
              }`}
            >
              {gm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#a6abb5]">Custom Prompt</label>
          <span className="text-[10px] text-[#70767f]">{customPrompt.length}/300</span>
        </div>
        <textarea
          value={customPrompt}
          onChange={(e) => {
            if (e.target.value.length <= 300) onPromptChange(e.target.value)
          }}
          placeholder="Describe your sound..."
          maxLength={300}
          rows={3}
          className="w-full resize-none rounded-lg border border-[#1e2631] bg-[#0d1117] px-3 py-2.5 text-sm leading-relaxed text-white placeholder-[#70767f] outline-none transition-colors focus:border-[#3D6AF2]"
        />
      </div>

      {/* Mute toggles */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a6abb5]">Mute</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onConfigChange({ muteDrums: !config.muteDrums })}
            className={`min-h-[44px] flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              config.muteDrums
                ? 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]'
                : 'border-[#1e2631] bg-[#0d1117] text-[#70767f] hover:text-white'
            }`}
          >
            🥁 Drums
          </button>
          <button
            type="button"
            onClick={() => onConfigChange({ muteBass: !config.muteBass })}
            className={`min-h-[44px] flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              config.muteBass
                ? 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]'
                : 'border-[#1e2631] bg-[#0d1117] text-[#70767f] hover:text-white'
            }`}
          >
            🎵 Bass
          </button>
        </div>
      </div>
    </div>
  )
}
