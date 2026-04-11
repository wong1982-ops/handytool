'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useDraft } from '@/lib/hooks/use-draft'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { BusinessInfoForm } from '@/tools/ecard-studio/ai-card/business-info-form'
import { LogoUpload, extractDominantColors } from '@/tools/ecard-studio/ai-card/logo-upload'
import { CardGallery } from '@/tools/ecard-studio/ai-card/card-gallery'
import { RefinementChat } from '@/tools/ecard-studio/ai-card/refinement-chat'
import { DownloadPanel } from '@/tools/ecard-studio/ai-card/download-panel'
import type {
  WizardState,
  WizardStep,
  BrandAnalysis,
  GeneratedDesign,
  ChatMessage,
} from '@/tools/ecard-studio/ai-card/types'
import {
  DEFAULT_WIZARD_STATE,
  DEFAULT_BUSINESS_INFO,
} from '@/tools/ecard-studio/ai-card/types'

const STEP_LABELS = ['Info', 'Brand', 'Generate', 'Refine', 'Download'] as const

export default function AIBusinessCardPage() {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<WizardState>(DEFAULT_WIZARD_STATE)
  useDraft('ecard-ai-card:draft', state, setState, ['loading', 'error'])
  const [designHistory, setDesignHistory] = useState<GeneratedDesign[]>([])
  const generateTriggered = useRef(false)

  // ── Step navigation ──────────────────────────────────────────
  function goToStep(step: WizardStep) {
    setState((s) => ({ ...s, step, error: null }))
  }

  function goBack() {
    if (state.step > 1) {
      goToStep((state.step - 1) as WizardStep)
    }
  }

  // ── Step 2: Brand analysis ──────────────────────────────────
  const handleAnalyzeBrand = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      let logoColors: string[] = []
      if (state.logoDataUrl) {
        logoColors = await extractDominantColors(state.logoDataUrl)
      }

      const res = await fetch('/api/v1/ecard/analyze-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo: state.businessInfo,
          logoColors,
        }),
      })

      if (!res.ok) throw new Error('Brand analysis failed')
      const { data } = await res.json()
      setState((s) => ({ ...s, brandAnalysis: data, loading: false }))
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Brand analysis failed',
      }))
    }
  }, [state.businessInfo, state.logoDataUrl])

  // ── Step 3: Generate cards ─────────────────────────────────
  const handleGenerateCards = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch('/api/v1/ecard/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo: state.businessInfo,
          brandAnalysis: state.brandAnalysis,
        }),
      })

      if (!res.ok) throw new Error('Card generation failed')
      const { data } = await res.json()
      const designs = data.designs as GeneratedDesign[]
      setState((s) => ({
        ...s,
        designs,
        selectedIndex: 0,
        loading: false,
        step: 4,
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Card generation failed',
      }))
    }
  }, [state.businessInfo, state.brandAnalysis])

  // Auto-trigger generation on step 3
  useEffect(() => {
    if (state.step === 3 && !generateTriggered.current) {
      generateTriggered.current = true
      handleGenerateCards()
    }
    if (state.step !== 3) {
      generateTriggered.current = false
    }
  }, [state.step, handleGenerateCards])

  // ── Step 4: Refinement ──────────────────────────────────────
  const handleSendRefinement = useCallback(
    async (message: string) => {
      if (!state.currentDesign && state.designs.length > 0) {
        // Initialize currentDesign from selected
        const selected = state.designs[state.selectedIndex]
        setState((s) => ({ ...s, currentDesign: selected }))
      }

      const designToRefine = state.currentDesign || state.designs[state.selectedIndex]
      if (!designToRefine) return

      const userMsg: ChatMessage = { role: 'user', content: message }
      setState((s) => ({
        ...s,
        chatHistory: [...s.chatHistory, userMsg],
        loading: true,
        error: null,
      }))

      try {
        const res = await fetch('/api/v1/ecard/refine-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentDesign: designToRefine,
            refinementPrompt: message,
            businessInfo: state.businessInfo,
          }),
        })

        if (!res.ok) throw new Error('Refinement failed')
        const { data } = await res.json()
        const newDesign = data.design as GeneratedDesign

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: 'Here is your updated design.',
          imageUrl: newDesign.imageUrl,
        }

        setState((s) => ({
          ...s,
          currentDesign: newDesign,
          chatHistory: [...s.chatHistory, assistantMsg],
          refinementCount: s.refinementCount + 1,
          loading: false,
        }))

        setDesignHistory((prev) => [...prev, newDesign])
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Refinement failed',
        }))
      }
    },
    [state.currentDesign, state.designs, state.selectedIndex, state.businessInfo],
  )

  const handleRevertDesign = useCallback((index: number) => {
    setDesignHistory((prev) => {
      const reverted = prev[index]
      if (reverted) {
        setState((s) => ({ ...s, currentDesign: reverted }))
      }
      return prev
    })
  }, [])

  // ── Step 5: Download / reset ────────────────────────────────
  function handleStartOver() {
    setState({ ...DEFAULT_WIZARD_STATE, businessInfo: { ...DEFAULT_BUSINESS_INFO } })
    setDesignHistory([])
  }

  function handleMakeAnother() {
    setState((s) => ({
      ...s,
      step: 3 as WizardStep,
      designs: [],
      selectedIndex: 0,
      chatHistory: [],
      currentDesign: null,
      refinementCount: 0,
      error: null,
    }))
    setDesignHistory([])
  }

  // ── Auth gate ───────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <ToolBreadcrumb toolName="AI Business Card" toolSlug="ecard-studio" />
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-[var(--tk-color-text-primary)] mb-2">
              Sign in to create business cards
            </h2>
            <p className="text-sm text-[var(--tk-color-text-secondary)] mb-4">
              Create a professional business card with AI.
            </p>
            <button
              onClick={() => signInWithOAuth('google')}
              className="min-h-[44px] rounded-xl bg-[var(--tk-color-primary-500)] px-6 py-3
                text-sm font-semibold text-white transition-colors
                hover:bg-[var(--tk-color-primary-600)] cursor-pointer"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Determine the active design for step 4/5
  const activeDesign =
    state.currentDesign || (state.designs.length > 0 ? state.designs[state.selectedIndex] : null)

  // Track which steps are completed
  const completedSteps = new Set<number>()
  for (let i = 1; i < state.step; i++) completedSteps.add(i)

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <ToolBreadcrumb toolName="AI Business Card" toolSlug="ecard-studio" />

        <div>
          <h1 className="text-2xl font-bold text-[var(--tk-color-text-primary)]">
            AI Business Card
          </h1>
          <p className="mt-1 text-sm text-[var(--tk-color-text-secondary)]">
            Create a professional business card with AI
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as WizardStep
            const isActive = state.step === stepNum
            const isCompleted = completedSteps.has(stepNum)
            const isClickable = isCompleted

            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`h-px w-6 transition-colors ${
                      isCompleted || isActive
                        ? 'bg-[var(--tk-color-primary-500)]'
                        : 'bg-[var(--tk-color-border)]'
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(stepNum)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-1 ${
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[var(--tk-color-primary-500)] text-white'
                        : isCompleted
                          ? 'bg-[var(--tk-color-primary-500)]/20 text-[var(--tk-color-primary-500)]'
                          : 'bg-[var(--tk-color-bg-secondary)] text-[var(--tk-color-text-muted)]'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      isActive
                        ? 'text-[var(--tk-color-primary-500)]'
                        : 'text-[var(--tk-color-text-muted)]'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Back button */}
        {state.step > 1 && state.step < 5 && (
          <button
            type="button"
            onClick={goBack}
            className="min-h-[44px] self-start flex items-center gap-1 rounded-lg px-3 py-2
              text-sm font-medium text-[var(--tk-color-text-secondary)] transition-colors
              hover:bg-[var(--tk-color-bg-secondary)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        )}

        {/* Step content */}
        {state.step === 1 && (
          <BusinessInfoForm
            info={state.businessInfo}
            onChange={(info) => setState((s) => ({ ...s, businessInfo: info }))}
            onNext={() => goToStep(2)}
          />
        )}

        {state.step === 2 && (
          <LogoUpload
            logoDataUrl={state.logoDataUrl}
            onLogoChange={(dataUrl) => setState((s) => ({ ...s, logoDataUrl: dataUrl }))}
            brandAnalysis={state.brandAnalysis}
            onAnalyze={handleAnalyzeBrand}
            onUpdateAnalysis={(analysis: BrandAnalysis) =>
              setState((s) => ({ ...s, brandAnalysis: analysis }))
            }
            loading={state.loading}
            error={state.error}
            onNext={() => goToStep(3)}
            onSkip={() => goToStep(3)}
          />
        )}

        {state.step === 3 && (
          <CardGallery
            designs={state.designs}
            selectedIndex={null}
            onSelect={() => {}}
            loading={state.loading}
          />
        )}

        {state.step === 4 && (
          <div className="flex flex-col gap-6">
            {/* Show gallery for picking if no currentDesign set yet */}
            {!state.currentDesign && (
              <CardGallery
                designs={state.designs}
                selectedIndex={state.selectedIndex}
                onSelect={(index) => {
                  setState((s) => ({
                    ...s,
                    selectedIndex: index,
                    currentDesign: s.designs[index],
                  }))
                  setDesignHistory([state.designs[index]])
                }}
                loading={false}
              />
            )}

            {/* Refinement chat when a design is selected */}
            {activeDesign && state.currentDesign && (
              <RefinementChat
                currentDesign={activeDesign}
                chatHistory={state.chatHistory}
                onSendMessage={handleSendRefinement}
                refinementCount={state.refinementCount}
                loading={state.loading}
                error={state.error}
                designHistory={designHistory}
                onRevert={handleRevertDesign}
                onDone={() => goToStep(5)}
              />
            )}
          </div>
        )}

        {state.step === 5 && activeDesign && (
          <DownloadPanel
            design={activeDesign}
            onStartOver={handleStartOver}
            onMakeAnother={handleMakeAnother}
          />
        )}
      </div>
    </main>
  )
}
