/**
 * Scrape I Know The Pilot RSS feed for Australian flight deals.
 * This is the most reliable free source for AU departure deals.
 * RSS URL: https://iknowthepilot.com.au/feed/
 */

export interface RawPromotion {
  source: string
  airline: string | null
  title: string
  description: string | null
  origin: string | null
  destination: string | null
  deal_url: string
  sale_starts: string | null
  sale_ends: string | null
  image_url: string | null
  price: number | null
}

export async function scrapeIKnowThePilot(): Promise<RawPromotion[]> {
  try {
    const res = await fetch('https://iknowthepilot.com.au/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Toolk1t/1.0)' },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: RawPromotion[] = []

    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1]
      const title = block.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const desc = block.match(/<description>(.*?)<\/description>/)?.[1] || null
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || null
      const expired = block.match(/<Expired>(.*?)<\/Expired>/)?.[1]
      const imageUrl = block.match(/<imageURL>(.*?)<\/imageURL>/)?.[1] || null
      const fromPrice = block.match(/<FromPrice>(.*?)<\/FromPrice>/)?.[1]

      if (expired === 'True') continue

      const categories: string[] = []
      const catRegex = /<category>(.*?)<\/category>/g
      let catMatch
      while ((catMatch = catRegex.exec(block)) !== null) {
        categories.push(catMatch[1])
      }

      const originCities = categories
        .filter(c => !c.startsWith('Flights '))
        .map(c => CITY_TO_IATA[c])
        .filter(Boolean)

      if (title && link) {
        items.push({
          source: 'iknowthepilot',
          airline: null,
          title: decodeHtmlEntities(title),
          description: desc ? decodeHtmlEntities(desc).slice(0, 300) : null,
          origin: originCities[0] || null,
          destination: null,
          deal_url: link,
          sale_starts: pubDate ? new Date(pubDate).toISOString() : null,
          sale_ends: null,
          image_url: imageUrl,
          price: fromPrice ? parseInt(fromPrice, 10) : null,
        })
      }
    }

    return items.slice(0, 20)
  } catch (err) {
    console.error('[promo-scraper] I Know The Pilot error:', err)
    return []
  }
}

const CITY_TO_IATA: Record<string, string> = {
  'Sydney': 'SYD', 'Melbourne': 'MEL', 'Brisbane': 'BNE',
  'Perth': 'PER', 'Adelaide': 'ADL', 'Cairns': 'CNS',
  'Darwin': 'DRW', 'Canberra': 'CBR', 'Hobart': 'HBA', 'Gold Coast': 'OOL',
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim()
}
