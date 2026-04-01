'use client'

interface BottomTabsProps {
  activeView: string
  onChangeView: (view: any) => void
}

const TABS = [
  { id: 'map', label: 'MAP', icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' },
  { id: 'services', label: 'SERVICES', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
  { id: 'favourites', label: 'FAVORITES', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { id: 'history', label: 'HISTORY', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
]

export function BottomTabs({ activeView, onChangeView }: BottomTabsProps) {
  return (
    <nav className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 safe-area-pb">
      {TABS.map(tab => {
        const isActive = activeView === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChangeView(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
              isActive
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// Keep DesktopTabs export for backwards compatibility
export function DesktopTabs() { return null }
