'use client'

import { useState } from 'react'
import { Sparkline } from './sparkline'
import type { FlightAlert } from './types'

interface AlertCardProps {
  alert: FlightAlert
  onEdit: (id: string, targetPrice: number) => void
  onDelete: (id: string) => void
}

// Minimal city name map — expand as needed
const CITY_NAMES: Record<string, string> = {
  SYD: 'Sydney',
  MEL: 'Melbourne',
  BNE: 'Brisbane',
  PER: 'Perth',
  ADL: 'Adelaide',
  NRT: 'Tokyo',
  HND: 'Tokyo',
  ICN: 'Seoul',
  HKG: 'Hong Kong',
  SIN: 'Singapore',
  BKK: 'Bangkok',
  DXB: 'Dubai',
  LHR: 'London',
  CDG: 'Paris',
  JFK: 'New York',
  LAX: 'Los Angeles',
  SFO: 'San Francisco',
  ORD: 'Chicago',
  MIA: 'Miami',
  AMS: 'Amsterdam',
  FRA: 'Frankfurt',
  MUC: 'Munich',
  ZRH: 'Zurich',
  MAD: 'Madrid',
  BCN: 'Barcelona',
  FCO: 'Rome',
  ATH: 'Athens',
  IST: 'Istanbul',
  DOH: 'Doha',
  KUL: 'Kuala Lumpur',
  CGK: 'Jakarta',
  MNL: 'Manila',
  TPE: 'Taipei',
  PVG: 'Shanghai',
  PEK: 'Beijing',
  DEL: 'Delhi',
  BOM: 'Mumbai',
  DEN: 'Denver',
  SEA: 'Seattle',
  YYZ: 'Toronto',
  YVR: 'Vancouver',
  MEX: 'Mexico City',
  GRU: 'São Paulo',
  EZE: 'Buenos Aires',
  JNB: 'Johannesburg',
  CPT: 'Cape Town',
  NBO: 'Nairobi',
  CAI: 'Cairo',
  ADD: 'Addis Ababa',
  AKL: 'Auckland',
}

function getCityName(iata: string): string {
  return CITY_NAMES[iata.toUpperCase()] ?? iata
}

function formatPrice(price: number | null): string {
  if (price === null) return '—'
  return `$${price.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`
}

export function AlertCard({ alert, onEdit, onDelete }: AlertCardProps) {
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState(String(alert.target_price))

  const isPriceDrop = alert.status === 'price_drop'
  const isExpired = alert.status === 'expired'

  const accentColor = isPriceDrop
    ? 'bg-[#10B981]'
    : isExpired
    ? 'bg-[#70767f]/40'
    : 'bg-[#70767f]'

  const borderColor = isPriceDrop ? 'border-[#10B981]/30' : 'border-[#1e2631]'

  const originCity = getCityName(alert.origin)
  const destCity = getCityName(alert.destination)

  function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed) && parsed > 0) {
      onEdit(alert.id, parsed)
      setEditMode(false)
    }
  }

  return (
    <article
      className={`rounded-xl bg-[#131a23] border ${borderColor} p-5 relative overflow-hidden flex gap-4`}
    >
      {/* Left accent border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} rounded-l-xl`} />

      {/* Main content */}
      <div className="flex-1 min-w-0 pl-2">
        {/* Header row: route + status badge */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Route */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-base leading-tight">
              {originCity}
            </span>
            <span className="text-[#a6abb5] text-xs font-mono">{alert.origin}</span>
            <span className="text-[#70767f]">→</span>
            <span className="text-white font-semibold text-base leading-tight">
              {destCity}
            </span>
            <span className="text-[#a6abb5] text-xs font-mono">{alert.destination}</span>
          </div>

          {/* Status badge */}
          <StatusBadge status={alert.status} />
        </div>

        {/* Departure date */}
        {alert.departure_date && (
          <p className="text-[#70767f] text-xs mt-1">
            Departs {new Date(alert.departure_date).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Prices row */}
        <div className="mt-3 flex items-baseline gap-4 flex-wrap">
          {/* Current price */}
          <div>
            <p className="text-[#70767f] text-xs mb-0.5">Current price</p>
            <p
              className={`text-2xl font-bold leading-none ${
                isPriceDrop ? 'text-[#10B981]' : 'text-white'
              }`}
            >
              {formatPrice(alert.current_price)}
            </p>
          </div>

          {/* Target price */}
          <div>
            <p className="text-[#70767f] text-xs mb-0.5">Target price</p>
            <p className="text-base font-medium text-[#a6abb5]">
              {formatPrice(alert.target_price)}
            </p>
          </div>
        </div>

        {/* Sparkline */}
        {alert.priceHistory && alert.priceHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-[#70767f] text-xs mb-1.5">30-day trend</p>
            <Sparkline data={alert.priceHistory} height={36} highlightDrop={isPriceDrop} />
          </div>
        )}

        {/* Edit mode */}
        {editMode && (
          <form onSubmit={handleSaveEdit} className="mt-4 flex items-center gap-2">
            <label htmlFor={`target-${alert.id}`} className="sr-only">
              New target price
            </label>
            <input
              id={`target-${alert.id}`}
              type="number"
              min={1}
              step={1}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-32 rounded-lg bg-[#0d1420] border border-[#1e2631] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2]"
              style={{ minHeight: '44px' }}
              aria-label="New target price"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#3D6AF2] text-white text-sm font-medium px-4 hover:bg-[#3D6AF2]/80 transition-colors"
              style={{ minHeight: '44px' }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                setEditValue(String(alert.target_price))
              }}
              className="rounded-lg border border-[#1e2631] text-[#a6abb5] text-sm px-3 hover:border-[#70767f] transition-colors"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
          </form>
        )}

        {/* Actions row */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {/* Book Now — only for price_drop */}
          {isPriceDrop && (
            <a
              href={`https://www.google.com/travel/flights?q=${alert.origin}+to+${alert.destination}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] text-white text-sm font-semibold px-4 hover:bg-[#10B981]/80 transition-colors"
              style={{ minHeight: '44px' }}
            >
              Book Now
            </a>
          )}

          {/* Edit button */}
          <button
            type="button"
            onClick={() => setEditMode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2631] text-[#a6abb5] text-sm px-3 hover:bg-[#1e2631] hover:text-white transition-colors"
            style={{ minHeight: '44px' }}
            aria-label="Edit target price"
            aria-pressed={editMode}
          >
            <PencilIcon />
            <span className="sr-only sm:not-sr-only">Edit</span>
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(alert.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2631] text-[#a6abb5] text-sm px-3 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/40 hover:text-[#EF4444] transition-colors"
            style={{ minHeight: '44px' }}
            aria-label="Delete alert"
          >
            <TrashIcon />
            <span className="sr-only sm:not-sr-only">Delete</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function StatusBadge({ status }: { status: FlightAlert['status'] }) {
  if (status === 'price_drop') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold px-2.5 py-1 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
        </span>
        Price Drop!
      </span>
    )
  }

  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70767f]/10 text-[#70767f]/60 text-xs font-medium px-2.5 py-1 shrink-0">
        <span className="h-2 w-2 rounded-full bg-[#70767f]/40" />
        Expired
      </span>
    )
  }

  // tracking
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70767f]/15 text-[#70767f] text-xs font-medium px-2.5 py-1 shrink-0">
      <span className="h-2 w-2 rounded-full bg-[#70767f]" />
      Tracking
    </span>
  )
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
