'use client'

import { useState, useRef } from 'react'
import { useResume } from '../resume-provider'
import { RESUME_SAMPLES, type ResumeSample } from '../resume-samples'
import type { AIAnalysisResponse, ResumeState } from '../resume-types'

export function ToolboxPanel() {
  const { state, dispatch, t } = useResume()
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [previewing, setPreviewing] = useState<ResumeSample | null>(null)
  const savedResumeRef = useRef<ResumeState | null>(null)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/v1/resume/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: state.resume }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const json = await res.json()
      setAnalysis(json.data || json)
    } catch {
      // error handling
    } finally {
      setAnalyzing(false)
    }
  }

  // Preview a sample: save current resume, load sample into preview
  const handlePreviewSample = (sample: ResumeSample) => {
    // Save current resume so we can restore on cancel
    if (!previewing) {
      savedResumeRef.current = { ...state.resume }
    }

    const previewResume: ResumeState = {
      ...sample.resume,
      id: state.resume.id, // keep the same id
      createdAt: state.resume.createdAt,
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'LOAD_STATE', payload: previewResume })
    setPreviewing(sample)
  }

  // Confirm: keep the sample, switch to edit mode
  const handleConfirmSample = () => {
    savedResumeRef.current = null
    setPreviewing(null)
    dispatch({ type: 'SET_SIDEBAR_MODE', payload: 'edit' })
    dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'baseInfo' })
  }

  // Cancel: restore the saved resume
  const handleCancelPreview = () => {
    if (savedResumeRef.current) {
      dispatch({ type: 'LOAD_STATE', payload: savedResumeRef.current })
      savedResumeRef.current = null
    }
    setPreviewing(null)
  }

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Floating confirm/cancel bar when previewing a sample */}
      {previewing && (
        <div className="sticky top-0 z-20 bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: previewing.icon }}
            >
              {previewing.title.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Previewing: {previewing.title}</p>
              <p className="text-[10px] text-blue-200">Check the preview on the right</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCancelPreview}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSample}
              className="px-3 py-1.5 text-xs font-medium bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Use Template
            </button>
          </div>
        </div>
      )}

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.toolbox.title}
        </h2>

        {/* Resume Samples */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {t.toolbox.samples}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t.toolbox.samplesDescription}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RESUME_SAMPLES.map((sample) => {
              const isActive = previewing?.id === sample.id
              return (
                <button
                  key={sample.id}
                  onClick={() => handlePreviewSample(sample)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left group ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: sample.icon }}
                  >
                    {sample.title.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}>
                      {sample.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {sample.description}
                    </p>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {sample.category}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* AI Resume Analysis */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {t.toolbox.aiAnalysis}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t.toolbox.aiAnalysisDescription}
          </p>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? t.ai.analyzing : t.ai.analyze}
          </button>

          {analysis && (
            <div className="mt-4 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-blue-500">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analysis.score}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.ai.score}</p>
              </div>

              {analysis.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">{t.ai.strengths}</h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-green-500 shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.improvements.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">{t.ai.improvements}</h4>
                  <ul className="space-y-1">
                    {analysis.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-amber-500 shrink-0">!</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">{t.ai.suggestions}</h4>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-blue-500 shrink-0">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
