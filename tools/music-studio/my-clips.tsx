'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ClipEntry {
  id: string
  name: string
  duration_seconds: number
  format: string
  clip_url: string
  mode: string | null
  prompt_summary: string | null
  created_at: string
}

interface MyClipsProps {
  visible: boolean
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function MyClips({ visible }: MyClipsProps) {
  const [entries, setEntries] = useState<ClipEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasFetched = useRef(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/music-studio/history')
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
    if (visible && !hasFetched.current) {
      hasFetched.current = true
      fetchHistory()
    }
  }, [visible, fetchHistory])

  const togglePlay = useCallback((entry: ClipEntry) => {
    if (playingId === entry.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(entry.clip_url)
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
    audio.play()
    audioRef.current = audio
    setPlayingId(entry.id)
  }, [playingId])

  if (!visible) return null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#3D6AF2]/30 border-t-[#3D6AF2] rounded-full animate-spin" />
        <p className="text-sm text-[#70767f]">Loading your clips...</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
        </div>
        <p className="text-white font-semibold">No saved clips yet</p>
        <p className="text-sm text-[#70767f] max-w-xs">Record and download clips to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isPlaying = playingId === entry.id

        return (
          <div
            key={entry.id}
            className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 flex items-center gap-3"
          >
            {/* Play button */}
            <button
              type="button"
              onClick={() => togglePlay(entry)}
              className="w-10 h-10 shrink-0 rounded-lg bg-[#3D6AF2]/10 hover:bg-[#3D6AF2]/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-[#3D6AF2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#3D6AF2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{entry.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#70767f] font-mono">
                  {formatDuration(entry.duration_seconds)}
                </span>
                {entry.mode && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#3D6AF2]/10 text-[#3D6AF2] capitalize">
                    {entry.mode}
                  </span>
                )}
                <span className="text-[10px] text-[#70767f]">
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Download link */}
            <a
              href={entry.clip_url}
              download
              className="w-8 h-8 shrink-0 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Download clip"
            >
              <svg className="w-4 h-4 text-[#70767f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          </div>
        )
      })}
    </div>
  )
}
