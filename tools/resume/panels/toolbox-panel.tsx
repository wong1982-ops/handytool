'use client'

import { useState } from 'react'
import { useResume } from '../resume-provider'
import type { AIAnalysisResponse } from '../resume-types'

export function ToolboxPanel() {
  const { state, t } = useResume()
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

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
      // Will add error toast in Phase 9
    } finally {
      setAnalyzing(false)
    }
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
          <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
            Coming soon
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
              {/* Score */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-blue-500">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analysis.score}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.ai.score}</p>
              </div>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">
                    {t.ai.strengths}
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-green-500 shrink-0">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">
                    {t.ai.improvements}
                  </h4>
                  <ul className="space-y-1">
                    {analysis.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-amber-500 shrink-0">!</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                    {t.ai.suggestions}
                  </h4>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-blue-500 shrink-0">→</span>
                        {s}
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
