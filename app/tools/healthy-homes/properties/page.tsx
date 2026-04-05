import type { Metadata } from 'next'
import PropertyTracker from '@/tools/healthy-homes/property-tracker'

export const metadata: Metadata = {
  title: 'Track Healthy Homes Compliance | Toolk1t',
  description: 'Track Healthy Homes compliance status across multiple NZ rental properties.',
}

export default function HealthyHomesPropertiesPage() {
  return <PropertyTracker />
}
