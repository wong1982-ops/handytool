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

// --- Community providers v2 types ---

export interface CommunityProvider {
  id: string
  name: string
  categoryId: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  socialLinks: Record<string, string>
  profilePhoto: string | null
  portfolioPhotos: string[]
  pricingInfo: string | null
  availability: string | null
  serviceArea: string[]
  lat: number | null
  lng: number | null
  address: string | null
  isVerified: boolean
  rating: number | null       // computed from community_reviews
  reviewCount: number
}

export interface MergedResult {
  id: string
  source: 'community' | 'google'
  name: string
  address: string
  lat: number | null
  lng: number | null
  distance: number | null
  phone: string | null
  website: string | null
  rating: number | null
  reviewCount: number
  hours: OpeningHours | null
  isOpenNow: boolean
  category: string
  photoUrl: string | null
  // Community-only fields
  isVerified?: boolean
  description?: string
  pricingInfo?: string
  availability?: string
  serviceArea?: string[]
  socialLinks?: Record<string, string>
  portfolioPhotos?: string[]
  profilePhoto?: string
}

export interface CommunityReview {
  id: string
  providerId: string
  userId: string
  rating: number
  text: string | null
  isFlagged: boolean
  createdAt: string
  authorName?: string
}

export interface ProviderSubmission {
  providerName: string
  categoryId: string
  phone: string
  description: string
  serviceArea: string[]
}

export interface LocalServicesState {
  results: MergedResult[]
  favourites: MergedResult[]
  recentSearches: RecentSearch[]
  location: UserLocation | null
  activeTab: TabId
  selectedCategory: string | null
  radius: RadiusOption
  isLoading: boolean
  error: string | null
}
