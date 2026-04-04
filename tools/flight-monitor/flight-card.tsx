'use client'

import type { FlightOffer } from './types'

interface FlightCardProps {
  offer: FlightOffer
  onSetAlert: (offer: FlightOffer) => void
}

function formatDuration(dur: string | number): string {
  if (typeof dur === 'number') {
    const h = Math.floor(dur / 60)
    const m = dur % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  // ISO duration "PT8H30M" or already formatted "8h 30m"
  if (dur.includes('h') || dur.includes('H')) {
    return dur.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim()
  }
  return dur
}

function formatTime(dateTime: string): string {
  // "2026-04-25 13:00" → "13:00" or "2026-04-25T13:00:00" → "13:00"
  const match = dateTime.match(/(\d{2}:\d{2})/)
  return match ? match[1] : dateTime
}

interface Leg {
  depCode?: string
  depTime?: string
  arrCode?: string
  arrTime?: string
  duration?: number
  airline?: string
  airlineLogo?: string
  flightNumber?: string
  airplane?: string
}

interface Layover {
  code?: string
  airport?: string
  duration?: number
}

export function FlightCard({ offer, onSetAlert }: FlightCardProps) {
  const ext = offer as FlightOffer & { legs?: Leg[]; layovers?: Layover[]; airplane?: string; carbonKg?: number; airlineLogo?: string }
  const legs: Leg[] = ext.legs || []
  const layovers: Layover[] = ext.layovers || []
  const hasRichData = legs.length > 0

  const stopsLabel =
    offer.stops === 0
      ? 'Direct'
      : offer.stops === 1
        ? `1 stop${offer.stopCities[0] ? ` (${offer.stopCities[0]})` : ''}`
        : `${offer.stops} stops`

  const stopsColor = offer.stops === 0 ? 'text-emerald-500' : 'text-amber-400'

  return (
    <article className="rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] p-4 hover:border-[#3D6AF2]/30 transition-colors">
      {/* Header: airline + price */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {ext.airlineLogo ? (
            <img src={ext.airlineLogo} alt={offer.airline} className="w-6 h-6 rounded" />
          ) : (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#3D6AF2] text-white text-[9px] font-bold">
              {offer.airlineCode || offer.airline.slice(0, 2)}
            </span>
          )}
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{offer.airline}</span>
          <span className="text-xs text-slate-400 dark:text-[#70767f]">{offer.flightNumber}</span>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ${offer.price.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-slate-400 dark:text-[#70767f]">{offer.currency}</span>
        </div>
      </div>

      {/* Route summary */}
      <div className="flex items-center gap-3 mb-2">
        <div className="text-center shrink-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatTime(offer.departureTime)}</p>
          <p className="text-[11px] text-slate-400 dark:text-[#70767f]">{offer.departureAirport}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[60px]">
          <p className="text-[11px] text-slate-400 dark:text-[#70767f]">{formatDuration(offer.duration)}</p>
          <div className="w-full flex items-center">
            <div className="flex-1 h-px bg-slate-300 dark:bg-[#2a3545]" />
            {offer.stops > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-0.5 shrink-0" />}
            {offer.stops > 1 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-0.5 shrink-0" />}
            <div className="flex-1 h-px bg-slate-300 dark:bg-[#2a3545]" />
          </div>
          <p className={`text-[11px] font-medium ${stopsColor}`}>{stopsLabel}</p>
        </div>
        <div className="text-center shrink-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatTime(offer.arrivalTime)}</p>
          <p className="text-[11px] text-slate-400 dark:text-[#70767f]">{offer.arrivalAirport}</p>
        </div>
      </div>

      {/* Rich leg details (when available from SerpApi) */}
      {hasRichData && legs.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#1e2631] space-y-0">
          {legs.map((leg, i) => (
            <div key={i}>
              <div className="flex items-center gap-2.5 py-1">
                <div className="flex flex-col items-center w-3 self-stretch shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3D6AF2] shrink-0 mt-1.5" />
                  <div className="flex-1 w-px bg-slate-300 dark:bg-[#2a3545]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{formatTime(leg.depTime || '')}</span>
                    <span className="text-[11px] text-slate-400 dark:text-[#70767f]">{leg.depCode}</span>
                    <span className="text-slate-300 dark:text-[#2a3545]">→</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{formatTime(leg.arrTime || '')}</span>
                    <span className="text-[11px] text-slate-400 dark:text-[#70767f]">{leg.arrCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-slate-400 dark:text-[#70767f]">
                    {leg.flightNumber && <span>{leg.flightNumber}</span>}
                    {leg.duration && <span>· {formatDuration(leg.duration)}</span>}
                    {leg.airplane && <span>· {leg.airplane}</span>}
                  </div>
                </div>
              </div>
              {i < layovers.length && (
                <div className="flex items-center gap-2.5 py-1">
                  <div className="flex flex-col items-center w-3 shrink-0">
                    <div className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                  </div>
                  <span className="text-[11px] font-medium text-amber-500">
                    {formatDuration(layovers[i].duration || 0)} layover in {layovers[i].code || layovers[i].airport}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Single-leg details (direct flights or basic data) */}
      {(!hasRichData || legs.length === 1) && (ext.airplane || offer.flightNumber) && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-400 dark:text-[#70767f]">
          {ext.airplane && <span>{ext.airplane}</span>}
          {ext.carbonKg && <span>· CO₂ {ext.carbonKg} kg</span>}
        </div>
      )}

      {/* Set Alert button */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onSetAlert(offer)}
          className="rounded-lg bg-[#3D6AF2]/10 border border-[#3D6AF2]/20 text-[#3D6AF2] text-xs font-medium px-4 hover:bg-[#3D6AF2]/20 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Set Alert
        </button>
      </div>
    </article>
  )
}
