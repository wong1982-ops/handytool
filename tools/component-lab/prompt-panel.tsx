'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentSettings } from './types'
import { PROMPT_PLACEHOLDERS } from './types'

interface PromptPanelProps {
  prompt: string
  settings: ComponentSettings
  referenceImage: string | null
  generating: boolean
  onPromptChange: (p: string) => void
  onSettingsChange: (s: Partial<ComponentSettings>) => void
  onReferenceChange: (base64: string | null) => void
  onGenerate: () => void
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all min-h-[28px]',
        active
          ? 'bg-[#3D6AF2] text-white'
          : 'bg-[#131a23] text-[#70767f] hover:text-[#a6abb5] hover:bg-[#1a2333]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function PromptPanel({
  prompt,
  settings,
  referenceImage,
  generating,
  onPromptChange,
  onSettingsChange,
  onReferenceChange,
  onGenerate,
}: PromptPanelProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Rotate placeholder every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PROMPT_PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 10 * 1024 * 1024) return // 10MB max

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          // Strip the data URL prefix — keep only the base64 content
          const base64 = result.split(',')[1] ?? result
          onReferenceChange(base64)
        }
      }
      reader.readAsDataURL(file)
    },
    [onReferenceChange],
  )

  const handleDropZoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  return (
    <div className="space-y-5 p-4">
      {/* 1. Component Description */}
      <section>
        <label className="block text-[13px] font-medium text-[#a6abb5] mb-2">
          Component Description
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder={PROMPT_PLACEHOLDERS[placeholderIndex]}
            className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-[13px] px-3.5 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors resize-none leading-relaxed"
          />
        </div>
        <p className="text-[10px] text-[#4a5060] mt-1 text-right">
          {prompt.length}/1000
        </p>
      </section>

      {/* 2. Reference Image */}
      <section>
        <label className="block text-[13px] font-medium text-[#a6abb5] mb-2">
          Reference Image
        </label>

        {referenceImage ? (
          <div className="relative rounded-xl overflow-hidden border border-[#1e2631] bg-[#131a23]">
            {/* Preview the uploaded image using a data URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/jpeg;base64,${referenceImage}`}
              alt="Reference"
              className="w-full h-32 object-cover"
            />
            <button
              type="button"
              onClick={() => onReferenceChange(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Remove reference image"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload reference image"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
            className={[
              'rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors min-h-[44px]',
              isDragOver
                ? 'border-[#3D6AF2] bg-[#3D6AF2]/10'
                : 'border-[#1e2631] bg-[#131a23] hover:border-[#3D6AF2]/50',
            ].join(' ')}
          >
            <svg
              className="w-6 h-6 text-[#70767f]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 19.5h18M3.75 4.5h16.5A.75.75 0 0 1 21 5.25v13.5a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 18.75V5.25A.75.75 0 0 1 3.75 4.5Z"
              />
            </svg>
            <p className="text-xs text-[#70767f] text-center">
              Drop image or click to upload
              <br />
              <span className="text-[10px] text-[#4a5060]">PNG, JPG, GIF · max 10MB</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleDropZoneChange}
              tabIndex={-1}
            />
          </div>
        )}
      </section>

      {/* 3. Settings */}
      <section className="space-y-4">
        <p className="text-[13px] font-medium text-[#a6abb5]">Settings</p>

        {/* Theme */}
        <div>
          <p className="text-[11px] text-[#70767f] mb-1.5">Theme</p>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'both'] as const).map((t) => (
              <PillButton
                key={t}
                active={settings.theme === t}
                onClick={() => onSettingsChange({ theme: t })}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Responsive */}
        <div>
          <p className="text-[11px] text-[#70767f] mb-1.5">Responsive</p>
          <div className="flex gap-2">
            <PillButton
              active={settings.responsive}
              onClick={() => onSettingsChange({ responsive: true })}
            >
              Yes
            </PillButton>
            <PillButton
              active={!settings.responsive}
              onClick={() => onSettingsChange({ responsive: false })}
            >
              No
            </PillButton>
          </div>
        </div>

        {/* Animations */}
        <div>
          <p className="text-[11px] text-[#70767f] mb-1.5">Animations</p>
          <div className="flex flex-wrap gap-2">
            {(['none', 'subtle', 'rich'] as const).map((a) => (
              <PillButton
                key={a}
                active={settings.animations === a}
                onClick={() => onSettingsChange({ animations: a })}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <p className="text-[11px] text-[#70767f] mb-1.5">Accessibility</p>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'standard', label: 'Standard' },
              { id: 'wcag-aa', label: 'WCAG AA' },
            ] as const).map(({ id, label }) => (
              <PillButton
                key={id}
                active={settings.accessibility === id}
                onClick={() => onSettingsChange({ accessibility: id })}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>

        {/* CSS Framework */}
        <div>
          <p className="text-[11px] text-[#70767f] mb-1.5">CSS Framework</p>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'tailwind', label: 'Tailwind' },
              { id: 'vanilla', label: 'Vanilla' },
              { id: 'none', label: 'None' },
            ] as const).map(({ id, label }) => (
              <PillButton
                key={id}
                active={settings.cssFramework === id}
                onClick={() => onSettingsChange({ cssFramework: id })}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={generating || !prompt.trim()}
        className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:from-[#3D79F2] hover:to-[#8B4CF0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {generating ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
              />
            </svg>
            Generate Component
          </>
        )}
      </button>
    </div>
  )
}
