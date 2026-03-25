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
    <div className="space-y-4">
      {entries.map((entry) => {
        const preview = entry.selected_index !== null
          ? entry.concepts[entry.selected_index]
          : entry.concepts[0]
        const thumbnails = entry.concepts.slice(0, 4)

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onLoadProject(entry)}
            className="w-full rounded-xl bg-[#131a23] hover:bg-[#1e2631] border border-[#1e2631] hover:border-[#3D6AF2]/30 transition-all p-4 text-left cursor-pointer group"
          >
            <div className="flex gap-4">
              {/* Main preview */}
              {preview?.imageUrl && (
                <img
                  src={preview.imageUrl}
                  alt={entry.business_name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 bg-white"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate group-hover:text-[#3D6AF2] transition-colors">
                  {entry.business_name}
                </p>
                <p className="text-[#70767f] text-xs mt-0.5">
                  {entry.style} &middot; {entry.concepts.length} concepts &middot;{' '}
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

            {/* Thumbnail strip */}
            {thumbnails.length > 1 && (
              <div className="flex gap-1.5 mt-3">
                {thumbnails.map((concept, i) => (
                  <img
                    key={i}
                    src={concept.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover bg-white opacity-60 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                ))}
                {entry.concepts.length > 4 && (
                  <span className="w-10 h-10 rounded-md bg-[#1e2631] flex items-center justify-center text-[10px] text-[#70767f] font-bold">
                    +{entry.concepts.length - 4}
                  </span>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
