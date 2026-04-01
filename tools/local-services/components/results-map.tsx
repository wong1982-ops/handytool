'use client'

import dynamic from 'next/dynamic'
import { useLocalServices } from '../local-services-provider'
import type { ServiceResult, RadiusOption } from '../local-services-types'

interface MapInnerProps {
  userLat: number
  userLng: number
  results: ServiceResult[]
  selectedPlaceId: string | null
  radius: RadiusOption
  onSelectPlace: (id: string) => void
}

const MapInner = dynamic<MapInnerProps>(() => import('./results-map-inner'), { ssr: false })

export function ResultsMap() {
  const { state, dispatch } = useLocalServices()

  if (!state.location) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
        <span className="text-sm text-gray-400">Waiting for location...</span>
      </div>
    )
  }

  return (
    <MapInner
      userLat={state.location.lat}
      userLng={state.location.lng}
      results={state.results}
      selectedPlaceId={state.selectedPlaceId}
      radius={state.radius}
      onSelectPlace={(id: string) => dispatch({ type: 'SET_SELECTED_PLACE', payload: id })}
    />
  )
}
