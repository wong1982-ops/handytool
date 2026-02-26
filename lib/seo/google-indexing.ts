const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'

export async function pingSitemap(): Promise<boolean> {
  try {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    const res = await fetch(pingUrl)
    return res.ok
  } catch {
    return false
  }
}

export async function submitUrl(url: string): Promise<boolean> {
  const keyJson = process.env.GOOGLE_INDEXING_KEY
  if (!keyJson) {
    console.log('[google-indexing] No GOOGLE_INDEXING_KEY set, skipping URL submission')
    return false
  }

  try {
    // For full Google Indexing API integration, use the googleapis package.
    // This is a placeholder that logs the intent — configure GOOGLE_INDEXING_KEY
    // with a service account JSON to enable actual submissions.
    console.log(`[google-indexing] Would submit URL: ${url}`)
    return false
  } catch (error) {
    console.error('[google-indexing] Error submitting URL:', error)
    return false
  }
}
