'use client'

import { useState } from 'react'
import type { MoodOption, ColorPreference } from './types'
import { MOOD_CARDS, TEMPLATES } from './wizard-moods'
import { useDraftSnapshot } from '@/lib/hooks/use-draft'
import { ActionGate } from '@/components/auth/action-gate'

interface WizardProps {
  onGenerate: (params: { theme: string; mood: MoodOption; colorPreference: ColorPreference }) => void
  onViewBoards: () => void
}

type ColorPill = { value: ColorPreference; label: string }

const COLOR_PILLS: ColorPill[] = [
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'surprise', label: 'Surprise me' },
]

export default function Wizard({ onGenerate, onViewBoards }: WizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [theme, setTheme] = useState('')
  const [mood, setMood] = useState<MoodOption | null>(null)
  const [colorPreference, setColorPreference] = useState<ColorPreference>('surprise')
  const [showTemplates, setShowTemplates] = useState(false)

  useDraftSnapshot(
    'mood-board:draft',
    { step, theme, mood, colorPreference },
    (s) => {
      if (s.step !== undefined) setStep(s.step)
      if (s.theme !== undefined) setTheme(s.theme)
      if (s.mood !== undefined) setMood(s.mood)
      if (s.colorPreference !== undefined) setColorPreference(s.colorPreference)
    },
  )

  const handleTemplateClick = (templateTheme: string) => {
    setTheme(templateTheme)
    setShowTemplates(false)
    setStep(3)
  }

  const handleGenerate = () => {
    if (!mood) return
    onGenerate({ theme, mood, colorPreference })
  }

  const handleSkip = () => {
    if (!mood) return
    onGenerate({ theme, mood, colorPreference })
  }

  // Step indicator dots
  const StepDots = ({ current }: { current: 1 | 2 | 3 }) => (
    <div className="flex items-center gap-2 mb-8">
      <span className={`w-2 h-2 rounded-full ${current === 1 ? 'bg-[#3D6AF2]' : 'bg-[#3D9DF2]'}`} />
      <span className={`h-px w-6 ${current > 1 ? 'bg-[#3D9DF2]' : 'bg-[#1e2631]'}`} />
      <span className={`w-2 h-2 rounded-full ${current === 2 ? 'bg-[#3D6AF2]' : current > 2 ? 'bg-[#3D9DF2]' : 'bg-[#1e2631]'}`} />
      <span className={`h-px w-6 ${current > 2 ? 'bg-[#3D9DF2]' : 'bg-[#1e2631]'}`} />
      <span className={`w-2 h-2 rounded-full ${current === 3 ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'}`} />
    </div>
  )

  return (
    <div className="min-h-full flex items-center justify-center relative">
      {/* My Boards button — top-right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onViewBoards}
          className="bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] hover:text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          My Boards
        </button>
      </div>

      <div className="max-w-[520px] w-full px-4">
        {/* ── Step 1: Theme ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <StepDots current={1} />

            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold text-white leading-tight">What&apos;s your mood board for?</h1>
              <p className="text-sm text-[#a6abb5]">Describe your project, brand, or creative vision.</p>
            </div>

            <textarea
              rows={3}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="A cozy autumn wedding with rustic details..."
              className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white placeholder-[#70767f] px-4 py-3.5 text-sm resize-none focus:outline-none focus:border-[#3D6AF2] transition-colors"
            />

            <button
              onClick={() => setStep(2)}
              disabled={theme.trim().length < 3}
              className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white rounded-xl min-h-[44px] px-6 py-3 font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <div className="text-center">
              <button
                onClick={() => setShowTemplates((v) => !v)}
                className="text-[#3D6AF2] hover:underline text-sm bg-transparent border-none cursor-pointer"
              >
                Or start from a template
              </button>
            </div>

            {showTemplates && (
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateClick(tpl.theme)}
                    className="rounded-[10px] bg-[#131a23] border border-[#1e2631] p-3.5 hover:bg-[#1e2631] hover:border-[#3D6AF2] cursor-pointer text-left transition-all"
                  >
                    <span className="text-[13px] font-semibold text-white">{tpl.label}</span>
                    <p className="text-[11px] text-[#70767f] mt-1 leading-snug line-clamp-2">{tpl.theme}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Visual Mood ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <StepDots current={2} />

            <h2 className="text-2xl font-bold text-white">Pick a vibe</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOOD_CARDS.map((card) => {
                const isSelected = mood === card.id
                return (
                  <button
                    key={card.id}
                    onClick={() => setMood(card.id)}
                    className={[
                      'group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] border bg-[#131a23] p-0 text-left',
                      isSelected
                        ? 'border-transparent'
                        : 'border-[#1e2631] hover:border-[#2a3545]',
                    ].join(' ')}
                    style={{
                      ...(isSelected ? { boxShadow: `0 0 0 2px ${card.accent}, 0 0 20px ${card.accent}40` } : {}),
                    }}
                  >
                    {/* Gradient background */}
                    <div
                      className="aspect-[4/3] w-full relative"
                      style={{ background: card.gradient }}
                    >
                      {/* Pattern overlay */}
                      <div
                        className="absolute inset-0"
                        style={{ backgroundImage: card.pattern, backgroundSize: '20px 20px' }}
                      />
                      {/* Hover shimmer */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-[#3D6AF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Label area */}
                    <div className="px-3 py-2.5 bg-[#131a23] text-left">
                      <div className="text-[13px] font-semibold text-white">{card.label}</div>
                      <div className="text-[11px] text-[#70767f] mt-0.5 leading-snug">{card.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] hover:text-white rounded-xl min-h-[44px] px-6 py-3 text-sm font-medium transition-colors inline-flex items-center justify-center"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={mood === null}
                className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white rounded-xl min-h-[44px] px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                Next
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Color Preference ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <StepDots current={3} />

            <div>
              <h2 className="text-2xl font-bold text-white">Any color direction?</h2>
              <p className="text-sm text-[#a6abb5] mt-2">This shapes the palette AI generates for your board.</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start">
              {COLOR_PILLS.map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setColorPreference(pill.value)}
                  className={[
                    'rounded-full px-6 py-2.5 text-sm font-medium min-h-[44px] transition-colors',
                    colorPreference === pill.value
                      ? 'bg-[#3D6AF2] text-white border border-[#3D6AF2]'
                      : 'bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] hover:text-white',
                  ].join(' ')}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-[13px] text-[#70767f] hover:text-[#a6abb5] transition-colors bg-transparent border-none cursor-pointer"
              >
                Skip
              </button>
            </div>

            <div className="w-full max-w-[380px] mx-auto flex flex-col gap-3">
              <ActionGate cost={1}>
                {() => (
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white rounded-xl min-h-[44px] px-6 py-3 font-semibold text-[15px] hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    Generate Board
                  </button>
                )}
              </ActionGate>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] hover:text-white rounded-xl min-h-[44px] px-6 py-3 text-sm font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
