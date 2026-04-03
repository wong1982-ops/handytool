'use client'

import { useState } from 'react'
import type { FlightOffer } from './types'

interface SetAlertModalProps {
  offer: FlightOffer
  onClose: () => void
  onCreated: () => void
}

export function SetAlertModal({ offer, onClose, onCreated }: SetAlertModalProps) {
  const suggestedPrice = Math.round(offer.price * 0.8)
  const [targetPrice, setTargetPrice] = useState(suggestedPrice)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (targetPrice <= 0) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/flights/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: offer.departureAirport,
          destination: offer.arrivalAirport,
          targetPrice,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Failed to create alert (${res.status})`)
      }

      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-[#0c1219] border border-[#1e2631] p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Create Price Alert</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-[#70767f] hover:text-white transition-colors cursor-pointer p-1"
          style={{ minHeight: '44px', minWidth: '44px' }}
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Route info */}
      <div className="flex items-center gap-2 text-sm text-[#a6abb5] mb-4">
        <span className="font-medium text-white">{offer.departureAirport}</span>
        <svg className="w-4 h-4 text-[#70767f]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
        <span className="font-medium text-white">{offer.arrivalAirport}</span>
        <span className="text-[#70767f] ml-auto">
          Current: {offer.currency === 'USD' ? '$' : offer.currency}{offer.price}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#a6abb5] mb-1.5">
            Target price ({offer.currency})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#70767f] text-sm font-medium">
              {offer.currency === 'USD' ? '$' : offer.currency}
            </span>
            <input
              type="number"
              min={1}
              value={targetPrice}
              onChange={(e) => setTargetPrice(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg bg-[#131a23] border border-[#1e2631] text-white
                pl-8 pr-3 py-2.5 text-sm outline-none focus:border-[#3D6AF2]/50 focus:ring-1 focus:ring-[#3D6AF2]/30 transition-colors"
              style={{ minHeight: '44px' }}
              aria-label="Target price"
            />
          </div>
          <p className="text-[10px] text-[#70767f] mt-1">
            We&apos;ll notify you when the price drops to this amount or below.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 mb-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1e2631] border border-[#2a3545] text-[#a6abb5] text-sm font-medium px-4 py-2
              hover:text-white hover:border-[#3D6AF2]/30 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || targetPrice <= 0}
            className="rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white text-sm font-medium px-4 py-2
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer flex-1"
            style={{ minHeight: '44px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Alert'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
