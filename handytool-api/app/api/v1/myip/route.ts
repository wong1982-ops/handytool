import { type NextRequest } from 'next/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { lookupIp, getClientIp } from '@/lib/geo/ip-lookup'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const geo = await lookupIp(clientIp)

    return apiSuccess({
      ip: geo.ip,
      ipVersion: geo.ipVersion,
      isp: geo.isp,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      region: geo.region,
      coordinates: { lat: geo.lat, lng: geo.lng },
      proxy: geo.proxy,
      hosting: geo.hosting,
      timezone: geo.timezone,
      org: geo.org,
      asn: geo.asn,
    })
  } catch (error) {
    console.error('My IP lookup failed:', error)
    return API_ERRORS.INTERNAL()
  }
}
