'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderProps {
  characterId: string
  characterName: string
}

interface VoiceState {
  id: string
  recordingUrl: string
  provider: string | null
  status: 'recorded' | 'cloning' | 'ready' | 'error'
  errorMessage: string | null
  createdAt: string
}

type RecorderPhase = 'idle' | 'recording' | 'preview'

const RECORDING_SCRIPT =
  'The little fox jumped over the log and ran through the tall grass. "Hello!" said the fox. "Do you want to play with me today?"'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const STATUS_BADGE: Record<VoiceState['status'], { label: string; cls: string }> = {
  ready: {
    label: 'All set!',
    cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  },
  recorded: {
    label: 'Working on it…',
    cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  cloning: {
    label: 'Making your voice…',
    cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  error: {
    label: 'Something went wrong',
    cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
}

export function VoiceRecorder({ characterId, characterName }: VoiceRecorderProps) {
  const [voice, setVoice] = useState<VoiceState | null>(null)
  const [loadingVoice, setLoadingVoice] = useState(true)

  const [phase, setPhase] = useState<RecorderPhase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewBlobRef = useRef<Blob | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // ── Fetch existing voice on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function fetchVoice() {
      try {
        const res = await fetch(`/api/v1/story/characters/${characterId}/voice`)
        if (!cancelled) {
          if (res.ok) {
            const json = await res.json() as { data: VoiceState | null }
            if (json.data && json.data.id) setVoice(json.data)
          } else if (res.status !== 404) {
            console.error('Failed to fetch voice:', res.status)
          }
        }
      } catch {
        // no-op — voice just won't be set
      } finally {
        if (!cancelled) setLoadingVoice(false)
      }
    }
    void fetchVoice()
    return () => { cancelled = true }
  }, [characterId])

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoStopRef.current) clearTimeout(autoStopRef.current)
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      stopTracks()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function stopTracks() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function clearTimers() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null }
  }

  // ── Start recording ──────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setSaveError(null)
    chunksRef.current = []
    setElapsed(0)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setSaveError('We need your microphone to record! Please say "yes" when your browser asks.')
      return
    }
    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(stream, { mimeType })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      previewBlobRef.current = blob
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = URL.createObjectURL(blob)
      setPhase('preview')
    }

    recorder.start(250) // collect in 250ms chunks
    setPhase('recording')

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)

    // Auto-stop at 60s
    autoStopRef.current = setTimeout(() => {
      stopRecording()
    }, 60_000)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop recording ───────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    clearTimers()
    stopTracks()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // ── Re-record: optionally delete existing voice first ───────────────────
  const handleReRecord = useCallback(async () => {
    if (voice) {
      try {
        await fetch(`/api/v1/story/characters/${characterId}/voice`, { method: 'DELETE' })
        setVoice(null)
      } catch {
        // ignore — proceed to re-record anyway
      }
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    previewBlobRef.current = null
    setElapsed(0)
    setPhase('idle')
    await startRecording()
  }, [voice, characterId, startRecording])

  // ── Delete voice ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    setDeleting(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}/voice`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setVoice(null)
      setPhase('idle')
    } catch {
      setSaveError('Oops, could not delete. Try again!')
    } finally {
      setDeleting(false)
    }
  }, [characterId])

  // ── Save recording ───────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!previewBlobRef.current) return
    setSaving(true)
    setSaveError(null)

    const blob = previewBlobRef.current
    const ext = blob.type.includes('webm') ? 'webm' : 'wav'
    const formData = new FormData()
    formData.append('audio', blob, `recording.${ext}`)

    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}/voice`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json().catch(() => null) as { data?: VoiceState; error?: string } | null
      if (!res.ok) {
        throw new Error(json?.error ?? 'Upload failed')
      }
      if (json?.data) setVoice(json.data)
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
      previewBlobRef.current = null
      setPhase('idle')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save. Try again!')
    } finally {
      setSaving(false)
    }
  }, [characterId])

  // ── Render ───────────────────────────────────────────────────────────────

  if (loadingVoice) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {/* Mic icon */}
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Record Your Voice — {characterName}
        </h3>
      </div>

      {/* ── EXISTING VOICE (idle phase) ───────────────────────────────── */}
      {voice && phase === 'idle' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[voice.status].cls}`}>
              {STATUS_BADGE[voice.status].label}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(voice.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Error message */}
          {voice.status === 'error' && voice.errorMessage && (
            <p className="text-xs text-red-600 dark:text-red-400">{voice.errorMessage}</p>
          )}

          {/* Playback */}
          <audio
            controls
            src={voice.recordingUrl}
            className="w-full h-10"
            aria-label={`Voice recording for ${characterName}`}
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReRecord}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              Re-record
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              )}
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── NO VOICE + IDLE — show script + start button ─────────────── */}
      {!voice && phase === 'idle' && (
        <div className="space-y-3">
          {/* Script box */}
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Read this out loud
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {RECORDING_SCRIPT}
            </p>
          </div>

          <button
            type="button"
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
            Start Recording
          </button>
        </div>
      )}

      {/* ── RECORDING PHASE ───────────────────────────────────────────── */}
      {phase === 'recording' && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4 space-y-3">
          {/* Indicator row */}
          <div className="flex items-center gap-3">
            {/* Pulsing dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>

            {/* Timer */}
            <span className={`text-2xl font-mono font-bold tabular-nums ${
              elapsed >= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatTime(elapsed)}
            </span>

            {/* Hint text */}
            {elapsed >= 55 ? (
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                Almost done!
              </span>
            ) : elapsed >= 30 ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Great job!
              </span>
            ) : null}
          </div>

          {/* Script reminder */}
          <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
            {RECORDING_SCRIPT}
          </p>

          {/* Stop button */}
          <button
            type="button"
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
            Stop
          </button>
        </div>
      )}

      {/* ── PREVIEW PHASE ─────────────────────────────────────────────── */}
      {phase === 'preview' && previewUrlRef.current && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Listen back and save if you like it!
          </p>

          {/* Audio playback */}
          <audio
            controls
            src={previewUrlRef.current}
            className="w-full h-10"
            aria-label="Preview recording"
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReRecord}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Re-record
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              )}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {saveError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-xs text-red-700 dark:text-red-400">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {saveError}
        </div>
      )}
    </div>
  )
}
