// ─── Healthy Homes Climate Zones ──────────────────────────────────────────────

import type { HeatingCalcResult } from './types'

// ─── City → Zone Mapping ─────────────────────────────────────────────────────

export const CITY_ZONES: Array<{ city: string; zone: 1 | 2 | 3 }> = [
  { city: 'Auckland', zone: 1 },
  { city: 'Hamilton', zone: 2 },
  { city: 'Tauranga', zone: 1 },
  { city: 'Rotorua', zone: 2 },
  { city: 'Gisborne', zone: 2 },
  { city: 'Napier', zone: 2 },
  { city: 'Hastings', zone: 2 },
  { city: 'New Plymouth', zone: 2 },
  { city: 'Whanganui', zone: 2 },
  { city: 'Palmerston North', zone: 2 },
  { city: 'Levin', zone: 2 },
  { city: 'Wellington', zone: 2 },
  { city: 'Lower Hutt', zone: 2 },
  { city: 'Upper Hutt', zone: 2 },
  { city: 'Porirua', zone: 2 },
  { city: 'Nelson', zone: 2 },
  { city: 'Blenheim', zone: 2 },
  { city: 'Westport', zone: 3 },
  { city: 'Greymouth', zone: 3 },
  { city: 'Christchurch', zone: 3 },
  { city: 'Timaru', zone: 3 },
  { city: 'Ashburton', zone: 3 },
  { city: 'Oamaru', zone: 3 },
  { city: 'Dunedin', zone: 3 },
  { city: 'Invercargill', zone: 3 },
  { city: 'Queenstown', zone: 3 },
  { city: 'Whangarei', zone: 1 },
]

// ─── Zone kW Multiplier ───────────────────────────────────────────────────────

export const ZONE_KW_MULTIPLIER: Record<1 | 2 | 3, number> = {
  1: 0.09,
  2: 0.11,
  3: 0.13,
}

// ─── Heating Calculator ───────────────────────────────────────────────────────

export function calculateHeatingKw(
  length: number,
  width: number,
  height: number,
  zone: 1 | 2 | 3,
): HeatingCalcResult {
  const area = length * width
  const volume = area * height
  const multiplier = ZONE_KW_MULTIPLIER[zone]
  const requiredKw = Math.round(volume * multiplier * 10) / 10

  return {
    requiredKw,
    zone,
    area: Math.round(area * 100) / 100,
    volume: Math.round(volume * 100) / 100,
  }
}
