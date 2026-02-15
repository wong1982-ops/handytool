/**
 * IP geolocation lookup using ip-api.com (free, no API key required).
 * Server-side only (HTTP endpoint, fine for server-to-server).
 */

const IP_API_FIELDS = [
  'status', 'message',
  'query', 'country', 'countryCode', 'region', 'regionName',
  'city', 'zip', 'lat', 'lon', 'timezone', 'isp', 'org', 'as',
  'proxy', 'hosting',
].join(',')

interface IpApiResponse {
  status: 'success' | 'fail'
  message?: string
  query: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  proxy: boolean
  hosting: boolean
}

export type IpVersion = 'ipv4' | 'ipv6'

export function detectIpVersion(ip: string): IpVersion {
  return ip.includes(':') ? 'ipv6' : 'ipv4'
}

export interface GeoResult {
  ip: string
  ipVersion: IpVersion
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lng: number
  timezone: string
  isp: string
  org: string
  asn: string
  proxy: boolean
  hosting: boolean
}

/**
 * Check if an IP is private/reserved (not routable on the public internet).
 */
function isPrivateIp(ip: string): boolean {
  return /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|^fc|^fd|^fe80|^0\.0\.0\.0$|^localhost$)/i.test(ip)
}

/**
 * Look up geolocation for an IP. Pass undefined/null to auto-detect the server's public IP.
 */
export async function lookupIp(ip?: string | null): Promise<GeoResult> {
  const target = ip && !isPrivateIp(ip) ? encodeURIComponent(ip) : ''
  const url = `http://ip-api.com/json/${target}?fields=${IP_API_FIELDS}`
  const res = await fetch(url, { next: { revalidate: 60 } })

  if (!res.ok) {
    throw new Error(`ip-api.com returned ${res.status}`)
  }

  const data: IpApiResponse = await res.json()

  if (data.status === 'fail') {
    throw new Error(data.message || 'IP lookup failed')
  }

  return {
    ip: data.query,
    ipVersion: detectIpVersion(data.query),
    country: data.country,
    countryCode: data.countryCode,
    region: data.region,
    regionName: data.regionName,
    city: data.city,
    zip: data.zip,
    lat: data.lat,
    lng: data.lon,
    timezone: data.timezone,
    isp: data.isp,
    org: data.org,
    asn: data.as,
    proxy: data.proxy,
    hosting: data.hosting,
  }
}

/** Extract client IP from request headers. */
export function getClientIp(request: Request): string | null {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return (
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    null
  )
}
