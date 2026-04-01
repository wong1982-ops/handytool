'use client'

import { LocalServicesProvider, useLocalServices } from '@/tools/local-services/local-services-provider'
import { Sidebar } from '@/tools/local-services/components/sidebar'
import { DiscoveryPanel } from '@/tools/local-services/components/discovery-panel'
import { ResultsMap } from '@/tools/local-services/components/results-map'
import { BottomTabs } from '@/tools/local-services/components/bottom-tabs'
import { LocationModal } from '@/tools/local-services/components/location-modal'
import { useState } from 'react'

function LocalServicesInner() {
  useLocalServices() // ensure provider is available
  const [mobileView, setMobileView] = useState<'map' | 'services' | 'favourites' | 'history'>('map')

  return (
    <div className="flex-1 flex min-h-0">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Discovery panel — desktop: always visible, mobile: overlay */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[420px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <DiscoveryPanel />
      </div>

      {/* Map + mobile overlays */}
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
