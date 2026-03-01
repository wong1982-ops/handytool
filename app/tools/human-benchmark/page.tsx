'use client'
import { useState, useCallback } from 'react'
import { Dashboard } from '@/tools/human-benchmark/dashboard'
import { TEST_CONFIGS } from '@/tools/human-benchmark/constants'
import { useTestScores } from '@/tools/human-benchmark/use-test-scores'
import { TestView } from '@/tools/human-benchmark/test-view'
import type { ViewState, TestId, TestComponentProps } from '@/tools/human-benchmark/types'

// Import all 8 test components
import { ReactionTime } from '@/tools/human-benchmark/tests/reaction-time'
import { SequenceMemory } from '@/tools/human-benchmark/tests/sequence-memory'
import { AimTrainer } from '@/tools/human-benchmark/tests/aim-trainer'
import { NumberMemory } from '@/tools/human-benchmark/tests/number-memory'
import { VerbalMemory } from '@/tools/human-benchmark/tests/verbal-memory'
import { ChimpTest } from '@/tools/human-benchmark/tests/chimp-test'
import { VisualMemory } from '@/tools/human-benchmark/tests/visual-memory'
import { TypingTest } from '@/tools/human-benchmark/tests/typing-test'

const TEST_COMPONENTS: Partial<Record<TestId, React.ComponentType<TestComponentProps>>> = {
  'reaction-time': ReactionTime,
  'sequence-memory': SequenceMemory,
  'aim-trainer': AimTrainer,
  'number-memory': NumberMemory,
  'verbal-memory': VerbalMemory,
  'chimp-test': ChimpTest,
  'visual-memory': VisualMemory,
  'typing': TypingTest,
}

export default function HumanBenchmarkPage() {
  const [view, setView] = useState<ViewState>('dashboard')
  const { getScore, saveScore, clearHistory } = useTestScores()

  const handleSelectTest = useCallback((testId: TestId) => setView(testId), [])
  const handleBack = useCallback(() => setView('dashboard'), [])
  const handleComplete = useCallback((testId: TestId, score: number) => {
    const config = TEST_CONFIGS.find(t => t.id === testId)
    saveScore(testId, score, config?.lowerIsBetter ?? false)
  }, [saveScore])

  if (view === 'dashboard') {
    return <Dashboard onSelectTest={handleSelectTest} />
  }

  const config = TEST_CONFIGS.find(t => t.id === view)!
  const testScore = getScore(view)
  const TestComponent = TEST_COMPONENTS[view]

  return (
    <TestView config={config} scores={testScore} onBack={handleBack} onClearHistory={() => clearHistory(view)}>
      {TestComponent != null ? (
        <TestComponent
          onComplete={(score: number) => handleComplete(view, score)}
          onBack={handleBack}
          bestScore={testScore?.best}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-400 text-lg font-medium mb-2">Coming Soon</p>
          <p className="text-slate-600 text-sm">This test is under development.</p>
        </div>
      )}
    </TestView>
  )
}
