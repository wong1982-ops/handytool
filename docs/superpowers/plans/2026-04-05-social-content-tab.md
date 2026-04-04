# Social Content Tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Social" tab to SEO Studio that generates platform-optimized social media posts (5 platforms × 3 variants) with CSV export.

**Architecture:** New tab route + API endpoint + Gemini prompt function + UI component. Single Gemini call generates all 15 posts. No persistence — results in component state, exported as CSV.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Gemini 2.5 Flash.

**Spec:** `docs/superpowers/specs/2026-04-05-social-content-tab.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `app/tools/seo-studio/social/page.tsx` | Social tab route |
| `app/api/v1/seo-studio/social/generate/route.ts` | Generation API (1 credit) |
| `tools/seo-studio/social-generator.tsx` | Social tab UI component |

### Modified Files
| File | Changes |
|---|---|
| `app/tools/seo-studio/layout.tsx` | Add "Social" to tabs array |
| `lib/seo-studio/gemini.ts` | Add `generateSocialPosts()` function |

---

## Task 1: Gemini Social Post Function

**Files:**
- Modify: `lib/seo-studio/gemini.ts`

- [ ] **Step 1: Add generateSocialPosts function**

Append to the end of `lib/seo-studio/gemini.ts`:

```typescript
export type SocialContentType = 'announcement' | 'tips' | 'engagement'
export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok'

export interface SocialVariant {
  content: string
  hashtags: string[]
  charCount: number
}

export interface SocialPostSet {
  platform: SocialPlatform
  variants: SocialVariant[]
}

const PLATFORM_RULES: Record<SocialPlatform, { maxChars: number; hashtagCount: string; tone: string }> = {
  twitter: { maxChars: 280, hashtagCount: '2-3', tone: 'Punchy, casual, emojis OK. Short and impactful.' },
  linkedin: { maxChars: 500, hashtagCount: '3-5 at end', tone: 'Professional, can include a question to drive engagement.' },
  instagram: { maxChars: 2200, hashtagCount: '5-10 in separate block', tone: 'Storytelling, emoji-heavy, visually descriptive.' },
  facebook: { maxChars: 500, hashtagCount: '1-2', tone: 'Conversational, can ask questions, friendly.' },
  tiktok: { maxChars: 2200, hashtagCount: '3-5', tone: 'Hook-style opening, casual/Gen-Z, trending language.' },
}

const CONTENT_TYPE_INSTRUCTIONS: Record<SocialContentType, string> = {
  announcement: 'Write promotional posts announcing this tool. Focus on what it does and why people should try it. Include a call-to-action.',
  tips: 'Write educational posts sharing tips about how to use this tool effectively. Provide real value and practical advice.',
  engagement: 'Write engaging posts that spark discussion — polls, questions, hot takes, or surprising facts related to what this tool does.',
}

