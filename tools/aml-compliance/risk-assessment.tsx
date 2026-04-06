'use client'

import { useState, useCallback } from 'react'
import { RISK_QUESTIONS, calculateRiskAssessment } from './aml-data'
import type { RiskAssessmentAnswers, RiskAssessmentResult, RiskLevel } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string; badge: string }> = {
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', badge: 'bg-green-500' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500' },
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', badge: 'bg-red-500' },
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white ${RISK_COLORS[level].badge}`}>
      {level.toUpperCase()}
    </span>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RiskAssessment() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<RiskAssessmentAnswers>({})
  const [result, setResult] = useState<RiskAssessmentResult | null>(null)

  const totalSteps = RISK_QUESTIONS.length
  const currentQuestion = RISK_QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }, [currentQuestion])

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      // Calculate result
      setResult(calculateRiskAssessment(answers))
    }
  }, [currentStep, totalSteps, answers])

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }, [currentStep])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setAnswers({})
    setResult(null)
  }, [])

  // ── Result View ────────────────────────────────────────────────────────
  if (result) {
    const colors = RISK_COLORS[result.overallLevel]
    return (
      <div className="space-y-6">
        {/* Overall Rating */}
        <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Overall Risk Rating</h3>
            <RiskBadge level={result.overallLevel} />
          </div>
          <p className="text-sm text-slate-300">
            Your overall risk score is <span className={`font-bold ${colors.text}`}>{result.overallScore}</span> out of 3.0.
            {result.overallLevel === 'low' && ' Your business presents a lower risk profile, but you must still maintain an AML/CFT compliance programme.'}
            {result.overallLevel === 'medium' && ' Your business has moderate risk factors. Enhanced procedures are recommended in some areas.'}
            {result.overallLevel === 'high' && ' Your business has significant risk factors. Enhanced CDD and robust monitoring procedures are essential.'}
          </p>
        </div>

        {/* Risk Areas */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Risk Areas</h3>
          {result.areas.map((area) => {
            const areaColors = RISK_COLORS[area.level]
            return (
              <div key={area.area} className={`rounded-xl border ${areaColors.border} bg-[#131a23] p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">{area.area}</h4>
                  <RiskBadge level={area.level} />
                </div>
                {area.recommendations.length > 0 && (
                  <ul className="space-y-1.5">
                    {area.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${areaColors.badge} shrink-0`} />
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="min-h-[44px] px-6 py-2.5 rounded-xl border border-[#1e2631] bg-[#131a23] text-sm font-medium text-slate-300 hover:bg-[#1e2631] transition-colors"
          >
            Start Over
          </button>
          <p className="text-xs text-slate-500 self-center">
            Your risk assessment results are used to pre-fill the Compliance Programme tab.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs text-amber-400/80">
            <strong>Disclaimer:</strong> This tool provides general guidance only. It is not legal advice and does not replace the requirement for independent AML/CFT compliance advice. Contact the DIA AML/CFT team for specific guidance.
          </p>
        </div>
      </div>
    )
  }

  // ── Wizard View ────────────────────────────────────────────────────────
  const selectedValue = answers[currentQuestion.id]

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1e2631] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">{currentQuestion.question}</h3>
        {currentQuestion.helpText && (
          <p className="text-sm text-slate-400">{currentQuestion.helpText}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedValue === option.value
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full min-h-[44px] px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'border-[#3D6AF2] bg-[#3D6AF2]/10 text-white ring-1 ring-[#3D6AF2]/50'
                  : 'border-[#1e2631] bg-[#131a23] text-slate-300 hover:border-[#3D6AF2]/40 hover:bg-[#1e2631]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  isSelected ? 'border-[#3D6AF2] bg-[#3D6AF2]' : 'border-slate-600'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                {option.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#1e2631] bg-[#131a23] text-sm font-medium text-slate-300 hover:bg-[#1e2631] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedValue}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#3D6AF2] text-sm font-bold text-white hover:bg-[#3D79F2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentStep === totalSteps - 1 ? 'Calculate Risk' : 'Next'}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-amber-400/80">
          <strong>Disclaimer:</strong> This tool provides general guidance only. It is not legal advice and does not replace the requirement for independent AML/CFT compliance advice. Contact the DIA AML/CFT team for specific guidance.
        </p>
      </div>
    </div>
  )
}
