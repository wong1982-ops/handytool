'use client'

interface LoadingScreenProps {
  step: number         // 0-3: which generation phase is active
  completedImages: number  // 0-8: how many images have been generated so far
}

const STEPS = [
  'Generating images...',
  'Creating palette...',
  'Picking fonts...',
  'Arranging board...',
]

export default function LoadingScreen({ step, completedImages }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#090f16] flex flex-col items-center justify-center">
      <div className="max-w-md w-full px-4 text-center">
        {/* Spinner */}
        <div className="w-10 h-10 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin mx-auto mb-6" />

        {/* Progress Steps */}
        <div className="space-y-3 text-left mb-8">
          {STEPS.map((label, index) => {
            const isActive = step === index
            const isCompleted = step > index
            const isPending = step < index

            return (
              <div key={index} className="flex items-center gap-2">
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#3D6AF2] animate-pulse shrink-0" />
                )}
                {isCompleted && (
                  <span className="text-[#a6abb5] shrink-0 text-sm leading-none">✓</span>
                )}
                {isPending && (
                  <span className="w-2 h-2 rounded-full bg-transparent shrink-0" />
                )}
                <span
                  className={
                    isActive
                      ? 'text-white font-medium'
                      : isCompleted
                        ? 'text-[#a6abb5]'
                        : 'text-[#70767f]'
                  }
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, slotIndex) => (
            <div
              key={slotIndex}
              className={`aspect-square rounded-lg ${
                completedImages > slotIndex
                  ? 'bg-[#1e2631]'
                  : 'bg-[#131a23] animate-pulse'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
