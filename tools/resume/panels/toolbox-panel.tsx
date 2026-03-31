'use client'

import { useState } from 'react'
import { useResume } from '../resume-provider'
import { RESUME_SAMPLES, type ResumeSample } from '../resume-samples'
import type { AIAnalysisResponse, ResumeState } from '../resume-types'

export function ToolboxPanel() {
  const { state, dispatch, t } = useResume()
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedSample, setSelectedSample] = useState<ResumeSample | null>(null)

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

  const handleLoadSample = (sample: ResumeSample) => {
    const newResume: ResumeState = {
      ...sample.resume,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'LOAD_STATE', payload: newResume })
    dispatch({ type: 'SET_SIDEBAR_MODE', payload: 'edit' })
    dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'baseInfo' })
    setSelectedSample(null)
  }

  return (
    <div className="flex-1 overflow-y-auto">
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
            {RESUME_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setSelectedSample(sample)}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-left group"
              >
                <span className="text-2xl shrink-0 mt-0.5">{sample.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
            ))}
          </div>
        </section>

        {/* Sample Preview Modal */}
        {selectedSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedSample(null)}>
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedSample.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedSample.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedSample.description}
                  </p>
                </div>
              </div>

              {/* Preview info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Name</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedSample.resume.baseInfo.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Position</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedSample.resume.jobIntention.position}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Sections</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedSample.resume.enabledModules.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Theme</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium capitalize">{selectedSample.resume.theme.templateId.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Language</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedSample.resume.locale === 'zh' ? '中文' : 'English'}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedSample(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLoadSample(selectedSample)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
              </div>

              <p className="text-[10px] text-center text-gray-400">
                This will replace your current resume content
              </p>
            </div>
          </div>
        )}

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
