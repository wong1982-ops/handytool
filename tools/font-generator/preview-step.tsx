'use client'

import { useState, useEffect } from 'react'
import type { FontCharacter } from './types'

const LOADING_MESSAGES = [
  'Crafting your letters...',
  'Mixing the perfect ink...',
  'Adding artistic flair...',
  'Shaping each stroke...',
  'Almost there...',
]

interface PreviewStepProps {
  characters: FontCharacter[]
  loading: boolean
  error: string | null
  onConfirm: () => void
  onRetry: () => void
  onBack: () => void
}

export function PreviewStep({ characters, loading, error, onConfirm, onRetry, onBack }: PreviewStepProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#1e2631" strokeWidth="4" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="url(#fontGrad)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * 0.25}`} />
            <defs>
              <linearGradient id="fontGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3D6AF2" />
                <stop offset="100%" stopColor="#af88ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">✦</span>
          </div>
        </div>
        <p className="text-white font-bold text-lg">{LOADING_MESSAGES[messageIndex]}</p>
        <p className="text-[#70767f] text-sm animate-pulse">Generating 8 sample characters</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-red-400 text-sm text-center">{error}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-[#3D6AF2] text-[#3D6AF2] rounded-xl text-sm font-medium min-h-[44px] cursor-pointer">Back</button>
          <button type="button" onClick={onRetry} className="px-4 py-2 bg-[#3D6AF2] text-white rounded-xl text-sm font-medium min-h-[44px] cursor-pointer">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {characters.map((c) => (
          <div key={c.char} className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-[#70767f] uppercase">{c.char}</span>
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-white shadow-lg">
              <img src={c.imageUrl} alt={`Letter ${c.char}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] font-semibold hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
          Back
        </button>
        <button type="button" onClick={onRetry}
          className="flex-1 border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] font-semibold hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer">
          Try Again
        </button>
        <button type="button" onClick={onConfirm}
          className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] cursor-pointer transition-opacity hover:opacity-90">
          Love it →
        </button>
      </div>
    </div>
  )
}
