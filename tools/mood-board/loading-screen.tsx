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
    <div className="min-h-screen bg-[#090f16] flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(61,106,242,0.15) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-[380px] w-full px-4 text-center relative">
        {/* Spinner */}
        <div className="w-11 h-11 rounded-full border-2 border-[#1e2631] border-t-[#3D6AF2] animate-spin mx-auto mb-5" />

        <p className="text-[15px] text-[#a6abb5] font-medium mb-7">Building your board&hellip;</p>

        {/* Progress Steps */}
        <div className="flex flex-col gap-3.5 text-left mb-8">
          {STEPS.map((label, index) => {
            const isActive = step === index
            const isCompleted = step > index
            const isPending = step < index

            return (
              <div key={index} className="flex items-center gap-2.5">
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#3D6AF2] animate-pulse shrink-0" />
                )}
                {isCompleted && (
                  <span className="text-[#a6abb5] shrink-0 text-base leading-none">&#10003;</span>
                )}
                {isPending && (
                  <span className="w-2 h-2 rounded-full border border-[#1e2631] shrink-0" />
                )}
                <span
                  className={
                    isActive
                      ? 'text-white font-semibold text-sm'
                      : isCompleted
                        ? 'text-[#a6abb5] text-sm'
                        : 'text-[#70767f] text-sm'
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
              className={`aspect-square rounded-[10px] ${
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
