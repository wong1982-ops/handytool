// tools/music-studio/use-lyria.ts
'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { GoogleGenAI } from '@google/genai'
import { pcm16ToFloat32 } from './audio-encoder'
import type { LyriaConfig, WeightedPrompt, Clip } from './types'
import { MAX_CLIPS, MAX_CLIP_DURATION } from './types'

type LyriaStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error'

interface UseLyriaReturn {
  status: LyriaStatus
  error: string | null
  isRecording: boolean
  recordingDuration: number
  clips: Clip[]
  connect: () => Promise<void>
  disconnect: () => void
  play: () => void
  pause: () => void
  startRecording: () => void
  stopRecording: () => void
  removeClip: (id: string) => void
  updateConfig: (config: Partial<LyriaConfig>) => void
  updatePrompts: (prompts: WeightedPrompt[]) => void
  analyserNode: AnalyserNode | null
}

export function useLyria(apiKey: string): UseLyriaReturn {
  const [status, setStatus] = useState<LyriaStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [clips, setClips] = useState<Clip[]>([])
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const nextPlayTimeRef = useRef(0)
  const recordingChunksRef = useRef<{ left: Float32Array; right: Float32Array }[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clipCounterRef = useRef(0)
  const configRef = useRef<LyriaConfig>({
    bpm: 120, brightness: 0.5, density: 0.5, scale: 'C_MAJOR',
    generationMode: 'QUALITY', muteBass: false, muteDrums: false,
  })

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 48000 })
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.connect(audioContextRef.current.destination)
      analyserRef.current = analyser
      setAnalyserNode(analyser)

      const gain = audioContextRef.current.createGain()
      gain.connect(analyser)
      gainNodeRef.current = gain
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Handle incoming audio chunks
  const handleAudioChunk = useCallback((base64Data: string) => {
    const ctx = getAudioContext()
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const pcm16 = new Int16Array(bytes.buffer)
    const { left, right } = pcm16ToFloat32(pcm16)

    // Schedule playback
    const audioBuffer = ctx.createBuffer(2, left.length, 48000)
    audioBuffer.copyToChannel(Float32Array.from(left), 0)
    audioBuffer.copyToChannel(Float32Array.from(right), 1)

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(gainNodeRef.current || ctx.destination)

    const now = ctx.currentTime
    const startTime = Math.max(now, nextPlayTimeRef.current)
    source.start(startTime)
    nextPlayTimeRef.current = startTime + audioBuffer.duration

    // Capture for recording
    if (isRecording) {
      recordingChunksRef.current.push({ left: new Float32Array(left), right: new Float32Array(right) })
    }
  }, [getAudioContext, isRecording])

  // Connect to Lyria
  const connect = useCallback(async () => {
    if (sessionRef.current) return
    setStatus('connecting')
    setError(null)

    try {
      getAudioContext() // ensure AudioContext exists (user gesture)

      const client = new GoogleGenAI({ apiKey })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await (client as any).live.music.connect({
        model: 'models/lyria-realtime-exp',
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (message: any) => {
            if (message.serverContent?.audioChunks) {
              for (const chunk of message.serverContent.audioChunks) {
                if (chunk.data) handleAudioChunk(chunk.data)
              }
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onerror: (err: any) => {
            console.error('[music-studio] Lyria error:', err)
            setError('Connection error. Try reconnecting.')
            setStatus('error')
          },
          onclose: () => {
            console.log('[music-studio] Lyria connection closed')
            if (status !== 'idle') setStatus('idle')
            sessionRef.current = null
          },
        },
      })

      sessionRef.current = session
      setStatus('playing')

      // Apply initial config
      await session.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: configRef.current.bpm,
          density: configRef.current.density,
          brightness: configRef.current.brightness,
          audioFormat: 'pcm16',
          sampleRateHz: 48000,
        },
      })

      await session.play()
    } catch (err) {
      console.error('[music-studio] Connect failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setStatus('error')
    }
  }, [apiKey, getAudioContext, handleAudioChunk, status])

  // Disconnect
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.stop?.()
      sessionRef.current = null
    }
    setStatus('idle')
    setIsRecording(false)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
  }, [])

  // Play / Pause
  const play = useCallback(async () => {
    if (!sessionRef.current) return
    await sessionRef.current.play()
    setStatus('playing')
  }, [])

  const pause = useCallback(async () => {
    if (!sessionRef.current) return
    await sessionRef.current.pause()
    setStatus('paused')
  }, [])

  // Recording
  const startRecording = useCallback(() => {
    if (clips.length >= MAX_CLIPS) return
    recordingChunksRef.current = []
    setRecordingDuration(0)
    setIsRecording(true)

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration((d) => {
        if (d >= MAX_CLIP_DURATION) {
          // Auto-stop at max duration
          return d
        }
        return d + 1
      })
    }, 1000)
  }, [clips.length])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    const chunks = recordingChunksRef.current
    if (chunks.length === 0) return // nothing recorded

    // Calculate duration from actual audio data
    const totalSamples = chunks.reduce((sum, c) => sum + c.left.length, 0)
    const durationSeconds = Math.round(totalSamples / 48000)
    if (durationSeconds < 1) return // too short

    clipCounterRef.current++
    const clip: Clip = {
      id: `clip-${Date.now()}`,
      name: `Clip ${clipCounterRef.current}`,
      durationSeconds,
      pcmData: chunks.map(c => {
        // Interleave for storage
        const interleaved = new Float32Array(c.left.length * 2)
        for (let i = 0; i < c.left.length; i++) {
          interleaved[i * 2] = c.left[i]
          interleaved[i * 2 + 1] = c.right[i]
        }
        return interleaved
      }),
      createdAt: Date.now(),
    }

    setClips((prev) => [...prev, clip])
    recordingChunksRef.current = []
    setRecordingDuration(0)
  }, [])

  // Auto-stop recording at max duration
  useEffect(() => {
    if (isRecording && recordingDuration >= MAX_CLIP_DURATION) {
      stopRecording()
    }
  }, [isRecording, recordingDuration, stopRecording])

  // Remove clip
  const removeClip = useCallback((id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Update config
  const updateConfig = useCallback(async (partial: Partial<LyriaConfig>) => {
    configRef.current = { ...configRef.current, ...partial }
    if (!sessionRef.current) return

    try {
      await sessionRef.current.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: configRef.current.bpm,
          density: configRef.current.density,
          brightness: configRef.current.brightness,
          audioFormat: 'pcm16',
          sampleRateHz: 48000,
        },
      })
    } catch (err) {
      console.error('[music-studio] Config update failed:', err)
    }
  }, [])

  // Update prompts
  const updatePrompts = useCallback(async (prompts: WeightedPrompt[]) => {
    if (!sessionRef.current || prompts.length === 0) return

    try {
      await sessionRef.current.setWeightedPrompts({
        weightedPrompts: prompts,
      })
    } catch (err) {
      console.error('[music-studio] Prompt update failed:', err)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
      audioContextRef.current?.close()
    }
  }, [disconnect])

  return {
    status,
    error,
    isRecording,
    recordingDuration,
    clips,
    connect,
    disconnect,
    play,
    pause,
    startRecording,
    stopRecording,
    removeClip,
    updateConfig,
    updatePrompts,
    analyserNode,
  }
}
