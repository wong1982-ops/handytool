import { createClient as createServiceClient } from '@supabase/supabase-js'
import { scrapeIKnowThePilot } from './promotion-scrapers/secret-flying'
import { scrapeJetstar } from './promotion-scrapers/jetstar'
import { scrapeScoot } from './promotion-scrapers/scoot'
import type { RawPromotion } from './promotion-scrapers/secret-flying'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getServiceClient() {
  return createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

export interface PromotionScrapeResult {
  sourcesScraped: number
  promotionsFound: number
  promotionsStored: number
  errors: string[]
}

const SCRAPERS: { name: string; fn: () => Promise<RawPromotion[]> }[] = [
  { name: 'iknowthepilot', fn: scrapeIKnowThePilot },
  { name: 'jetstar', fn: scrapeJetstar },
  { name: 'scoot', fn: scrapeScoot },
]

export async function scrapePromotions(): Promise<PromotionScrapeResult> {
  const supabase = getServiceClient()
  const now = new Date().toISOString()
  const result: PromotionScrapeResult = { sourcesScraped: 0, promotionsFound: 0, promotionsStored: 0, errors: [] }

  // Expire old promotions (>7 days)
  await supabase
    .from('flight_promotions')
    .update({ active: false })
    .lt('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  for (const scraper of SCRAPERS) {
    try {
      const promos = await scraper.fn()
      result.sourcesScraped++
      result.promotionsFound += promos.length

      for (const promo of promos) {
        const { error } = await supabase.from('flight_promotions').upsert(
          {
            source: promo.source,
            airline: promo.airline,
            title: promo.title,
            description: promo.description,
            origin: promo.origin,
            destination: promo.destination,
            deal_url: promo.deal_url,
            sale_starts: promo.sale_starts,
            sale_ends: promo.sale_ends,
            scraped_at: now,
            active: true,
          },
          { onConflict: 'source,title' },
        )
        if (error) {
          result.errors.push(`${scraper.name}: ${error.message}`)
        } else {
          result.promotionsStored++
        }
      }
    } catch (err) {
      result.errors.push(`${scraper.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return result
}
