'use client'

import { Sparkline } from './sparkline'
import type { FlightDeal, DealDetails } from './types'

interface DealCardProps {
  deal: FlightDeal
  onSetAlert: (origin: string, destination: string) => void
  onSearch: (origin: string, destination: string) => void
}

const CITY_NAMES: Record<string, string> = {
  SYD: 'Sydney', MEL: 'Melbourne', BNE: 'Brisbane', PER: 'Perth', ADL: 'Adelaide',
  NRT: 'Tokyo', HND: 'Tokyo Haneda', ICN: 'Seoul', HKG: 'Hong Kong', SIN: 'Singapore',
  BKK: 'Bangkok', DPS: 'Bali', DXB: 'Dubai', LHR: 'London', CDG: 'Paris',
  JFK: 'New York', LAX: 'Los Angeles', SFO: 'San Francisco', AMS: 'Amsterdam',
  KUL: 'Kuala Lumpur', AKL: 'Auckland', MNL: 'Manila', TPE: 'Taipei',
}

function getCityName(iata: string): string {
  return CITY_NAMES[iata.toUpperCase()] ?? iata
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatTime(dateTime: string): string {
  // "2026-04-25 13:00" → "13:00"
  const parts = dateTime.split(' ')
  return parts[1] || dateTime
}

function formatDate(dateStr: string): string {
  // "2026-04-25" → "25 Apr"
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function FlightDetails({ details }: { details: DealDetails }) {
  const firstLeg = details.legs[0]
  const lastLeg = details.legs[details.legs.length - 1]
  if (!firstLeg) return null

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#1e2631] space-y-2.5">
      {/* Airline + dates */}
      <div className="flex items-center gap-2.5">
        {details.airlineLogo && (
          <img src={details.airlineLogo} alt={details.airline} className="w-5 h-5 rounded" />
        )}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{details.airline}</span>
        <span className="text-slate-300 dark:text-[#2a3545]">·</span>
        <span className="text-xs text-slate-400 dark:text-[#70767f]">
          {formatDate(details.departureDate)} – {formatDate(details.returnDate)}
        </span>
      </div>

      {/* Route visualization */}
      <div className="flex items-center gap-3">
        {/* Departure */}
        <div className="text-center shrink-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatTime(firstLeg.depTime)}</p>
          <p className="text-[11px] text-slate-400 dark:text-[#70767f]">{firstLeg.depCode}</p>
        </div>

        {/* Route line */}
        <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
          <p className="text-[11px] text-slate-400 dark:text-[#70767f]">{formatDuration(details.totalDuration)}</p>
          <div className="w-full flex items-center gap-0.5">
            <div className="flex-1 h-px bg-slate-300 dark:bg-[#2a3545]" />
            {details.stops > 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
            <div className="flex-1 h-px bg-slate-300 dark:bg-[#2a3545]" />
          </div>
          <p className={`text-[11px] font-medium ${details.stops === 0 ? 'text-emerald-500' : 'text-amber-400'}`}>
            {details.stops === 0 ? 'Direct' : `${details.stops} stop`}
          </p>
        </div>

        {/* Arrival */}
        <div className="text-center shrink-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatTime(lastLeg.arrTime)}</p>
          <p className="text-[11px] text-slate-400 dark:text-[#70767f]">{lastLeg.arrCode}</p>
        </div>
      </div>

      {/* Layover + flight info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {details.layovers.length > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-[#70767f]">
            Layover: {details.layovers.map(l => `${formatDuration(l.duration)} in ${getCityName(l.code)}`).join(', ')}
          </span>
        )}
        {firstLeg.airplane && (
          <span className="text-[11px] text-slate-400 dark:text-[#70767f]">{firstLeg.airplane}</span>
        )}
        {firstLeg.flightNumber && (
          <span className="text-[11px] text-slate-400 dark:text-[#70767f]">{firstLeg.flightNumber}</span>
        )}
        {details.carbonKg && (
          <span className="text-[11px] text-slate-400 dark:text-[#70767f]">CO₂: {details.carbonKg} kg</span>
        )}
      </div>
    </div>
  )
}

export function DealCard({ deal, onSetAlert, onSearch }: DealCardProps) {
  const originCity = getCityName(deal.origin)
  const destCity = getCityName(deal.destination)
  const hasDiscount = deal.discount_pct > 0
  const discountLabel = hasDiscount ? `-${Math.round(deal.discount_pct)}%` : 'Tracking'
  const details = deal.details as DealDetails | undefined

  return (
    <article className="rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] p-5 hover:border-[#10B981]/40 transition-colors">
      {/* Header row: route + discount badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-slate-900 dark:text-white font-bold text-base leading-tight truncate">
            {originCity}
          </span>
          <ArrowRightIcon />
          <span className="text-slate-900 dark:text-white font-bold text-base leading-tight truncate">
            {destCity}
          </span>
        </div>

        <span className={`inline-flex items-center shrink-0 rounded-full text-xs font-semibold px-2.5 py-1 ${
          hasDiscount
            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
            : 'bg-[#3D6AF2]/10 text-[#3D6AF2] border border-[#3D6AF2]/20'
        }`}>
          {discountLabel}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-slate-400 dark:text-[#70767f] text-xs mt-1">
        {deal.origin} → {deal.destination} · {details?.airline || 'Multiple airlines'}
      </p>

      {/* Price section */}
      <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-slate-400 dark:text-[#70767f] text-xs mb-0.5">Current price</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
            {formatPrice(deal.current_price)}
          </p>
        </div>

        {hasDiscount && (
          <div className="text-right">
            <p className="text-slate-400 dark:text-[#70767f] text-xs mb-0.5">30-day avg</p>
            <p className="text-base font-medium text-slate-500 dark:text-[#a6abb5] line-through">
              {formatPrice(deal.avg_price)}
            </p>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {deal.priceHistory && deal.priceHistory.length > 0 && (
        <div className="mt-4">
          <Sparkline data={deal.priceHistory} height={24} highlightDrop />
        </div>
      )}

      {/* Rich flight details */}
      {details && details.legs.length > 0 && (
        <FlightDetails details={details} />
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSetAlert(deal.origin, deal.destination)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6AF2]/10 border border-[#3D6AF2]/20 text-[#3D6AF2] text-sm font-medium px-3 hover:bg-[#3D6AF2]/20 transition-colors"
          style={{ minHeight: '44px' }}
          aria-label={`Set alert for ${originCity} to ${destCity}`}
        >
          <BellIcon />
          Set Alert
        </button>

        <button
          type="button"
          onClick={() => onSearch(deal.origin, deal.destination)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-[#1e2631] border border-slate-200 dark:border-[#1e2631] text-slate-500 dark:text-[#a6abb5] text-sm font-medium px-3 hover:bg-slate-300 dark:hover:bg-[#1e2631]/70 hover:text-slate-900 dark:hover:text-white transition-colors"
          style={{ minHeight: '44px' }}
          aria-label={`Search flights from ${originCity} to ${destCity}`}
        >
          <SearchIcon />
          Search
        </button>
      </div>
    </article>
  )
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#70767f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
