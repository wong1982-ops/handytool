'use client'

interface SettingsPanelProps {
  bgColor: string
  onBgColorChange: (color: string) => void
  exportMode: 'digital' | 'print'
  onExportModeChange: (mode: 'digital' | 'print') => void
  paperSize: string
  onPaperSizeChange: (size: string) => void
  hasPhoto: boolean
  photoUrl: string | null
  onDownload: () => void
}

const BG_COLORS = [
  { id: 'white', label: 'White', color: '#ffffff', border: true },
  { id: 'blue', label: 'Blue', color: '#3b82f6', border: false },
  { id: 'grey', label: 'Grey', color: '#94a3b8', border: false },
]

export function SettingsPanel({
  bgColor,
  onBgColorChange,
  exportMode,
  onExportModeChange,
  paperSize,
  onPaperSizeChange,
  hasPhoto,
  photoUrl,
  onDownload,
}: SettingsPanelProps) {
  return (
    <aside className="w-72 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col hidden xl:flex overflow-y-auto">
      <div className="p-6 space-y-6 flex-1">
        {/* Background Color */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--ht-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Background Color
          </h3>
          <div className="flex gap-4">
            {BG_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => onBgColorChange(c.color)}
                className="group flex flex-col items-center gap-2 cursor-pointer"
                aria-label={`Background ${c.label}`}
              >
                <div
                  className={`w-12 h-12 rounded-full transition-transform group-hover:scale-110 ${
                    bgColor === c.color
                      ? 'border-2 border-[var(--ht-color-secondary-500)] ring-4 ring-[var(--ht-color-secondary-500)]/10 shadow-sm'
                      : `border-2 ${c.border ? 'border-slate-200 dark:border-slate-600' : 'border-transparent'}`
                  }`}
                  style={{ backgroundColor: c.color }}
                />
                <span className={`text-xs ${bgColor === c.color ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {c.label}
                </span>
              </button>
            ))}
            <button
              className="group flex flex-col items-center gap-2 cursor-pointer"
              aria-label="Custom background color"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Custom</span>
            </button>
          </div>
        </div>

        {/* Export Settings */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--ht-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export Settings
          </h3>
          <div className="space-y-3">
            <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              exportMode === 'digital'
                ? 'border-[var(--ht-color-secondary-500)]/30 bg-[var(--ht-color-secondary-500)]/5'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}>
              <input
                type="radio"
                name="export"
                checked={exportMode === 'digital'}
                onChange={() => onExportModeChange('digital')}
                className="accent-[var(--ht-color-secondary-500)] h-4 w-4"
              />
              <div className="ml-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Digital ID Photo</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Single JPEG, optimized for online uploads</p>
              </div>
            </label>
            <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              exportMode === 'print'
                ? 'border-[var(--ht-color-secondary-500)]/30 bg-[var(--ht-color-secondary-500)]/5'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}>
              <input
                type="radio"
                name="export"
                checked={exportMode === 'print'}
                onChange={() => onExportModeChange('print')}
                className="accent-[var(--ht-color-secondary-500)] h-4 w-4"
              />
              <div className="ml-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Printable 4&quot; x 6&quot; Sheet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">6 photos per sheet, ready to print</p>
              </div>
            </label>
          </div>
        </div>

        {/* Print Preview */}
        {hasPhoto && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Print Preview</h3>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 aspect-[1/1.4]">
              <div className="grid grid-cols-2 gap-1.5 h-full">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-700 rounded-sm shadow-sm overflow-hidden flex items-center justify-center">
                    {photoUrl && i < 4 ? (
                      <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paper Size */}
        <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase mb-2">Paper Size</p>
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-sm font-bold focus:ring-0 cursor-pointer dark:text-white"
            aria-label="Paper size"
          >
            <option value="4x6">4 × 6 inches (Standard)</option>
            <option value="a4">A4 Paper (8.3 × 11.7&quot;)</option>
            <option value="3.5x5">3.5 × 5 inches</option>
          </select>
        </div>

        {/* Info tip */}
        <div className="p-4 bg-[var(--ht-color-secondary-500)]/5 rounded-xl border border-[var(--ht-color-secondary-500)]/10">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--ht-color-secondary-500)] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Ensure you use matte or glossy photo paper for official submissions.
            </p>
          </div>
        </div>
      </div>

      {/* Download CTA */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onDownload}
          disabled={!hasPhoto}
          className="w-full bg-[var(--ht-color-secondary-500)] text-slate-900 font-black text-base py-3.5 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          DOWNLOAD PHOTO
        </button>
        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-2">
          Secure processing. Photos stay in your browser.
        </p>
      </div>
    </aside>
  )
}
