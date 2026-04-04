# SEO Studio Phase 2 — Audit & Landing Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin-only Audit and Landing Pages tabs for SEO Studio, replacing the current "Coming Soon" placeholders.

**Architecture:** Admin gate checks user email against `NEXT_PUBLIC_ADMIN_EMAILS` env var. Audit tab fetches tool page HTML server-side and parses for SEO issues. Landing Pages tab generates content via Gemini and stores in `seo_landing_pages` table, rendered via existing `/use-cases/[slug]` and `/free/[slug]` routes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Gemini 2.5 Flash, Supabase, ToolFrame.

**Spec:** `docs/superpowers/specs/2026-04-04-seo-studio-design.md` (sections 3-4)

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/seo-studio/audit-dashboard.tsx` | Audit scan UI with results dashboard |
| `tools/seo-studio/page-generator.tsx` | Landing page generator + list UI |
| `app/api/v1/seo-studio/audit/scan/route.ts` | Audit scan API (fetches + parses tool pages) |
| `app/api/v1/seo-studio/audit/latest/route.ts` | Get latest audit results |
| `app/api/v1/seo-studio/pages/generate/route.ts` | Generate landing page content via Gemini |
| `app/api/v1/seo-studio/pages/list/route.ts` | List saved landing pages |
| `supabase/migrations/037_seo_audit_and_pages.sql` | Database tables for audit results + landing pages |

### Modified Files
| File | Changes |
|---|---|
| `tools/seo-studio/types.ts` | Add AuditIssue, ToolAuditResult, AuditResult, LandingPage, LandingPageContent types |
| `tools/seo-studio/admin-gate.tsx` | Replace "Coming Soon" with actual admin email check |
| `lib/seo-studio/gemini.ts` | Add `generateLandingPage()` function |
| `app/tools/seo-studio/audit/page.tsx` | Render AuditDashboard inside AdminGate |
| `app/tools/seo-studio/pages/page.tsx` | Render PageGenerator inside AdminGate |

---

## Task 1: Types, Admin Gate, Database

**Files:**
- Modify: `tools/seo-studio/types.ts`
- Modify: `tools/seo-studio/admin-gate.tsx`
- Create: `supabase/migrations/037_seo_audit_and_pages.sql`

- [ ] **Step 1: Add types to types.ts**

Append to the end of `tools/seo-studio/types.ts`:

```typescript
// Audit types
export interface AuditIssue {
  type: 'critical' | 'warning' | 'info'
  message: string
  current?: string
  recommended?: string
}

export interface ToolAuditResult {
  slug: string
  name: string
  score: number
  issues: AuditIssue[]
}

export interface AuditResult {
  id?: string
  scannedAt: string
  overallScore: number
  tools: ToolAuditResult[]
}

// Landing page types
export interface LandingPage {
  id: string
  toolSlug: string
  keyword: string
  pageType: 'use-case' | 'free-tool'
  slug: string
  title: string
  metaDescription: string
  content: LandingPageContent
  structuredData: Record<string, unknown>
  status: 'draft' | 'live'
  createdAt: string
  updatedAt: string
}

export interface LandingPageContent {
  heroHeadline: string
  heroSubheadline: string
  benefits: { title: string; description: string }[]
  faq: { question: string; answer: string }[]
  ctaText: string
  ctaHref: string
}
```

- [ ] **Step 2: Update admin-gate.tsx**

Replace the entire file with an actual admin check:

```typescript
'use client'

import { useAuth } from '@/lib/hooks/use-auth'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)

interface AdminGateProps {
  children: React.ReactNode
}

