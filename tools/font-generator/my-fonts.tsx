'use client'

import { useState, useEffect, useCallback } from 'react'

interface FontEntry {
  id: string
  project_id: string
  style_preset: string | null
  custom_prompt: string | null
  colors: string[]
  color_mode: string
  characters: { char: string; imageUrl: string; svgUrl?: string | null }[]
  created_at: string
}

interface MyFontsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoadProject: (entry: any) => void
}

export function MyFonts({ onLoadProject }: MyFontsProps) {
  const [entries, setEntries] = useState<FontEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/font-generator/history')
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load history')
        return
      }
      setEntries(json.data?.entries ?? [])
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#3D6AF2]/30 border-t-[#3D6AF2] rounded-full animate-spin" />
        <p className="text-sm text-[#70767f]">Loading your fonts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={fetchHistory}
          className="text-sm text-[#3D6AF2] font-medium hover:underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#3D6AF2]/10 flex items-center justify-center mb-1">
          <svg className="w-7 h-7 text-[#3D6AF2]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </div>
        <p className="text-white font-semibold">No fonts yet</p>
        <p className="text-sm text-[#70767f] max-w-xs">Generate your first font and it will appear here automatically.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const preview = entry.characters?.[0]
        const styleName = entry.style_preset
          ? entry.style_preset.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : 'Custom'

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onLoadProject(entry)}
            className="w-full rounded-xl bg-[#131a23] hover:bg-[#1e2631] border border-[#1e2631] hover:border-[#3D6AF2]/30 transition-all p-4 text-left cursor-pointer group"
          >
            <div className="flex gap-4">
              {/* Preview thumbnail */}
              {preview?.imageUrl && (
                <img
                  src={preview.imageUrl}
                  alt={styleName}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 bg-white"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate group-hover:text-[#3D6AF2] transition-colors">
                  {styleName}
                </p>
                <p className="text-[#70767f] text-xs mt-0.5">
                  {entry.characters?.length ?? 0} characters &middot;{' '}
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                {/* Color dots */}
                <div className="flex gap-1 mt-2">
                  {(entry.colors || []).slice(0, 5).map((c, i) => (
                    <span key={i} className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
