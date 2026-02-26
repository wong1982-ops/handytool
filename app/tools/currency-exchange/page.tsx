'use client'

import { type ReactNode, useState, useCallback, useEffect, useRef } from 'react'
import { ConverterBar } from '@/tools/currency-exchange/converter-bar'
import { RateChart, type Period } from '@/tools/currency-exchange/rate-chart'
import { StatsRow } from '@/tools/currency-exchange/stats-row'
import { CurrencyPairs, type CurrencyPair } from '@/tools/currency-exchange/currency-pairs'
import { ExternalLinks } from '@/tools/currency-exchange/external-links'
import { PanelGrid } from '@/tools/currency-exchange/panel-grid'
import { usePanelLayout, type PanelId } from '@/tools/currency-exchange/use-panel-layout'
import { useIsDesktop } from '@/tools/currency-exchange/use-is-desktop'
import {
  isCrypto,
  getCryptoId,
  getCryptoCurrencies,
  fetchCryptoRates,
  fetchCryptoHistory,
} from '@/tools/currency-exchange/crypto-api'

const API_BASE = 'https://api.frankfurter.app'

const TOP_PAIRS_CONFIG: { from: string; to: string; label: string; sublabel: string }[] = [
  { from: 'EUR', to: 'USD', label: 'EUR / USD', sublabel: 'Euro vs US Dollar' },
  { from: 'GBP', to: 'USD', label: 'GBP / USD', sublabel: 'Pound vs US Dollar' },
  { from: 'USD', to: 'JPY', label: 'USD / JPY', sublabel: 'US Dollar vs Yen' },
  { from: 'AUD', to: 'USD', label: 'AUD / USD', sublabel: 'Australian Dollar vs USD' },
]

function getDateRange(period: Period): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  switch (period) {
    case '1W': start.setDate(end.getDate() - 7); break
    case '1M': start.setMonth(end.getMonth() - 1); break
    case '3M': start.setMonth(end.getMonth() - 3); break
    case '6M': start.setMonth(end.getMonth() - 6); break
    case '1Y': start.setFullYear(end.getFullYear() - 1); break
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function getYesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  // Skip weekends (frankfurter has no weekend data)
  const day = d.getDay()
  if (day === 0) d.setDate(d.getDate() - 2) // Sunday -> Friday
  if (day === 6) d.setDate(d.getDate() - 1) // Saturday -> Friday
  return d.toISOString().slice(0, 10)
}

function periodToDays(period: Period): number {
  switch (period) {
    case '1W': return 7
    case '1M': return 30
    case '3M': return 90
    case '6M': return 180
    case '1Y': return 365
  }
}

// Format numbers appropriately for crypto (high precision for small values, low for large)
function formatCryptoRate(rate: number): string {
  if (rate >= 1000) return rate.toFixed(2)
  if (rate >= 1) return rate.toFixed(4)
  if (rate >= 0.01) return rate.toFixed(6)
  return rate.toFixed(8)
}

