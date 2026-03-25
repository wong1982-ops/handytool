'use client'

import { useState, useRef, useCallback } from 'react'
import type { Clip } from './types'
import { encodeMp3, encodeWav } from './audio-encoder'

interface ClipsPanelProps {
  clips: Clip[]
  onRemove: (id: string) => void
}

/** Deinterleave Float32Array (L/R alternating) back to stereo channels */
function deinterleave(interleaved: Float32Array): { left: Float32Array; right: Float32Array } {
  const numSamples = interleaved.length / 2
  const left = new Float32Array(numSamples)
  const right = new Float32Array(numSamples)
  for (let i = 0; i < numSamples; i++) {
    left[i] = interleaved[i * 2]
    right[i] = interleaved[i * 2 + 1]
  }
  return { left, right }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ClipsPanel({ clips, onRemove }: ClipsPanelProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [popoverId, setPopoverId] = useState<string | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)

  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch { /* already stopped */ }
      sourceRef.current = null
    }
    setPlayingId(null)
  }, [])

  const playClip = useCallback((clip: Clip) => {
    // If already playing this clip, stop it
    if (playingId === clip.id) {
      stopPlayback()
      return
    }

    stopPlayback()

    const ctx = ctxRef.current ?? new AudioContext({ sampleRate: 48000 })
    ctxRef.current = ctx
    if (ctx.state === 'suspended') ctx.resume()

    // Deinterleave all chunks and compute total length
    const stereoChunks = clip.pcmData.map(deinterleave)
    const totalSamples = stereoChunks.reduce((sum, c) => sum + c.left.length, 0)

    const audioBuffer = ctx.createBuffer(2, totalSamples, 48000)
    const leftChannel = audioBuffer.getChannelData(0)
    const rightChannel = audioBuffer.getChannelData(1)

    let offset = 0
    for (const chunk of stereoChunks) {
      leftChannel.set(chunk.left, offset)
      rightChannel.set(chunk.right, offset)
      offset += chunk.left.length
    }

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)
    source.onended = () => setPlayingId(null)
    source.start()

    sourceRef.current = source
    setPlayingId(clip.id)
  }, [playingId, stopPlayback])

  const downloadClip = useCallback(async (clip: Clip, format: 'mp3' | 'wav') => {
    setPopoverId(null)
    setDownloadingId(clip.id)

    try {
      const stereoChunks = clip.pcmData.map(deinterleave)

      let blob: Blob
      if (format === 'mp3') {
        blob = await encodeMp3(stereoChunks, 48000)
      } else {
        blob = encodeWav(stereoChunks, 48000)
      }

      // Upload to API
      const formData = new FormData()
      formData.append('audio', blob, `${clip.name}.${format}`)
      formData.append('name', clip.name)
      formData.append('durationSeconds', String(clip.durationSeconds))
      formData.append('format', format)
      formData.append('mode', '')
      formData.append('promptSummary', '')

      const res = await fetch('/api/v1/music-studio/save-clip', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')

      // Trigger browser download
      const a = document.createElement('a')
      a.href = json.data?.clipUrl ?? ''
      a.download = `${clip.name}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('[clips-panel] Download failed:', err)
      // Could add toast here
    } finally {
      setDownloadingId(null)
    }
  }, [])

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#3D6AF2]/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-[#3D6AF2]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
        </div>
        <p className="text-white font-semibold text-sm">No clips yet</p>
        <p className="text-xs text-[#70767f] max-w-[200px]">Hit Record to capture music</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {clips.map((clip) => {
        const isPlaying = playingId === clip.id
        const isDownloading = downloadingId === clip.id
        const showPopover = popoverId === clip.id

        return (
          <div
            key={clip.id}
            className="relative rounded-xl bg-[#131a23] border border-[#1e2631] p-3 flex items-center gap-3"
          >
            {/* Play/pause */}
            <button
              type="button"
              onClick={() => playClip(clip)}
              className="w-9 h-9 shrink-0 rounded-lg bg-[#3D6AF2]/10 hover:bg-[#3D6AF2]/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause clip' : 'Play clip'}
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

            {/* Name + duration */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{clip.name}</p>
              <span className="text-[10px] text-[#70767f] font-mono">
                {formatDuration(clip.durationSeconds)}
              </span>
            </div>

            {/* Download */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPopoverId(showPopover ? null : clip.id)}
                disabled={isDownloading}
                className="w-8 h-8 shrink-0 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Download clip"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-[#3D6AF2]/30 border-t-[#3D6AF2] rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-[#70767f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
              </button>

              {/* Download popover */}
              {showPopover && (
                <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg bg-[#1e2631] border border-[#2a3441] shadow-xl py-1">
                  <button
                    type="button"
                    onClick={() => downloadClip(clip, 'mp3')}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>MP3</span>
                    <span className="text-[10px] text-[#70767f]">1 credit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadClip(clip, 'wav')}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>WAV</span>
                    <span className="text-[10px] text-[#70767f]">2 credits</span>
                  </button>
                </div>
              )}
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => {
                if (playingId === clip.id) stopPlayback()
                onRemove(clip.id)
              }}
              className="w-8 h-8 shrink-0 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Remove clip"
            >
              <svg className="w-4 h-4 text-[#70767f] hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
