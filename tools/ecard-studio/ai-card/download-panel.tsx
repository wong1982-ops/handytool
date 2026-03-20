'use client'

import type { GeneratedDesign } from '@/tools/ecard-studio/ai-card/types'

interface DownloadPanelProps {
  design: GeneratedDesign
  onStartOver: () => void
  onMakeAnother: () => void
}

export function DownloadPanel({
  design,
  onStartOver,
  onMakeAnother,
}: DownloadPanelProps) {
  async function handleDownload() {
    try {
      const response = await fetch(design.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'business-card.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(design.imageUrl, '_blank')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Success message */}
      <div className="text-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--tk-color-text-primary)]">
          Your business card is ready!
        </h2>
      </div>

      {/* Final card preview */}
      <div className="mx-auto w-full max-w-lg">
        <div className="aspect-[3.5/2] w-full overflow-hidden rounded-xl bg-slate-100 shadow-lg dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.imageUrl}
            alt="Final business card"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex w-full flex-col gap-3">
        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[44px] w-full rounded-xl bg-gradient-to-r
            from-[var(--tk-color-primary-500)] to-[var(--tk-color-primary-600)]
            px-6 py-3 text-sm font-semibold text-white shadow-md
            transition-all hover:shadow-lg hover:brightness-110"
        >
          Download PNG
        </button>

        {/* Make Another */}
        <button
          type="button"
          onClick={onMakeAnother}
          className="min-h-[44px] w-full rounded-xl border border-[var(--tk-color-border)]
            bg-[var(--tk-color-bg-secondary)] px-6 py-3 text-sm font-semibold
            text-[var(--tk-color-text-primary)] transition-colors
            hover:bg-[var(--tk-color-bg-tertiary)]"
        >
          Make Another
        </button>

        {/* Start Over */}
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] w-full rounded-xl border border-[var(--tk-color-border)]
            bg-transparent px-6 py-3 text-sm font-semibold
            text-[var(--tk-color-text-secondary)] transition-colors
            hover:bg-[var(--tk-color-bg-secondary)]"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
