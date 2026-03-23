'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SketchMode } from './types'

interface Creation {
  id: string
  title: string
  original_sketch_url: string
  result_image_url: string
  style: string
  created_at: string
}

interface MyCreationsProps {
  mode: SketchMode
  visible: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function MyCreations({ mode, visible }: MyCreationsProps) {
  const isFun = mode === 'fun'
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchCreations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/sketch-to-art/gallery/me')
      if (!res.ok) {
        if (res.status === 401) {
          setCreations([])
          return
        }
        throw new Error('Failed to load')
      }
      const json = await res.json()
      setCreations(json.data?.entries || [])
    } catch {
      setError('Failed to load your creations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (visible) fetchCreations()
  }, [visible, fetchCreations])

  const selected = creations.find((c) => c.id === selectedId)

  if (!visible) return null

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          type="button"
          onClick={fetchCreations}
          className="min-h-[44px] px-4 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (creations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">{isFun ? '🎨' : '📁'}</div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isFun ? 'No creations yet — make some magic!' : 'No creations yet. Generate your first artwork.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Grid of creations */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {creations.map((creation) => (
          <button
            key={creation.id}
            type="button"
            onClick={() => setSelectedId(creation.id)}
            className="group relative aspect-square rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-color-primary-500)] transition-all hover:scale-[1.03] hover:shadow-xl"
          >
            <Image
              src={creation.result_image_url}
              alt={creation.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-xs font-semibold truncate drop-shadow">{creation.title}</p>
              <p className="text-white/60 text-[10px]">{formatDate(creation.created_at)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-black/85"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}
        >
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selected.title}</h3>
                  <p className="text-xs text-slate-400">{selected.style} · {formatDate(selected.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <div className="relative aspect-square">
                <Image
                  src={selected.result_image_url}
                  alt={selected.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4">
                <a
                  href={selected.result_image_url}
                  download={`${selected.title}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex-1 flex items-center justify-center rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selected.result_image_url)
                  }}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
