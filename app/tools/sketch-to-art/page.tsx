'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import ModeToggle from '@/tools/sketch-to-art/mode-toggle'
import { SketchTabNavigation } from '@/tools/sketch-to-art/sketch-tab-navigation'
import SketchInput from '@/tools/sketch-to-art/sketch-input'
import StylePicker from '@/tools/sketch-to-art/style-picker'
import GenerationResults from '@/tools/sketch-to-art/generation-results'
import RefinementChat from '@/tools/sketch-to-art/refinement-chat'
import SaveShare from '@/tools/sketch-to-art/save-share'
import MyCreations from '@/tools/sketch-to-art/my-creations'
import { ShowcaseGallery } from '@/tools/sketch-to-art/showcase-gallery'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type {
  SketchMode,
  WizardState,
  WizardStep,
  GeneratedVariation,
} from '@/tools/sketch-to-art/types'
import { DEFAULT_WIZARD_STATE } from '@/tools/sketch-to-art/types'

const LS_MODE_KEY = 'tk-sketch-mode'

const STEPS: WizardStep[] = [1, 2, 3, 4, 5]

export default function SketchToArtPage() {
  const [state, setState] = useState<WizardState>(DEFAULT_WIZARD_STATE)
  const [mode, setMode] = useState<SketchMode>('fun')
  const [activeTab, setActiveTab] = useState<'create' | 'creations'>('create')
  const { user, loading: authLoading } = useAuth()

  // Load mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_MODE_KEY) as SketchMode | null
      if (saved === 'fun' || saved === 'pro') setMode(saved)
    } catch { /* SSR / private browsing */ }
  }, [])

  const handleModeToggle = useCallback((newMode: SketchMode) => {
    setMode(newMode)
    try { localStorage.setItem(LS_MODE_KEY, newMode) } catch { /* noop */ }
  }, [])

  const isFun = mode === 'fun'

  // --- Step transitions ---
  const goTo = useCallback((step: WizardStep) => {
    setState((s) => ({ ...s, step, error: null }))
  }, [])

  const handleSketchReady = useCallback((dataUrl: string) => {
    setState((s) => ({ ...s, sketchDataUrl: dataUrl, step: 2 }))
  }, [])

  const handleGenerate = useCallback(async () => {
    // Auth gate: require sign-in before generation
    if (!user && !authLoading) return

    setState((s) => ({ ...s, step: 3, loading: true, error: null, variations: [] }))

    try {
      const res = await fetch('/api/v1/sketch-to-art/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sketch: state.sketchDataUrl,
          style: state.selectedStyle,
          customStyle: state.customStyle,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          error: json.error || 'Generation failed',
        }))
        return
      }

      const variations = json.data.variations as GeneratedVariation[]
      setState((s) => ({
        ...s,
        loading: false,
        variations,
      }))

      // Auto-save all variations to gallery
      const styleName = state.customStyle || state.selectedStyle || 'Art'
      for (const v of variations) {
        fetch('/api/v1/sketch-to-art/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resultImageUrl: v.imageUrl,
            style: styleName,
          }),
        }).catch(() => { /* silent — auto-save is best-effort */ })
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }, [user, authLoading, state.sketchDataUrl, state.selectedStyle, state.customStyle])

  const handleSelectVariation = useCallback((index: number) => {
    setState((s) => ({
      ...s,
      selectedIndex: index,
      currentImage: s.variations[index],
      step: 4,
      chatHistory: [],
      refinementCount: 0,
    }))
  }, [])

  const handleSendRefinement = useCallback(async (message: string) => {
    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      chatHistory: [...s.chatHistory, { role: 'user' as const, content: message }],
    }))

    try {
      const res = await fetch('/api/v1/sketch-to-art/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentImageUrl: state.currentImage?.imageUrl,
          feedback: message,
          originalSketch: state.sketchDataUrl,
          style: state.selectedStyle || state.customStyle,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          error: json.error || 'Refinement failed',
          chatHistory: [
            ...s.chatHistory,
            { role: 'assistant' as const, content: json.error || 'Refinement failed' },
          ],
        }))
        return
      }

      const newImage: GeneratedVariation = {
        imageUrl: json.data.imageUrl,
        prompt: message,
      }

      setState((s) => ({
        ...s,
        loading: false,
        currentImage: newImage,
        refinementCount: s.refinementCount + 1,
        chatHistory: [
          ...s.chatHistory,
          { role: 'assistant' as const, content: 'Here\'s the updated version!', imageUrl: json.data.imageUrl },
        ],
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }, [state.currentImage, state.sketchDataUrl, state.selectedStyle, state.customStyle])

  const handleRefinementDone = useCallback(() => {
    goTo(5)
  }, [goTo])

  const handleBack = useCallback(() => {
    setState((s) => {
      const prev = (s.step - 1) as WizardStep
      if (prev < 1) return s
      // Reset relevant state when going back
      switch (s.step) {
        case 2: return { ...s, step: 1, selectedStyle: null, customStyle: '' }
        case 3: return { ...s, step: 2, variations: [], loading: false, error: null }
        case 4: return { ...s, step: 3, chatHistory: [], refinementCount: 0, currentImage: null, selectedIndex: null }
        case 5: return { ...s, step: 4 }
        default: return s
      }
    })
  }, [])

  const handleStartOver = useCallback(() => {
    setState(DEFAULT_WIZARD_STATE)
  }, [])

  // Build image history for refinement revert (original + all chat images)
  const imageHistory: GeneratedVariation[] = []
  if (state.selectedIndex !== null && state.variations[state.selectedIndex]) {
    imageHistory.push(state.variations[state.selectedIndex])
  }
  state.chatHistory.forEach((msg) => {
    if (msg.role === 'assistant' && msg.imageUrl) {
      imageHistory.push({ imageUrl: msg.imageUrl, prompt: msg.content })
    }
  })

  const handleRevert = useCallback((index: number) => {
    const img = imageHistory[index]
    if (img) {
      setState((s) => ({ ...s, currentImage: img }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageHistory.length])

  return (
    <div
      className="min-h-screen h-screen overflow-y-auto bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' }}
    >
      {/* Themed header — matching Story Studio pattern */}
      <div className="relative bg-gradient-to-r from-[#0c1424] via-[#111b2e] to-[#0c1424]">
        {/* Subtle particle background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 25%, #3D6AF2, transparent),
              radial-gradient(1.5px 1.5px at 30% 65%, #af88ff, transparent),
              radial-gradient(1px 1px at 50% 15%, #3D9DF2, transparent),
              radial-gradient(2px 2px at 70% 45%, #3D6AF2, transparent),
              radial-gradient(1px 1px at 85% 75%, #af88ff, transparent),
              radial-gradient(1.5px 1.5px at 95% 30%, #3D9DF2, transparent)
            `,
            animation: 'starfield-drift 14s ease-in-out infinite alternate',
          }} />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-16 bg-gradient-to-t from-[#3D6AF2]/10 via-[#af88ff]/5 to-transparent blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-4 pb-4 md:pt-5 md:pb-5">
          {/* Top row: breadcrumb (desktop) */}
          <div className="hidden md:block">
            <ToolBreadcrumb toolName="Sketch to Art" toolSlug="sketch-to-art" />
          </div>

          {/* Header row: title + mode toggle */}
          <div className="mt-1 md:mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile: home link */}
              <a
                href="/"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-[#93aaff] hover:text-white transition-colors"
                aria-label="Home"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </a>

              <div className="relative">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-[#3D6AF2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#af88ff] rounded-full animate-pulse" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sketch to Art
              </h1>
            </div>

            <ModeToggle mode={mode} onToggle={handleModeToggle} />
          </div>
        </div>
      </div>

      {/* Sticky tab navigation — always accessible */}
      <div className="sticky top-0 z-30">
        <SketchTabNavigation activeTab={activeTab} onTabChange={setActiveTab} mode={mode} />
      </div>

      {/* Tab content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">

        {/* My Creations tab */}
        <MyCreations mode={mode} visible={activeTab === 'creations'} />

        {activeTab === 'create' && (<>
          {/* Showcase Gallery — visible before upload on step 1 */}
          {state.step === 1 && !state.sketchDataUrl && (
            <ShowcaseGallery mode={mode} />
          )}

          {/* Subtitle */}
          <p className="text-sm text-slate-500 dark:text-[#a6abb5] text-center mb-6">
            {isFun ? 'Upload a sketch and watch AI transform it into art' : 'Step ' + state.step + ': ' + ['Upload your sketch', 'Choose a style', 'Generating art', 'Refine your art', 'Save and share'][state.step - 1]}
          </p>

          {/* Step indicator — labeled stepper */}
          {(() => {
            const stepLabels = isFun
              ? ['Sketch', 'Style', 'Magic', 'Refine', 'Share']
              : ['Upload', 'Style', 'Generate', 'Refine', 'Save']
            return (
              <nav aria-label="Wizard progress" className="mb-8">
                {/* Desktop: full labeled stepper */}
                <ol className="hidden sm:flex items-center justify-center gap-0">
                  {STEPS.map((s, i) => {
                    const isCompleted = s < state.step
                    const isCurrent = s === state.step
                    return (
                      <li key={s} className="flex items-center">
                        <div className="flex flex-col items-center">
                          {/* Circle */}
                          <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-[#3D6AF2] border-[#3D6AF2]'
                              : isCurrent
                              ? 'border-[#3D6AF2] bg-[#3D6AF2]/20 shadow-[0_0_15px_rgba(61,106,242,0.4)]'
                              : 'border-slate-200 dark:border-[#1e2631] bg-transparent'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className={`text-xs font-bold ${
                                isCurrent ? 'text-[#93aaff]' : 'text-slate-400 dark:text-[#70767f]'
                              }`}>{s}</span>
                            )}
                          </div>
                          {/* Label */}
                          <span className={`mt-1.5 text-[11px] font-medium transition-colors ${
                            isCompleted || isCurrent
                              ? 'text-[#93aaff]'
                              : 'text-slate-400 dark:text-[#70767f]'
                          }`}>
                            {stepLabels[i]}
                          </span>
                        </div>
                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                          <div className={`w-12 lg:w-20 h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                            s < state.step ? 'bg-gradient-to-r from-[#3D6AF2] to-[#3D6AF2]' : 'bg-slate-200 dark:bg-[#1e2631]'
                          }`} />
                        )}
                      </li>
                    )
                  })}
                </ol>

                {/* Mobile: compact pill stepper */}
                <div className="flex sm:hidden items-center justify-center gap-1.5">
                  {STEPS.map((s, i) => {
                    const isCompleted = s < state.step
                    const isCurrent = s === state.step
                    return (
                      <div key={s} className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[#3D6AF2] text-white'
                            : isCurrent
                            ? 'bg-[#3D6AF2]/15 text-[#93aaff] ring-1 ring-[#3D6AF2]/30'
                            : 'bg-slate-50 dark:bg-[#131a23] text-slate-400 dark:text-[#70767f]'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span>{s}</span>
                          )}
                          {isCurrent && <span>{stepLabels[i]}</span>}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-3 h-0.5 rounded-full ${
                            s < state.step ? 'bg-[#3D6AF2]' : 'bg-slate-200 dark:bg-[#1e2631]'
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </nav>
            )
          })()}

          {/* Wizard content */}
          <div id="wizard" style={{ scrollMarginTop: '80px' }}>

          {/* Error display */}
          {state.error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          {/* Step 1: Sketch Input */}
          {state.step === 1 && (
            <SketchInput onSketchReady={handleSketchReady} mode={mode} />
          )}

          {/* Step 2: Style Picker + Generate */}
          {state.step === 2 && (
            <div>
              <StylePicker
                selectedStyle={state.selectedStyle}
                customStyle={state.customStyle}
                onSelectStyle={(id) => setState((s) => ({ ...s, selectedStyle: id }))}
                onCustomStyleChange={(text) => setState((s) => ({ ...s, customStyle: text }))}
                mode={mode}
              />

              {/* Auth gate */}
              {!user && !authLoading ? (
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-[#a6abb5] mb-3">
                    Sign in to generate art
                  </p>
                  <button
                    type="button"
                    onClick={() => signInWithOAuth('google')}
                    className="min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!state.selectedStyle && !state.customStyle.trim()}
                  className="mt-6 w-full min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isFun ? '\u2728 Make Magic!' : 'Generate'}
                </button>
              )}
            </div>
          )}

          {/* Step 3: Generation Results */}
          {state.step === 3 && (
            <GenerationResults
              variations={state.variations}
              selectedIndex={state.selectedIndex}
              onSelect={handleSelectVariation}
              loading={state.loading}
              mode={mode}
            />
          )}

          {/* Step 4: Refinement Chat */}
          {state.step === 4 && state.currentImage && (
            <RefinementChat
              currentImage={state.currentImage}
              originalSketch={state.sketchDataUrl || ''}
              style={state.selectedStyle || state.customStyle}
              chatHistory={state.chatHistory}
              onSendMessage={handleSendRefinement}
              refinementCount={state.refinementCount}
              loading={state.loading}
              error={state.error}
              imageHistory={imageHistory}
              onRevert={handleRevert}
              mode={mode}
              onDone={handleRefinementDone}
            />
          )}

          {/* Step 5: Save & Share */}
          {state.step === 5 && state.currentImage && (
            <SaveShare
              finalImage={state.currentImage}
              originalSketch={state.sketchDataUrl || ''}
              style={state.selectedStyle || state.customStyle}
              mode={mode}
              onStartOver={handleStartOver}
            />
          )}

          {/* Sticky action footer — Prev / Next */}
          {state.step > 1 && state.step < 5 && (
            <div className="sticky bottom-0 z-20 mt-6 -mx-4 px-4 py-3 bg-white dark:bg-[#090f16]/90 backdrop-blur-lg border-t border-slate-200 dark:border-[#1e2631]">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-[#a6abb5] hover:text-white bg-slate-50 dark:bg-[#131a23] hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {isFun
                    ? ['', 'Sketch', 'Style', 'Magic', 'Refine'][state.step - 1]
                    : 'Previous'}
                </button>
                <span className="text-xs text-slate-400 dark:text-[#70767f]">
                  Step {state.step} of 5
                </span>
                {state.step === 1 && (
                  <div className="w-20" />
                )}
              </div>
            </div>
          )}

          </div>{/* end #wizard */}
        </>)}
      </main>
    </div>
  )
}
