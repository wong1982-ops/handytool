'use client'

import type { WizardStep, BookStatus } from './types'

interface StepConfig {
  key: WizardStep
  label: string
  icon: React.ReactNode
}

const STEPS: StepConfig[] = [
  {
    key: 'input',
    label: 'Story Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.85 2.85a1.5 1.5 0 0 1 2.12 0l.18.18a1.5 1.5 0 0 1 0 2.12L7.4 14.9l-3.18.71.71-3.18L14.85 2.85Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 5.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'story',
    label: 'Review',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 6h6M7 10h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'illustrations',
    label: 'Illustrate',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 14l4-4 3 3 3-4 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'editor',
    label: 'Book',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 4C8.5 2.5 6 2 3 2v14c3 0 5.5.5 7 2 1.5-1.5 4-2 7-2V2c-3 0-5.5.5-7 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 4v14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

const STEP_ORDER: WizardStep[] = ['input', 'story', 'illustrations', 'editor']

function getStepIndex(step: WizardStep): number {
  return STEP_ORDER.indexOf(step)
}

/** Determine the maximum navigable step index based on bookStatus */
function getMaxNavigableIndex(bookStatus?: BookStatus): number {
  if (!bookStatus) return 0
  switch (bookStatus) {
    case 'draft':
      return 1 // can go back to input or stay on story
    case 'story-approved':
      return 2 // can navigate to illustrations
    case 'illustrating':
      return 2
    case 'complete':
      return 3
    default:
      return 0
  }
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface WizardProgressProps {
  currentStep: WizardStep
  onStepClick: (step: WizardStep) => void
  bookStatus?: BookStatus
}

export function WizardProgress({ currentStep, onStepClick, bookStatus }: WizardProgressProps) {
  const currentIndex = getStepIndex(currentStep)
  const maxNavigable = getMaxNavigableIndex(bookStatus)

  return (
    <nav aria-label="Wizard progress" className="w-full px-2 py-4 sm:px-4">
      <ol className="flex items-center justify-between relative">
        {STEPS.map((step, index) => {
          const isActive = step.key === currentStep
          const isCompleted = index < currentIndex
          const isClickable = index <= maxNavigable && index !== currentIndex
          const isFuture = index > currentIndex

          return (
            <li
              key={step.key}
              className="flex flex-1 items-center relative"
            >
              {/* Connecting line (not on first step) */}
              {index > 0 && (
                <div className="flex-1 h-0.5 mx-1 sm:mx-2">
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      index <= currentIndex
                        ? 'bg-[#3D6AF2]'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                </div>
              )}

              {/* Step circle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${step.label}${isCompleted ? ' (completed)' : ''}${isActive ? ' (current)' : ''}`}
                className={`
                  flex flex-col items-center gap-1 sm:gap-1.5 shrink-0
                  min-w-[44px] min-h-[44px] justify-center
                  transition-all duration-200
                  ${isClickable ? 'cursor-pointer hover:scale-105' : ''}
                  ${!isClickable && !isActive ? 'cursor-default' : ''}
                  ${isActive ? 'cursor-default' : ''}
                  disabled:cursor-default
                `}
              >
                {/* Circle */}
                <span
                  className={`
                    flex items-center justify-center
                    w-10 h-10 sm:w-11 sm:h-11 rounded-full
                    border-2 transition-all duration-300
                    ${isActive
                      ? 'border-[#3D6AF2] bg-[#3D6AF2] text-white shadow-md shadow-[#3D6AF2]/30'
                      : isCompleted
                        ? 'border-[#3D6AF2] bg-[#3D6AF2]/10 text-[#3D6AF2] dark:bg-[#3D6AF2]/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? <CheckIcon /> : step.icon}
                </span>

                {/* Label — hidden on mobile */}
                <span
                  className={`
                    hidden sm:block text-xs font-medium transition-colors duration-200
                    ${isActive
                      ? 'text-[#3D6AF2] font-bold'
                      : isCompleted
                        ? 'text-[#3D6AF2]/80 dark:text-[#3D6AF2]/70'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
