'use client'

import { LocalServicesProvider, useLocalServices } from '@/tools/local-services/local-services-provider'
import { Sidebar } from '@/tools/local-services/components/sidebar'
import { DiscoveryPanel } from '@/tools/local-services/components/discovery-panel'
import { ResultsMap } from '@/tools/local-services/components/results-map'
import { BusinessDetail } from '@/tools/local-services/components/business-detail'
import { BottomTabs } from '@/tools/local-services/components/bottom-tabs'
import { LocationModal } from '@/tools/local-services/components/location-modal'
import { useState } from 'react'

function LocalServicesInner() {
  const { state, dispatch } = useLocalServices()
  const [mobileView, setMobileView] = useState<'map' | 'services' | 'favourites' | 'history'>('map')

  const selectedResult = state.results.find(r => r.id === state.selectedPlaceId)

  // If a business is selected, show detail view
  if (selectedResult && state.selectedPlaceId) {
    return (
      <BusinessDetail
        result={selectedResult}
        onBack={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: null })}
      />
    )
  }

  return (
    <div className="flex-1 flex min-h-0">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Desktop: Discovery panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[420px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <DiscoveryPanel />
      </div>

      {/* Map — always visible on desktop, toggle on mobile */}
      <div className="flex-1 relative min-h-0">
        <ResultsMap />

        {/* Mobile: overlay panels */}
        <div className="lg:hidden">
          {mobileView === 'services' && (
            <div className="absolute inset-x-0 bottom-14 top-0 bg-white dark:bg-slate-900 z-20 overflow-y-auto rounded-t-2xl shadow-2xl">
              <DiscoveryPanel />
            </div>
          )}
        </div>

        {/* Mobile bottom tabs */}
        <div className="lg:hidden absolute bottom-0 inset-x-0 z-30">
          <BottomTabs activeView={mobileView} onChangeView={setMobileView} />
        </div>
      </div>

      <LocationModal />
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
