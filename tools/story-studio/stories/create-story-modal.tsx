'use client'

interface CreateStoryModalProps {
  open: boolean
  onClose: () => void
  onSelectMode: (mode: 'speed' | 'professional') => void
  onWriteFromScratch: () => void
}

export function CreateStoryModal({ open, onClose, onSelectMode, onWriteFromScratch }: CreateStoryModalProps) {
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
          {/* Speed Mode */}
          <button
            onClick={() => onSelectMode('speed')}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-amber-300 dark:hover:border-amber-600 transition-colors cursor-pointer group"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30
                flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">
                <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Speed Mode</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Quick story with cover. Add illustrations &amp; narration later.
                </p>
                <p className="text-xs text-amber-500 mt-1.5">20 credits</p>
              </div>
            </div>
          </button>

          {/* Professional Mode */}
          <button
            onClick={() => onSelectMode('professional')}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-[#1e2631] dark:hover:border-[#3D6AF2] transition-colors cursor-pointer group"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/15
                flex items-center justify-center shrink-0 group-hover:bg-[#3D6AF2]/15 dark:group-hover:bg-[#1e2631]">
                <svg className="w-5 h-5 text-[#3D6AF2]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Professional Mode</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Full creative control. Edit each page, fine-tune illustrations &amp; narration.
                </p>
                <p className="text-xs text-[#3D6AF2] mt-1.5">50 credits</p>
              </div>
            </div>
          </button>

          {/* Write from scratch */}
          <button
            onClick={onWriteFromScratch}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-[#1e2631] dark:hover:border-[#3D6AF2] transition-colors cursor-pointer group"
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
