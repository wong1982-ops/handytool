'use client'

import { useRef, useCallback } from 'react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  lineCount: number
}

export function CodeEditor({ value, onChange, readOnly = false, placeholder, lineCount }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Line Numbers Gutter */}
      <div
        ref={gutterRef}
        className="w-12 shrink-0 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center py-4 font-mono text-xs text-slate-300 dark:text-slate-600 select-none overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <span key={i} className="leading-[1.625rem]">{i + 1}</span>
        ))}
      </div>

      {/* Editor Area */}
      {readOnly ? (
        <pre className="flex-1 p-4 font-mono text-sm overflow-auto text-slate-700 dark:text-slate-300 whitespace-pre leading-[1.625rem]">
          {value}
        </pre>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 p-4 font-mono text-sm bg-transparent border-none focus:ring-0 resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none leading-[1.625rem]"
        />
      )}
    </div>
  )
}
