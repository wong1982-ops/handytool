# Blog SEO Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Revamp the blog into a full SEO engine — AI auto-generates tool announcement posts and how-to guides via Gemini, stored as markdown in JSONB, rendered with ToC, FAQ schema, related posts, social share, and filterable listing page.

**Architecture:** Extend existing `blog_posts` table with metadata columns (category, tags, keywords, tool_slug). Gemini generates markdown content stored in the JSONB `content` column. Two API routes: manual generate + deploy-hook auto-generate. Enhanced listing page with category/tag filters. Enhanced post page with markdown rendering, ToC, FAQ schema, related posts, share buttons, CTA.

**Tech Stack:** Gemini 2.5 Flash, react-markdown, rehype-highlight, remark-gfm, Supabase, Next.js App Router.

**Design doc:** `docs/plans/2026-03-21-blog-seo-engine-design.md`

---

### Task 1: Database Migration + Dependencies

**Files:**
- Create: `supabase/migrations/017_blog_enhancements.sql`

**Step 1: Create migration**

```sql
-- Extend blog_posts for SEO engine
-- Add new post types
ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_post_type_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_post_type_check
  CHECK (post_type IN ('weekly-roundup', 'trending', 'tool-spotlight', 'tool-announcement', 'how-to-guide', 'comparison'));

-- Add metadata columns
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'tool-announcement';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reading_time_min INTEGER DEFAULT 3;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tool_slug TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Toolk1t';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tool_slug ON public.blog_posts (tool_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING GIN (tags);
```

**Step 2: Install dependencies**

```bash
pnpm add react-markdown rehype-highlight remark-gfm
```

**Step 3: Apply migration**

Run via Supabase MCP or dashboard.

**Step 4: Commit**

```bash
git add supabase/migrations/017_blog_enhancements.sql package.json pnpm-lock.yaml
git commit -m "feat(blog): add schema migration for SEO engine + install markdown deps"
```

---

### Task 2: Blog Generation Logic (Shared)

**Files:**
- Create: `lib/blog/generate-post.ts`

**Step 1: Build the shared generation function**

NO `'use client'` — server-side only.

This is the core AI generation logic used by both manual and auto-generate routes.

```typescript
// lib/blog/generate-post.ts

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface GeneratedPost {
  slug: string
  title: string
  description: string
  content: {
    markdown: string
    toc: { id: string; title: string; level: number }[]
    faq: { question: string; answer: string }[]
  }
  post_type: 'tool-announcement' | 'how-to-guide'
  category: string
  tags: string[]
  keywords: string[]
  reading_time_min: number
  tool_slug: string | null
  author: string
}

interface GenerateInput {
  type: 'tool-announcement' | 'how-to-guide'
  toolName?: string
  toolSlug?: string
  toolDescription?: string
  toolHref?: string
  customTopic?: string
}
```

Functions:
- `generateBlogPost(input: GenerateInput): Promise<GeneratedPost>` — calls Gemini with structured output to generate title, description, markdown body (800-1500 words), 3-5 FAQ pairs, 5 keywords, 3-5 tags
- `generateToc(markdown: string): { id: string; title: string; level: number }[]` — parses `## ` and `### ` headings from markdown, generates slug IDs
- `calculateReadingTime(markdown: string): number` — word count / 200, minimum 2
- `slugify(title: string): string` — lowercase, replace spaces with hyphens, remove special chars, truncate to 80 chars

**Gemini system prompt for tool-announcement:**
"You are an SEO content writer for Toolk1t, a free online tools website. Write a blog post announcing a new tool. Structure: engaging intro → what it does → 3-5 key features with details → step-by-step how to use it → 3 real-world use cases → why it's free → call to action. Use markdown with ## and ### headings. Include internal link to the tool page. Target long-tail search keywords naturally. Write 800-1200 words."

**Gemini system prompt for how-to-guide:**
"You are an SEO content writer for Toolk1t. Write a comprehensive how-to guide. Structure: intro explaining the problem → prerequisites → step-by-step instructions with details → pro tips → common mistakes to avoid → conclusion with CTA. Use markdown with ## and ### headings. Write 1000-1500 words."

**Gemini structured output schema:** title (STRING), description (STRING, max 160 chars), markdown (STRING), faq (ARRAY of {question: STRING, answer: STRING}), keywords (ARRAY of STRING), tags (ARRAY of STRING), category (STRING).

**Step 2: Commit**

```bash
git add lib/blog/generate-post.ts
git commit -m "feat(blog): add AI blog post generation logic via Gemini"
```

