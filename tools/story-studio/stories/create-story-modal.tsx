'use client'

interface CreateStoryModalProps {
  open: boolean
  onClose: () => void
  onGenerateWithAI: () => void
  onWriteFromScratch: () => void
}

export function CreateStoryModal({ open, onClose, onGenerateWithAI, onWriteFromScratch }: CreateStoryModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create a New Story</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Generate with AI */}
          <button
            onClick={onGenerateWithAI}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30
                flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Generate with AI</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Describe your plot and AI generates a full story draft with scenes, dialogue, and image prompts.
                </p>
                <p className="text-xs text-indigo-500 mt-1.5">10 credits</p>
              </div>
            </div>
          </button>

          {/* Write from scratch */}
          <button
            onClick={onWriteFromScratch}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700
                flex items-center justify-center shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Write from scratch</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Start with a blank story. Add pages and write your own scenes, dialogue, and prompts.
                </p>
                <p className="text-xs text-green-500 mt-1.5">Free</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
