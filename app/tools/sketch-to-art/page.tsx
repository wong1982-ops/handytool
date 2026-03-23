'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import ModeToggle from '@/tools/sketch-to-art/mode-toggle'
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
  RefinementMessage,
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
          instruction: message,
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
    <main
      className={`flex-1 flex flex-col items-center py-10 px-4 ${
        isFun
          ? 'bg-gradient-to-b from-pink-50 to-violet-50 dark:from-[#1a1025] dark:to-[#101922]'
          : ''
      }`}
      style={{ overscrollBehaviorX: 'none' }}
    >
      <div className="w-full max-w-4xl relative">
        {/* Breadcrumb + Mode toggle row */}
        <div className="flex items-center justify-between mb-4">
          <ToolBreadcrumb toolName="Sketch to Art" toolSlug="sketch-to-art" />
          <ModeToggle mode={mode} onToggle={handleModeToggle} />
        </div>

        {/* Showcase Gallery — visible before upload on step 1 */}
        {state.step === 1 && !state.sketchDataUrl && (
          <ShowcaseGallery mode={mode} />
        )}

        {/* Title + Tabs */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">
          {isFun ? '\u2728 Turn Your Drawing Into Art!' : 'Sketch to Art'}
        </h1>

        {/* Create / My Creations tabs */}
        {user && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {isFun ? '\u{1F3A8} Create' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('creations')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'creations'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {isFun ? '\u{1F5BC}\u{FE0F} My Creations' : 'My Creations'}
              </button>
            </div>
          </div>
        )}

        {/* My Creations tab */}
        <MyCreations mode={mode} visible={activeTab === 'creations'} />

        {activeTab === 'create' && (<>
        {/* Step indicator — labeled stepper */}
        {(() => {
          const stepLabels = isFun
            ? ['Sketch', 'Style', 'Magic', 'Refine', 'Share']
            : ['Upload', 'Style', 'Generate', 'Refine', 'Save']
          // Icons reserved for future use
          return (
            <nav aria-label="Wizard progress" className="mb-8">
              {/* Desktop: full labeled stepper */}
              <ol className="hidden sm:flex items-center justify-center gap-0">
                {STEPS.map((s, i) => {
                  const isCompleted = s < state.step
                  const isCurrent = s === state.step
                  const _isFuture = s > state.step
                  return (
                    <li key={s} className="flex items-center">
                      <div className="flex flex-col items-center">
                        {/* Circle */}
                        <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[var(--tk-color-primary-500)] border-[var(--tk-color-primary-500)]'
                            : isCurrent
                            ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/10'
                            : 'border-slate-300 dark:border-slate-600 bg-transparent'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className={`text-xs font-bold ${
                              isCurrent ? 'text-[var(--tk-color-primary-500)]' : 'text-slate-400 dark:text-slate-500'
                            }`}>{s}</span>
                          )}
                        </div>
                        {/* Label */}
                        <span className={`mt-1.5 text-[11px] font-medium transition-colors ${
                          isCompleted || isCurrent
                            ? 'text-[var(--tk-color-primary-500)]'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {stepLabels[i]}
                        </span>
                      </div>
                      {/* Connector line */}
                      {i < STEPS.length - 1 && (
                        <div className={`w-12 lg:w-20 h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                          s < state.step ? 'bg-[var(--tk-color-primary-500)]' : 'bg-slate-200 dark:bg-slate-700'
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
                          ? 'bg-[var(--tk-color-primary-500)] text-white'
                          : isCurrent
                          ? 'bg-[var(--tk-color-primary-500)]/15 text-[var(--tk-color-primary-500)] ring-1 ring-[var(--tk-color-primary-500)]/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
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
                          s < state.step ? 'bg-[var(--tk-color-primary-500)]' : 'bg-slate-200 dark:bg-slate-700'
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

        {/* Back button (steps 2-5) */}
        {state.step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--tk-color-primary-500)] transition-colors min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Error display */}
        {state.error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
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
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
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
                {isFun ? '✨ Make Magic!' : 'Generate'}
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

        </div>{/* end #wizard */}
        </>)}
      </div>
    </main>
  )
}
