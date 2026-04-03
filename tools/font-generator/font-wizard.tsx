'use client'

import { useState, useCallback } from 'react'
import { FontProject, DEFAULT_FONT_PROJECT, WizardStep, FontCharacter } from '@/tools/font-generator/types'
import { DescribeStep } from './describe-step'
import { PreviewStep } from './preview-step'
import { AlphabetGrid } from './alphabet-grid'
import { RefineStep } from './refine-step'
import { DownloadStep } from './download-step'
import { MyFonts } from './my-fonts'

type Tab = 'create' | 'history'

const STEPS: WizardStep[] = [1, 2, 3, 4, 5]
const STEP_LABELS = ['Describe', 'Preview', 'Generate', 'Refine', 'Download']

const STEP_SUBTITLES: Record<WizardStep, string> = {
  1: 'Choose your font style',
  2: 'Preview sample letters',
  3: 'Generate full alphabet',
  4: 'Refine individual letters',
  5: 'Download your font',
}

export default function FontWizard() {
  const [project, setProject] = useState<FontProject>(DEFAULT_FONT_PROJECT)
  const [activeTab, setActiveTab] = useState<Tab>('create')
  const [regeneratingChar, setRegeneratingChar] = useState<string | null>(null)

  // --- Preview (step 1 → 2) ---
  const handlePreview = useCallback(async (proj: FontProject) => {
    setProject((p) => ({ ...p, step: 2, loading: true, error: null, characters: [] }))

    try {
      const res = await fetch('/api/v1/font-generator/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylePreset: proj.stylePreset,
          customPrompt: proj.customPrompt || undefined,
          colors: proj.colors,
          colorMode: proj.colorMode,
          referenceImageBase64: proj.referenceImageBase64 || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setProject((p) => ({ ...p, loading: false, error: json.error || 'Preview failed' }))
        return
      }

      const characters: FontCharacter[] = json.data?.characters ?? []
      const projectId: string | null = json.data?.projectId ?? null
      setProject((p) => ({
        ...p,
        loading: false,
        characters,
        projectId,
      }))
    } catch (err) {
      setProject((p) => ({
        ...p,
        loading: false,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }, [])

  // --- Generate full alphabet (step 2 → 3) ---
  const handleGenerateFull = useCallback(async () => {
    setProject((p) => ({ ...p, step: 3, loading: true, error: null }))

    try {
      const existingChars = project.characters.map((c) => c.char)

      const res = await fetch('/api/v1/font-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          existingChars,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setProject((p) => ({ ...p, loading: false, error: json.error || 'Generation failed' }))
        return
      }

      const newChars: FontCharacter[] = json.data?.characters ?? []
      setProject((p) => {
        const merged = [...p.characters]
        for (const nc of newChars) {
          const idx = merged.findIndex((c) => c.char === nc.char)
          if (idx >= 0) {
            merged[idx] = nc
          } else {
            merged.push(nc)
          }
        }
        return { ...p, loading: false, characters: merged }
      })

      // Auto-save to history (fire-and-forget)
      fetch('/api/v1/font-generator/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          stylePreset: project.stylePreset,
          customPrompt: project.customPrompt || undefined,
          colors: project.colors,
          colorMode: project.colorMode,
        }),
      }).catch(() => {}) // silent — don't block UX if save fails
    } catch (err) {
      setProject((p) => ({
        ...p,
        loading: false,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }, [project.characters, project.projectId, project.stylePreset, project.customPrompt, project.colors, project.colorMode])

  // --- Regenerate single character ---
  const handleRegenerate = useCallback(async (char: string) => {
    setRegeneratingChar(char)
    try {
      const res = await fetch('/api/v1/font-generator/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.projectId,
          char,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setProject((p) => ({ ...p, error: json.error || 'Regeneration failed' }))
        return
      }

      const updated: FontCharacter = json.data?.character
      if (updated) {
        setProject((p) => ({
          ...p,
          characters: p.characters.map((c) => (c.char === updated.char ? updated : c)),
        }))
      }
    } catch (err) {
      setProject((p) => ({
        ...p,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    } finally {
      setRegeneratingChar(null)
    }
  }, [project.projectId])

  // --- Navigation ---
  const handleBack = useCallback(() => {
    setProject((p) => {
      if (p.step <= 1) return p
      return { ...p, step: (p.step - 1) as WizardStep, error: null }
    })
  }, [])

  const handleStartOver = useCallback(() => {
    setProject(DEFAULT_FONT_PROJECT)
    setActiveTab('create')
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadFromHistory = useCallback((entry: any) => {
    setProject({
      stylePreset: entry.style_preset ?? null,
      customPrompt: entry.custom_prompt || '',
      colors: entry.colors || [],
      colorMode: entry.color_mode || 'ai-suggested',
      referenceImageBase64: null,
      projectId: entry.project_id ?? null,
      characters: entry.characters || [],
      step: 3,
      loading: false,
      error: null,
    })
    setActiveTab('create')
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-2 tracking-tight">
        Font{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED]">
          Generator
        </span>
      </h1>
      <p className="text-sm text-slate-500 dark:text-[#a6abb5] text-center mb-6">
        {activeTab === 'history' ? 'Your generated fonts' : STEP_SUBTITLES[project.step]}
      </p>

      {/* Tab toggle */}
      <div className="flex justify-center gap-1 mb-6 bg-slate-50 dark:bg-[#131a23] rounded-xl p-1 max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#3D6AF2] text-white shadow-lg'
              : 'text-slate-400 dark:text-[#70767f] hover:text-white'
          }`}
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#3D6AF2] text-white shadow-lg'
              : 'text-slate-400 dark:text-[#70767f] hover:text-white'
          }`}
        >
          My Fonts
        </button>
      </div>

      {activeTab === 'history' ? (
        <MyFonts onLoadProject={handleLoadFromHistory} />
      ) : (
        <>
          {/* Step indicator */}
          <nav aria-label="Wizard progress" className="mb-8">
            {/* Desktop */}
            <ol className="hidden sm:flex items-center justify-center gap-0">
              {STEPS.map((s, i) => {
                const isCompleted = s < project.step
                const isCurrent = s === project.step
                return (
                  <li key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[#3D6AF2] border-[#3D6AF2]'
                            : isCurrent
                            ? 'border-[#3D6AF2] bg-[#3D6AF2]/20 shadow-[0_0_15px_rgba(61,106,242,0.4)]'
                            : 'border-slate-200 dark:border-[#1e2631] bg-transparent'
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-[#93aaff]' : 'text-slate-400 dark:text-[#70767f]'
                            }`}
                          >
                            {s}
                          </span>
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[11px] font-medium transition-colors ${
                          isCompleted || isCurrent ? 'text-[#93aaff]' : 'text-slate-400 dark:text-[#70767f]'
                        }`}
                      >
                        {STEP_LABELS[i]}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-12 lg:w-20 h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                          s < project.step ? 'bg-[#3D6AF2]' : 'bg-slate-200 dark:bg-[#1e2631]'
                        }`}
                      />
                    )}
                  </li>
                )
              })}
            </ol>

            {/* Mobile */}
            <div className="flex sm:hidden items-center justify-center gap-1.5">
              {STEPS.map((s, i) => {
                const isCompleted = s < project.step
                const isCurrent = s === project.step
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#3D6AF2] text-white'
                          : isCurrent
                          ? 'bg-[#3D6AF2]/15 text-[#3D6AF2] ring-1 ring-[#3D6AF2]/30'
                          : 'bg-slate-50 dark:bg-[#131a23] text-slate-400 dark:text-[#70767f]'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{s}</span>
                      )}
                      {isCurrent && <span>{STEP_LABELS[i]}</span>}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-3 h-0.5 rounded-full ${
                          s < project.step ? 'bg-[#3D6AF2]' : 'bg-slate-200 dark:bg-[#1e2631]'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Error display */}
          {project.error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {project.error}
            </div>
          )}

          {/* Step content */}
          <div id="wizard-content" style={{ scrollMarginTop: '80px' }}>
            {project.step === 1 && (
              <DescribeStep
                stylePreset={project.stylePreset}
                customPrompt={project.customPrompt}
                colors={project.colors}
                colorMode={project.colorMode}
                referenceImageBase64={project.referenceImageBase64}
                onStyleChange={(s) => setProject((p) => ({ ...p, stylePreset: s }))}
                onCustomPromptChange={(v) => setProject((p) => ({ ...p, customPrompt: v }))}
                onColorsChange={(c) => setProject((p) => ({ ...p, colors: c }))}
                onColorModeChange={(m) => setProject((p) => ({ ...p, colorMode: m }))}
                onReferenceChange={(base64) => setProject((p) => ({ ...p, referenceImageBase64: base64 }))}
                onNext={() => handlePreview(project)}
              />
            )}

            {project.step === 2 && (
              <PreviewStep
                characters={project.characters}
                loading={project.loading}
                error={project.error}
                onConfirm={handleGenerateFull}
                onRetry={() => handlePreview(project)}
                onBack={handleBack}
              />
            )}

            {project.step === 3 && (
              <AlphabetGrid
                characters={project.characters}
                loading={project.loading}
                totalExpected={36}
                onNext={() => setProject((p) => ({ ...p, step: 4 }))}
                onBack={handleBack}
              />
            )}

            {project.step === 4 && (
              <RefineStep
                characters={project.characters}
                regeneratingChar={regeneratingChar}
                onRegenerate={handleRegenerate}
                onNext={() => setProject((p) => ({ ...p, step: 5 }))}
                onBack={handleBack}
              />
            )}

            {project.step === 5 && (
              <DownloadStep
                characters={project.characters}
                projectId={project.projectId || ''}
                stylePreset={project.stylePreset || ''}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
