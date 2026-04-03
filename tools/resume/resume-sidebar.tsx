'use client'

import { useResume } from './resume-provider'
import type { SidebarMode } from './resume-types'

const SIDEBAR_ITEMS: { mode: SidebarMode; icon: string }[] = [
  { mode: 'edit', icon: '✏️' },
  { mode: 'modules', icon: '📋' },
  { mode: 'beautify', icon: '🎨' },
  { mode: 'toolbox', icon: '🧰' },
  { mode: 'export', icon: '📤' },
]

export function ResumeSidebar() {
  const { state, dispatch, t, saveToCloudManual, cloudSaveStatus } = useResume()
  const { sidebarMode, resume, activeModule } = state

  const sidebarLabels: Record<SidebarMode, string> = {
    edit: t.sidebar.edit,
    modules: t.sidebar.modules,
    beautify: t.sidebar.beautify,
    toolbox: t.sidebar.toolbox,
    export: t.sidebar.export,
  }

  return (
    <aside className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-[220px] max-lg:w-[60px] shrink-0" role="navigation" aria-label="Resume editor navigation">
      {/* Mode tabs */}
      <nav className="flex flex-col gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
        {SIDEBAR_ITEMS.map(({ mode, icon }) => (
          <button
            key={mode}
            onClick={() => dispatch({ type: 'SET_SIDEBAR_MODE', payload: mode })}
            className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors text-left
              ${sidebarMode === mode
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            aria-current={sidebarMode === mode ? 'page' : undefined}
          >
            <span className="text-base" aria-hidden="true">{icon}</span>
            <span className="max-lg:hidden">{sidebarLabels[mode]}</span>
          </button>
        ))}
      </nav>

      {/* Module list (visible in edit mode) */}
      {sidebarMode === 'edit' && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-1">
            {resume.enabledModules.map((mod) => (
              <button
                key={mod}
                onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: mod })}
                className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-colors text-left
                  ${activeModule === mod
                    ? 'bg-gray-100 text-gray-900 font-medium dark:bg-gray-800 dark:text-gray-100'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                  }`}
              >
                <span className="max-lg:hidden truncate">{t.modules[mod as keyof typeof t.modules] ?? mod}</span>
                <span className="lg:hidden text-xs">{(t.modules[mod as keyof typeof t.modules] ?? mod).slice(0, 2)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {/* Save to cloud */}
        <button
          onClick={() => saveToCloudManual()}
          className={`w-full flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-colors ${
            cloudSaveStatus === 'saved'
              ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
              : cloudSaveStatus === 'error'
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          disabled={cloudSaveStatus === 'saving'}
          aria-label={t.actions.saveToCloud}
        >
          <span aria-hidden="true">
            {cloudSaveStatus === 'saving' ? '⏳' : cloudSaveStatus === 'saved' ? '✓' : cloudSaveStatus === 'error' ? '✕' : '☁️'}
          </span>
          <span className="max-lg:hidden">
            {cloudSaveStatus === 'saving' ? '...' : cloudSaveStatus === 'saved' ? 'Saved!' : t.actions.saveToCloud}
          </span>
        </button>

        {/* Locale toggle — hidden for now (English only) */}
        {/* TODO: re-enable when Chinese i18n is needed
        <button
          onClick={() =>
            dispatch({ type: 'SET_LOCALE', payload: resume.locale === 'en' ? 'zh' : 'en' })
          }
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle language"
        >
          <span aria-hidden="true">🌐</span>
          <span className="max-lg:hidden">{resume.locale === 'en' ? 'English' : '中文'}</span>
        </button>
        */}
      </div>
    </aside>
  )
}
