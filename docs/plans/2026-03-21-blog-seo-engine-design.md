# Blog SEO Engine — Design Document

**Date:** 2026-03-21
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** Revamp the blog into a full SEO-optimized content engine — AI auto-generates tool announcement posts on deploy + manual trigger for how-to guides, stored as markdown in JSONB, rendered with full SEO
- **Why:** Drive organic search traffic to tools via blog content targeting long-tail keywords
- **Who:** Google crawlers (SEO) and users discovering tools via search/social
- **Key constraints:** Gemini 2.5 Flash for generation, no credit cost (internal), auto-publish on deploy, markdown in existing JSONB content column, categories + tags
- **Non-goals:** No CMS/WYSIWYG editor, no multi-author, no comments, no email newsletter

## Assumptions

- Gemini 2.5 Flash available (already set up)
- Existing blog_posts table extended with new metadata columns
- Content JSONB stores { markdown, toc, faq } for new post types
- Old weekly-roundup posts keep working (backward compatible)
- Sitemap already includes blog posts
- Cover images use tool gradient colors (no AI image generation)
- Posts editable directly in Supabase after publish

---

## Database Schema Extension

New columns on `blog_posts`:

```sql
ALTER TABLE blog_posts
  ADD COLUMN category TEXT DEFAULT 'tool-announcement',
  ADD COLUMN tags TEXT[] DEFAULT '{}',
  ADD COLUMN keywords TEXT[] DEFAULT '{}',
  ADD COLUMN cover_image_url TEXT,
  ADD COLUMN reading_time_min INTEGER DEFAULT 3,
  ADD COLUMN tool_slug TEXT,
  ADD COLUMN author TEXT DEFAULT 'Toolk1t';

CREATE INDEX idx_blog_posts_category ON blog_posts (category);
CREATE INDEX idx_blog_posts_tool_slug ON blog_posts (tool_slug);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN (tags);
```

Existing columns unchanged: id, slug, title, description, content (JSONB), post_type, published_at, created_at.

**Content JSONB structure for new posts:**
```typescript
interface BlogPostContent {
  markdown: string
  toc: { id: string; title: string; level: number }[]
  faq: { question: string; answer: string }[]
  tool_slug?: string
}
```

Old `weekly-roundup` posts keep their existing JSONB format. Renderer switches based on `post_type`.

---

## API Routes

### `POST /api/v1/blog/generate`

Manual trigger for generating a blog post.

Input:
```typescript
{
  type: 'tool-announcement' | 'how-to-guide'
  toolSlug?: string        // required for tool-announcement
  customTopic?: string     // for how-to guides
  publish?: boolean        // default true
}
```

Processing:
1. Auth check (admin — verify via CRON_SECRET header or admin user role)
2. Look up tool info from tools list if toolSlug provided
3. Gemini generates: title, description (150 chars), markdown body, FAQ pairs, keywords, tags
4. Auto-generate ToC from markdown headings
5. Calculate reading time (words / 200)
6. Generate slug from title
7. Insert into blog_posts
8. Return created post

**Tool announcement prompt structure:** intro → what it does → key features → how to use → use cases → why free → CTA

**How-to guide prompt structure:** intro → prerequisites → step-by-step → tips → common mistakes → FAQ → CTA

No credit cost — internal admin operation.

### `POST /api/v1/blog/auto-generate`

Deploy hook — generates posts for tools without blog posts.

1. Get all tool slugs from tools list
2. Query blog_posts for existing tool_slugs
3. Find missing tools
4. Generate up to 5 posts (oldest-missing first)
5. Return list of generated slugs

Secured with CRON_SECRET. Idempotent — safe to call repeatedly.

---

## Blog Listing Page (`/blog`)

Upgrade from plain list to filterable grid:

- Hero: title + subtitle + post count
- Filter bar: category pills (All, New Tools, How-To Guides, Weekly Roundups) + tag dropdown
- Post grid: 2-col desktop, 1-col mobile
- Each card: cover (gradient banner), category badge, title, description (2 lines), reading time + date, tag pills
- Pagination: "Load more" after 20 posts
- ISR: revalidate = 3600

---

## Blog Post Page (`/blog/[slug]`)

- Breadcrumb: Home > Blog > Title
- Header: title, author, date, reading time, category, tags
- Cover: image or styled gradient
- Table of Contents: sticky sidebar desktop, collapsible mobile (from content.toc)
- Markdown body: react-markdown + rehype-highlight + remark-gfm
- FAQ section: from content.faq, with FAQ schema.org
- Related posts: 3 posts sharing most tags
- Social share: copy link, X, LinkedIn
- CTA banner: "Try [Tool] now — it's free"

**SEO per post:**
- title, meta description, canonical, Open Graph (article)
- Article schema + FAQ schema + BreadcrumbList schema
- Keywords meta

---

## Components

| File | Responsibility |
|---|---|
| `supabase/migrations/XXX_blog_enhancements.sql` | Schema migration |
| `app/api/v1/blog/generate/route.ts` | Manual blog generation API |
| `app/api/v1/blog/auto-generate/route.ts` | Deploy hook auto-generation |
| `app/blog/page.tsx` | Enhanced listing page with filters |
| `app/blog/[slug]/page.tsx` | Enhanced post page with ToC, FAQ, related |
| `components/blog/blog-card.tsx` | Post card for listing grid |
| `components/blog/markdown-renderer.tsx` | react-markdown wrapper with syntax highlighting |
| `components/blog/table-of-contents.tsx` | Sticky ToC sidebar |
| `components/blog/faq-section.tsx` | FAQ with schema.org markup |
| `components/blog/related-posts.tsx` | Related posts by tags |
| `components/blog/share-buttons.tsx` | Social share (copy, X, LinkedIn) |
| `components/blog/cta-banner.tsx` | "Try this tool" CTA at bottom |
| `lib/blog/generate-post.ts` | Gemini generation logic (shared by both API routes) |

---

## Dependencies

- `react-markdown` — markdown to JSX
- `rehype-highlight` — syntax highlighting
- `remark-gfm` — GitHub Flavored Markdown

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Tool slug not found | Error "Tool not found" |
| Post already exists for tool | Skip, return existing |
| Gemini fails | Error, don't create partial post |
| No cover image | CSS gradient from tool color |
| Old weekly-roundup posts | Render with existing BlogPostRenderer |
| Empty FAQ from AI | Hide FAQ section |
| Auto-generate no missing tools | No-op, return empty |
| Concurrent calls | UNIQUE constraint on tool_slug prevents duplicates |
| Post editing | Update directly in Supabase |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | AI auto-publish + manual trigger | Manual only; Draft review | Zero friction for announcements |
| 2 | Markdown in existing JSONB content | New column; HTML | Backward compatible |
| 3 | Gemini 2.5 Flash | GPT-4; Claude | Already available, fast, free |
| 4 | Categories + tags | Flat; Categories only | Best SEO targeting |
| 5 | Deploy hook API | CI; Cron only | Simple, idempotent, manual too |
| 6 | react-markdown | Custom parser; MDX | Standard, safe, plugins |
| 7 | FAQ schema per post | No FAQ | Improves search appearance |
| 8 | Related by shared tags | Manual; AI-suggested | Simple, automatic |
| 9 | Gradient cover fallback | AI image; No cover | Free, branded |
| 10 | No credit cost | Credits | Internal operation |
| 11 | Max 5 per auto-generate | Unlimited | Prevents mass generation |