export default function CurrencyExchangePage() {
  const [currencies, setCurrencies] = useState<Record<string, string>>({})
  const [amount, setAmount] = useState('1000.00')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [period, setPeriod] = useState<Period>('1M')

  const [result, setResult] = useState<{ converted: number; rate: number; changePercent: number | null } | null>(null)
  const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([])
  const [topPairs, setTopPairs] = useState<CurrencyPair[]>(
    TOP_PAIRS_CONFIG.map((p) => ({ ...p, rate: null, changePercent: null }))
  )

  const [convertLoading, setConvertLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [pairsLoading, setPairsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initialized = useRef(false)

  const { panels, reorderPanels, setColSpan, resetLayout, isDefault } = usePanelLayout()
  const isDesktop = useIsDesktop()

  // Fetch currencies list on mount (fiat from frankfurter + crypto)
  useEffect(() => {
    fetch(`${API_BASE}/currencies`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        // Merge fiat and crypto currencies
        const merged = { ...data, ...getCryptoCurrencies() }
        setCurrencies(merged)
      })
      .catch(() => setError('Failed to load currency list'))
  }, [])

  // Fetch top pairs data on mount
  useEffect(() => {
    const fetchPairs = async () => {
      setPairsLoading(true)
      try {
        const yesterday = getYesterdayStr()
        const results = await Promise.all(
          TOP_PAIRS_CONFIG.map(async (pair) => {
            const [latestRes, yesterdayRes] = await Promise.all([
              fetch(`${API_BASE}/latest?from=${pair.from}&to=${pair.to}`),
              fetch(`${API_BASE}/${yesterday}?from=${pair.from}&to=${pair.to}`),
            ])
            const latestData = await latestRes.json()
            const yesterdayData = await yesterdayRes.json()
            const rate = latestData.rates?.[pair.to] ?? null
            const yesterdayRate = yesterdayData.rates?.[pair.to] ?? null
            const changePercent = rate !== null && yesterdayRate !== null
              ? ((rate - yesterdayRate) / yesterdayRate) * 100
              : null
            return { ...pair, rate, changePercent }
          })
        )
        setTopPairs(results)
      } catch {
        // Keep existing null state for pairs — non-critical
      } finally {
        setPairsLoading(false)
      }
    }
    fetchPairs()
  }, [])

  // Convert currency — handles fiat-fiat, crypto-fiat, fiat-crypto, crypto-crypto
  const doConvert = useCallback(async (amt: string, fromCode: string, toCode: string) => {
    if (!amt || parseFloat(amt) <= 0) return
    if (fromCode === toCode) {
      setResult({ converted: parseFloat(amt), rate: 1, changePercent: null })
      return
    }
    setConvertLoading(true)
    setError(null)
    try {
      const fromIsCrypto = isCrypto(fromCode)
      const toIsCrypto = isCrypto(toCode)
      const parsedAmt = parseFloat(amt)

      if (!fromIsCrypto && !toIsCrypto) {
        // Fiat -> Fiat: use frankfurter (existing logic)
        const yesterday = getYesterdayStr()
        const [latestRes, yesterdayRes] = await Promise.all([
          fetch(`${API_BASE}/latest?amount=${parsedAmt}&from=${fromCode}&to=${toCode}`),
          fetch(`${API_BASE}/${yesterday}?from=${fromCode}&to=${toCode}`),
        ])
        const latestData = await latestRes.json()
        const yesterdayData = await yesterdayRes.json()

        const converted = latestData.rates?.[toCode]
        const rate = converted / parsedAmt
        const yesterdayRate = yesterdayData.rates?.[toCode] ?? null
        const changePercent = yesterdayRate !== null ? ((rate - yesterdayRate) / yesterdayRate) * 100 : null

        if (converted !== undefined) {
          setResult({ converted, rate, changePercent })
        } else {
          throw new Error('No rate returned')
        }
      } else if (fromIsCrypto && !toIsCrypto) {
        // Crypto -> Fiat: get crypto price in fiat currency
        const cryptoId = getCryptoId(fromCode)!
        const fiatLower = toCode.toLowerCase()
        const data = await fetchCryptoRates([cryptoId], [fiatLower])
        const price = data[cryptoId]?.[fiatLower]
        const change24h = data[cryptoId]?.[`${fiatLower}_24h_change`] ?? null
        if (price === undefined) throw new Error('No rate returned')
        const rate = price
        const converted = parsedAmt * rate
        setResult({ converted, rate, changePercent: change24h })
      } else if (!fromIsCrypto && toIsCrypto) {
        // Fiat -> Crypto: inverse of crypto price in fiat
        const cryptoId = getCryptoId(toCode)!
        const fiatLower = fromCode.toLowerCase()
        const data = await fetchCryptoRates([cryptoId], [fiatLower])
        const cryptoPrice = data[cryptoId]?.[fiatLower]
        const change24h = data[cryptoId]?.[`${fiatLower}_24h_change`] ?? null
        if (cryptoPrice === undefined) throw new Error('No rate returned')
        const rate = 1 / cryptoPrice
        const converted = parsedAmt * rate
        // Invert the change direction since we're going fiat->crypto
        const changePercent = change24h !== null ? -change24h : null
        setResult({ converted, rate, changePercent })
      } else {
        // Crypto -> Crypto: intermediate USD conversion
        const fromId = getCryptoId(fromCode)!
        const toId = getCryptoId(toCode)!
        const data = await fetchCryptoRates([fromId, toId], ['usd'])
        const fromPrice = data[fromId]?.usd
        const toPrice = data[toId]?.usd
        const fromChange = data[fromId]?.usd_24h_change ?? null
        const toChange = data[toId]?.usd_24h_change ?? null
        if (fromPrice === undefined || toPrice === undefined) throw new Error('No rate returned')
        const rate = fromPrice / toPrice
        const converted = parsedAmt * rate
        // Approximate change: difference between the two 24h changes
        const changePercent = fromChange !== null && toChange !== null ? fromChange - toChange : null
        setResult({ converted, rate, changePercent })
      }
    } catch {
      setError('Failed to fetch exchange rate. Please try again.')
    } finally {
      setConvertLoading(false)
    }
  }, [])

  // Fetch chart data — handles fiat and crypto pairs
  const fetchChart = useCallback(async (fromCode: string, toCode: string, p: Period) => {
    if (fromCode === toCode) {
      setChartData([])
      return
    }
    setChartLoading(true)
    try {
      const fromIsCrypto = isCrypto(fromCode)
      const toIsCrypto = isCrypto(toCode)

      if (!fromIsCrypto && !toIsCrypto) {
        // Fiat -> Fiat: use frankfurter (existing logic)
        const { start, end } = getDateRange(p)
        const res = await fetch(`${API_BASE}/${start}..${end}?from=${fromCode}&to=${toCode}`)
        const data = await res.json()
        if (data.rates) {
          const entries = Object.entries(data.rates)
            .map(([date, rates]) => ({
              date,
              rate: (rates as Record<string, number>)[toCode],
            }))
            .filter((d) => d.rate !== undefined)
            .sort((a, b) => a.date.localeCompare(b.date))
          setChartData(entries)
        }
      } else if (fromIsCrypto && !toIsCrypto) {
        // Crypto -> Fiat: CoinGecko history
        const cryptoId = getCryptoId(fromCode)!
        const days = periodToDays(p)
        const history = await fetchCryptoHistory(cryptoId, toCode.toLowerCase(), days)
        const entries = history.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toISOString().slice(0, 10),
          rate: price,
        }))
        // Deduplicate by date (CoinGecko returns multiple points per day for short periods)
        const deduped = new Map<string, { date: string; rate: number }>()
        for (const entry of entries) {
          deduped.set(entry.date, entry)
        }
        setChartData(Array.from(deduped.values()).sort((a, b) => a.date.localeCompare(b.date)))
      } else if (!fromIsCrypto && toIsCrypto) {
        // Fiat -> Crypto: inverse of crypto price in fiat
        const cryptoId = getCryptoId(toCode)!
        const days = periodToDays(p)
        const history = await fetchCryptoHistory(cryptoId, fromCode.toLowerCase(), days)
        const entries = history.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toISOString().slice(0, 10),
          rate: price > 0 ? 1 / price : 0,
        }))
        const deduped = new Map<string, { date: string; rate: number }>()
        for (const entry of entries) {
          deduped.set(entry.date, entry)
        }
        setChartData(Array.from(deduped.values()).sort((a, b) => a.date.localeCompare(b.date)))
      } else {
        // Crypto -> Crypto: get both in USD and compute ratio
        const fromId = getCryptoId(fromCode)!
        const toId = getCryptoId(toCode)!
        const days = periodToDays(p)
        const [fromHistory, toHistory] = await Promise.all([
          fetchCryptoHistory(fromId, 'usd', days),
          fetchCryptoHistory(toId, 'usd', days),
        ])
        // Build a map of toCode prices by date for lookup
        const toPriceMap = new Map<string, number>()
        for (const [timestamp, price] of toHistory.prices) {
          const date = new Date(timestamp).toISOString().slice(0, 10)
          toPriceMap.set(date, price)
        }
        const entries: { date: string; rate: number }[] = []
        const seen = new Set<string>()
        for (const [timestamp, fromPrice] of fromHistory.prices) {
          const date = new Date(timestamp).toISOString().slice(0, 10)
          if (seen.has(date)) continue
          seen.add(date)
          const toPrice = toPriceMap.get(date)
          if (toPrice && toPrice > 0) {
            entries.push({ date, rate: fromPrice / toPrice })
          }
        }
        setChartData(entries.sort((a, b) => a.date.localeCompare(b.date)))
      }
    } catch {
      setChartData([])
    } finally {
      setChartLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (!initialized.current && Object.keys(currencies).length > 0) {
      initialized.current = true
      doConvert(amount, from, to)
      fetchChart(from, to, period)
    }
  }, [currencies, amount, from, to, period, doConvert, fetchChart])

  // Re-fetch chart when period changes
  const handlePeriodChange = useCallback(
    (p: Period) => {
      setPeriod(p)
      fetchChart(from, to, p)
    },
    [from, to, fetchChart]
  )

  const handleConvert = useCallback(() => {
    doConvert(amount, from, to)
    fetchChart(from, to, period)
  }, [amount, from, to, period, doConvert, fetchChart])

  const handleSwap = useCallback(() => {
    setFrom(to)
    setTo(from)
    doConvert(amount, to, from)
    fetchChart(to, from, period)
  }, [amount, from, to, period, doConvert, fetchChart])

  const handleFromChange = useCallback(
    (code: string) => {
      setFrom(code)
      doConvert(amount, code, to)
      fetchChart(code, to, period)
    },
    [amount, to, period, doConvert, fetchChart]
  )

  const handleToChange = useCallback(
    (code: string) => {
      setTo(code)
      doConvert(amount, from, code)
      fetchChart(from, code, period)
    },
    [amount, from, period, doConvert, fetchChart]
  )

  const handlePairClick = useCallback(
    (pairFrom: string, pairTo: string) => {
      setFrom(pairFrom)
      setTo(pairTo)
      doConvert(amount, pairFrom, pairTo)
      fetchChart(pairFrom, pairTo, period)
    },
    [amount, period, doConvert, fetchChart]
  )

  const renderPanel = useCallback(
    (id: PanelId): ReactNode => {
      switch (id) {
        case 'rate-chart':
          return (
            <RateChart
              data={chartData}
              from={from}
              to={to}
              period={period}
              onPeriodChange={handlePeriodChange}
              loading={chartLoading}
            />
          )
        case 'stats-row':
          return <StatsRow data={chartData} to={to} loading={chartLoading} />
        case 'currency-pairs':
          return (
            <CurrencyPairs
              pairs={topPairs}
              loading={pairsLoading}
              onPairClick={handlePairClick}
            />
          )
        case 'external-links':
          return <ExternalLinks from={from} to={to} amount={amount} />
      }
    },
    [chartData, from, to, period, handlePeriodChange, chartLoading, topPairs, pairsLoading, handlePairClick, amount]
  )

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 dark:text-white font-medium">Currency Exchange</li>
        </ol>
      </nav>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Converter Bar */}
      <div className="mb-8 relative z-20">
        <ConverterBar
          amount={amount}
          from={from}
          to={to}
          currencies={currencies}
          result={result}
          loading={convertLoading}
          onAmountChange={setAmount}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
          onSwap={handleSwap}
          onConvert={handleConvert}
        />
      </div>

      {/* Main content: Draggable panel grid */}
      <PanelGrid
        panels={panels}
        onReorder={reorderPanels}
        onColSpanChange={setColSpan}
        onReset={resetLayout}
        isDefault={isDefault}
        isDragEnabled={isDesktop}
        renderPanel={renderPanel}
      />
    </main>
  )
}
