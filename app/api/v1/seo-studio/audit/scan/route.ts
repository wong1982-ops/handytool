import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { tools } from '@/lib/tools'
import type { AuditIssue, ToolAuditResult } from '@/tools/seo-studio/types'

export const maxDuration = 120

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function checkAdminEmail(userId: string): boolean {
  // In dev mode with no ADMIN_EMAILS configured, allow all authenticated users
  if ((process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) && ADMIN_EMAILS.length === 0) {
    return true
  }
  // Server-side we only have userId, not email — skip strict email check in dev
  if (process.env.NODE_ENV === 'development') return true
  return false
}

function auditHtml(html: string): AuditIssue[] {
  const issues: AuditIssue[] = []

  // Check <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!titleMatch) {
    issues.push({ type: 'critical', message: 'Missing <title> tag' })
  } else {
    const titleLen = titleMatch[1].trim().length
    if (titleLen < 30) {
      issues.push({
        type: 'warning',
        message: `Title too short (${titleLen} chars)`,
        current: titleMatch[1].trim(),
        recommended: '50-60 characters',
      })
    } else if (titleLen > 70) {
      issues.push({
        type: 'warning',
        message: `Title too long (${titleLen} chars)`,
        current: titleMatch[1].trim(),
        recommended: '50-60 characters',
      })
    }
  }

  // Check meta description
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
  if (!metaDescMatch) {
    issues.push({ type: 'critical', message: 'Missing meta description' })
  } else {
    const descLen = metaDescMatch[1].trim().length
    if (descLen < 120) {
      issues.push({
        type: 'warning',
        message: `Meta description too short (${descLen} chars)`,
        current: metaDescMatch[1].trim().slice(0, 80) + '...',
        recommended: '150-160 characters',
      })
    } else if (descLen > 170) {
      issues.push({
        type: 'warning',
        message: `Meta description too long (${descLen} chars)`,
        recommended: '150-160 characters',
      })
    }
  }

  // Check H1
  const h1Matches = html.match(/<h1[\s>]/gi)
  if (!h1Matches) {
    issues.push({ type: 'critical', message: 'Missing <h1> tag' })
  } else if (h1Matches.length > 1) {
    issues.push({
      type: 'warning',
      message: `Multiple <h1> tags found (${h1Matches.length})`,
      recommended: 'Exactly one <h1> per page',
    })
  }

  // Check JSON-LD
  const hasJsonLd = /<script\s+type=["']application\/ld\+json["']/i.test(html)
  if (!hasJsonLd) {
    issues.push({ type: 'warning', message: 'Missing JSON-LD structured data' })
  }

  // Check OpenGraph
  const ogTags = ['og:title', 'og:description', 'og:image']
  for (const tag of ogTags) {
    const hasTag = new RegExp(`<meta\\s+property=["']${tag}["']`, 'i').test(html)
    if (!hasTag) {
      issues.push({ type: 'info', message: `Missing OpenGraph tag: ${tag}` })
    }
  }

  // Check canonical
  const hasCanonical = /<link\s+[^>]*rel=["']canonical["']/i.test(html)
  if (!hasCanonical) {
    issues.push({ type: 'info', message: 'Missing canonical link tag' })
  }

  return issues
}

function calculateScore(issues: AuditIssue[]): number {
  let score = 100
  for (const issue of issues) {
    if (issue.type === 'critical') score -= 20
    else if (issue.type === 'warning') score -= 10
    else if (issue.type === 'info') score -= 3
  }
  return Math.max(0, score)
}

export async function POST() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Admin check (permissive in dev)
  if (!checkAdminEmail(userId) && ADMIN_EMAILS.length > 0) {
    return API_ERRORS.FORBIDDEN()
  }

  // Get tool slugs from the tools array
  const toolSlugs = tools.map(t => ({
    slug: t.href.replace('/tools/', ''),
    name: t.name,
  }))

  const results: ToolAuditResult[] = []

  for (const tool of toolSlugs) {
    try {
      const res = await fetch(`${SITE_URL}/tools/${tool.slug}`, {
        headers: { 'User-Agent': 'Toolk1t-SEO-Auditor/1.0' },
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) {
        results.push({
          slug: tool.slug,
          name: tool.name,
          score: 0,
          issues: [{ type: 'critical', message: `Page returned HTTP ${res.status}` }],
        })
        continue
      }

      const html = await res.text()
      const issues = auditHtml(html)
      const score = calculateScore(issues)

      results.push({ slug: tool.slug, name: tool.name, score, issues })
    } catch (err) {
      results.push({
        slug: tool.slug,
        name: tool.name,
        score: 0,
        issues: [{ type: 'critical', message: `Failed to fetch: ${err instanceof Error ? err.message : 'unknown error'}` }],
      })
    }
  }

  const overallScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0

  return apiSuccess({
    scannedAt: new Date().toISOString(),
    overallScore,
    tools: results,
  })
}
