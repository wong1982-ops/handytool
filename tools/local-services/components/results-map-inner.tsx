'use client'

import { useEffect, useRef, useState } from 'react'
import type { MergedResult } from '../local-services-types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ResultsMapInnerProps {
  userLat: number
  userLng: number
  results: MergedResult[]
  selectedPlaceId: string | null
  radius: number
  onSelectPlace: (id: string) => void
}

/** CartoDB tile URLs for light and dark modes */
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

function radiusToZoom(radius: number): number {
  if (radius <= 500) return 16
  if (radius <= 1000) return 15
  if (radius <= 2000) return 14
  if (radius <= 5000) return 12
  return 11
}

/** Detect dark mode from the document */
function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

/** Build a pin-shaped SVG marker */
function buildMarkerHtml(color: string, isSelected: boolean): string {
  const size = isSelected ? 32 : 24
  const shadow = isSelected ? 'filter: drop-shadow(0 2px 6px rgba(0,0,0,.4));' : 'filter: drop-shadow(0 1px 3px rgba(0,0,0,.25));'
  return `<div style="width:${size}px;height:${size}px;${shadow}transition:all .2s ease">
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="white" stroke-width="1.2"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  </div>`
}

/** Build the blue pulsing user location marker */
function buildUserMarkerHtml(): string {
  return `<div style="position:relative;width:20px;height:20px">
    <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(59,130,246,.2);animation:pulse-ring 2s ease-out infinite"></div>
    <div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,.3)"></div>
  </div>
  <style>
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>`
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
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [dark, setDark] = useState(false)

  // Observe dark mode changes
  useEffect(() => {
    setDark(isDarkMode())
    const observer = new MutationObserver(() => setDark(isDarkMode()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([userLat, userLng], radiusToZoom(radius))

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    tileLayerRef.current = L.tileLayer(dark ? TILE_DARK : TILE_LIGHT, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switch tile layer when dark mode changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return
    tileLayerRef.current.setUrl(dark ? TILE_DARK : TILE_LIGHT)
  }, [dark])

  // Update center and zoom when location/radius changes
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo([userLat, userLng], radiusToZoom(radius), { duration: 0.8 })
  }, [userLat, userLng, radius])

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    markersRef.current.clearLayers()

    // User location: blue pulsing circle
    const userIcon = L.divIcon({
      className: '',
      html: buildUserMarkerHtml(),
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    L.marker([userLat, userLng], { icon: userIcon, interactive: false }).addTo(markersRef.current)

    // Result markers
    const markerLatLngs: L.LatLngExpression[] = [[userLat, userLng]]

    results.forEach((r) => {
      // Skip results with null coordinates
      if (r.lat == null || r.lng == null) return

      const isSelected = r.id === selectedPlaceId
      const color = isSelected ? '#EF4444' : '#3D6AF2'
      const size = isSelected ? 32 : 24

      const icon = L.divIcon({
        className: '',
        html: buildMarkerHtml(color, isSelected),
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
      })

      const marker = L.marker([r.lat, r.lng], { icon })

      // Popup with name + rating
      const ratingStars = r.rating ? '⭐ ' + r.rating.toFixed(1) : ''
      const popupContent = `<div style="font-family:system-ui;padding:2px 0">
        <strong style="font-size:13px">${r.name}</strong>
        ${ratingStars ? `<div style="font-size:11px;color:#888;margin-top:2px">${ratingStars}</div>` : ''}
      </div>`
      marker.bindPopup(popupContent, { closeButton: false, offset: [0, -size + 4] })

      marker.bindTooltip(r.name, { direction: 'top', offset: [0, -size + 4] })
      marker.on('click', () => onSelectPlace(r.id))
      marker.addTo(markersRef.current!)
      markerLatLngs.push([r.lat, r.lng])
    })

    // Fit bounds to show all results when we have results
    if (results.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(markerLatLngs)
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 })
    }
  }, [results, selectedPlaceId, userLat, userLng, onSelectPlace])

  // Fly to selected place
  useEffect(() => {
    if (!mapRef.current || !selectedPlaceId) return
    const result = results.find(r => r.id === selectedPlaceId)
    const lat = result?.lat
    const lng = result?.lng
    if (lat != null && lng != null) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 0.6 })
    }
  }, [selectedPlaceId, results])

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-xl"
      style={{ zIndex: 0, minHeight: 256 }}
    />
  )
}
