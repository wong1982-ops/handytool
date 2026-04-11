'use client'

import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterEditorProps {
  input: string
  output: string
  onInputChange: (value: string) => void
  t: I18nStrings
}

export function FormatterEditor({ input, output, onInputChange, t }: FormatterEditorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Input pane */}
      <div className="flex flex-col">
        <label htmlFor="formatter-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          {t.panes.input}
        </label>
        <textarea
          id="formatter-input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t.panes.inputPlaceholder}
          spellCheck={false}
          className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
          style={{ height: 'clamp(280px, 55vh, 600px)' }}
        />
      </div>

      {/* Output pane */}
      <div className="flex flex-col">
        <label htmlFor="formatter-output" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          {t.panes.output}
        </label>
        <textarea
          id="formatter-output"
          value={output}
          readOnly
          placeholder={t.panes.outputPlaceholder}
          spellCheck={false}
          className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0f17] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
          style={{ height: 'clamp(280px, 55vh, 600px)' }}
        />
      </div>
    </div>
  )
}
