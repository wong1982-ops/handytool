'use client'

import { useLocalServices } from '../local-services-provider'

export function LocationModal() {
  const { state, dispatch, t } = useLocalServices()

  if (!state.showLocationModal) return null

  function handleClose() {
    dispatch({ type: 'TOGGLE_LOCATION_MODAL' })
  }

  function handleUseGps() {
    dispatch({ type: 'SET_LOCATION_LOADING', payload: true })
    dispatch({ type: 'TOGGLE_LOCATION_MODAL' })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              label: 'Current Location',
              source: 'gps',
            },
          })
        },
        () => {
          dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(9,15,22,0.85)' }}
        onClick={handleClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 z-10"
        style={{ background: '#131a23', border: '1px solid #1e2631', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
      >
        <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>
          {t.location.title}
        </h2>

        <p className="mt-2 text-sm" style={{ color: '#a6abb5' }}>
          GPS is used to detect your current location. Tap the button below to re-detect.
        </p>

        <div className="mt-6 space-y-3">
          {/* Use My Location button */}
          <button
            type="button"
            onClick={handleUseGps}
            className="flex w-full items-center justify-center gap-2 rounded-xl h-12 text-sm font-semibold transition-colors"
            style={{ background: '#3D6AF2', color: '#ffffff' }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {t.location.useGps}
          </button>

          <p className="text-center text-xs" style={{ color: '#70767f' }}>
            Address search will be available in a future update.
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-xs text-center py-2"
            style={{ color: '#70767f' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
