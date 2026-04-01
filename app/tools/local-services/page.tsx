'use client'

import { LocalServicesProvider, useLocalServices } from '@/tools/local-services/local-services-provider'
import { FloatingSearch } from '@/tools/local-services/components/floating-search'
import { ResultsPanel } from '@/tools/local-services/components/results-panel'
import { DetailPanel } from '@/tools/local-services/components/detail-panel'
import { ResultsMap } from '@/tools/local-services/components/results-map'
import { LocationModal } from '@/tools/local-services/components/location-modal'
import { SuggestProvider } from '@/tools/local-services/components/suggest-provider'
import { useState } from 'react'

function LocalServicesInner() {
  const { state, dispatch } = useLocalServices()
  const [showSuggest, setShowSuggest] = useState(false)

  const selectedResult = state.results.find(r => r.id === state.selectedPlaceId)

  return (
    <div className="fixed inset-0 z-[70] bg-slate-100 dark:bg-slate-950">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <ResultsMap />
      </div>

      {/* Floating search bar + category chips */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <FloatingSearch />
        </div>
      </div>

      {/* Results panel — left side desktop, bottom sheet mobile */}
      {state.results.length > 0 && !selectedResult && (
        <div className="absolute left-0 top-[120px] bottom-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <ResultsPanel onSuggest={() => setShowSuggest(true)} />
          </div>
        </div>
      )}

      {/* Detail panel — replaces results when a place is selected */}
      {selectedResult && (
        <div className="absolute left-0 top-[120px] bottom-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <DetailPanel
              result={selectedResult}
              onBack={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: null })}
            />
          </div>
        </div>
      )}

      {/* Map controls — right side */}
      <div className="absolute right-4 bottom-8 z-10 flex flex-col gap-2 max-lg:bottom-20">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_LOCATION_MODAL' })}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          aria-label="My location"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <LocationModal />
      {showSuggest && <SuggestProvider onClose={() => setShowSuggest(false)} />}
    </div>
  )
}

export default function LocalServicesPage() {
  return (
    <LocalServicesProvider>
      <LocalServicesInner />
    </LocalServicesProvider>
  )
}
