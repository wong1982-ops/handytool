'use client'

import dynamic from 'next/dynamic'
import { GlassCard } from '@/components/ui/glass-card'
import { DetailList, type DetailItem } from '@/components/ui/detail-list'

const LocationMap = dynamic(() => import('@/components/ui/location-map').then((m) => m.LocationMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
      <span className="text-slate-400">Loading map...</span>
    </div>
  ),
})

interface LocationData {
  city: string
  state: string
  country: string
  countryCode: string
  postalCode: string
  lat: number
  lng: number
}

interface LocationDetailProps {
  data: LocationData
}

export function LocationDetail({ data }: LocationDetailProps) {
  const items: DetailItem[] = [
    { label: 'City', value: data.city },
    { label: 'State', value: data.state },
    {
      label: 'Country',
      value: (
        <span className="flex items-center gap-2">
          <span className="text-base">{countryFlag(data.countryCode)}</span>
          {data.country}
        </span>
      ),
    },
    { label: 'Postal Code', value: data.postalCode },
    { label: 'Coordinates', value: `${data.lat}, ${data.lng}` },
  ]

  return (
    <GlassCard className="overflow-hidden mt-8">
      <div className="grid md:grid-cols-3">
        <div className="p-8 md:col-span-1 border-r border-slate-200 dark:border-slate-800">
          <DetailList title="Detailed Location" items={items} />
        </div>
        <div className="md:col-span-2 min-h-[300px] relative" role="img" aria-label="Map showing IP location">
          <LocationMap lat={data.lat} lng={data.lng} />
        </div>
      </div>
    </GlassCard>
  )
}

function countryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}
