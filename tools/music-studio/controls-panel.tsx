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
  return (
    <div className="space-y-4 p-4">
      {/* BPM */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="mb-1.5 text-xs font-medium text-[#a6abb5]">BPM</label>
          <span className="text-xs font-medium text-white">{config.bpm}</span>
        </div>
        <input
          type="range"
          min={60}
          max={200}
          value={config.bpm}
          onChange={(e) => onConfigChange({ bpm: Number(e.target.value) })}
          className="min-h-[44px] w-full cursor-pointer accent-[#3D6AF2]"
        />
      </div>

      {/* Brightness */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="mb-1.5 text-xs font-medium text-[#a6abb5]">Brightness</label>
          <span className="text-xs font-medium text-white">
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
      </div>

      {/* Density */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="mb-1.5 text-xs font-medium text-[#a6abb5]">Density</label>
          <span className="text-xs font-medium text-white">
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
      </div>

      {/* Scale */}
      <div className="space-y-1">
        <label className="mb-1.5 text-xs font-medium text-[#a6abb5]">Scale</label>
        <select
          value={config.scale}
          onChange={(e) => onConfigChange({ scale: e.target.value })}
          className="min-h-[44px] w-full rounded-lg border border-[#1e2631] bg-[#131a23] px-3 py-2 text-sm text-white outline-none focus:border-[#3D6AF2]"
        >
          {SCALES.map((scale) => (
            <option key={scale} value={scale}>
              {SCALE_LABELS[scale] ?? scale}
            </option>
          ))}
        </select>
      </div>

      {/* Prompt */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="mb-1.5 text-xs font-medium text-[#a6abb5]">Prompt</label>
          <span className="text-xs text-[#70767f]">{customPrompt.length}/300</span>
        </div>
        <textarea
          value={customPrompt}
          onChange={(e) => {
            if (e.target.value.length <= 300) onPromptChange(e.target.value)
          }}
          placeholder="Describe your sound..."
          maxLength={300}
          rows={3}
          className="w-full resize-none rounded-lg border border-[#1e2631] bg-[#131a23] px-3 py-2 text-sm text-white placeholder-[#70767f] outline-none focus:border-[#3D6AF2]"
        />
      </div>
    </div>
  )
}
