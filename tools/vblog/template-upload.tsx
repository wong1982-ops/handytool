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
      <h2 className="text-sm font-medium text-[#a6abb5]">Template Assets</h2>
      <p className="text-xs text-[#70767f]">
        Upload your face clips and background music. These are reused across all video generations.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {SLOTS.map((slot) => (
          <div
            key={slot.key}
            className="bg-[#131a23] rounded-xl border border-[#1e2631] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{slot.label}</p>
              <p className="text-xs text-[#70767f] mt-0.5">{slot.description}</p>
              <p className={`text-xs mt-1 ${status[slot.key] ? 'text-emerald-400' : 'text-[#70767f]'}`}>
                {status[slot.key] ? 'Uploaded \u2713' : 'Not uploaded'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={(el) => { fileRefs.current[slot.key] = el }}
                type="file"
                accept={slot.accept}
                className="text-sm text-[#a6abb5] file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1e2631] file:text-[#a6abb5] file:cursor-pointer hover:file:bg-[#3D6AF2]/20"
                aria-label={`Choose ${slot.label} file`}
              />
              <button
                type="button"
                onClick={() => handleUpload(slot.key)}
                disabled={uploading === slot.key}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl min-h-[44px] px-4 py-2 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {uploading === slot.key ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