---

### Task 3: Manual Generate API Route

**Files:**
- Create: `app/api/v1/blog/generate/route.ts`

**Step 1: Build the endpoint**

`POST /api/v1/blog/generate`

Input: `{ type: 'tool-announcement' | 'how-to-guide', toolSlug?: string, customTopic?: string, publish?: boolean }`

Processing:
1. Auth check — verify CRON_SECRET header OR authenticated admin user
2. Validate input: for tool-announcement, toolSlug is required
3. If toolSlug: look up tool info — import tools array from `@/lib/tools` (note: this is a React file with JSX icons, so we need a plain data source). Alternative: accept toolName + toolDescription in the request body, or maintain a server-safe tools list.
   - Simplest: accept `{ toolSlug, toolName, toolDescription }` in the request for tool-announcement
   - Or: query the tools list via a helper that strips JSX
4. Check if blog post already exists for this tool_slug (if provided) — return existing if found
5. Call `generateBlogPost(input)`
6. Insert into `blog_posts` table via Supabase
7. If `publish !== false`, set `published_at = now()`
8. Return the created post

**Auth pattern:** Check `x-cron-secret` header matches `CRON_SECRET` env var (same as job queue auth). This allows both cron triggers and manual curl calls.

```typescript
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateBlogPost } from '@/lib/blog/generate-post'
import { verifyCronSecret } from '@/lib/story/queue'
```

**Step 2: Commit**

```bash
git add app/api/v1/blog/generate/route.ts
git commit -m "feat(blog): add manual blog post generation API route"
```

---

### Task 4: Auto-Generate API Route

**Files:**
- Create: `app/api/v1/blog/auto-generate/route.ts`

**Step 1: Build the deploy-hook endpoint**

`POST /api/v1/blog/auto-generate`

Processing:
1. Verify CRON_SECRET header
2. Get list of all tool slugs — hardcode or import a server-safe list. Create a simple `lib/blog/tool-slugs.ts` with:
```typescript
export const TOOL_ENTRIES = [
  { slug: 'ipcheck', name: 'IP Check', description: 'Look up any IP address or domain' },
  { slug: 'myip', name: 'My IP', description: 'Find your public IP address' },
  // ... all tools
]
```
3. Query `blog_posts` for existing `tool_slug` values: `SELECT tool_slug FROM blog_posts WHERE tool_slug IS NOT NULL`
4. Find tools without posts
5. Generate up to 5 posts (call `generateBlogPost` for each)
6. Insert each into blog_posts with `published_at = now()`
7. Return `{ generated: ['slug1', 'slug2', ...] }`

**Step 2: Create `lib/blog/tool-slugs.ts`**

Server-safe tool list without JSX — just slug, name, description, href for each tool. Keep in sync manually (or auto-derive later).

**Step 3: Commit**

```bash
git add app/api/v1/blog/auto-generate/route.ts lib/blog/tool-slugs.ts
git commit -m "feat(blog): add auto-generate API route for deploy hook"
```

---

### Task 5: Blog UI Components

**Files:**
- Create: `components/blog/markdown-renderer.tsx`
- Create: `components/blog/table-of-contents.tsx`
- Create: `components/blog/faq-section.tsx`
- Create: `components/blog/related-posts.tsx`
- Create: `components/blog/share-buttons.tsx`
- Create: `components/blog/cta-banner.tsx`
- Create: `components/blog/blog-card.tsx`

**Step 1: Create markdown renderer**

`'use client'` component using react-markdown + rehype-highlight + remark-gfm.

Props: `content: string` (markdown string)

Style prose content with Tailwind typography classes. Headings get auto-generated IDs for ToC linking. Code blocks get syntax highlighting. Links open in new tab for external URLs.

**Step 2: Create table of contents**

Props: `toc: { id: string; title: string; level: number }[]`

Desktop: sticky sidebar (right side). Mobile: collapsible section above content. Each item links to `#id` with smooth scroll. Active item highlighted based on scroll position (IntersectionObserver).

**Step 3: Create FAQ section**

Props: `faq: { question: string; answer: string }[]`

Renders FAQ items as expandable accordions. Includes FAQ schema.org `<script type="application/ld+json">` inline.

**Step 4: Create related posts**

Props: `posts: { slug: string; title: string; description: string; category: string; published_at: string }[]`

Grid of 3 cards linking to other posts. Each card: title, description (truncated), date, category badge.

**Step 5: Create share buttons**

Props: `url: string, title: string`

