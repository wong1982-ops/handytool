'use client'

import { FaviconConfig } from './types'
import StyleControls from './style-controls'

interface TextTabProps {
  config: FaviconConfig
  onConfigChange: (updates: Partial<FaviconConfig>) => void
}

export default function TextTab({ config, onConfigChange }: TextTabProps) {
  const text = config.text ?? ''

  return (
    <div className="rounded-xl border border-[#1e2631] bg-[#131a23] p-5 space-y-5">
      {/* Text input */}
      <div className="space-y-2">
        <label
          htmlFor="favicon-text"
          className="block text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]"
        >
          Text / Emoji
        </label>
        <input
          id="favicon-text"
          type="text"
          value={text}
          maxLength={10}
          onChange={(e) =>
            onConfigChange({ mode: 'text', text: e.target.value })
          }
          placeholder="A"
          className="w-full rounded-lg border border-[#1e2631] bg-[#090f16] px-4 py-3 text-center text-2xl font-bold text-white placeholder-[#70767f] focus:border-[#3D6AF2] focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/20 transition-all"
        />
        {text.length > 3 && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Best results with 1-3 characters
          </p>
        )}
      </div>

      {/* Style controls with font options */}
      <StyleControls
        config={config}
        onConfigChange={(updates) =>
          onConfigChange({ mode: 'text', ...updates })
        }
        showFontOptions
      />
    </div>
  )
}
