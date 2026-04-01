export interface ServiceResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  distance: number        // meters
  phone: string | null
  website: string | null
  rating: number | null   // 0-5 scale
  hours: OpeningHours | null
  isOpenNow: boolean
  category: string
  photoUrl: string | null
}

export interface OpeningHours {
  display: string[]       // e.g. ["Mon-Fri 8am-5pm", "Sat 9am-1pm", "Sun Closed"]
  isOpenNow: boolean
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
  foursquareId: string
}

export interface RecentSearch {
  query: string
  categoryId?: string
  lat: number
  lng: number
  locationLabel: string
  timestamp: string
  resultCount: number
}

export interface UserLocation {
  lat: number
  lng: number
  label: string           // e.g. "Auckland CBD"
  source: 'gps' | 'manual' | 'ip'
}

export type TabId = 'home' | 'favourites' | 'recent'

export type RadiusOption = 500 | 1000 | 2000 | 5000 | 10000

export const RADIUS_OPTIONS: RadiusOption[] = [500, 1000, 2000, 5000, 10000]

export const RADIUS_LABELS: Record<RadiusOption, string> = {
  500: '500m',
  1000: '1km',
  2000: '2km',
  5000: '5km',
  10000: '10km',
}
