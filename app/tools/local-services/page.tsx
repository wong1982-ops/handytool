'use client'

import { LocalServicesProvider, useLocalServices } from '@/tools/local-services/local-services-provider'
import { LocationBar } from '@/tools/local-services/components/location-bar'
import { SearchBar } from '@/tools/local-services/components/search-bar'
import { CategoryGrid } from '@/tools/local-services/components/category-grid'
import { RadiusPills } from '@/tools/local-services/components/radius-pills'
import { ResultsList } from '@/tools/local-services/components/results-list'
import { ResultDetail } from '@/tools/local-services/components/result-detail'
import { ResultsMap } from '@/tools/local-services/components/results-map'
import { BottomTabs } from '@/tools/local-services/components/bottom-tabs'
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
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <LocationBar />
        </div>
        <FavoriteButton slug="local-services" name="Local Services" />
      </header>

      {/* Search bar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <SearchBar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {state.activeTab === 'home' && (
          <>
            {!hasResults ? (
              /* Category grid (home state) */
              <div className="h-full overflow-y-auto px-4 py-4">
                <CategoryGrid />
              </div>
            ) : (
              /* Results state: radius + split view */
              <div className="flex flex-col h-full">
                <div className="px-4 py-2 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
                  <RadiusPills />
                  {/* Mobile map/list toggle */}
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="lg:hidden text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {showMap ? 'List' : 'Map'}
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* List panel */}
                  <div className={`w-full lg:w-[40%] overflow-y-auto border-r border-gray-200 dark:border-gray-700 ${showMap ? 'max-lg:hidden' : ''}`}>
                    <ResultsList />
                  </div>

                  {/* Map panel */}
                  <div className={`w-full lg:w-[60%] ${!showMap ? 'max-lg:hidden' : ''}`}>
                    <ResultsMap />
                  </div>
                </div>

                {/* Detail panel (slides in when a result is selected) */}
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
          <div className="h-full overflow-y-auto">
            <FavouritesTab />
          </div>
        )}

        {state.activeTab === 'recent' && (
          <div className="h-full overflow-y-auto">
            <RecentTab />
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
