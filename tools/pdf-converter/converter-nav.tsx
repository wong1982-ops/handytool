export type ConversionMode = 'pdf-to-word' | 'word-to-pdf' | 'merge-pdf' | 'split-pdf' | 'compress-pdf'

interface ConverterNavProps {
  activeMode: ConversionMode
  onModeChange: (mode: ConversionMode) => void
}

const MODES: { id: ConversionMode; label: string; icon: React.ReactNode }[] = [
  {
    id: 'pdf-to-word',
    label: 'PDF to Word',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'word-to-pdf',
    label: 'Word to PDF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'merge-pdf',
    label: 'Merge PDF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: 'split-pdf',
    label: 'Split PDF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
  },
  {
    id: 'compress-pdf',
    label: 'Compress PDF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
]

const MODE_DESCRIPTIONS: Record<ConversionMode, { title: string; desc: string; accept: string; fromIcon: string; toIcon: string }> = {
  'pdf-to-word': { title: 'PDF to Word', desc: 'Convert your PDF documents into editable Word files with high precision.', accept: '.pdf', fromIcon: 'PDF', toIcon: 'DOCX' },
  'word-to-pdf': { title: 'Word to PDF', desc: 'Convert Word documents into PDF format for sharing.', accept: '.doc,.docx', fromIcon: 'DOCX', toIcon: 'PDF' },
  'merge-pdf': { title: 'Merge PDF', desc: 'Combine multiple PDF files into a single document.', accept: '.pdf', fromIcon: 'PDF', toIcon: 'PDF' },
  'split-pdf': { title: 'Split PDF', desc: 'Split a PDF into separate individual pages.', accept: '.pdf', fromIcon: 'PDF', toIcon: 'PDF' },
  'compress-pdf': { title: 'Compress PDF', desc: 'Reduce PDF file size while maintaining quality.', accept: '.pdf', fromIcon: 'PDF', toIcon: 'PDF' },
}

export { MODES, MODE_DESCRIPTIONS }

export function ConverterNav({ activeMode, onModeChange }: ConverterNavProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col hidden lg:flex">
      <nav className="flex-1 px-3 py-6 space-y-1">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors cursor-pointer ${
              activeMode === mode.id
                ? 'bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)] font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {mode.icon}
            <span className="text-sm">{mode.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
