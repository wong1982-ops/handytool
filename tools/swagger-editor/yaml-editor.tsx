'use client'

import { useRef, useCallback } from 'react'

interface YamlEditorProps {
  value: string
  onChange: (value: string) => void
  isValid: boolean | null
  validationLabel: string
  lineCount: number
  cursorLine: number
  cursorCol: number
}

export function YamlEditor({
  value,
  onChange,
  isValid,
  validationLabel,
  lineCount,
  cursorLine,
  cursorCol,
}: YamlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  return (
    <section className="flex-1 flex flex-col bg-[#1a1b26] min-w-0">
      {/* File tab header */}
      <div className="h-10 bg-[#15161e] flex items-center px-4 justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--ht-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-mono text-[#c0caf5]">openapi.yaml</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#565f89] font-mono">YAML 1.2</span>
          <svg className="w-3.5 h-3.5 text-[#565f89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex font-mono text-sm leading-relaxed overflow-hidden relative">
        {/* Line numbers gutter */}
        <div
          ref={gutterRef}
          className="w-12 bg-[#15161e] flex flex-col items-end py-4 pr-3 text-[#4b5563] select-none overflow-hidden shrink-0"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className={`leading-relaxed text-xs ${cursorLine === i + 1 ? 'text-[#c0caf5]' : ''}`}
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="flex-1 bg-transparent text-[#c0caf5] p-4 resize-none outline-none leading-relaxed overflow-y-auto"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="OpenAPI YAML editor"
        />
      </div>

      {/* Status bar */}
      <div className="h-8 bg-[#15161e] border-t border-white/5 flex items-center px-4 justify-between text-[11px] font-mono text-[#565f89] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {isValid === true && (
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
            {isValid === false && (
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            )}
            <span>{validationLabel}</span>
          </div>
          <span>Ln {cursorLine}, Col {cursorCol}</span>
          <span>Spaces: 2</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-[#c0caf5] cursor-pointer">UTF-8</span>
          <span className="hover:text-[#c0caf5] cursor-pointer">YAML</span>
        </div>
      </div>
    </section>
  )
}
