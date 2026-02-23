'use client'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

export function TypingTest({ onComplete, onBack, bestScore }: TestComponentProps) {
  return (
    <GameCard bgColor="#4f46e5">
      <div className="text-center text-white">
        <p className="text-2xl font-bold mb-4">Typing Test</p>
        <p className="text-white/60 mb-6">Coming soon...</p>
        <button onClick={onBack} className="px-6 py-3 bg-white/20 rounded-xl font-semibold min-h-[44px]">Back</button>
      </div>
    </GameCard>
  )
}
