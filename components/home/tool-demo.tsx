'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const DEMO_TOOLS = [
  {
    id: 'ipcheck',
    label: 'IP Check',
    placeholder: '8.8.8.8',
    href: '/tools/ipcheck',
    mock: (v: string) => (v ? '\u{1F4CD} Mountain View, US \u00B7 Google LLC' : null),
  },
  {
    id: 'story-studio',
    label: 'Story Studio',
    placeholder: 'A brave kitten finds a magic door...',
    href: '/tools/story-studio',
    mock: (v: string) => (v ? '\u2728 Story concept ready \u00B7 8 pages \u00B7 Illustrated' : null),
  },
  {
    id: 'json-converter',
    label: 'JSON',
    placeholder: '{"key": "value"}',
    href: '/tools/json-converter',
    mock: (v: string) => {
      try {
        JSON.parse(v)
        return '\u2713 Valid JSON \u00B7 Beautified'
      } catch {
        return v ? '\u2717 Invalid JSON' : null
      }
    },
  },
  {
    id: 'currency-exchange',
    label: 'Currency',
    placeholder: '100',
    href: '/tools/currency-exchange',
    mock: (v: string) =>
      v ? `\u{1F4B1} ${v} USD \u2248 ${(Number(v) * 1.53).toFixed(2)} AUD` : null,
  },
  {
    id: 'color-palette',
    label: 'Colors',
    placeholder: '#3D6AF2',
    href: '/tools/color-palette',
    mock: (v: string) =>
      v?.startsWith('#') ? '\u{1F3A8} Analogous \u00B7 Triadic \u00B7 Complementary' : null,
  },
]

export function ToolDemo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)

  const activeTool = DEMO_TOOLS[activeIndex]

  // Auto-rotation
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_TOOLS.length)
      setInput('')
      setResult(null)
    }, 5000)
    return () => clearInterval(interval)
  }, [paused])

  const handleGo = useCallback(() => {
    setResult(DEMO_TOOLS[activeIndex].mock(input))
  }, [activeIndex, input])

  const handleToolChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = DEMO_TOOLS.findIndex((t) => t.id === e.target.value)
    if (idx >= 0) {
      setActiveIndex(idx)
      setInput('')
      setResult(null)
    }
  }, [])

  return (
    <div
      className="flex flex-col items-center gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className="text-slate-500 dark:text-slate-400 text-sm">Try</span>
        <select
          value={activeTool.id}
          onChange={handleToolChange}
          className="rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] min-h-[44px]"
        >
          {DEMO_TOOLS.map((tool) => (
            <option key={tool.id} value={tool.id} className="bg-slate-900 text-white">
              {tool.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setPaused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGo()
          }}
          placeholder={activeTool.placeholder}
          className="rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm px-3 py-2 w-48 sm:w-64 outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[44px]"
        />
        <button
          onClick={handleGo}
          className="rounded-lg bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white px-4 py-2 text-sm font-medium transition-colors min-h-[44px] cursor-pointer"
        >
          Go &rarr;
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-white/10 backdrop-blur border border-slate-200 dark:border-white/10 rounded-xl px-6 py-3 animate-slide-up">
          <p className="text-slate-900 dark:text-white text-sm font-mono">{result}</p>
          <Link
            href={activeTool.href}
            className="text-xs text-[var(--tk-color-primary-400)] mt-1 inline-block hover:underline"
          >
            Open tool &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
