# SEO Studio Phase 1 — Keywords & Content

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing SEO Studio tool with Keyword Research and Content Calendar tabs, using ToolFrame.

**Architecture:** Next.js App Router with nested route tabs. Keyword research uses Google Autocomplete API + Gemini AI for analysis. Content calendar stores plans in Supabase and generates blog drafts via Gemini, pushing to the existing blog_posts table for publishing through VBlog.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Gemini 2.5 Flash (text), Supabase, ToolFrame layout system.

**Spec:** `docs/superpowers/specs/2026-04-04-seo-studio-design.md` (sections 1-2)

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/seo-studio/types.ts` | Shared types for keywords, content plans |
| `tools/seo-studio/keyword-research.tsx` | Keyword research UI (search, results table, export) |
| `tools/seo-studio/content-calendar.tsx` | Calendar grid + post list |
| `tools/seo-studio/content-editor.tsx` | New/edit post form with AI generation |
| `tools/seo-studio/admin-gate.tsx` | Admin check wrapper (for Phase 2, but stub now) |
| `app/tools/seo-studio/layout.tsx` | ToolFrame wrapper with tabs |
| `app/tools/seo-studio/page.tsx` | Keywords tab (default route) |
| `app/tools/seo-studio/content/page.tsx` | Content tab route |
| `app/api/v1/seo-studio/keywords/route.ts` | Keyword research API |
| `app/api/v1/seo-studio/content/generate/route.ts` | AI draft generation API |
| `app/api/v1/seo-studio/content/plans/route.ts` | Content plans CRUD API |
| `app/api/v1/seo-studio/content/publish/route.ts` | Push draft to blog_posts |
| `lib/seo-studio/gemini.ts` | Gemini prompts for keyword analysis + content drafts |
| `supabase/migrations/036_seo_studio.sql` | Database tables |

---

## Task 1: Types & Database

**Files:**
- Create: `tools/seo-studio/types.ts`
- Create: `supabase/migrations/036_seo_studio.sql`

- [ ] **Step 1: Create types.ts**

```typescript
// tools/seo-studio/types.ts

export interface KeywordResult {
  keyword: string
  volume: 'high' | 'medium' | 'low'
  competition: 'easy' | 'medium' | 'hard'
  relevance: number // 0-100
}

export interface KeywordResearchResponse {
  suggestions: KeywordResult[]
  questions: string[]
  autocomplete: string[]
  longTail: string[]
}

export interface ContentPlan {
  id: string
  userId: string
  keyword: string
  topic: string | null
  toolSlug: string | null
  scheduledDate: string | null
  status: 'planned' | 'generating' | 'draft' | 'published'
  draftContent: DraftContent | null
  createdAt: string
  updatedAt: string
}

export interface DraftContent {
  title: string
  metaDescription: string
  body: string // markdown
  suggestedLinks: { label: string; href: string }[]
}

export type ContentPlanStatus = ContentPlan['status']
```

- [ ] **Step 2: Create migration file**

```sql
-- supabase/migrations/036_seo_studio.sql

-- Keyword cache (24hr TTL)
CREATE TABLE IF NOT EXISTS public.seo_keyword_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL UNIQUE,
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_cache_hash ON seo_keyword_cache (query_hash);

-- Content plans
CREATE TABLE IF NOT EXISTS public.seo_content_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  topic TEXT,
  tool_slug TEXT,
  scheduled_date DATE,
  status TEXT DEFAULT 'planned',
  draft_content JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_content_plans_user ON seo_content_plans (user_id, created_at DESC);

