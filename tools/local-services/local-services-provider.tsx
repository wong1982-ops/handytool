'use client'

import {
  createContext, useContext, useReducer, useEffect, useMemo, useCallback,
  type ReactNode,
} from 'react'
import type { ServiceResult, UserLocation, TabId, RadiusOption, RecentSearch } from './local-services-types'
import { en } from './i18n/en'
import type { I18nStrings } from './i18n/en'

// State
interface LocalServicesState {
  location: UserLocation | null
  locationLoading: boolean
  results: ServiceResult[]
  resultsLoading: boolean
  activeCategory: string | null
  searchQuery: string
  radius: RadiusOption
  activeTab: TabId
  selectedPlaceId: string | null
  favourites: ServiceResult[]
  recentSearches: RecentSearch[]
  showLocationModal: boolean
}

// Actions
type Action =
  | { type: 'SET_LOCATION'; payload: UserLocation }
  | { type: 'SET_LOCATION_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: ServiceResult[] }
  | { type: 'SET_RESULTS_LOADING'; payload: boolean }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_RADIUS'; payload: RadiusOption }
  | { type: 'SET_TAB'; payload: TabId }
  | { type: 'SET_SELECTED_PLACE'; payload: string | null }
  | { type: 'SET_FAVOURITES'; payload: ServiceResult[] }
  | { type: 'ADD_FAVOURITE'; payload: ServiceResult }
  | { type: 'REMOVE_FAVOURITE'; payload: string }
  | { type: 'SET_RECENT'; payload: RecentSearch[] }
  | { type: 'ADD_RECENT'; payload: RecentSearch }
  | { type: 'CLEAR_RECENT' }
  | { type: 'TOGGLE_LOCATION_MODAL' }

function reducer(state: LocalServicesState, action: Action): LocalServicesState {
  switch (action.type) {
    case 'SET_LOCATION': return { ...state, location: action.payload, locationLoading: false }
    case 'SET_LOCATION_LOADING': return { ...state, locationLoading: action.payload }
    case 'SET_RESULTS': return { ...state, results: action.payload, resultsLoading: false }
    case 'SET_RESULTS_LOADING': return { ...state, resultsLoading: action.payload }
    case 'SET_CATEGORY': return { ...state, activeCategory: action.payload, activeTab: 'home' }
    case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload }
    case 'SET_RADIUS': return { ...state, radius: action.payload }
    case 'SET_TAB': return { ...state, activeTab: action.payload, ...(action.payload === 'home' && !state.activeCategory ? { results: [] } : {}) }
    case 'SET_SELECTED_PLACE': return { ...state, selectedPlaceId: action.payload }
    case 'SET_FAVOURITES': return { ...state, favourites: action.payload }
    case 'ADD_FAVOURITE': return { ...state, favourites: [...state.favourites, action.payload] }
    case 'REMOVE_FAVOURITE': return { ...state, favourites: state.favourites.filter(f => f.id !== action.payload) }
    case 'SET_RECENT': return { ...state, recentSearches: action.payload }
    case 'ADD_RECENT': return { ...state, recentSearches: [action.payload, ...state.recentSearches].slice(0, 20) }
    case 'CLEAR_RECENT': return { ...state, recentSearches: [] }
    case 'TOGGLE_LOCATION_MODAL': return { ...state, showLocationModal: !state.showLocationModal }
    default: return state
  }
}

const defaultState: LocalServicesState = {
  location: null,
  locationLoading: true,
  results: [],
  resultsLoading: false,
  activeCategory: null,
  searchQuery: '',
  radius: 2000,
  activeTab: 'home',
  selectedPlaceId: null,
  favourites: [],
  recentSearches: [],
  showLocationModal: false,
}

// Context
interface ContextValue {
  state: LocalServicesState
  dispatch: React.Dispatch<Action>
  t: I18nStrings
  searchServices: (categoryId?: string, query?: string) => Promise<void>
}

const Ctx = createContext<ContextValue | null>(null)

export function LocalServicesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState)
  const t = en as I18nStrings

  // Load favourites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ls_favourites')
      if (saved) dispatch({ type: 'SET_FAVOURITES', payload: JSON.parse(saved) })
      const recent = localStorage.getItem('ls_recent')
      if (recent) dispatch({ type: 'SET_RECENT', payload: JSON.parse(recent) })
    } catch {}
  }, [])

  // Save favourites to localStorage
  useEffect(() => {
    try { localStorage.setItem('ls_favourites', JSON.stringify(state.favourites)) } catch {}
  }, [state.favourites])

  useEffect(() => {
    try { localStorage.setItem('ls_recent', JSON.stringify(state.recentSearches)) } catch {}
  }, [state.recentSearches])

  // Detect location on mount — try GPS first, then IP fallback
  useEffect(() => {
    const fallbackToIp = async () => {
      try {
        // Use ip-api.com (same as My IP tool) as fallback
        const res = await fetch('http://ip-api.com/json/?fields=lat,lon,city,regionName')
        const data = await res.json()
        if (data.lat && data.lon) {
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              lat: data.lat,
              lng: data.lon,
              label: data.city ? `${data.city}, ${data.regionName}` : 'Approximate Location',
              source: 'ip',
            },
          })
          return
        }
      } catch {}
      dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Reverse geocode to get a label
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&zoom=14`)
            .then(r => r.json())
            .then(data => {
              const label = data.address?.suburb || data.address?.city || data.address?.town || 'Current Location'
              dispatch({
                type: 'SET_LOCATION',
                payload: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  label,
                  source: 'gps',
                },
              })
            })
            .catch(() => {
              dispatch({
                type: 'SET_LOCATION',
                payload: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  label: 'Current Location',
                  source: 'gps',
                },
              })
            })
        },
        () => {
          // GPS denied or failed — fallback to IP
          fallbackToIp()
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      // No geolocation API — fallback to IP
      fallbackToIp()
    }
  }, [])

  // Search function
  const searchServices = useCallback(async (categoryId?: string, query?: string) => {
    if (!state.location) return

    dispatch({ type: 'SET_RESULTS_LOADING', payload: true })
    if (categoryId) dispatch({ type: 'SET_CATEGORY', payload: categoryId })

    try {
      const res = await fetch('/api/v1/local-services/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: state.location.lat,
          lng: state.location.lng,
          category: categoryId || query || '',
          radius: state.radius,
        }),
      })
      const json = await res.json()
      const results = json.data?.results || []
      dispatch({ type: 'SET_RESULTS', payload: results })

      // Add to recent searches
      dispatch({
        type: 'ADD_RECENT',
        payload: {
          query: query || categoryId || '',
          categoryId,
          lat: state.location.lat,
          lng: state.location.lng,
          locationLabel: state.location.label,
          timestamp: new Date().toISOString(),
          resultCount: results.length,
        },
      })
    } catch {
      dispatch({ type: 'SET_RESULTS', payload: [] })
    }
  }, [state.location, state.radius])

  const value = useMemo(() => ({ state, dispatch, t, searchServices }), [state, t, searchServices])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLocalServices() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLocalServices must be used within LocalServicesProvider')
  return ctx
}
