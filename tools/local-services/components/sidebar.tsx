'use client'

import { useLocalServices } from '../local-services-provider'
import type { TabId } from '../local-services-types'

const NAV_ITEMS: { id: string; tab: TabId; label: string; icon: string }[] = [
  { id: 'map', tab: 'home', label: 'Map Explorer', icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' },
  { id: 'services', tab: 'home', label: 'Service Categories', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
  { id: 'recent', tab: 'recent', label: 'Recent History', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'saved', tab: 'favourites', label: 'Saved Places', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { id: 'settings', tab: 'home', label: 'Settings', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' },
]

export function Sidebar() {
  const { state, dispatch } = useLocalServices()

  // Map tab to active sidebar item
  const getActiveId = () => {
    if (state.activeTab === 'favourites') return 'saved'
    if (state.activeTab === 'recent') return 'recent'
    // For home tab, check if we're showing categories or results
    if (!state.activeCategory && state.results.length === 0) return 'services'
    return 'map'
  }

  const activeId = getActiveId()

  const handleClick = (item: typeof NAV_ITEMS[0]) => {
    dispatch({ type: 'SET_TAB', payload: item.tab })

    // Special handling: "Service Categories" clears results to show category grid
    if (item.id === 'services') {
      dispatch({ type: 'SET_CATEGORY', payload: null })
      dispatch({ type: 'SET_RESULTS', payload: [] })
      dispatch({ type: 'SET_SELECTED_PLACE', payload: null })
    }

    // "Map Explorer" goes to results/map view
    if (item.id === 'map') {
      dispatch({ type: 'SET_SELECTED_PLACE', payload: null })
    }
  }

  return (
    <aside className="w-[220px] h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      {/* Brand */}
      <div className="px-5 py-4">
        <h2 className="text-base font-bold text-[var(--tk-color-primary-500)]">Navigator</h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">Local Services</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[var(--tk-color-primary-500)] text-white shadow-md shadow-[var(--tk-color-primary-500)]/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Location info */}
      {state.location && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[var(--tk-color-primary-500)]">📍</span>
            <span className="truncate">{state.location.label}</span>
          </div>
        </div>
      )}

      {/* Filter distance button */}
      <div className="px-3 pb-4">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_LOCATION_MODAL' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[var(--tk-color-primary-500)] text-white text-sm font-medium shadow-lg shadow-[var(--tk-color-primary-500)]/25 hover:bg-[var(--tk-color-primary-600)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filter Distance
        </button>
      </div>
    </aside>
  )
}
