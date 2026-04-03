'use client'

import type { FlightOffer } from './types'

interface FlightCardProps {
  offer: FlightOffer
  onSetAlert: (offer: FlightOffer) => void
  googlePrice?: number
}

const AIRLINE_COLORS: Record<string, string> = {
  QF: '#e0102e',
  SQ: '#f9a825',
  EK: '#c8102e',
  AA: '#0078d2',
  UA: '#002244',
  DL: '#003366',
  BA: '#075aaa',
  LH: '#002855',
  CX: '#006564',
  JL: '#c8102e',
}

function getAirlineColor(code: string): string {
  return AIRLINE_COLORS[code] ?? '#3D6AF2'
}

export function FlightCard({ offer, onSetAlert, googlePrice }: FlightCardProps) {
  const stopsLabel =
    offer.stops === 0
      ? 'Direct'
      : offer.stops === 1
        ? `1 stop${offer.stopCities[0] ? ` (${offer.stopCities[0]})` : ''}`
        : `${offer.stops} stops${offer.stopCities.length ? ` (${offer.stopCities.join(', ')})` : ''}`

  const stopsColor = offer.stops === 0 ? 'text-[#10B981]' : 'text-[#f59e0b]'

  const savingsPercent =
    googlePrice && googlePrice > offer.price
      ? Math.round(((googlePrice - offer.price) / googlePrice) * 100)
      : null

  return (
    <article className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 hover:border-[#3D6AF2]/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Airline info */}
        <div className="flex items-center gap-3 sm:w-36 shrink-0">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white text-xs font-bold"
            style={{ backgroundColor: getAirlineColor(offer.airlineCode) }}
            aria-hidden="true"
          >
            {offer.airlineCode}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{offer.airline}</p>
            <p className="text-xs text-[#70767f]">{offer.flightNumber}</p>
          </div>
        </div>

        {/* Time and route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Departure */}
            <div className="text-right shrink-0">
              <p className="text-lg font-semibold text-white leading-tight">{offer.departureTime}</p>
              <p className="text-xs text-[#70767f]">{offer.departureAirport}</p>
            </div>

            {/* Duration bar */}
            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[80px]">
              <p className="text-[10px] text-[#70767f]">{offer.duration}</p>
              <div className="w-full flex items-center gap-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D6AF2] shrink-0" />
                <span className="flex-1 h-px bg-[#2a3545]" />
                {offer.stops > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />}
                {offer.stops > 0 && <span className="flex-1 h-px bg-[#2a3545]" />}
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D6AF2] shrink-0" />
              </div>
              <p className={`text-[10px] font-medium ${stopsColor}`}>{stopsLabel}</p>
            </div>

            {/* Arrival */}
            <div className="shrink-0">
              <p className="text-lg font-semibold text-white leading-tight">{offer.arrivalTime}</p>
              <p className="text-xs text-[#70767f]">{offer.arrivalAirport}</p>
            </div>
          </div>
        </div>

        {/* Price and action */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2 shrink-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">
              {offer.currency === 'USD' ? '$' : offer.currency}{offer.price}
            </span>
          </div>

          {savingsPercent !== null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898" />
              </svg>
              {savingsPercent}% vs Google
            </span>
          )}

          <button
            type="button"
            onClick={() => onSetAlert(offer)}
            className="rounded-lg bg-[#3D6AF2]/10 border border-[#3D6AF2]/20 text-[#3D6AF2] text-xs font-medium px-3 py-1.5
              hover:bg-[#3D6AF2]/20 hover:border-[#3D6AF2]/40 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Set Alert
          </button>
        </div>
      </div>
    </article>
  )
}
