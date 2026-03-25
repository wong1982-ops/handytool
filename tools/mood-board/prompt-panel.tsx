'use client'

import { useState, useRef } from 'react'

interface PromptPanelProps {
  theme: string
  generating: boolean
  addingMore: boolean
  elementCount: number
  maxElements: number
  hasElements: boolean
  paletteColors: string[]
  error: string | null
  onGenerate: (theme: string) => void
  onAddMore: (prompt: string) => void
  onAddText: () => void
  onAddSwatch: (color: string) => void
  onUploadImage: (file: File) => void
}

export function PromptPanel({
  theme: initialTheme,
  generating,
  addingMore,
  elementCount,
  maxElements,
  hasElements,
  paletteColors,
  error,
  onGenerate,
  onAddMore,
  onAddText,
  onAddSwatch,
  onUploadImage,
}: PromptPanelProps) {
  const [themeInput, setThemeInput] = useState(initialTheme)
  const [addMoreInput, setAddMoreInput] = useState('')
  const [swatchColor, setSwatchColor] = useState('#3D6AF2')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = () => {
    const trimmed = themeInput.trim()
    if (!trimmed) return
    onGenerate(trimmed)
  }

  const handleAddMore = () => {
    const trimmed = addMoreInput.trim()
    if (!trimmed) return
    onAddMore(trimmed)
    setAddMoreInput('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUploadImage(file)
      e.target.value = ''
    }
  }

  return (
    <aside className="flex flex-col gap-5 p-4 h-full overflow-y-auto">
      {/* Section 1: Theme input */}
      <section>
        <label className="block text-xs font-medium text-[#a6abb5] mb-1.5">
          Theme
        </label>
        <input
          type="text"
          value={themeInput}
          onChange={(e) => setThemeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !generating) handleGenerate()
          }}
          placeholder="Describe your mood..."
          disabled={generating}
          className="w-full min-h-[44px] rounded-xl bg-[#131a23] border border-[#1e2631] px-3 py-2 text-sm text-white placeholder-[#70767f] outline-none focus:border-[#3D6AF2] transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleGenerate}
          disabled={generating || !themeInput.trim()}
          className="mt-2 w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="32"
                  strokeLinecap="round"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              {/* Sparkle icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
              </svg>
              Generate
            </>
          )}
        </button>
      </section>

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Section 2: Add more (visible when hasElements) */}
      {hasElements && (
        <section>
          <label className="block text-xs font-medium text-[#a6abb5] mb-1.5">
            Add More Elements
          </label>
          <textarea
            value={addMoreInput}
            onChange={(e) => setAddMoreInput(e.target.value)}
            placeholder="Add more elements..."
            disabled={addingMore}
            rows={3}
            className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] px-3 py-2 text-sm text-white placeholder-[#70767f] outline-none focus:border-[#3D6AF2] transition-colors resize-none disabled:opacity-50"
          />
          <button
            onClick={handleAddMore}
            disabled={addingMore || !addMoreInput.trim()}
            className="mt-2 w-full min-h-[44px] rounded-xl bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {addingMore ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="32"
                    strokeLinecap="round"
                  />
                </svg>
                Adding...
              </>
            ) : (
              <>
                Add
                <span className="inline-flex items-center rounded-full bg-[#7C3AED]/30 text-[#c084fc] text-xs px-2 py-0.5 font-medium">
                  1 credit
                </span>
              </>
            )}
          </button>
        </section>
      )}

      {/* Section 3: Manual additions */}
      <section>
        <label className="block text-xs font-medium text-[#a6abb5] mb-1.5">
          Manual Additions
        </label>
        <div className="flex flex-col gap-2">
          {/* Add Text Note */}
          <button
            onClick={onAddText}
            className="w-full min-h-[44px] rounded-lg bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-2"
          >
            {/* Text icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
            </svg>
            Add Text Note
          </button>

          {/* Color swatch */}
          <div className="flex gap-2">
            <input
              type="color"
              value={swatchColor}
              onChange={(e) => setSwatchColor(e.target.value)}
              className="h-[44px] w-[44px] rounded-lg border border-[#1e2631] bg-[#131a23] cursor-pointer p-1"
            />
            <button
              onClick={() => onAddSwatch(swatchColor)}
              className="flex-1 min-h-[44px] rounded-lg bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-2"
            >
              {/* Swatch icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
              Add Swatch
            </button>
          </div>

          {/* Upload Image */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[44px] rounded-lg bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-2"
          >
            {/* Upload icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Image
          </button>
        </div>
      </section>

      {/* Section 4: Cross-tool links */}
      {paletteColors.length > 0 && (
        <section>
          <label className="block text-xs font-medium text-[#a6abb5] mb-1.5">
            Open in Other Tools
          </label>
          <div className="flex flex-col gap-2">
            <a
              href={`/tools/color-palette#${paletteColors.join('-')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] rounded-lg bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-2"
            >
              {/* Palette icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="8" r="2" fill="currentColor" />
                <circle cx="8" cy="14" r="2" fill="currentColor" />
                <circle cx="16" cy="14" r="2" fill="currentColor" />
              </svg>
              Open in Color Palette
              <span className="ml-auto text-[#70767f]">&rarr;</span>
            </a>
            <a
              href="/tools/font-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] rounded-lg bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-2"
            >
              {/* Font icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7V4h16v3" />
                <path d="M9 20h6" />
                <path d="M12 4v16" />
              </svg>
              Open in Font Generator
              <span className="ml-auto text-[#70767f]">&rarr;</span>
            </a>
            <a
              href="/tools/logo-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] rounded-lg bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-2"
            >
              {/* Logo icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Open in Logo Generator
              <span className="ml-auto text-[#70767f]">&rarr;</span>
            </a>
          </div>
        </section>
      )}

      {/* Section 5: Element count */}
      <div className="mt-auto pt-3 border-t border-[#1e2631]">
        <p className="text-xs text-[#70767f] text-center">
          {elementCount}/{maxElements} elements
        </p>
      </div>
    </aside>
  )
}
