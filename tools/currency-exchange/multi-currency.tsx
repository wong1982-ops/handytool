'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getFlag } from './currency-select'
import { isCrypto, getCryptoId, fetchCryptoRates } from './crypto-api'

const API_BASE = 'https://api.frankfurter.app'
const STORAGE_KEY = 'ht-currency-multi-targets'
const DEFAULT_TARGETS = ['USD', 'EUR', 'GBP', 'JPY', 'AUD']

interface MultiCurrencyProps {
  amount: number
  from: string
  currencies: Record<string, string>
}

interface ConvertedRate {
  code: string
  name: string
  rate: number
  converted: number
}

function loadTargets(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Ignore
  }
  return DEFAULT_TARGETS
}

function saveTargets(targets: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targets))
  } catch {
    // Ignore
  }
}

function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function formatSmart(n: number): string {
  if (n >= 1000) return formatNumber(n, 2)
  if (n >= 1) return formatNumber(n, 4)
  if (n >= 0.01) return formatNumber(n, 6)
  return formatNumber(n, 8)
}

export function MultiCurrency({ amount, from, currencies }: MultiCurrencyProps) {
  const [targets, setTargets] = useState<string[]>([])
  const [rates, setRates] = useState<ConvertedRate[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownFilter, setDropdownFilter] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  // Load targets from localStorage
  useEffect(() => {
    const stored = loadTargets()
    setTargets(stored)
    loaded.current = true
  }, [])

  // Save targets when changed
  useEffect(() => {
    if (!loaded.current) return
    saveTargets(targets)
  }, [targets])

  // Filter out the source currency
  const activeTargets = targets.filter((t) => t !== from)

  // Fetch rates for all targets
  useEffect(() => {
    if (activeTargets.length === 0 || amount <= 0) {
      setRates([])
      return
    }

    const fetchRates = async () => {
      setLoading(true)
      try {
        const fromIsCrypto = isCrypto(from)
        const fiatTargets = activeTargets.filter((t) => !isCrypto(t))
        const cryptoTargets = activeTargets.filter((t) => isCrypto(t))

        const results: ConvertedRate[] = []

        // Fetch fiat rates
        if (fiatTargets.length > 0) {
          if (!fromIsCrypto) {
            // Fiat -> Fiat: frankfurter batch
            const res = await fetch(`${API_BASE}/latest?from=${from}&to=${fiatTargets.join(',')}`)
            const data = await res.json()
            if (data.rates) {
              for (const code of fiatTargets) {
                const rate = data.rates[code]
                if (rate !== undefined) {
                  results.push({
                    code,
                    name: currencies[code] || code,
                    rate,
                    converted: amount * rate,
                  })
                }
              }
            }
          } else {
            // Crypto -> Fiat: CoinGecko
            const cryptoId = getCryptoId(from)
            if (cryptoId) {
              const fiatLower = fiatTargets.map((t) => t.toLowerCase())
              const data = await fetchCryptoRates([cryptoId], fiatLower)
              for (const code of fiatTargets) {
                const price = data[cryptoId]?.[code.toLowerCase()]
                if (price !== undefined) {
                  results.push({
                    code,
                    name: currencies[code] || code,
                    rate: price,
                    converted: amount * price,
                  })
                }
              }
            }
          }
        }

        // Fetch crypto rates
        if (cryptoTargets.length > 0) {
          if (!fromIsCrypto) {
            // Fiat -> Crypto: invert CoinGecko prices
            const cryptoIds = cryptoTargets.map((t) => getCryptoId(t)).filter(Boolean) as string[]
            const fiatLower = from.toLowerCase()
            const data = await fetchCryptoRates(cryptoIds, [fiatLower])
            for (const code of cryptoTargets) {
              const cryptoId = getCryptoId(code)
              if (!cryptoId) continue
              const price = data[cryptoId]?.[fiatLower]
              if (price !== undefined && price > 0) {
                const rate = 1 / price
                results.push({
                  code,
                  name: currencies[code] || code,
                  rate,
                  converted: amount * rate,
                })
              }
            }
          } else {
            // Crypto -> Crypto: via USD
            const fromId = getCryptoId(from)
            const cryptoIds = cryptoTargets.map((t) => getCryptoId(t)).filter(Boolean) as string[]
            if (fromId) {
              const allIds = [fromId, ...cryptoIds]
              const data = await fetchCryptoRates(allIds, ['usd'])
              const fromPrice = data[fromId]?.usd
              if (fromPrice) {
                for (const code of cryptoTargets) {
                  const cryptoId = getCryptoId(code)
                  if (!cryptoId) continue
                  const toPrice = data[cryptoId]?.usd
                  if (toPrice && toPrice > 0) {
                    const rate = fromPrice / toPrice
                    results.push({
                      code,
                      name: currencies[code] || code,
                      rate,
                      converted: amount * rate,
                    })
                  }
                }
              }
            }
          }
        }

        setRates(results)
      } catch {
        // Keep existing rates on error
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [from, amount, activeTargets.join(','), currencies])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setDropdownFilter('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const addTarget = useCallback((code: string) => {
    setTargets((prev) => {
      if (prev.includes(code)) return prev
      return [...prev, code]
    })
    setShowDropdown(false)
    setDropdownFilter('')
  }, [])

  const removeTarget = useCallback((code: string) => {
    setTargets((prev) => prev.filter((t) => t !== code))
  }, [])

  // Available currencies to add (not already in targets and not the source)
  const availableCurrencies = Object.keys(currencies)
    .filter((code) => !targets.includes(code) && code !== from)
    .sort()

  const filteredAvailable = dropdownFilter
    ? availableCurrencies.filter(
        (code) =>
          code.toLowerCase().includes(dropdownFilter.toLowerCase()) ||
          (currencies[code] || '').toLowerCase().includes(dropdownFilter.toLowerCase())
      )
    : availableCurrencies

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Multi-Currency
        </h3>
        <span className="text-xs text-slate-400">
          {formatSmart(amount)} {from} =
        </span>
      </div>

      {loading && rates.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeTargets.map((code) => (
            <div
              key={code}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 animate-pulse"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-2" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rates.map((r) => (
            <div
              key={r.code}
              className="group relative bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 transition-colors hover:border-[var(--tk-color-primary-500)]/30"
            >
              {/* Remove button */}
              <button
                onClick={() => removeTarget(r.code)}
                className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-xs"
                aria-label={`Remove ${r.code}`}
              >
                &times;
              </button>

              {/* Flag + Code */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base" aria-hidden="true">{getFlag(r.code)}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{r.code}</span>
              </div>

              {/* Converted amount */}
              <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate" title={formatSmart(r.converted)}>
                {formatSmart(r.converted)}
              </p>

              {/* Rate */}
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                1 {from} = {formatSmart(r.rate)}
              </p>
            </div>
          ))}

          {/* Add currency button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[var(--tk-color-primary-500)] hover:border-[var(--tk-color-primary-500)]/30 transition-colors cursor-pointer"
              aria-label="Add currency"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium">Add</span>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={dropdownFilter}
                    onChange={(e) => setDropdownFilter(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto py-1">
                  {filteredAvailable.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-slate-400 text-center">No currencies available</li>
                  ) : (
                    filteredAvailable.slice(0, 20).map((code) => (
                      <li key={code}>
                        <button
                          onMouseDown={(e) => { e.preventDefault(); addTarget(code) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-left"
                        >
                          <span aria-hidden="true">{getFlag(code)}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{code}</span>
                          <span className="text-slate-400 truncate">{currencies[code]}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