export default function AdminGate({ children }: AdminGateProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  // In dev, allow all authenticated users if no admin emails configured
  const isDev = process.env.NODE_ENV === 'development'
  const isAdmin = user && (ADMIN_EMAILS.length === 0 && isDev || ADMIN_EMAILS.includes(user.email || ''))

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-300">Admin Access Required</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in with an admin account to access this feature.</p>
      </div>
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 3: Create migration**

```sql
-- supabase/migrations/037_seo_audit_and_pages.sql

CREATE TABLE IF NOT EXISTS public.seo_audit_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  overall_score INT NOT NULL,
  results JSONB NOT NULL
);

GRANT ALL ON seo_audit_results TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.seo_landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  keyword TEXT NOT NULL,
  page_type TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  content JSONB NOT NULL,
  structured_data JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_landing_pages_slug ON seo_landing_pages (slug);
GRANT ALL ON seo_landing_pages TO authenticated, service_role;
```

Apply via Supabase MCP.

- [ ] **Step 4: Commit**

```bash
git add tools/seo-studio/types.ts tools/seo-studio/admin-gate.tsx supabase/migrations/037_seo_audit_and_pages.sql
git commit -m "feat(seo-studio): add audit/pages types, admin gate, database tables"
```

---

## Task 2: Gemini Landing Page Function

**Files:**
- Modify: `lib/seo-studio/gemini.ts`

- [ ] **Step 1: Add generateLandingPage function**

Append to `lib/seo-studio/gemini.ts`:

```typescript
export async function generateLandingPage(params: {
  toolName: string
  toolSlug: string
  keyword: string
  pageType: 'use-case' | 'free-tool'
}): Promise<{
  heroHeadline: string
  heroSubheadline: string
  benefits: { title: string; description: string }[]
  faq: { question: string; answer: string }[]
  ctaText: string
  title: string
  metaDescription: string
  structuredData: Record<string, unknown>
}> {
  const pageContext = params.pageType === 'use-case'
    ? `This is a use-case landing page showing how "${params.toolName}" solves a specific problem.`
    : `This is a free-tool landing page promoting "${params.toolName}" as a free online tool.`

  const prompt = `You are an expert SEO copywriter. Create landing page content targeting the keyword: "${params.keyword}"

Tool: "${params.toolName}" at /tools/${params.toolSlug}
${pageContext}

Return a JSON object with:
1. "title": SEO page title (50-60 chars, includes keyword)
2. "metaDescription": meta description (150-160 chars, includes keyword, compelling)
3. "heroHeadline": bold headline for the hero section (6-10 words, includes keyword)
4. "heroSubheadline": supporting subtitle (15-25 words)
5. "benefits": array of 4 objects, each with "title" (short) and "description" (2-3 sentences)
6. "faq": array of 5 objects, each with "question" and "answer" (target "People also ask" queries for this keyword)
7. "ctaText": call-to-action button text (3-5 words, action-oriented)
8. "structuredData": a FAQPage JSON-LD schema object with the FAQ questions/answers

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in landing page response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/seo-studio/gemini.ts
git commit -m "feat(seo-studio): add landing page generation Gemini function"
```

---

## Task 3: Audit API Routes

**Files:**
- Create: `app/api/v1/seo-studio/audit/scan/route.ts`
- Create: `app/api/v1/seo-studio/audit/latest/route.ts`

- [ ] **Step 1: Create audit scan route**

The scan route fetches each tool page HTML and checks for SEO issues:

```typescript
// app/api/v1/seo-studio/audit/scan/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { tools } from '@/lib/tools'

export const maxDuration = 120

function checkSeoIssues(html: string, toolName: string): { issues: { type: 'critical' | 'warning' | 'info'; message: string; current?: string; recommended?: string }[]; score: number } {
  const issues: { type: 'critical' | 'warning' | 'info'; message: string; current?: string; recommended?: string }[] = []

  // Title check
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  if (!titleMatch) {
    issues.push({ type: 'critical', message: 'Missing <title> tag', recommended: '50-60 characters with primary keyword' })
  } else {
    const title = titleMatch[1].trim()
    if (title.length < 30) issues.push({ type: 'warning', message: 'Title too short', current: `"${title}" (${title.length} chars)`, recommended: '50-60 characters' })
    if (title.length > 70) issues.push({ type: 'warning', message: 'Title too long', current: `"${title.slice(0, 50)}..." (${title.length} chars)`, recommended: '50-60 characters' })
  }

  // Meta description check
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i)
  if (!descMatch) {
    issues.push({ type: 'critical', message: 'Missing meta description', recommended: '150-160 characters with keyword' })
  } else {
    const desc = descMatch[1]
    if (desc.length < 120) issues.push({ type: 'warning', message: 'Meta description too short', current: `${desc.length} chars`, recommended: '150-160 characters' })
    if (desc.length > 170) issues.push({ type: 'warning', message: 'Meta description too long', current: `${desc.length} chars`, recommended: '150-160 characters' })
  }

  // H1 check
  const h1Matches = html.match(/<h1[\s>]/gi)
  if (!h1Matches) {
    issues.push({ type: 'critical', message: 'No <h1> tag found', recommended: 'Exactly one H1 with primary keyword' })
  } else if (h1Matches.length > 1) {
    issues.push({ type: 'warning', message: `Multiple H1 tags (${h1Matches.length})`, recommended: 'Exactly one H1 per page' })
  }

  // JSON-LD check
  const jsonLd = html.includes('application/ld+json')
  if (!jsonLd) {
    issues.push({ type: 'warning', message: 'No JSON-LD structured data', recommended: 'Add SoftwareApplication or WebApplication schema' })
  }

  // OpenGraph check
  const ogTitle = html.includes('property="og:title"') || html.includes("property='og:title'")
  if (!ogTitle) {
    issues.push({ type: 'warning', message: 'Missing OpenGraph tags', recommended: 'Add og:title, og:description, og:image' })
  }

  // Canonical check
  const canonical = html.includes('rel="canonical"') || html.includes("rel='canonical'")
  if (!canonical) {
    issues.push({ type: 'info', message: 'No canonical URL set', recommended: 'Add <link rel="canonical"> to prevent duplicate content' })
  }

  // Image alt check
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt=') || img.includes('alt=""'))
  if (imgsWithoutAlt.length > 0) {
    issues.push({ type: 'info', message: `${imgsWithoutAlt.length} image(s) missing alt text`, recommended: 'Add descriptive alt text to all images' })
  }

  // Score: start at 100, deduct per issue
  let score = 100
  for (const issue of issues) {
    if (issue.type === 'critical') score -= 20
    else if (issue.type === 'warning') score -= 10
    else score -= 3
  }

  return { issues, score: Math.max(0, score) }
}

