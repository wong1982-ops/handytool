'use client'

import { useEffect, useRef } from 'react'
import type { ServiceResult } from '../local-services-types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ResultsMapInnerProps {
  userLat: number
  userLng: number
  results: ServiceResult[]
  selectedPlaceId: string | null
  radius: number
  onSelectPlace: (id: string) => void
}

function radiusToZoom(radius: number): number {
  if (radius <= 500) return 16
  if (radius <= 1000) return 15
  if (radius <= 2000) return 14
  if (radius <= 5000) return 12
  return 11
}

export default function ResultsMapInner({
  userLat,
  userLng,
  results,
  selectedPlaceId,
  radius,
  onSelectPlace,
}: ResultsMapInnerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([userLat, userLng], radiusToZoom(radius))

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update center and zoom when location/radius changes
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([userLat, userLng], radiusToZoom(radius))
  }, [userLat, userLng, radius])

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    markersRef.current.clearLayers()

    // User location: blue circle
    const userIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })

    L.marker([userLat, userLng], { icon: userIcon, interactive: false }).addTo(markersRef.current)

    // Result markers
    results.forEach((r) => {
      const isSelected = r.id === selectedPlaceId
      const size = isSelected ? 18 : 12
      const color = isSelected ? '#2563eb' : '#ef4444'

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);transition:all .15s"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker([r.lat, r.lng], { icon })
      marker.bindTooltip(r.name, { direction: 'top', offset: [0, -8] })
      marker.on('click', () => onSelectPlace(r.id))
      marker.addTo(markersRef.current!)
    })
  }, [results, selectedPlaceId, userLat, userLng, onSelectPlace])

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-xl lg:h-80"
      style={{ zIndex: 0 }}
    />
  )
}
