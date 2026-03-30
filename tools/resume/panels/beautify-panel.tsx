'use client'

import { useResume } from '../resume-provider'
import type { TemplateId, FontFamily, FontSize } from '../resume-types'

const THEMES: { id: TemplateId; color: string }[] = [
  { id: 'classic', color: '#D4A052' },
  { id: 'blue-minimal', color: '#3D6AF2' },
  { id: 'yellow-minimal', color: '#F2C94C' },
]

const FONTS: { id: FontFamily; label: 'fontFamilySystem' | 'fontFamilySerif' | 'fontFamilyMono' }[] = [
  { id: 'system', label: 'fontFamilySystem' },
  { id: 'serif', label: 'fontFamilySerif' },
  { id: 'mono', label: 'fontFamilyMono' },
]

const SIZES: { id: FontSize; label: 'fontSizeSm' | 'fontSizeMd' | 'fontSizeLg' }[] = [
  { id: 'sm', label: 'fontSizeSm' },
  { id: 'md', label: 'fontSizeMd' },
  { id: 'lg', label: 'fontSizeLg' },
]

export function BeautifyPanel() {
  const { state, dispatch, t } = useResume()
  const { theme } = state.resume

  const themeNames: Record<TemplateId, string> = {
    classic: t.beautify.classic,
    'blue-minimal': t.beautify.blueMinimal,
    'yellow-minimal': t.beautify.yellowMinimal,
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.beautify.title}
        </h2>

        {/* Theme selection */}
        <section>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t.beautify.themes}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ id, color }) => (
              <button
                key={id}
                onClick={() => dispatch({ type: 'SET_THEME', payload: { templateId: id, primaryColor: color } })}
                className={`relative rounded-xl border-2 p-3 transition-all ${
                  theme.templateId === id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                aria-label={themeNames[id]}
                aria-pressed={theme.templateId === id}
              >
                {/* Mini preview */}
                <div className="bg-white rounded-lg shadow-sm aspect-[210/297] p-2 mb-2">
                  <div className="h-3 rounded-sm mb-1.5" style={{ backgroundColor: color }} />
                  <div className="space-y-1">
                    <div className="h-1.5 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-1 bg-gray-100 rounded-full w-full" />
                    <div className="h-1 bg-gray-100 rounded-full w-5/6" />
                    <div className="h-1.5 rounded-sm mt-2 w-1/2" style={{ backgroundColor: color + '40' }} />
                    <div className="h-1 bg-gray-100 rounded-full w-full" />
                    <div className="h-1 bg-gray-100 rounded-full w-4/5" />
                  </div>
                </div>
                <p className="text-xs text-center font-medium text-gray-700 dark:text-gray-300">
                  {themeNames[id]}
                </p>
                {theme.templateId === id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Accent color */}
        <section>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t.beautify.primaryColor}
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => dispatch({ type: 'SET_THEME', payload: { primaryColor: e.target.value } })}
              className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
              aria-label={t.beautify.primaryColor}
            />
            <input
              type="text"
              value={theme.primaryColor}
              onChange={(e) => dispatch({ type: 'SET_THEME', payload: { primaryColor: e.target.value } })}
              className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 font-mono"
              aria-label="Color hex value"
            />
          </div>
        </section>

        {/* Font family */}
        <section>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t.beautify.fontFamily}
          </h3>
          <div className="flex gap-2">
            {FONTS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => dispatch({ type: 'SET_THEME', payload: { fontFamily: id } })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  theme.fontFamily === id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-pressed={theme.fontFamily === id}
              >
                {t.beautify[label]}
              </button>
            ))}
          </div>
        </section>

        {/* Font size */}
        <section>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t.beautify.fontSize}
          </h3>
          <div className="flex gap-2">
            {SIZES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => dispatch({ type: 'SET_THEME', payload: { fontSize: id } })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  theme.fontSize === id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-pressed={theme.fontSize === id}
              >
                {t.beautify[label]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
