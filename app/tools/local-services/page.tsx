'use client'

import { LocalServicesProvider, useLocalServices } from '@/tools/local-services/local-services-provider'
import { LocationBar } from '@/tools/local-services/components/location-bar'
import { SearchBar } from '@/tools/local-services/components/search-bar'
import { CategoryGrid } from '@/tools/local-services/components/category-grid'
import { RadiusPills } from '@/tools/local-services/components/radius-pills'
import { ResultsList } from '@/tools/local-services/components/results-list'
import { ResultDetail } from '@/tools/local-services/components/result-detail'
import { ResultsMap } from '@/tools/local-services/components/results-map'
import { BottomTabs, DesktopTabs } from '@/tools/local-services/components/bottom-tabs'
import { FavouritesTab } from '@/tools/local-services/components/favourites-tab'
import { RecentTab } from '@/tools/local-services/components/recent-tab'
import { LocationModal } from '@/tools/local-services/components/location-modal'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { useState } from 'react'

function LocalServicesInner() {
  const { state, dispatch } = useLocalServices()
  const [showMap, setShowMap] = useState(true)

  const hasResults = state.activeCategory || state.results.length > 0
  const selectedResult = state.results.find(r => r.id === state.selectedPlaceId)
  const isFavourite = (id: string) => state.favourites.some(f => f.id === id)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header — matches Toolk1t tool pattern */}
      <div className="px-4 md:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">Local Services</h1>
          <LocationBar />
          <div className="hidden lg:block h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <DesktopTabs />
        </div>
        <FavoriteButton slug="local-services" name="Local Services" />
      </div>

      {/* Search + radius bar */}
      <div className="px-4 md:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar />
          </div>
          {hasResults && (
            <>
              <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="hidden sm:flex">
                <RadiusPills />
              </div>
            </>
          )}
        </div>
        {/* Mobile: radius pills + map/list toggle */}
        {hasResults && (
          <div className="sm:hidden mt-2 flex items-center justify-between">
            <RadiusPills />
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
            >
              {showMap ? '☰ List' : '🗺 Map'}
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {state.activeTab === 'home' && (
          <>
            {!hasResults ? (
              /* Category grid */
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    What do you need?
                  </h2>
                  <CategoryGrid />
                </div>
              </div>
            ) : (
              /* Split view: list + map */
              <div className="flex-1 flex min-h-0 overflow-hidden">
                <div className={`w-full lg:w-[40%] xl:w-[35%] overflow-y-auto border-r border-slate-200 dark:border-slate-800 ${showMap ? 'max-lg:hidden' : ''}`}>
                  <ResultsList />
                </div>
                <div className={`w-full lg:w-[60%] xl:w-[65%] min-h-0 ${!showMap ? 'max-lg:hidden' : ''}`}>
                  <ResultsMap />
                </div>
                {selectedResult && (
                  <ResultDetail
                    result={selectedResult}
                    isFavourite={isFavourite(selectedResult.id)}
                    onClose={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: null })}
                    onToggleFavourite={() => {
                      if (isFavourite(selectedResult.id)) {
                        dispatch({ type: 'REMOVE_FAVOURITE', payload: selectedResult.id })
                      } else {
                        dispatch({ type: 'ADD_FAVOURITE', payload: selectedResult })
                      }
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}

        {state.activeTab === 'favourites' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
              <FavouritesTab />
            </div>
          </div>
        )}

        {state.activeTab === 'recent' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
              <RecentTab />
            </div>
          </div>
        )}
      </div>

      {/* Bottom tabs */}
      <BottomTabs />

      {/* Location modal */}
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
