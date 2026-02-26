const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

// Top 10 cryptos with their CoinGecko IDs
export const CRYPTO_CURRENCIES: Record<string, { name: string; symbol: string; flag: string }> = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', flag: '\u20BF' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', flag: '\u039E' },
  tether: { name: 'Tether', symbol: 'USDT', flag: '\u20AE' },
  binancecoin: { name: 'BNB', symbol: 'BNB', flag: '\u25C6' },
  ripple: { name: 'XRP', symbol: 'XRP', flag: '\u2715' },
  'usd-coin': { name: 'USD Coin', symbol: 'USDC', flag: '$' },
  solana: { name: 'Solana', symbol: 'SOL', flag: '\u25CE' },
  cardano: { name: 'Cardano', symbol: 'ADA', flag: '\u20B3' },
  dogecoin: { name: 'Dogecoin', symbol: 'DOGE', flag: '\u00D0' },
  polkadot: { name: 'Polkadot', symbol: 'DOT', flag: '\u25CF' },
}

// Build a lookup from symbol to entry for quick access
const SYMBOL_TO_ENTRY = Object.entries(CRYPTO_CURRENCIES).reduce(
  (acc, [id, info]) => {
    acc[info.symbol] = { id, ...info }
    return acc
  },
  {} as Record<string, { id: string; name: string; symbol: string; flag: string }>
)

// Helper to check if a currency code is crypto
export function isCrypto(code: string): boolean {
  return code in SYMBOL_TO_ENTRY
}

// Get CoinGecko ID from symbol
export function getCryptoId(symbol: string): string | undefined {
  return SYMBOL_TO_ENTRY[symbol]?.id
}

// Get crypto display info from symbol
export function getCryptoInfo(symbol: string): { name: string; flag: string } | undefined {
  const entry = SYMBOL_TO_ENTRY[symbol]
  return entry ? { name: entry.name, flag: entry.flag } : undefined
}

// Build currencies record for crypto (symbol -> name) for merging into dropdown
export function getCryptoCurrencies(): Record<string, string> {
  const result: Record<string, string> = {}
  for (const info of Object.values(CRYPTO_CURRENCIES)) {
    result[info.symbol] = info.name
  }
  return result
}

// Simple in-memory cache to respect CoinGecko rate limits
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30_000 // 30 seconds

async function cachedFetch<T>(url: string): Promise<T> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`)
  const data = await res.json()
  cache.set(url, { data, timestamp: Date.now() })
  return data as T
}

// Fetch current prices for crypto currencies
export async function fetchCryptoRates(
  ids: string[],
  vsCurrencies: string[] = ['usd']
): Promise<Record<string, Record<string, number>>> {
  const url = `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=${vsCurrencies.join(',')}&include_24hr_change=true`
  return cachedFetch(url)
}

// Fetch historical price data for charts
export async function fetchCryptoHistory(
  id: string,
  vsCurrency: string,
  days: number
): Promise<{ prices: [number, number][] }> {
  const url = `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`
  return cachedFetch(url)
}
