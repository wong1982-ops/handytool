'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/ui/search-bar'
import { IpHeroCard } from '@/tools/ipcheck/ip-hero-card'
import { IpInfoGrid } from '@/tools/ipcheck/ip-info-grid'
import { LocationDetail } from '@/tools/ipcheck/location-detail'

// Mock data — replace with API calls later
const mockData = {
  ip: '104.28.192.254',
  location: 'San Francisco, CA, US',
  isSecure: true,
  info: {
    proxy: { detected: false, status: 'Clean Status' },
    isp: { name: 'Google Cloud LLC', asn: 'AS15169' },
    dns: { server: '8.8.8.8', provider: 'Google Public DNS' },
    userAgent: { browser: 'Chrome / macOS', version: 'v122.0.0.0' },
  },
  locationDetail: {
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    countryCode: 'US',
    postalCode: '94105',
    lat: 37.7749,
    lng: -122.4194,
  },
}

export default function IpCheckPage() {
  const [, setSearchQuery] = useState('')

  function handleSearch(query: string) {
    setSearchQuery(query)
    // TODO: Call IP lookup API
  }

  function handleRefresh() {
    // TODO: Re-fetch current IP
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
      <div className="mb-12 flex justify-center">
        <SearchBar
          placeholder="Lookup any IP address or domain..."
          buttonLabel="Lookup"
          onSearch={handleSearch}
        />
      </div>

      <IpHeroCard
        ip={mockData.ip}
        location={mockData.location}
        isSecure={mockData.isSecure}
        onRefresh={handleRefresh}
      />

      <IpInfoGrid data={mockData.info} />

      <LocationDetail data={mockData.locationDetail} />
    </main>
  )
}