ALTER TABLE seo_content_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own content plans" ON seo_content_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON seo_content_plans TO authenticated;
GRANT ALL ON seo_keyword_cache TO authenticated, service_role;
```

- [ ] **Step 3: Apply migration via Supabase MCP**

Use `mcp__supabase__apply_migration` with project_id `wgrcfnumbozvtmhcavnm`, name `036_seo_studio`, and the SQL above.

- [ ] **Step 4: Commit**

```bash
git add tools/seo-studio/types.ts supabase/migrations/036_seo_studio.sql
git commit -m "feat(seo-studio): add types and database tables"
```

---

## Task 2: Gemini Prompts

**Files:**
- Create: `lib/seo-studio/gemini.ts`

- [ ] **Step 1: Create gemini.ts with keyword analysis and content generation**

```typescript
// lib/seo-studio/gemini.ts

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const TEXT_MODEL = 'gemini-2.5-flash'

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  })
  if (!response.ok) throw new Error(`Gemini API ${response.status}`)
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function analyzeKeywords(query: string, autocomplete: string[]): Promise<{
  suggestions: { keyword: string; volume: string; competition: string; relevance: number }[]
  questions: string[]
  longTail: string[]
}> {
  const prompt = `You are an SEO expert. Analyze the seed keyword: "${query}"

Given these Google autocomplete suggestions: ${JSON.stringify(autocomplete)}

Return a JSON object with:
1. "suggestions": array of 10-15 keyword objects, each with:
   - "keyword": the keyword phrase
   - "volume": "high", "medium", or "low" (estimate based on commercial intent and search patterns)
   - "competition": "easy", "medium", or "hard" (estimate based on how many tools/sites target this)
   - "relevance": 0-100 score of relevance to the seed keyword
2. "questions": array of 6-8 "People also ask" style questions related to this keyword
3. "longTail": array of 8-10 long-tail (3-5 word) keyword variations

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in keyword analysis response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}

export async function generateBlogDraft(params: {
  keyword: string
  topic?: string | null
  toolSlug?: string | null
  toolName?: string | null
}): Promise<{
  title: string
  metaDescription: string
  body: string
  suggestedLinks: { label: string; href: string }[]
}> {
  const toolContext = params.toolSlug && params.toolName
    ? `This post should naturally reference the tool "${params.toolName}" at /tools/${params.toolSlug} as a solution.`
    : ''
  const topicContext = params.topic ? `Angle/topic: ${params.topic}.` : ''

  const prompt = `You are an expert SEO content writer. Write a blog post targeting the keyword: "${params.keyword}"

${topicContext}
${toolContext}

Return a JSON object with:
1. "title": SEO-optimized title (50-60 chars, includes the keyword naturally)
2. "metaDescription": meta description (150-160 chars, includes keyword, compelling CTA)
3. "body": the full blog post in Markdown format (800-1200 words). Requirements:
   - Include the keyword in the first paragraph
   - Use 3-5 H2 headings (## format)
   - Use 1-2 H3 subheadings where appropriate
   - Write naturally — no keyword stuffing
   - Include a brief FAQ section at the end with 3 questions
   - End with a clear call-to-action
4. "suggestedLinks": array of 2-3 objects with "label" and "href" for internal links to relevant tools (use /tools/{slug} format)

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in blog draft response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/seo-studio/gemini.ts
git commit -m "feat(seo-studio): add Gemini prompts for keyword analysis and content generation"
```

---

## Task 3: Keywords API Route

**Files:**
- Create: `app/api/v1/seo-studio/keywords/route.ts`

- [ ] **Step 1: Create keywords API**

```typescript
// app/api/v1/seo-studio/keywords/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { analyzeKeywords } from '@/lib/seo-studio/gemini'
import { createHash } from 'crypto'

export const maxDuration = 30

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { query: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const query = body.query?.trim()
  if (!query || query.length < 2) {
    return apiError('Query must be at least 2 characters', 'VALIDATION_ERROR', 400)
  }

  const queryHash = createHash('sha256').update(query.toLowerCase()).digest('hex')
  const supabase = await getSupabase()

  // Check cache (24hr TTL)
  const { data: cached } = await supabase
    .from('seo_keyword_cache')
    .select('results, cached_at')
    .eq('query_hash', queryHash)
    .single()

  if (cached) {
    const cachedAt = new Date(cached.cached_at).getTime()
    const age = Date.now() - cachedAt
    if (age < 24 * 60 * 60 * 1000) {
      return apiSuccess(cached.results)
    }
  }

  // Deduct 1 credit
  const authSupabase = await createClient()
  const { error: deductError } = await authSupabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'seo-studio',
    p_description: `Keyword research: "${query}"`,
  })

  if (deductError) {
    const isInsufficient = deductError.message?.includes('insufficient_credits')
    return isInsufficient
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  // Fetch Google Autocomplete
  let autocomplete: string[] = []
  try {
    const acUrl = `https://suggestqueries.google.com/complete/search?q=${encodeURIComponent(query)}&client=chrome`
    const acRes = await fetch(acUrl)
    if (acRes.ok) {
      const acData = await acRes.json()
      autocomplete = Array.isArray(acData[1]) ? acData[1].slice(0, 10) : []
    }
  } catch {
    // Autocomplete failed — continue without it
  }

  // Analyze with Gemini
  try {
    const analysis = await analyzeKeywords(query, autocomplete)
    const results = { ...analysis, autocomplete }

    // Cache results (upsert)
    await supabase
      .from('seo_keyword_cache')
      .upsert({ query_hash: queryHash, query, results, cached_at: new Date().toISOString() }, { onConflict: 'query_hash' })

    return apiSuccess(results)
  } catch (err) {
    console.error('[seo-studio/keywords] Analysis failed:', err)
    return apiError('Keyword analysis failed', 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/seo-studio/keywords/route.ts
git commit -m "feat(seo-studio): add keyword research API with caching"
```

---

## Task 4: Content Plans API Routes

**Files:**
- Create: `app/api/v1/seo-studio/content/plans/route.ts`
- Create: `app/api/v1/seo-studio/content/generate/route.ts`
- Create: `app/api/v1/seo-studio/content/publish/route.ts`

- [ ] **Step 1: Create content plans CRUD route**

```typescript
// app/api/v1/seo-studio/content/plans/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('seo_content_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[seo-studio/content/plans] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ plans: data ?? [] })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { id?: string; keyword: string; topic?: string; toolSlug?: string; scheduledDate?: string; status?: string; draftContent?: unknown }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.keyword?.trim()) {
    return apiError('Keyword is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()

  if (body.id) {
    // Update existing plan
    const { error } = await supabase
      .from('seo_content_plans')
      .update({
        keyword: body.keyword,
        topic: body.topic ?? null,
        tool_slug: body.toolSlug ?? null,
        scheduled_date: body.scheduledDate ?? null,
        status: body.status ?? 'planned',
        draft_content: body.draftContent ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('user_id', userId)

    if (error) {
      console.error('[seo-studio/content/plans] Update error:', error)
      return API_ERRORS.INTERNAL()
    }
    return apiSuccess({ planId: body.id })
  }

  // Create new plan
  const { data, error } = await supabase
    .from('seo_content_plans')
    .insert({
      user_id: userId,
      keyword: body.keyword.trim(),
      topic: body.topic ?? null,
      tool_slug: body.toolSlug ?? null,
      scheduled_date: body.scheduledDate ?? null,
      status: 'planned',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[seo-studio/content/plans] Insert error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ planId: data.id }, 201)
}
```

- [ ] **Step 2: Create content generation route**

```typescript
// app/api/v1/seo-studio/content/generate/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateBlogDraft } from '@/lib/seo-studio/gemini'
import { tools } from '@/lib/tools'

export const maxDuration = 60

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { keyword: string; topic?: string; toolSlug?: string; planId?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.keyword?.trim()) {
    return apiError('Keyword is required', 'VALIDATION_ERROR', 400)
  }

  // Deduct 2 credits
  const authSupabase = await createClient()
  const { error: deductError } = await authSupabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 2,
    p_tool_id: 'seo-studio',
    p_description: `Content draft: "${body.keyword}"`,
  })

  if (deductError) {
    const isInsufficient = deductError.message?.includes('insufficient_credits')
    return isInsufficient
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  // Find tool name if toolSlug provided
  const toolName = body.toolSlug
    ? tools.find(t => t.href === `/tools/${body.toolSlug}`)?.name ?? null
    : null

  try {
    const draft = await generateBlogDraft({
      keyword: body.keyword.trim(),
      topic: body.topic,
      toolSlug: body.toolSlug,
      toolName,
    })

    // If planId provided, update the plan with draft content
    if (body.planId) {
      const supabase = await getSupabase()
      await supabase
        .from('seo_content_plans')
        .update({
          status: 'draft',
          draft_content: draft,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.planId)
        .eq('user_id', userId)
    }

    return apiSuccess({ draft })
  } catch (err) {
    console.error('[seo-studio/content/generate] Failed:', err)
    return apiError('Draft generation failed', 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 3: Create publish route**

```typescript
// app/api/v1/seo-studio/content/publish/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { planId: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.planId) {
    return apiError('planId is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()

  // Fetch the plan
  const { data: plan, error: planError } = await supabase
    .from('seo_content_plans')
    .select('*')
    .eq('id', body.planId)
    .eq('user_id', userId)
    .single()

  if (planError || !plan) {
    return apiError('Plan not found', 'NOT_FOUND', 404)
  }

  if (!plan.draft_content) {
    return apiError('No draft content to publish. Generate a draft first.', 'VALIDATION_ERROR', 400)
  }

  const draft = plan.draft_content as { title: string; metaDescription: string; body: string }
  const slug = draft.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  // Insert into blog_posts
  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title: draft.title,
      description: draft.metaDescription,
      content: draft.body,
      category: 'seo',
      status: 'draft',
      reading_time_min: Math.ceil(draft.body.split(/\s+/).length / 200),
    })
    .select('id, slug')
    .single()

  if (postError) {
    console.error('[seo-studio/content/publish] Insert error:', postError)
    return apiError('Failed to create blog post', 'INTERNAL_ERROR', 500)
  }

  // Update plan status
  await supabase
    .from('seo_content_plans')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', body.planId)

  return apiSuccess({ postId: post.id, slug: post.slug })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/seo-studio/content/
git commit -m "feat(seo-studio): add content plans CRUD, generation, and publish APIs"
```

---

## Task 5: Page Routes & Layout

**Files:**
- Create: `app/tools/seo-studio/layout.tsx`
- Create: `app/tools/seo-studio/page.tsx`
- Create: `app/tools/seo-studio/content/page.tsx`
- Create: `tools/seo-studio/admin-gate.tsx`

- [ ] **Step 1: Create layout.tsx with ToolFrame**

```typescript
// app/tools/seo-studio/layout.tsx
import { ToolFrame } from '@/components/layout/tool-frame'

export default function SeoStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolFrame
      toolName="SEO Studio"
      toolSlug="seo-studio"
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      }
      tabs={[
        { label: 'Keywords', href: '/tools/seo-studio' },
        { label: 'Content', href: '/tools/seo-studio/content' },
        { label: 'Audit', href: '/tools/seo-studio/audit' },
        { label: 'Pages', href: '/tools/seo-studio/pages' },
      ]}
    >
      {children}
    </ToolFrame>
  )
}
```

- [ ] **Step 2: Create keywords page.tsx (default tab)**

```typescript
// app/tools/seo-studio/page.tsx
import type { Metadata } from 'next'
import KeywordResearch from '@/tools/seo-studio/keyword-research'

export const metadata: Metadata = {
  title: 'SEO Studio — Keyword Research | Toolk1t',
  description: 'Discover high-value keywords, related questions, and long-tail variations for your SEO strategy.',
}

export default function SeoStudioPage() {
  return <KeywordResearch />
}
```

- [ ] **Step 3: Create content page.tsx**

```typescript
// app/tools/seo-studio/content/page.tsx
import type { Metadata } from 'next'
import ContentCalendar from '@/tools/seo-studio/content-calendar'

export const metadata: Metadata = {
  title: 'SEO Studio — Content Calendar | Toolk1t',
  description: 'Plan and generate SEO-optimized blog posts with AI.',
}

export default function ContentPage() {
  return <ContentCalendar />
}
```

- [ ] **Step 4: Create admin-gate.tsx stub**

```typescript
// tools/seo-studio/admin-gate.tsx
'use client'

interface AdminGateProps {
  children: React.ReactNode
}

export default function AdminGate({ children }: AdminGateProps) {
  // Phase 2: implement admin check
  // For now, show "coming soon" placeholder
  return (
    <div className="text-center py-20">
      <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Coming Soon</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This feature is under development.</p>
    </div>
  )
}
```

- [ ] **Step 5: Create audit and pages placeholder routes**

Create `app/tools/seo-studio/audit/page.tsx`:
```typescript
import AdminGate from '@/tools/seo-studio/admin-gate'
export default function AuditPage() { return <AdminGate><div /></AdminGate> }
```

Create `app/tools/seo-studio/pages/page.tsx`:
```typescript
import AdminGate from '@/tools/seo-studio/admin-gate'
export default function PagesPage() { return <AdminGate><div /></AdminGate> }
```

- [ ] **Step 6: Add seo-studio to tool registry and bento showcase**

Add to `lib/tools.tsx`:
```typescript
{
  name: 'SEO Studio',
  href: '/tools/seo-studio',
  description: 'Keyword research and SEO content planning',
  icon: (/* search magnifying glass SVG */),
  color: 'from-blue-500 to-indigo-500',
}
```

Add to `components/home/bento-showcase.tsx` with a preview card.

Add to `components/layout/tool-categories.ts`: `'seo-studio': 'utility'`

- [ ] **Step 7: Commit**

```bash
git add app/tools/seo-studio/ tools/seo-studio/admin-gate.tsx lib/tools.tsx components/home/bento-showcase.tsx components/layout/tool-categories.ts
git commit -m "feat(seo-studio): add page routes, layout, and tool registry entry"
```

---

## Task 6: Keyword Research UI

**Files:**
- Create: `tools/seo-studio/keyword-research.tsx`

- [ ] **Step 1: Create keyword-research.tsx**

A `'use client'` component with:

**State:**
- `query: string` — search input
- `loading: boolean` — research in progress
- `results: KeywordResearchResponse | null` — API response
- `error: string | null`

**UI sections:**

1. **Search bar** — input + "Research" button (gradient, 1 credit badge). Disabled when loading or query < 2 chars.

2. **Results** (shown after research):
   - **Keyword suggestions table** — sortable table with columns: Keyword, Volume (badge: green=high, amber=medium, slate=low), Competition (badge: green=easy, amber=medium, red=hard), Relevance (progress bar). Click a keyword row to copy it.
   - **Related questions** — list of questions with question mark icon
   - **Autocomplete suggestions** — horizontal pill list
   - **Long-tail variations** — vertical list

3. **Export CSV button** — converts suggestions table to CSV download

**API call:** `POST /api/v1/seo-studio/keywords` with `{ query }`

**Styling:** dark theme tokens (`#090f16`, `#131a23`, `#1e2631`, `#3D6AF2`). Tables use `rounded-xl bg-[#131a23] border border-[#1e2631]`. Badges use Tailwind color classes.

- [ ] **Step 2: Commit**

```bash
git add tools/seo-studio/keyword-research.tsx
git commit -m "feat(seo-studio): add keyword research UI with table, questions, export"
```

---

## Task 7: Content Calendar UI

**Files:**
- Create: `tools/seo-studio/content-calendar.tsx`
- Create: `tools/seo-studio/content-editor.tsx`

- [ ] **Step 1: Create content-calendar.tsx**

A `'use client'` component with:

**State:**
- `plans: ContentPlan[]` — fetched from API
- `loading: boolean`
- `selectedPlan: ContentPlan | null` — for editing
- `showEditor: boolean`

**UI:**
- **Header row** — "Content Calendar" title + "New Post" button (gradient)
- **Post list** (simpler than a full calendar grid for v1) — table/cards showing:
  - Title (from draft_content or keyword)
  - Target keyword
  - Status badge (Planned=slate, Generating=amber+pulse, Draft=blue, Published=green)
  - Scheduled date (if set)
  - Click to edit → opens `ContentEditor`
- **Empty state** — "No content plans yet. Create your first post!"

**On mount:** `GET /api/v1/seo-studio/content/plans` → set plans

**When "New Post" clicked:** `setShowEditor(true)` with null selectedPlan

- [ ] **Step 2: Create content-editor.tsx**

A `'use client'` component with:

**Props:**
```typescript
interface ContentEditorProps {
  plan: ContentPlan | null  // null = new plan
  onSave: () => void        // refresh list
  onClose: () => void
}
```

**UI:**
- Form fields:
  - Target keyword (text input, required)
  - Topic/angle (text input, optional)
  - Target tool (dropdown from `tools` array, optional)
  - Schedule date (date input, optional)
- "Generate Draft" button (gradient, 2 credits) — calls `POST /api/v1/seo-studio/content/generate`
- **Draft preview** (shown after generation):
  - Title (editable)
  - Meta description (editable, char count)
  - Body (markdown rendered + raw toggle)
  - Suggested internal links (list)
- **Actions:**
  - "Save Plan" — saves/updates via `POST /api/v1/seo-studio/content/plans`
  - "Publish to Blog" — calls `POST /api/v1/seo-studio/content/publish`
  - "Back" — returns to list

**Styling:** same dark theme. Form inputs: `rounded-xl bg-[#131a23] border border-[#1e2631] text-white`. Draft preview: `rounded-xl bg-[#0d1117] border border-[#1e2631] p-6`.

- [ ] **Step 3: Commit**

```bash
git add tools/seo-studio/content-calendar.tsx tools/seo-studio/content-editor.tsx
git commit -m "feat(seo-studio): add content calendar and editor with AI draft generation"
```

---

## Task 8: Build Verification & Integration Test

**Files:** None new

- [ ] **Step 1: Build check**

```bash
pnpm build
```

Expected: clean build, no errors.

- [ ] **Step 2: Verify routes load**

```bash
for route in seo-studio seo-studio/content seo-studio/audit seo-studio/pages; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/$route)
  echo "$route: $code"
done
```

Expected: all return 200.

- [ ] **Step 3: Test keyword API**

```bash
curl -s -X POST http://localhost:3000/api/v1/seo-studio/keywords \
  -H "Content-Type: application/json" \
  -d '{"query":"json formatter"}' | python3 -m json.tool | head -20
```

Expected: JSON response with suggestions, questions, autocomplete, longTail.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore(seo-studio): build verification and fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types & database tables | None | Simple |
| 2 | Gemini prompts | None | Medium |
| 3 | Keywords API route | Tasks 1, 2 | Medium |
| 4 | Content plans API routes | Tasks 1, 2 | Medium |
| 5 | Page routes & layout | None | Simple |
| 6 | Keyword research UI | Tasks 3, 5 | Medium |
| 7 | Content calendar UI | Tasks 4, 5 | Medium |
| 8 | Build verification | All | Simple |

Tasks 1-2 can run in parallel. Tasks 3-4 can run in parallel (both depend on 1+2). Task 5 is independent. Tasks 6-7 can run in parallel (depend on 3-5 and 4-5 respectively). Task 8 runs last.
