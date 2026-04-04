import type { RawPromotion } from './secret-flying'

/**
 * Scrape Jetstar deals page for current sales.
 * URL: https://www.jetstar.com/au/en/deals
 */
export async function scrapeJetstar(): Promise<RawPromotion[]> {
  try {
    const res = await fetch('https://www.jetstar.com/au/en/deals', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Toolk1t/1.0)',
        'Accept': 'text/html',
      },
    })
    if (!res.ok) return []

    const html = await res.text()
    const promos: RawPromotion[] = []

    // Look for deal cards — Jetstar uses structured sale blocks
    // Extract sale titles and links using regex patterns
    const saleRegex = /<a[^>]*href="(\/au\/en\/deals[^"]*)"[^>]*>[\s\S]*?<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi
    let match
    while ((match = saleRegex.exec(html)) !== null) {
      const url = `https://www.jetstar.com${match[1]}`
      const title = match[2].replace(/<[^>]*>/g, '').trim()
      if (title && title.length > 5 && title.length < 200) {
        promos.push({
          source: 'jetstar',
          airline: 'Jetstar',
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

    // Deduplicate by title
    const seen = new Set<string>()
    return promos.filter(p => {
      if (seen.has(p.title)) return false
      seen.add(p.title)
      return true
    }).slice(0, 10)
  } catch (err) {
    console.error('[promo-scraper] Jetstar error:', err)
    return []
  }
}