export async function POST() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const results: { slug: string; name: string; score: number; issues: any[] }[] = []

  for (const tool of tools) {
    const slug = tool.href.replace('/tools/', '')
    try {
      const res = await fetch(`${baseUrl}${tool.href}`, { cache: 'no-store' })
      if (!res.ok) {
        results.push({ slug, name: tool.name, score: 0, issues: [{ type: 'critical', message: `Page returned ${res.status}` }] })
        continue
      }
      const html = await res.text()
      const { issues, score } = checkSeoIssues(html, tool.name)
      results.push({ slug, name: tool.name, score, issues })
    } catch (err) {
      results.push({ slug, name: tool.name, score: 0, issues: [{ type: 'critical', message: 'Failed to fetch page' }] })
    }
  }

  const overallScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
  const auditResult = { scannedAt: new Date().toISOString(), overallScore, tools: results }

  // Save to database
  try {
    const supabase = getAdminSupabase()
    await supabase.from('seo_audit_results').insert({
      scanned_at: auditResult.scannedAt,
      overall_score: overallScore,
      results: auditResult,
    })
  } catch {}

  return apiSuccess(auditResult)
}
```

- [ ] **Step 2: Create audit latest route**

```typescript
// app/api/v1/seo-studio/audit/latest/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  try {
    const supabase = getAdminSupabase()
    const { data } = await supabase
      .from('seo_audit_results')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return apiSuccess(null)
    return apiSuccess(data.results)
  } catch {
    return apiSuccess(null)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/seo-studio/audit/
git commit -m "feat(seo-studio): add audit scan and latest results API routes"
```

---

## Task 4: Landing Pages API Routes

**Files:**
- Create: `app/api/v1/seo-studio/pages/generate/route.ts`
- Create: `app/api/v1/seo-studio/pages/list/route.ts`

- [ ] **Step 1: Create pages generate route**

```typescript
// app/api/v1/seo-studio/pages/generate/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateLandingPage } from '@/lib/seo-studio/gemini'
import { tools } from '@/lib/tools'

export const maxDuration = 60

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch {}
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { toolSlug: string; keyword: string; pageType: 'use-case' | 'free-tool' }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!body.toolSlug || !body.keyword?.trim() || !body.pageType) {
    return apiError('toolSlug, keyword, and pageType are required', 'VALIDATION_ERROR', 400)
  }

  const tool = tools.find(t => t.href === `/tools/${body.toolSlug}`)
  if (!tool) return apiError('Tool not found', 'NOT_FOUND', 404)

  // Deduct 3 credits
  const authSupabase = await createClient()
  const { error: deductError } = await authSupabase.rpc('deduct_credits', {
    p_user_id: userId, p_amount: 3, p_tool_id: 'seo-studio', p_description: `Landing page: "${body.keyword}"`,
  })
  if (deductError) {
    return deductError.message?.includes('insufficient_credits')
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  try {
    const generated = await generateLandingPage({
      toolName: tool.name,
      toolSlug: body.toolSlug,
      keyword: body.keyword.trim(),
      pageType: body.pageType,
    })

    const pageSlug = body.keyword.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
    const prefix = body.pageType === 'use-case' ? '/use-cases/' : '/free/'

    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('seo_landing_pages')
      .insert({
        tool_slug: body.toolSlug,
        keyword: body.keyword.trim(),
        page_type: body.pageType,
        slug: pageSlug,
        title: generated.title,
        meta_description: generated.metaDescription,
        content: {
          heroHeadline: generated.heroHeadline,
          heroSubheadline: generated.heroSubheadline,
          benefits: generated.benefits,
          faq: generated.faq,
          ctaText: generated.ctaText,
          ctaHref: `/tools/${body.toolSlug}`,
        },
        structured_data: generated.structuredData,
        status: 'draft',
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('[seo-studio/pages/generate] Insert error:', error)
      return apiError('Failed to save landing page', 'INTERNAL_ERROR', 500)
    }

    return apiSuccess({ page: { id: data.id, slug: pageSlug, url: `${prefix}${pageSlug}`, ...generated } }, 201)
  } catch (err) {
    console.error('[seo-studio/pages/generate] Generation failed:', err)
    return apiError('Page generation failed', 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 2: Create pages list route**

```typescript
// app/api/v1/seo-studio/pages/list/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('seo_landing_pages')
      .select('id, tool_slug, keyword, page_type, slug, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[seo-studio/pages/list] Error:', error)
      return API_ERRORS.INTERNAL()
    }

    return apiSuccess({ pages: data ?? [] })
  } catch {
    return API_ERRORS.INTERNAL()
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/seo-studio/pages/
git commit -m "feat(seo-studio): add landing page generate and list API routes"
```

---

## Task 5: Audit Dashboard UI

**Files:**
- Create: `tools/seo-studio/audit-dashboard.tsx`
- Modify: `app/tools/seo-studio/audit/page.tsx`

- [ ] **Step 1: Create audit-dashboard.tsx**

`'use client'` default export component.

**State:** `scanning`, `progress` (number), `totalTools` (number), `results: AuditResult | null`, `error`

**On mount:** fetch `GET /api/v1/seo-studio/audit/latest` to show last scan results.

**UI:**
- "Run Full Audit" button (gradient). When scanning: progress bar + "Scanning X/Y..." label.
- Results (when available):
  - Overall score: large number (48px bold) colored by range (green 80+, amber 50-79, red <50)
  - Subtitle "Overall SEO Score"
  - Issue summary: 3 pills showing critical/warning/info counts
  - Tool list: expandable cards, each showing tool name + score. Click to expand → shows issues list with severity icon + message + current/recommended values.

**Scan flow:** POST to `/api/v1/seo-studio/audit/scan`. The API returns the full result. No streaming — just show a spinner until done.

- [ ] **Step 2: Update audit page.tsx**

```typescript
import type { Metadata } from 'next'
import AdminGate from '@/tools/seo-studio/admin-gate'
import AuditDashboard from '@/tools/seo-studio/audit-dashboard'

export const metadata: Metadata = {
  title: 'SEO Studio — Site Audit | Toolk1t',
  description: 'Audit your tool pages for SEO issues.',
}

export default function AuditPage() {
  return <AdminGate><AuditDashboard /></AdminGate>
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/seo-studio/audit-dashboard.tsx app/tools/seo-studio/audit/page.tsx
git commit -m "feat(seo-studio): add audit dashboard UI with scan and results"
```

---

## Task 6: Page Generator UI

**Files:**
- Create: `tools/seo-studio/page-generator.tsx`
- Modify: `app/tools/seo-studio/pages/page.tsx`

- [ ] **Step 1: Create page-generator.tsx**

`'use client'` default export component.

**State:** `pages: LandingPage[]`, `loading`, `showForm`, `generating`, `formData: { toolSlug, keyword, pageType }`, `generatedPreview`, `error`

**On mount:** fetch `GET /api/v1/seo-studio/pages/list`

**UI:**
- Header: "Landing Pages" title + "New Page" button
- Page list table: slug (as link), keyword, tool name, status badge (draft=amber, live=green), created date
- Empty state: "No landing pages yet"
- New page form (when showForm):
  - Target tool (select from tools array)
  - Keyword (text input)
  - Page type: 2 pill buttons (Use Case / Free Tool)
  - "Generate" button (gradient, 3 credits badge)
- Generated preview:
  - Hero headline + subheadline in a gradient preview card
  - Benefits list
  - FAQ list
  - "Save as Draft" is automatic (already saved on generation)
  - "View Page" link to the generated URL

- [ ] **Step 2: Update pages page.tsx**

```typescript
import type { Metadata } from 'next'
import AdminGate from '@/tools/seo-studio/admin-gate'
import PageGenerator from '@/tools/seo-studio/page-generator'

export const metadata: Metadata = {
  title: 'SEO Studio — Landing Pages | Toolk1t',
  description: 'Generate SEO landing pages for your tools.',
}

export default function PagesPage() {
  return <AdminGate><PageGenerator /></AdminGate>
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/seo-studio/page-generator.tsx app/tools/seo-studio/pages/page.tsx
git commit -m "feat(seo-studio): add landing page generator UI with preview"
```

---

## Task 7: Build Verification

- [ ] **Step 1: Build check**

```bash
pnpm build
```

Expected: clean build.

- [ ] **Step 2: Verify all routes**

```bash
for route in seo-studio seo-studio/content seo-studio/audit seo-studio/pages; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/$route)
  echo "$route: $code"
done
```

Expected: all 200.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "chore(seo-studio): phase 2 build verification"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types, admin gate, database | None | Simple |
| 2 | Gemini landing page function | None | Simple |
| 3 | Audit API routes | Task 1 | Medium |
| 4 | Landing pages API routes | Tasks 1, 2 | Medium |
| 5 | Audit dashboard UI | Tasks 1, 3 | Medium |
| 6 | Page generator UI | Tasks 1, 4 | Medium |
| 7 | Build verification | All | Simple |

Tasks 1-2 can run in parallel. Tasks 3-4 can run in parallel. Tasks 5-6 can run in parallel. Task 7 runs last.
