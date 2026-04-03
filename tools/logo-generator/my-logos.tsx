'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LogoConcept } from './types'

interface LogoEntry {
  id: string
  business_name: string
  tagline: string | null
  industry: string | null
  style: string
  colors: string[]
  concepts: LogoConcept[]
  selected_index: number | null
  created_at: string
}

interface MyLogosProps {
  onLoadProject: (entry: LogoEntry) => void
}

export function MyLogos({ onLoadProject }: MyLogosProps) {
  const [entries, setEntries] = useState<LogoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/logo-generator/history')
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
        <p className="text-sm text-[#70767f]">Loading your logos...</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
          </svg>
        </div>
        <p className="text-white font-semibold">No logos yet</p>
        <p className="text-sm text-[#70767f] max-w-xs">Generate your first logo and it will appear here automatically.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => {
        const preview = entry.selected_index !== null
          ? entry.concepts[entry.selected_index]
          : entry.concepts[0]

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onLoadProject(entry)}
            className="bg-[#131a23] rounded-2xl overflow-hidden border border-[#1e2631] hover:border-[#3D6AF2]/40 transition-all group cursor-pointer text-left"
          >
            {/* Preview image area */}
            <div
              className="h-32 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0d1829 0%, #1a1040 100%)' }}
            >
              {preview?.imageUrl ? (
                <img
                  src={preview.imageUrl}
                  alt={entry.business_name}
                  className="w-20 h-20 rounded-xl object-contain bg-white"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-[#3D6AF2]/20 flex items-center justify-center">
                  <svg className="w-9 h-9 text-[#3D6AF2]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Card content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {entry.business_name}
                  </p>
                  {entry.tagline && (
                    <p className="text-[#70767f] text-xs truncate">{entry.tagline}</p>
                  )}
                </div>
                <span
                  className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full text-[#3D6AF2] capitalize"
                  style={{ background: 'rgba(61,106,242,0.15)', border: '1px solid rgba(61,106,242,0.3)' }}
                >
                  {entry.style}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-[#70767f] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-medium text-[#3D6AF2] group-hover:text-white transition-colors flex items-center gap-1 min-h-[32px]">
                  Load
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
