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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {t.location.title}
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          GPS is used to detect your current location. Tap the button below to re-detect.
        </p>

        <div className="mt-6 space-y-3">
          {/* Use My Location button */}
          <button
            type="button"
            onClick={handleUseGps}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {t.location.useGps}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Address search will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
