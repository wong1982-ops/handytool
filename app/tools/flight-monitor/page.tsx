import type { Metadata } from 'next'
import FlightMonitor from '@/tools/flight-monitor/flight-monitor'

export const metadata: Metadata = {
  title: 'Flight Monitor — Track Prices & Discover Deals | Toolk1t',
  description: 'Search flights, set price alerts, and discover deals with auto-detected price drops. Powered by Amadeus and Google Flights data.',
}

export default function FlightMonitorPage() {
  return <FlightMonitor />
}
