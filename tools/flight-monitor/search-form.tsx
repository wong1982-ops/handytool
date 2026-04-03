'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { AirportSuggestion } from './types'

interface SearchFormProps {
  onSearch: (params: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    adults: number
  }) => void
  loading: boolean
  defaultOrigin?: string
  defaultDestination?: string
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function AirportInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (code: string, display: string) => void
  placeholder: string
}) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState(value)
  const debouncedQuery = useDebounce(query, 300)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync external value changes (e.g. swap)
  useEffect(() => {
    setQuery(value)
    setSelectedCode(value)
  }, [value])

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || debouncedQuery === selectedCode) {
      setSuggestions([])
      return
    }
    let cancelled = false
    fetch(`/api/v1/flights/airports?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data: AirportSuggestion[]) => {
        if (!cancelled) {
          setSuggestions(data)
          setOpen(data.length > 0)
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
    return () => { cancelled = true }
  }, [debouncedQuery, selectedCode])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <label className="block text-xs font-medium text-slate-500 dark:text-[#a6abb5] mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#70767f]">{icon}</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedCode('')
            onChange('', '')
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-white placeholder:text-slate-400 dark:text-[#70767f]
            pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#3D6AF2]/50 focus:ring-1 focus:ring-[#3D6AF2]/30 transition-colors"
          style={{ minHeight: '44px' }}
          autoComplete="off"
          aria-label={label}
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 left-0 right-0 mt-1 rounded-lg bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] shadow-xl overflow-hidden"
          role="listbox"
        >
          {suggestions.map((s) => (
            <li key={s.iataCode}>
              <button
                type="button"
                onClick={() => {
                  const display = `${s.iataCode} \u2014 ${s.cityName}, ${s.countryCode}`
                  setQuery(display)
                  setSelectedCode(display)
                  onChange(s.iataCode, display)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-500 dark:text-[#a6abb5] hover:bg-slate-200 dark:hover:bg-slate-200 dark:bg-[#1e2631] hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
                role="option"
                aria-selected={false}
              >
                <span className="font-semibold text-white">{s.iataCode}</span>
                {' \u2014 '}
                {s.name}, {s.cityName}, {s.countryCode}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SearchForm({ onSearch, loading, defaultOrigin, defaultDestination }: SearchFormProps) {
  const [originCode, setOriginCode] = useState(defaultOrigin ?? '')
  const [originDisplay, setOriginDisplay] = useState(defaultOrigin ?? '')
  const [destCode, setDestCode] = useState(defaultDestination ?? '')
  const [destDisplay, setDestDisplay] = useState(defaultDestination ?? '')
  const [tripType, setTripType] = useState<'oneway' | 'return'>('oneway')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [adults, setAdults] = useState(1)

  const canSearch = originCode.length === 3 && destCode.length === 3 && departureDate !== ''

  const handleSwap = useCallback(() => {
    setOriginCode(destCode)
    setOriginDisplay(destDisplay)
    setDestCode(originCode)
    setDestDisplay(originDisplay)
  }, [originCode, originDisplay, destCode, destDisplay])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSearch) return
    onSearch({
      origin: originCode,
      destination: destCode,
      departureDate,
      ...(tripType === 'return' && returnDate ? { returnDate } : {}),
      adults,
    })
  }

  // Today as min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] p-4 sm:p-6">
      {/* Trip type toggle */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white dark:bg-[#090f16] w-fit">
        <button
          type="button"
          onClick={() => { setTripType('oneway'); setReturnDate('') }}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tripType === 'oneway'
              ? 'bg-slate-200 dark:bg-[#1e2631] text-white'
              : 'text-slate-400 dark:text-[#70767f] hover:text-slate-500 dark:hover:text-slate-500 dark:text-[#a6abb5]'
          }`}
          style={{ minHeight: '44px' }}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => setTripType('return')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tripType === 'return'
              ? 'bg-slate-200 dark:bg-[#1e2631] text-white'
              : 'text-slate-400 dark:text-[#70767f] hover:text-slate-500 dark:hover:text-slate-500 dark:text-[#a6abb5]'
          }`}
          style={{ minHeight: '44px' }}
        >
          Return
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        {/* Origin */}
        <AirportInput
          label="From"
          placeholder="City or airport"
          value={originDisplay}
          onChange={(code, display) => {
            setOriginCode(code)
            setOriginDisplay(display)
          }}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          }
        />

        {/* Swap */}
        <div className="flex items-end justify-center pb-0.5">
          <button
            type="button"
            onClick={handleSwap}
            className="rounded-lg bg-slate-200 dark:bg-[#1e2631] border border-[#2a3545] p-2.5 text-slate-500 dark:text-[#a6abb5] hover:text-white hover:border-[#3D6AF2]/30 transition-colors cursor-pointer"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Swap origin and destination"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>
        </div>

        {/* Destination */}
        <AirportInput
          label="To"
          placeholder="City or airport"
          value={destDisplay}
          onChange={(code, display) => {
            setDestCode(code)
            setDestDisplay(display)
          }}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          }
        />
      </div>

      <div className={`grid grid-cols-2 ${tripType === 'return' ? 'sm:grid-cols-[1fr_1fr_auto_auto]' : 'sm:grid-cols-[1fr_auto_auto]'} gap-3 mt-3 items-end`}>
        {/* Departure date */}
        <div className="min-w-0">
          <label className="block text-xs font-medium text-slate-500 dark:text-[#a6abb5] mb-1.5">Departure</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#70767f]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </span>
            <input
              type="date"
              value={departureDate}
              min={today}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-lg bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-white
                pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#3D6AF2]/50 focus:ring-1 focus:ring-[#3D6AF2]/30 transition-colors
                [color-scheme:dark]"
              style={{ minHeight: '44px' }}
              aria-label="Departure date"
            />
          </div>
        </div>

        {/* Return date (conditional) */}
        {tripType === 'return' && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-[#a6abb5] mb-1.5">Return</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#70767f]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </span>
              <input
                type="date"
                value={returnDate}
                min={departureDate || today}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full rounded-lg bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-white
                  pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#3D6AF2]/50 focus:ring-1 focus:ring-[#3D6AF2]/30 transition-colors
                  [color-scheme:dark]"
                style={{ minHeight: '44px' }}
                aria-label="Return date"
              />
            </div>
          </div>
        )}

        {/* Passengers */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-[#a6abb5] mb-1.5">Passengers</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#70767f]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <input
              type="number"
              min={1}
              max={9}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, Math.min(9, Number(e.target.value))))}
              className="w-24 rounded-lg bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-white
                pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#3D6AF2]/50 focus:ring-1 focus:ring-[#3D6AF2]/30 transition-colors"
              style={{ minHeight: '44px' }}
              aria-label="Number of passengers"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={!canSearch || loading}
          className="rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white font-medium text-sm px-6 py-2.5
            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Search Flights
            </span>
          )}
        </button>
      </div>
    </form>
  )
}
