'use client'

import { useState, useCallback } from 'react'
import { LogoProject, DEFAULT_PROJECT, WizardStep } from '@/tools/logo-generator/types'
import { BusinessInfoStep } from '@/tools/logo-generator/business-info-step'
import { StyleStep } from '@/tools/logo-generator/style-step'
import ConceptsGrid from '@/tools/logo-generator/concepts-grid'
import { LogoEditor } from '@/tools/logo-generator/logo-editor'
import { DownloadStep } from '@/tools/logo-generator/download-step'
import { MyLogos } from '@/tools/logo-generator/my-logos'

type Tab = 'create' | 'history'

const STEPS: WizardStep[] = [1, 2, 3, 4, 5]
const STEP_LABELS = ['Info', 'Style', 'Generate', 'Edit', 'Download']

const STEP_SUBTITLES: Record<WizardStep, string> = {
  1: 'Tell us about your business',
  2: 'Choose a visual style',
  3: 'Pick your favourite concept',
  4: 'Customise your logo',
  5: 'Download your logo',
}

export default function LogoWizard() {
  const [project, setProject] = useState<LogoProject>(DEFAULT_PROJECT)
  const [activeTab, setActiveTab] = useState<Tab>('create')

  // --- Generation ---
  const handleGenerate = useCallback(async (proj: LogoProject) => {
    setProject((p) => ({ ...p, step: 3, loading: true, error: null, concepts: [] }))

    try {
      const res = await fetch('/api/v1/logo-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: proj.businessName,
          tagline: proj.tagline,
          industry: proj.industry,
          style: proj.style,
          colors: proj.colors,
          customPrompt: proj.customPrompt || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setProject((p) => ({ ...p, loading: false, error: json.error || 'Generation failed' }))
        return
      }

      const concepts = json.data?.concepts ?? []
      setProject((p) => ({
        ...p,
        loading: false,
        concepts,
      }))

      // Auto-save generation to history (fire-and-forget)
      if (concepts.length > 0) {
        fetch('/api/v1/logo-generator/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: proj.businessName,
            tagline: proj.tagline,
            industry: proj.industry,
            style: proj.style,
            colors: proj.colors,
            customPrompt: proj.customPrompt || undefined,
            concepts,
          }),
        }).catch(() => {}) // silent — don't block UX if save fails
      }
    } catch (err) {
      setProject((p) => ({
        ...p,
        loading: false,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }, [])

  // --- Step transitions ---
  // Separate handler for step 2 → 3 to avoid stale closure issues
  const handleNextFromStyle = useCallback((currentProject: LogoProject) => {
    handleGenerate(currentProject)
  }, [handleGenerate])

  const handleBack = useCallback(() => {
    setProject((p) => {
      if (p.step <= 1) return p
      return { ...p, step: (p.step - 1) as WizardStep, error: null }
    })
  }, [])

  const handleRegenerate = useCallback(() => {
    handleGenerate(project)
  }, [handleGenerate, project])

  const handleStartOver = useCallback(() => {
    setProject(DEFAULT_PROJECT)
    setActiveTab('create')
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadFromHistory = useCallback((entry: any) => {
    setProject({
      businessName: entry.business_name,
      tagline: entry.tagline || '',
      industry: entry.industry || '',
      style: entry.style || 'modern',
      colors: entry.colors || [],
      colorMode: 'palette',
      customPrompt: entry.custom_prompt || '',
      concepts: entry.concepts || [],
      selectedIndex: entry.selected_index ?? null,
      step: 3, // Jump to concepts grid
      loading: false,
      error: null,
    })
    setActiveTab('create')
  }, [])

  const handleSelectConcept = useCallback((index: number) => {
    setProject((p) => ({
      ...p,
      selectedIndex: index,
      step: 4,
      error: null,
    }))
  }, [])

  const selectedConcept =
    project.selectedIndex !== null ? project.concepts[project.selectedIndex] : null

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-2 tracking-tight">
        Logo{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9]">
          Generator
        </span>
      </h1>
      <p className="text-sm text-[#a6abb5] text-center max-w-sm mx-auto mb-6">
        {activeTab === 'history' ? 'Your generated logos' : STEP_SUBTITLES[project.step]}
      </p>

      {/* Tab toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#131a23] rounded-xl p-1 flex gap-1 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'create'
                ? 'bg-[#3D6AF2] text-white shadow-lg'
                : 'text-[#70767f] hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'history'
                ? 'bg-[#3D6AF2] text-white shadow-lg'
                : 'text-[#70767f] hover:text-white'
            }`}
          >
            My Logos
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <MyLogos onLoadProject={handleLoadFromHistory} />
      ) : (
      <>
      {/* Step indicator */}
      <nav aria-label="Wizard progress" className="mb-10">
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
                        : 'border-[#1e2631] bg-transparent'
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
                          isCurrent ? 'text-[#3D6AF2]' : 'text-[#70767f]'
                        }`}
                      >
                        {s}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium transition-colors ${
                      isCompleted || isCurrent ? 'text-[#a6abb5]' : 'text-[#70767f]'
                    }`}
                  >
                    {STEP_LABELS[i]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-12 lg:w-20 h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                      s < project.step ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'
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
                      : 'bg-[#131a23] text-[#70767f]'
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
                      s < project.step ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'
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
          <BusinessInfoStep
            businessName={project.businessName}
            tagline={project.tagline}
            industry={project.industry}
            onBusinessNameChange={(v) => setProject((p) => ({ ...p, businessName: v }))}
            onTaglineChange={(v) => setProject((p) => ({ ...p, tagline: v }))}
            onIndustryChange={(v) => setProject((p) => ({ ...p, industry: v }))}
            onNext={() => setProject((p) => ({ ...p, step: 2, error: null }))}
          />
        )}

        {project.step === 2 && (
          <StyleStep
            style={project.style}
            colors={project.colors}
            colorMode={project.colorMode === 'palette' ? 'custom' : 'ai-suggested'}
            customPrompt={project.customPrompt}
            onStyleChange={(s) => setProject((p) => ({ ...p, style: s }))}
            onColorsChange={(c) => setProject((p) => ({ ...p, colors: c }))}
            onColorModeChange={(m) =>
              setProject((p) => ({ ...p, colorMode: m === 'custom' ? 'palette' : 'custom' }))
            }
            onCustomPromptChange={(v) => setProject((p) => ({ ...p, customPrompt: v }))}
            onNext={() => handleNextFromStyle(project)}
            onBack={handleBack}
          />
        )}

        {project.step === 3 && (
          <ConceptsGrid
            concepts={project.concepts}
            selectedIndex={project.selectedIndex}
            loading={project.loading}
            onSelect={handleSelectConcept}
            onRegenerate={handleRegenerate}
            onNext={() => {
              if (project.selectedIndex !== null) {
                setProject((p) => ({ ...p, step: 4, error: null }))
              }
            }}
            onBack={handleBack}
          />
        )}

        {project.step === 4 && selectedConcept && (
          <LogoEditor
            concept={selectedConcept}
            businessName={project.businessName}
            tagline={project.tagline}
            onBack={handleBack}
            onNext={() => setProject((p) => ({ ...p, step: 5, error: null }))}
          />
        )}

        {project.step === 5 && selectedConcept && (
          <DownloadStep
            concept={selectedConcept}
            businessName={project.businessName}
            onStartOver={handleStartOver}
          />
        )}
      </div>
      </>
      )}
    </div>
  )
}