3 buttons: Copy Link (clipboard + "Copied!" feedback), Share on X, Share on LinkedIn. Uses `navigator.share` on mobile if available.

**Step 6: Create CTA banner**

Props: `toolName: string, toolHref: string`

Gradient banner: "Try {toolName} now — it's free" with button linking to the tool.

**Step 7: Create blog card**

Props: `post: { slug, title, description, category, tags, reading_time_min, published_at, tool_slug? }`

For the listing page grid. Shows: gradient cover (based on tool color or default), category badge, title, description (2 lines), reading time + date, tag pills.

**Step 8: Commit**

```bash
git add components/blog/
git commit -m "feat(blog): add all blog UI components (markdown, ToC, FAQ, related, share, CTA, card)"
```

---

### Task 6: Enhanced Blog Listing Page

**Files:**
- Rewrite: `app/blog/page.tsx`

**Step 1: Rewrite the listing page**

Server component with ISR (`revalidate = 3600`).

Query blog_posts: `SELECT slug, title, description, category, tags, reading_time_min, published_at, tool_slug FROM blog_posts WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT 50`

Layout:
- Hero: "Blog" title + "Tools, guides, and insights for developers and creators" + post count
- Filter bar (client component wrapper): category pills (All, New Tools, How-To Guides, Weekly Roundups) — uses URL search params `?category=tool-announcement`
- Post grid using `<BlogCard>` — 2-col desktop, 1-col mobile
- If no posts: "No posts yet" message

Pass `category` from searchParams to filter the query.

**Step 2: Commit**

```bash
git add app/blog/page.tsx
git commit -m "feat(blog): rewrite listing page with category filters and post cards"
```

---

### Task 7: Enhanced Blog Post Page

**Files:**
- Rewrite: `app/blog/[slug]/page.tsx`

**Step 1: Rewrite the post page**

Server component with ISR.

Query: `SELECT * FROM blog_posts WHERE slug = $1 AND published_at IS NOT NULL`

Detect post type:
- If `post_type` is `weekly-roundup` / `trending` / `tool-spotlight`: use existing `<BlogPostRenderer>` with JSONB content (backward compat)
- If `post_type` is `tool-announcement` / `how-to-guide`: use new markdown rendering

For new post types, layout:
- Breadcrumb schema + visual breadcrumb
- Header: title (h1), author + date + reading time, category badge, tags
- Two-column layout on desktop:
  - Left (main): `<MarkdownRenderer content={post.content.markdown} />`
  - Right (sidebar): `<TableOfContents toc={post.content.toc} />`
- Below content: `<FaqSection faq={post.content.faq} />`
- `<ShareButtons url={/blog/${slug}} title={post.title} />`
- If tool_slug: `<CtaBanner toolName={...} toolHref={...} />`
- `<RelatedPosts posts={relatedPosts} />`

Related posts query: `SELECT slug, title, description, category, published_at FROM blog_posts WHERE published_at IS NOT NULL AND slug != $1 AND tags && $2 ORDER BY published_at DESC LIMIT 3` (where $2 is the current post's tags array — `&&` is PostgreSQL array overlap)

SEO:
- generateMetadata with title, description, canonical, OG article
- Article schema + FAQ schema + Breadcrumb schema (using existing helpers from `lib/seo/schemas.ts`)
- Add `buildFaqSchema` helper to `lib/seo/schemas.ts`

**Step 2: Add FAQ schema helper to `lib/seo/schemas.ts`**

```typescript
export function buildFaqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
```

**Step 3: Commit**

```bash
git add app/blog/[slug]/page.tsx lib/seo/schemas.ts
git commit -m "feat(blog): rewrite post page with markdown, ToC, FAQ schema, related posts, CTA"
```

---

### Task 8: Build, Deploy & Generate Initial Posts

**Step 1: Run build**

```bash
pnpm build
```

**Step 2: Commit any remaining files and push**

```bash
git add docs/plans/2026-03-21-blog-seo-engine-design.md docs/plans/2026-03-21-blog-seo-engine-plan.md
git commit -m "docs: add blog SEO engine design and plan"
git push origin main
```

**Step 3: Apply database migration**

Run the migration via Supabase MCP or dashboard.

**Step 4: Generate initial blog posts for all existing tools**

```bash
curl -X POST https://toolk1t.com/api/v1/blog/auto-generate \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json"
```

Or call locally:
```bash
curl -X POST http://localhost:3000/api/v1/blog/auto-generate \
  -H "x-cron-secret: $CRON_SECRET"
```

This generates up to 5 posts per call. Run multiple times to cover all tools.
