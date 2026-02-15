import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { lookupIp } from '@/lib/geo/ip-lookup'
import { resolve4, resolve6 } from 'dns/promises'

const QuerySchema = z.object({
  ip: z.string().ip().optional(),
  domain: z.string().min(1).max(253).optional(),
}).refine(
  (data) => data.ip || data.domain,
  { message: 'Either ip or domain is required' },
)

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = QuerySchema.safeParse(params)

    if (!parsed.success) {
      return API_ERRORS.VALIDATION(parsed.error.flatten())
    }

    let ip = parsed.data.ip
    let ipv6: string | undefined

    // Resolve domain to IP if needed
    if (!ip && parsed.data.domain) {
      try {
        const [v4Addresses, v6Addresses] = await Promise.all([
          resolve4(parsed.data.domain).catch(() => [] as string[]),
          resolve6(parsed.data.domain).catch(() => [] as string[]),
        ])

        if (v4Addresses.length > 0) {
          ip = v4Addresses[0]
        } else if (v6Addresses.length > 0) {
          ip = v6Addresses[0]
        } else {
          return API_ERRORS.NOT_FOUND('Domain could not be resolved')
        }

        // Include IPv6 as secondary when primary is IPv4
        if (v4Addresses.length > 0 && v6Addresses.length > 0) {
          ipv6 = v6Addresses[0]
        }
      } catch {
        return API_ERRORS.VALIDATION({ message: `Could not resolve domain: ${parsed.data.domain}` })
      }
    }

    if (!ip) {
      return API_ERRORS.VALIDATION({ message: 'No IP address available' })
    }

    const geo = await lookupIp(ip)

    return apiSuccess({
      ip: geo.ip,
      ipVersion: geo.ipVersion,
      ...(ipv6 && { ipv6 }),
      location: {
        city: geo.city,
        state: geo.regionName,
        country: geo.country,
        countryCode: geo.countryCode,
        postalCode: geo.zip,
        lat: geo.lat,
        lng: geo.lng,
      },
      network: {
        isp: geo.isp,
        org: geo.org,
        asn: geo.asn,
        proxy: geo.proxy,
        hosting: geo.hosting,
      },
      timezone: geo.timezone,
    })
  } catch (error) {
    console.error('IP check failed:', error)
    return API_ERRORS.INTERNAL()
  }
}
