import type { RawPromotion } from './secret-flying'

/**
 * Scrape Scoot promotions page.
 * URL: https://www.flyscoot.com/en/promotions
 */
export async function scrapeScoot(): Promise<RawPromotion[]> {
  try {
    const res = await fetch('https://www.flyscoot.com/en/promotions', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Toolk1t/1.0)',
        'Accept': 'text/html',
      },
    })
    if (!res.ok) return []

    const html = await res.text()
    const promos: RawPromotion[] = []

    // Extract promotion blocks
    const promoRegex = /<a[^>]*href="([^"]*promotions[^"]*)"[^>]*>[\s\S]*?<(?:h[2-4]|span|div)[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/(?:h[2-4]|span|div)>/gi
    let match
    while ((match = promoRegex.exec(html)) !== null) {
      const url = match[1].startsWith('http') ? match[1] : `https://www.flyscoot.com${match[1]}`
      const title = match[2].replace(/<[^>]*>/g, '').trim()
      if (title && title.length > 5 && title.length < 200) {
        promos.push({
          source: 'scoot',
          airline: 'Scoot',
          title,
          description: null,
          origin: null,
          destination: null,
          deal_url: url,
          sale_starts: null,
          sale_ends: null,
          image_url: null,
          price: null,
        })
      }
    }

    // If regex didn't match (page structure changed), try a simpler approach
    if (promos.length === 0) {
      // Just link to the promotions page as a single entry
      promos.push({
        source: 'scoot',
        airline: 'Scoot',
        title: 'Scoot Promotions — Check Latest Deals',
        description: 'View current Scoot flight promotions and sales',
        origin: null,
        destination: null,
        deal_url: 'https://www.flyscoot.com/en/promotions',
        sale_starts: null,
        sale_ends: null,
        image_url: null,
        price: null,
      })
    }

    const seen = new Set<string>()
    return promos.filter(p => {
      if (seen.has(p.title)) return false
      seen.add(p.title)
      return true
    }).slice(0, 10)
  } catch (err) {
    console.error('[promo-scraper] Scoot error:', err)
    return []
  }
}
