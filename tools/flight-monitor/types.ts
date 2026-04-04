export type FlightTab = 'search' | 'alerts' | 'deals'

export interface FlightOffer {
  airline: string
  airlineCode: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  departureAirport: string
  arrivalAirport: string
  duration: string
  stops: number
  stopCities: string[]
  price: number
  currency: string
  bookingUrl?: string
}

export interface SearchResult {
  offers: FlightOffer[]
  cachedAt: string | null
  expiresAt: string | null
}

export interface FlightAlert {
  id: string
  origin: string
  destination: string
  departure_date: string | null
  target_price: number
  current_price: number | null
  status: 'tracking' | 'price_drop' | 'expired'
  last_notified_at: string | null
  created_at: string
  updated_at: string
  priceHistory?: number[]
}

export interface DealFlightLeg {
  depAirport: string
  depCode: string
  depTime: string
  arrAirport: string
  arrCode: string
  arrTime: string
  duration: number        // minutes
  airline: string
  airlineLogo: string
  flightNumber: string
  airplane: string
  travelClass: string
  legroom: string
  overnight: boolean
}

export interface DealLayover {
  airport: string
  code: string
  duration: number        // minutes
}

export interface DealDetails {
  airline: string
  airlineLogo: string
  totalDuration: number   // minutes
  stops: number
  legs: DealFlightLeg[]
  layovers: DealLayover[]
  carbonKg: number | null
  tripType: string
  departureDate: string
  returnDate: string
}

export interface FlightDeal {
  id: string
  origin: string
  destination: string
  current_price: number
  avg_price: number
  discount_pct: number
  computed_at: string
  deal_tier?: 'normal' | 'price_drop' | 'hot_deal' | 'lowest_ever'
  priceHistory?: number[]
  details?: DealDetails
}

export interface AirportSuggestion {
  iataCode: string
  name: string
  cityName: string
  countryCode: string
}