export async function generateSocialPosts(params: {
  toolName: string
  toolSlug: string
  toolDescription: string
  contentType: SocialContentType
  customAngle?: string
}): Promise<SocialPostSet[]> {
  const { toolName, toolSlug, toolDescription, contentType, customAngle } = params
  const angleNote = customAngle ? `\nCustom angle to emphasize: "${customAngle}"` : ''

  const platformSpecs = Object.entries(PLATFORM_RULES)
    .map(([p, r]) => `- ${p}: max ${r.maxChars} chars, ${r.hashtagCount} hashtags. Tone: ${r.tone}`)
    .join('\n')

  const prompt = `You are an expert social media marketer. Generate social media posts for the tool "${toolName}".

Tool description: ${toolDescription}
Tool URL: https://toolk1t.com/tools/${toolSlug}

Content type: ${CONTENT_TYPE_INSTRUCTIONS[contentType]}
${angleNote}

Generate posts for these 5 platforms, with 3 unique variants per platform:

${platformSpecs}

Return a JSON object with this exact structure:
{
  "posts": [
    {
      "platform": "twitter",
      "variants": [
        { "content": "post text here", "hashtags": ["#tag1", "#tag2"] },
        { "content": "another version", "hashtags": ["#tag1", "#tag3"] },
        { "content": "third version", "hashtags": ["#tag2", "#tag4"] }
      ]
    },
    ... (repeat for linkedin, instagram, facebook, tiktok)
  ]
}

Rules:
- Each variant MUST be unique — different angle, different wording
- Hashtags as separate array, NOT in the content text
- Content must be within the platform's character limit
- Include the tool URL naturally where appropriate (not in every post)
- Write in English
- No placeholder text — write real, ready-to-post content

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in social posts response')

  const { jsonrepair } = await import('jsonrepair')
  const parsed = JSON.parse(jsonrepair(jsonMatch[0]))

  // Add charCount to each variant
  const posts: SocialPostSet[] = (parsed.posts || []).map((p: { platform: SocialPlatform; variants: { content: string; hashtags: string[] }[] }) => ({
    platform: p.platform,
    variants: p.variants.map(v => ({
      content: v.content,
      hashtags: v.hashtags || [],
      charCount: v.content.length,
    })),
  }))

  return posts
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/seo-studio/gemini.ts
git commit -m "feat(seo-studio): add social post generation Gemini function"
```

---

## Task 2: Social Generate API Route

**Files:**
- Create: `app/api/v1/seo-studio/social/generate/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// app/api/v1/seo-studio/social/generate/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateSocialPosts, type SocialContentType } from '@/lib/seo-studio/gemini'
import { tools } from '@/lib/tools'

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { toolSlug: string; contentType: SocialContentType; customAngle?: string }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!body.toolSlug || !body.contentType) {
    return apiError('toolSlug and contentType are required', 'VALIDATION_ERROR', 400)
  }

  const validTypes: SocialContentType[] = ['announcement', 'tips', 'engagement']
  if (!validTypes.includes(body.contentType)) {
    return apiError('contentType must be announcement, tips, or engagement', 'VALIDATION_ERROR', 400)
  }

  const tool = tools.find(t => t.href === `/tools/${body.toolSlug}`)
  if (!tool) return apiError('Tool not found', 'NOT_FOUND', 404)

  // Deduct 1 credit
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'seo-studio',
    p_description: `Social posts: ${tool.name} (${body.contentType})`,
  })

  if (deductError) {
    return deductError.message?.includes('insufficient_credits')
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  try {
    const posts = await generateSocialPosts({
      toolName: tool.name,
      toolSlug: body.toolSlug,
      toolDescription: tool.description,
      contentType: body.contentType,
      customAngle: body.customAngle,
    })

    return apiSuccess({ posts })
  } catch (err) {
    console.error('[seo-studio/social/generate] Failed:', err)
    return apiError('Social post generation failed', 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/seo-studio/social/generate/route.ts
git commit -m "feat(seo-studio): add social post generation API route"
```

---

## Task 3: Social Tab UI Component

**Files:**
- Create: `tools/seo-studio/social-generator.tsx`

- [ ] **Step 1: Create social-generator.tsx**

`'use client'` default export. Full component with form, results, and CSV export.

**State:**
- `toolSlug: string` — selected tool
- `contentType: SocialContentType | null` — selected type
- `customAngle: string` — optional angle text
- `generating: boolean`
- `posts: SocialPostSet[]` — results (empty initially)
- `activePlatform: SocialPlatform` — which platform tab is active (default 'twitter')
- `error: string | null`
- `copiedId: string | null` — tracks which variant just got copied (for "Copied!" feedback)

**UI structure:**

1. **Form card** (centered max-w-2xl, card-bg, border, rounded-xl, p-6):
   - Target tool: `<select>` with all tools from `@/lib/tools`, card-bg styling, 44px
   - Content type: 3 pill buttons (Announcement/Tips/Engagement), single-select, active=primary gradient, inactive=card-bg+border
   - Custom angle: text input, optional, placeholder
   - Generate button: full-width gradient, disabled when !toolSlug || !contentType || generating, spinner when generating, "1 credit" badge below

2. **Empty state** (when posts.length === 0 and !generating):
   - Megaphone SVG icon + heading + subtitle, centered py-12

3. **Results** (when posts.length > 0):
   - Header: "Generated Posts" title + "Download All as CSV" button (secondary)
   - Platform tabs: 5 pills (Twitter/LinkedIn/Instagram/Facebook/TikTok), active=primary, inactive=card-bg
   - 3 variant cards for active platform:
     - Header: "Variant N" label + char count badge (green if within limit, red if over)
     - Content text: 14px white, whitespace-pre-wrap
     - Hashtags: flex-wrap pills
     - Copy button: right-aligned, shows "Copied!" briefly on click

4. **Error banner** (when error): red-900/30 bg, red-400 text

**CSV export function:**
```typescript
function downloadCsv() {
  const rows = ['Platform,Variant,Content,Hashtags,CharCount']
  for (const set of posts) {
    set.variants.forEach((v, i) => {
      const content = v.content.replace(/"/g, '""')
      const hashtags = v.hashtags.join(' ')
      rows.push(`${set.platform},${i + 1},"${content}","${hashtags}",${v.charCount}`)
    })
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `social-posts-${toolSlug}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

**Copy function:**
```typescript
async function copyVariant(platform: string, index: number, content: string, hashtags: string[]) {
  const full = content + '\n\n' + hashtags.join(' ')
  await navigator.clipboard.writeText(full)
  setCopiedId(`${platform}-${index}`)
  setTimeout(() => setCopiedId(null), 2000)
}
```

**Platform char limits** (for badge color logic):
```typescript
const CHAR_LIMITS: Record<string, number> = { twitter: 280, linkedin: 500, instagram: 2200, facebook: 500, tiktok: 2200 }
```

**Styling:** dark theme tokens. Inputs: `rounded-xl bg-[#131a23] border border-[#1e2631] text-white min-h-[44px]`. Buttons: `min-h-[44px]`. Primary gradient: `from-[#3D6AF2] to-[#3D9DF2]`. Cards: `rounded-xl bg-[#131a23] border border-[#1e2631]`.

- [ ] **Step 2: Commit**

```bash
git add tools/seo-studio/social-generator.tsx
git commit -m "feat(seo-studio): add social content generator UI with platform tabs and CSV export"
```

---

## Task 4: Page Route + Layout Update

**Files:**
- Create: `app/tools/seo-studio/social/page.tsx`
- Modify: `app/tools/seo-studio/layout.tsx`

- [ ] **Step 1: Create social page route**

```typescript
// app/tools/seo-studio/social/page.tsx
import type { Metadata } from 'next'
import SocialGenerator from '@/tools/seo-studio/social-generator'

export const metadata: Metadata = {
  title: 'SEO Studio — Social Content | Toolk1t',
  description: 'Generate optimized social media posts for Twitter, LinkedIn, Instagram, Facebook, and TikTok.',
}

export default function SocialPage() {
  return <SocialGenerator />
}
```

- [ ] **Step 2: Add Social tab to layout.tsx**

In `app/tools/seo-studio/layout.tsx`, add a 5th tab to the `tabs` array after the "Pages" entry:

```typescript
  {
    label: 'Social',
    href: '/tools/seo-studio/social',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
      </svg>
    ),
  },
```

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add app/tools/seo-studio/social/ app/tools/seo-studio/layout.tsx
git commit -m "feat(seo-studio): add Social tab route and layout entry"
```

---

## Task 5: Build Verification

- [ ] **Step 1: Verify route loads**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/seo-studio/social
```

Expected: 200.

- [ ] **Step 2: Verify all 5 tabs load**

```bash
for route in seo-studio seo-studio/content seo-studio/audit seo-studio/pages seo-studio/social; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/$route)
  echo "$route: $code"
done
```

Expected: all 200.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "chore(seo-studio): social tab build verification"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Gemini social posts function | None | Medium |
| 2 | Social generate API route | Task 1 | Simple |
| 3 | Social generator UI | None | Medium |
| 4 | Page route + layout update | Tasks 2, 3 | Simple |
| 5 | Build verification | All | Simple |

Tasks 1 and 3 can run in parallel. Task 2 depends on 1. Task 4 depends on 2 and 3. Task 5 runs last.
