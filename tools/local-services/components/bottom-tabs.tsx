'use client'

import { useLocalServices } from '../local-services-provider'
import type { TabId } from '../local-services-types'

const TABS: { id: TabId; label: 'home' | 'favourites' | 'recent'; iconPath: string }[] = [
  {
    id: 'home',
    label: 'home',
    iconPath: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    id: 'favourites',
    label: 'favourites',
    iconPath: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  },
  {
    id: 'recent',
    label: 'recent',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

/** Mobile bottom tabs — hidden on lg+ */
export function BottomTabs() {
  const { state, dispatch, t } = useLocalServices()

  return (
    <nav className="lg:hidden flex min-h-[56px] items-center justify-around border-t border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-900">
      {TABS.map((tab) => {
        const isActive = state.activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
              isActive
                ? 'text-[var(--tk-color-primary-500)]'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.iconPath} />
            </svg>
            <span className="text-[10px] font-semibold">{t.tabs[tab.label]}</span>
          </button>
        )
      })}
    </nav>
  )
}

/** Desktop inline tabs — shown in header, hidden on mobile */
export function DesktopTabs() {
  const { state, dispatch, t } = useLocalServices()

  return (
    <div className="hidden lg:flex items-center gap-1">
      {TABS.map((tab) => {
        const isActive = state.activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-500)]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.iconPath} />
            </svg>
            {t.tabs[tab.label]}
          </button>
        )
      })}
    </div>
  )
}
