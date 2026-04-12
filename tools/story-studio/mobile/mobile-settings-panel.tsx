'use client'

import { ART_STYLES } from '@/tools/story-studio/use-characters'
import { useLanguage } from '@/tools/story-studio/use-language-context'

export interface MobileSettingsPanelProps {
  open: boolean
  artStyle: string | null
  onArtStyleChange: (style: string | null) => void
  pageCount: number
  onPageCountChange: (count: number) => void
}

const PAGE_COUNT_OPTIONS = [4, 6, 8, 10]

export default function MobileSettingsPanel({
  open,
  artStyle,
  onArtStyleChange,
  pageCount,
  onPageCountChange,
}: MobileSettingsPanelProps) {
  const { t } = useLanguage()

  if (!open) return null

  return (
    <div
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-3 animate-in slide-in-from-bottom duration-200"
      role="region"
      aria-label="Settings panel"
    >
      {/* Art Style Section */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
          {t.plotInput.artStyle}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ART_STYLES.map(style => {
            const isSelected = artStyle === style.value
            return (
              <button
                key={style.value}
                onClick={() => onArtStyleChange(isSelected ? null : style.value)}
                aria-pressed={isSelected}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-purple-600 text-white focus-visible:ring-purple-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus-visible:ring-slate-400',
                ].join(' ')}
              >
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Page Count Section */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
          {t.common.pages}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PAGE_COUNT_OPTIONS.map(count => {
            const isSelected = pageCount === count
            return (
              <button
                key={count}
                onClick={() => onPageCountChange(count)}
                aria-pressed={isSelected}
                className={[
                  'px-3 py-2 rounded-full text-xs font-medium transition-all min-h-8 flex items-center',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-[#3D6AF2] text-white focus-visible:ring-[#3D6AF2]/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus-visible:ring-slate-400',
                ].join(' ')}
              >
                {count}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
