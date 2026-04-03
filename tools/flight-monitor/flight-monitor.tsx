'use client'

import { useState, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { FlightTabNavigation } from './tab-navigation'
import { SearchForm } from './search-form'
import { SearchResults } from './search-results'
import { SetAlertModal } from './set-alert-modal'
import { AlertsTab } from './alerts-tab'
import { DealsTab } from './deals-tab'
import type { FlightTab, FlightOffer } from './types'

export default function FlightMonitor() {
  const [activeTab, setActiveTab] = useState<FlightTab>('search')
  const [alertCount, setAlertCount] = useState(0)

  // Search state
  const [searchOrigin, setSearchOrigin] = useState('')
  const [searchDestination, setSearchDestination] = useState('')
  const [searchOffers, setSearchOffers] = useState<FlightOffer[]>([])
  const [searchCachedAt, setSearchCachedAt] = useState<string | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Alert modal state
  const [alertModalOffer, setAlertModalOffer] = useState<FlightOffer | null>(null)

  // Last search params for refresh
  const [lastSearchParams, setLastSearchParams] = useState<{
    origin: string
    destination: string
    departureDate: string
    adults: number
  } | null>(null)

  const handleSearch = useCallback(async (params: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    adults: number
  }) => {
    setSearchLoading(true)
    setSearchOffers([])
    setSearchCachedAt(null)
    setLastSearchParams(params)

    try {
      const qs = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        adults: String(params.adults),
      })
      if (params.returnDate) qs.set('returnDate', params.returnDate)

      const res = await fetch(`/api/v1/flights/search?${qs}`)
      const json = await res.json()

      if (!res.ok) {
        console.error('Search failed:', json.error)
        return
      }

      setSearchOffers(json.data.offers ?? [])
      setSearchCachedAt(json.data.cachedAt ?? null)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    if (!lastSearchParams) return

    setSearchLoading(true)
    try {
      const qs = new URLSearchParams({
        origin: lastSearchParams.origin,
        destination: lastSearchParams.destination,
        departureDate: lastSearchParams.departureDate,
        adults: String(lastSearchParams.adults),
        refresh: 'true',
      })

      const res = await fetch(`/api/v1/flights/search?${qs}`)
      const json = await res.json()

      if (!res.ok) {
        console.error('Refresh failed:', json.error)
        return
      }

      setSearchOffers(json.data.offers ?? [])
      setSearchCachedAt(json.data.cachedAt ?? null)
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      setSearchLoading(false)
    }
  }, [lastSearchParams])

  const handleSetAlert = useCallback((offer: FlightOffer) => {
    setAlertModalOffer(offer)
  }, [])

  const handleAlertCreated = useCallback(() => {
    setAlertModalOffer(null)
    setAlertCount((c) => c + 1)
  }, [])

  // Called from DealsTab to pre-fill search and switch tab
  const handleDealSearch = useCallback((origin: string, destination: string) => {
    setSearchOrigin(origin)
    setSearchDestination(destination)
    setActiveTab('search')
  }, [])

  // Called from DealsTab to set an alert for a route
  const handleDealSetAlert = useCallback((origin: string, destination: string) => {
    setSearchOrigin(origin)
    setSearchDestination(destination)
    setActiveTab('search')
  }, [])

  return (
    <div
      className="min-h-screen h-screen overflow-y-auto bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' }}
    >
      {/* Themed header */}
      <div className="relative bg-gradient-to-r from-[#0c1424] via-[#111b2e] to-[#0c1424]">
        {/* Subtle particle background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 25%, #3D6AF2, transparent),
              radial-gradient(1.5px 1.5px at 30% 65%, #32A9D9, transparent),
              radial-gradient(1px 1px at 50% 15%, #3D9DF2, transparent),
              radial-gradient(2px 2px at 70% 45%, #3D6AF2, transparent),
              radial-gradient(1px 1px at 85% 75%, #32A9D9, transparent),
              radial-gradient(1.5px 1.5px at 95% 30%, #3D9DF2, transparent)
            `,
            animation: 'starfield-drift 14s ease-in-out infinite alternate',
          }} />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-16 bg-gradient-to-t from-[#3D6AF2]/10 via-[#32A9D9]/5 to-transparent blur-2xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-4 pb-4 md:pt-5 md:pb-5">
          {/* Top row: breadcrumb (desktop) */}
          <div className="hidden md:block">
            <ToolBreadcrumb toolName="Flight Monitor" toolSlug="flight-monitor" />
          </div>

          {/* Header row: title */}
          <div className="mt-1 md:mt-3 flex items-center gap-3">
            {/* Mobile: home link */}
            <a
              href="/"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-[#93aaff] hover:text-white transition-colors"
              aria-label="Home"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </a>

            <div className="relative">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-[#3D6AF2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#32A9D9] rounded-full animate-pulse" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Flight Monitor
            </h1>
          </div>
        </div>
      </div>

      {/* Sticky tab navigation */}
      <div className="sticky top-0 z-30">
        <FlightTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alertCount}
        />
      </div>

      {/* Content area */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        {activeTab === 'search' && (
          <>
            <SearchForm
              onSearch={handleSearch}
              loading={searchLoading}
              defaultOrigin={searchOrigin}
              defaultDestination={searchDestination}
            />
            <SearchResults
              offers={searchOffers}
              loading={searchLoading}
              cachedAt={searchCachedAt}
              onSetAlert={handleSetAlert}
              onRefresh={handleRefresh}
            />
          </>
        )}

        {activeTab === 'alerts' && (
          <AlertsTab onAlertCountChange={setAlertCount} />
        )}

        {activeTab === 'deals' && (
          <DealsTab
            onSetAlert={handleDealSetAlert}
            onSearch={handleDealSearch}
          />
        )}
      </main>

      {/* Set Alert Modal */}
      {alertModalOffer && (
        <SetAlertModal
          offer={alertModalOffer}
          onClose={() => setAlertModalOffer(null)}
          onCreated={handleAlertCreated}
        />
      )}
    </div>
  )
}
