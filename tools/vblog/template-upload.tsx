'use client'

import { useState, useEffect, useRef } from 'react'

interface TemplateStatus {
  intro: boolean
  outro: boolean
  bgm: boolean
}

interface TemplateSlot {
  key: keyof TemplateStatus
  label: string
  accept: string
  description: string
}

const SLOTS: TemplateSlot[] = [
  { key: 'intro', label: 'Intro Video', accept: 'video/mp4', description: '.mp4 — 3-5s face intro clip' },
  { key: 'outro', label: 'Outro Video', accept: 'video/mp4', description: '.mp4 — 3-5s face outro clip' },
  { key: 'bgm', label: 'Background Music', accept: 'audio/mpeg', description: '.mp3 — royalty-free background music' },
]

export function TemplateUpload() {
  const [status, setStatus] = useState<TemplateStatus>({ intro: false, outro: false, bgm: false })
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/vblog/templates')
      if (!res.ok) return
      const data = await res.json()
      if (data.data) setStatus(data.data)
    } catch {
      // ignore
    }
  }

  const handleUpload = async (key: string) => {
    const input = fileRefs.current[key]
    const file = input?.files?.[0]
    if (!file) return

    setUploading(key)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('type', key)
      formData.append('file', file)

      const res = await fetch('/api/v1/vblog/templates', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Upload failed')
      }

      await fetchStatus()
      if (input) input.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-[#a6abb5] uppercase tracking-wider mb-1">Template Assets</p>
        <p className="text-xs text-[#70767f]">
          Upload your face clips and background music. These are reused across all video generations.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {SLOTS.map((slot) => (
          <div
            key={slot.key}
            className="bg-[#131a23] rounded-xl border border-[#1e2631] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                status[slot.key] ? 'bg-[#3D6AF2]/10' : 'bg-[#70767f]/10'
              }`}>
                <svg className={`w-5 h-5 ${status[slot.key] ? 'text-[#3D6AF2]' : 'text-[#70767f]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {slot.key === 'bgm' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.125M9 18.75V9m0 9.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553V9" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  )}
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold">{slot.label}</p>
                <p className="text-xs text-[#70767f] mt-0.5">{slot.description}</p>
                <p className={`text-xs mt-1 ${status[slot.key] ? 'text-[#10B981]' : 'text-[#70767f]'}`}>
                  {status[slot.key] ? 'Uploaded' : 'Not uploaded'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={(el) => { fileRefs.current[slot.key] = el }}
                type="file"
                accept={slot.accept}
                className="hidden"
                aria-label={`Choose ${slot.label} file`}
              />
              <button
                type="button"
                onClick={() => {
                  const input = fileRefs.current[slot.key]
                  if (input) {
                    input.click()
                    input.onchange = () => handleUpload(slot.key)
                  }
                }}
                disabled={uploading === slot.key}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 ${
                  status[slot.key]
                    ? 'bg-[#1e2631] hover:bg-[#1e2631]/70 text-[#a6abb5] hover:text-white'
                    : 'bg-[#10B981] hover:bg-emerald-500 text-white'
                }`}
              >
                {uploading === slot.key ? 'Uploading...' : status[slot.key] ? 'Replace' : 'Upload'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
