'use client'

import { useState } from 'react'
import type { MoodOption, ColorPreference } from './types'
import { MOOD_CARDS, TEMPLATES } from './wizard-moods'

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

  return (
    <div className="min-h-full flex items-center justify-center relative">
      {/* My Boards button — top-right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onViewBoards}
          className="bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] rounded-xl px-4 py-2 text-sm font-medium transition-colors min-h-[44px]"
        >
          My Boards
        </button>
      </div>

      <div className="max-w-xl w-full px-4">
        {/* ── Step 1: Theme ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-white">What&apos;s your mood board for?</h1>
              <p className="text-[#a6abb5]">Describe your project, brand, or creative vision</p>
            </div>

            <textarea
              rows={3}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="A cozy autumn wedding with rustic details..."
              className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white placeholder-[#70767f] p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:border-transparent transition-colors"
            />

            <button
              onClick={() => setStep(2)}
              disabled={theme.trim().length < 3}
              className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white rounded-xl min-h-[44px] px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>

            <div className="text-center">
              <button
                onClick={() => setShowTemplates((v) => !v)}
                className="text-[#3D6AF2] hover:underline text-sm"
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
                    className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 hover:bg-[#1e2631] cursor-pointer text-left transition-colors"
                  >
                    <span className="text-sm font-medium text-white">{tpl.label}</span>
                    <p className="text-xs text-[#70767f] mt-1 line-clamp-2">{tpl.theme}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Visual Mood ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Pick a vibe</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOOD_CARDS.map((card) => {
                const isSelected = mood === card.id
                return (
                  <button
                    key={card.id}
                    onClick={() => setMood(card.id)}
                    className={[
                      'group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]',
                      isSelected
                        ? 'ring-2 shadow-lg'
                        : 'ring-1 ring-[#1e2631] hover:ring-[#2a3545]',
                    ].join(' ')}
                    style={{
                      ...(isSelected ? { ringColor: card.accent, boxShadow: `0 0 20px ${card.accent}40` } : {}),
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
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#3D6AF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Label area */}
                    <div className="px-3 py-2.5 bg-[#131a23] text-left">
                      <div className="text-sm font-semibold text-white">{card.label}</div>
                      <div className="text-[11px] text-[#70767f] mt-0.5 leading-snug">{card.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] rounded-xl min-h-[44px] px-6 py-3 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={mood === null}
                className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white rounded-xl min-h-[44px] px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Color Preference ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6 items-center">
            <h2 className="text-2xl font-bold text-white self-start">Any color direction?</h2>

            <div className="flex flex-wrap gap-3 justify-center">
              {COLOR_PILLS.map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setColorPreference(pill.value)}
                  className={[
                    'rounded-full px-6 py-2.5 text-sm font-medium min-h-[44px] transition-colors',
                    colorPreference === pill.value
                      ? 'bg-[#3D6AF2] text-white'
                      : 'bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631]',
                  ].join(' ')}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSkip}
              className="text-sm text-[#70767f] hover:text-[#a6abb5] transition-colors"
            >
              Skip
            </button>

            <div className="w-full max-w-sm flex flex-col gap-3">
              <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white rounded-xl min-h-[44px] px-6 py-3 font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Generate Board
              </button>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] rounded-xl min-h-[44px] px-6 py-3 text-sm font-medium transition-colors"
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
