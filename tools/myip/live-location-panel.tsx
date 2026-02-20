'use client'

import dynamic from 'next/dynamic'

const LocationMap = dynamic(
  () => import('@/components/ui/location-map').then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
        <span className="text-slate-400 text-sm">Loading map...</span>
      </div>
    ),
  }
)

interface LiveLocationPanelProps {
  lat: number
  lng: number
}

export function LiveLocationPanel({ lat, lng }: LiveLocationPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 h-full rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold">Live Location</h2>
        <button
          className="text-[var(--tk-color-primary-500)] text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          aria-label="Open map fullscreen"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Fullscreen
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[300px] relative" role="img" aria-label="Map showing IP geolocation">
        <LocationMap lat={lat} lng={lng} />
      </div>
    </div>
  )
}
