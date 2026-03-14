'use client'

interface AddOnsSectionProps {
  illustrationsDone: number
  narratedDone: number
  totalPages: number
  onOpenIllustrations: () => void
  onOpenNarration: () => void
}

function getLabel(done: number, total: number, noun: string): { text: string; button: string } {
  if (done === 0) return { text: `0 of ${total} pages ${noun}`, button: noun === 'illustrated' ? 'Add Illustrations' : 'Add Narration' }
  if (done >= total) return { text: `All ${total} pages ${noun}`, button: 'Review' }
  return { text: `${done} of ${total} pages ${noun}`, button: 'Continue' }
}

export function AddOnsSection({ illustrationsDone, narratedDone, totalPages, onOpenIllustrations, onOpenNarration }: AddOnsSectionProps) {
  const ill = getLabel(illustrationsDone, totalPages, 'illustrated')
  const nar = getLabel(narratedDone, totalPages, 'narrated')

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Illustrations card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Illustrations</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-2">{ill.text}</p>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: totalPages > 0 ? `${(illustrationsDone / totalPages) * 100}%` : '0%' }}
            />
          </div>
          <button
            onClick={onOpenIllustrations}
            className="w-full py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {ill.button}
          </button>
        </div>

        {/* Narration card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Narration</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-2">{nar.text}</p>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: totalPages > 0 ? `${(narratedDone / totalPages) * 100}%` : '0%' }}
            />
          </div>
          <button
            onClick={onOpenNarration}
            className="w-full py-2 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {nar.button}
          </button>
        </div>
      </div>
    </div>
  )
}
