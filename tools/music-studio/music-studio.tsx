'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  type StudioMode,
  type LyriaConfig,
  type WeightedPrompt,
  DEFAULT_LYRIA_CONFIG,
  MODE_PRESETS,
  MAX_CLIPS,
} from './types'
import { useLyria } from './use-lyria'
import { Launchpad } from './launchpad'
import { ControlsPanel } from './controls-panel'
import { WaveformVisualizer } from './waveform-visualizer'
import { TransportBar } from './transport-bar'
import { ClipsPanel } from './clips-panel'
import { MyClips } from './my-clips'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

export default function MusicStudio() {
  /* ─── Local State ─── */
  const [mode, setMode] = useState<StudioMode>('music')
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set())
  const [activeInstruments, setActiveInstruments] = useState<Set<string>>(new Set())
  const [config, setConfig] = useState<LyriaConfig>(DEFAULT_LYRIA_CONFIG)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showControls, setShowControls] = useState(false)
  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio')

  /* ─── Lyria Hook ─── */
  const {
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
  } = useLyria(apiKey)

  /* ─── Prompt Assembly (debounced 500ms) ─── */
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current)

    promptTimerRef.current = setTimeout(() => {
      const prompts: WeightedPrompt[] = []

      // Active genre/mood buttons from current mode
      const presets = MODE_PRESETS[mode]
      for (const btn of presets) {
        if (activeButtons.has(btn.id)) {
          prompts.push({ text: btn.label + ' music', weight: 1.0 })
        }
      }

      // Active instruments
      for (const id of activeInstruments) {
        const inst = [
          'piano', 'guitar', 'synth', 'drums', 'bass', 'strings', 'brass', 'flute',
        ]
        if (inst.includes(id)) {
          const label = id.charAt(0).toUpperCase() + id.slice(1)
          prompts.push({ text: 'featuring ' + label, weight: 0.5 })
        }
      }

      // Custom prompt
      if (customPrompt.trim()) {
        prompts.push({ text: customPrompt.trim(), weight: 1.0 })
      }

      if (prompts.length > 0) {
        updatePrompts(prompts)
      }
    }, 500)

    return () => {
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current)
    }
  }, [activeButtons, activeInstruments, customPrompt, mode, updatePrompts])

  /* ─── Mute Handling ─── */
  useEffect(() => {
    const muteDrums = !activeInstruments.has('drums')
    const muteBass = !activeInstruments.has('bass')

    if (muteDrums !== config.muteDrums || muteBass !== config.muteBass) {
      const updated = { ...config, muteDrums, muteBass }
      setConfig(updated)
      updateConfig({ muteDrums, muteBass })
    }
    // Only react to instrument changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInstruments])

  /* ─── Config Sync ─── */
  const handleConfigChange = useCallback(
    (partial: Partial<LyriaConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial }
        updateConfig(partial)
        return next
      })
    },
    [updateConfig],
  )

  /* ─── Toggle Handlers ─── */
  const handleToggleButton = useCallback((id: string) => {
    setActiveButtons((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleToggleInstrument = useCallback((id: string) => {
    setActiveInstruments((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleModeChange = useCallback((newMode: StudioMode) => {
    setMode(newMode)
    setActiveButtons(new Set())
  }, [])

  /* ─── Render ─── */
  const isPlaying = status === 'playing'

  return (
    <div className="flex flex-col h-full">
      {/* Tab toggle */}
      <div className="flex justify-center md:justify-start px-4 md:px-0 mb-5">
        <div className="flex w-full max-w-xs gap-1 rounded-xl bg-[#131a23] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`flex-1 min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-[#3D6AF2] text-white shadow-lg'
                : 'text-[#70767f] hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#3D6AF2] text-white shadow-lg'
                : 'text-[#70767f] hover:text-white'
            }`}
          >
            My Clips
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="px-4">
          <MyClips visible={true} />
        </div>
      ) : (
        <>
          {/* ── Desktop Layout ── */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:px-4">
            {/* Left column */}
            <div className="col-span-8 flex flex-col gap-4">
              <Launchpad
                mode={mode}
                activeButtons={activeButtons}
                activeInstruments={activeInstruments}
                onToggleButton={handleToggleButton}
                onToggleInstrument={handleToggleInstrument}
                onModeChange={handleModeChange}
              />
              <WaveformVisualizer analyserNode={analyserNode} isPlaying={isPlaying} />
              <TransportBar
                status={status}
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                clipCount={clips.length}
                maxClips={MAX_CLIPS}
                onConnect={connect}
                onPlay={play}
                onPause={pause}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onDisconnect={disconnect}
              />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#70767f]">Session Clips</p>
                <ClipsPanel clips={clips} onRemove={removeClip} />
              </div>
            </div>

            {/* Right column: controls sidebar */}
            <div className="col-span-4">
              <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-xl bg-[#131a23] border border-[#1e2631]">
                <div className="border-b border-[#1e2631] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#70767f]">Controls</p>
                </div>
                <ControlsPanel
                  config={config}
                  customPrompt={customPrompt}
                  onConfigChange={handleConfigChange}
                  onPromptChange={setCustomPrompt}
                />
              </div>
            </div>
          </div>

          {/* ── Mobile Layout ── */}
          <div className="flex flex-col gap-4 p-4 md:hidden">
            <Launchpad
              mode={mode}
              activeButtons={activeButtons}
              activeInstruments={activeInstruments}
              onToggleButton={handleToggleButton}
              onToggleInstrument={handleToggleInstrument}
              onModeChange={handleModeChange}
            />
            <WaveformVisualizer analyserNode={analyserNode} isPlaying={isPlaying} />
            <TransportBar
              status={status}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              clipCount={clips.length}
              maxClips={MAX_CLIPS}
              onConnect={connect}
              onPlay={play}
              onPause={pause}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onDisconnect={disconnect}
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#70767f]">Session Clips</p>
              <ClipsPanel clips={clips} onRemove={removeClip} />
            </div>

            {/* Gear toggle for controls drawer */}
            <button
              type="button"
              onClick={() => setShowControls(true)}
              className="fixed bottom-6 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#3D6AF2] text-white shadow-lg transition-opacity hover:opacity-90 cursor-pointer"
              aria-label="Open controls"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* ── Mobile Controls Drawer ── */}
          {showControls && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setShowControls(false)}
                aria-hidden="true"
              />
              {/* Drawer */}
              <div className="fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] overflow-y-auto bg-[#131a23] md:hidden">
                <div className="flex items-center justify-between px-4 pt-4">
                  <h2 className="text-sm font-semibold text-white">Controls</h2>
                  <button
                    type="button"
                    onClick={() => setShowControls(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Close controls"
                  >
                    <svg className="w-5 h-5 text-[#70767f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ControlsPanel
                  config={config}
                  customPrompt={customPrompt}
                  onConfigChange={handleConfigChange}
                  onPromptChange={setCustomPrompt}
                />
              </div>
            </>
          )}

          {/* Error display */}
          {error && (
            <div className="mx-4 mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}
