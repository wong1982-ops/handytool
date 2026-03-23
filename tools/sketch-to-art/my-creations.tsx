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
  const [needsAuth, setNeedsAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchCreations = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNeedsAuth(false)
    try {
      const res = await fetch('/api/v1/sketch-to-art/gallery/me')
      if (res.status === 401) {
        setNeedsAuth(true)
        setCreations([])
        return
      }
      if (!res.ok) {
        throw new Error('Failed to load')
      }
      const json = await res.json()
      setCreations(json.data?.entries || [])
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (visible) fetchCreations()
  }, [visible, fetchCreations])

  const selected = creations.find((c) => c.id === selectedId)

  if (!visible) return null

  // Loading skeleton
  if (loading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Not signed in
  if (needsAuth) {
    return (
      <div className="flex flex-col items-center py-16 px-4">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          Sign in to see your creations
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-5">
          Your generated artwork is saved automatically. Sign in to access your collection.
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center py-16 px-4">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          Couldn&apos;t load your creations
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-5">
          Don&apos;t worry, your artwork is safe. Please try again.
        </p>
        <button
          type="button"
          onClick={fetchCreations}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Try again
        </button>
      </div>
    )
  }

  // Empty state
  if (creations.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 px-4">
        <div className="w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 dark:from-pink-500/10 dark:to-violet-500/10 flex items-center justify-center">
          <span className="text-3xl">{isFun ? '\u{1F3A8}' : '\u{1F5BC}\u{FE0F}'}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          {isFun ? 'Your gallery is empty!' : 'No creations yet'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-5">
          {isFun
            ? 'Upload a sketch and make some magic \u2014 your artwork will appear here!'
            : 'Generate your first artwork and it will be saved here automatically.'}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Auto-saved
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Private by default
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {creations.length} creation{creations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {creations.map((creation) => (
          <button
            key={creation.id}
            type="button"
            onClick={() => setSelectedId(creation.id)}
            className="group relative aspect-square rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-color-primary-500)] transition-all hover:scale-[1.03] hover:shadow-xl"
          >
            <Image
              src={creation.result_image_url}
              alt={creation.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
                  className="min-h-[44px] flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selected.result_image_url)
                  }}
                  className="min-h-[44px] flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.482a4.5 4.5 0 00-6.364-6.364L4.5 8.625a4.5 4.5 0 001.242 7.244" />
                  </svg>
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
