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
    <div className="fixed inset-0 z-[70]" style={{ background: '#090f16' }}>
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
        <div className="absolute left-0 top-[108px] bottom-0 z-10 pointer-events-none flex">
          <div className="pointer-events-auto h-full">
            <ResultsPanel onSuggest={() => setShowSuggest(true)} />
          </div>
        </div>
      )}

      {/* Detail panel — replaces results when a place is selected */}
      {selectedResult && (
        <div className="absolute left-0 top-[108px] bottom-0 z-10 pointer-events-none flex">
          <div className="pointer-events-auto h-full">
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
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: '#131a23', border: '1px solid #1e2631' }}
          aria-label="My location"
        >
          <svg className="w-5 h-5" style={{ color: '#a6abb5' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
