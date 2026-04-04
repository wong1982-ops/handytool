# SEO Studio — Design Spec

**Date:** 2026-04-04
**Status:** Approved

---

## Overview

An "SEO Studio" tool to drive organic search traffic to Toolk1t. Four modules: Keyword Research (public), Content Calendar (public), SEO Audit (admin), and Landing Page Generator (admin). Uses ToolFrame with tab navigation.

## Tool Structure

- **Route:** `/tools/seo-studio`
- **Category:** Utility (blue theme)
- **Layout:** ToolFrame standard variant, 4 tabs
- **Tabs:**
  1. Keywords (`/tools/seo-studio`) — public
  2. Content (`/tools/seo-studio/content`) — public
  3. Audit (`/tools/seo-studio/audit`) — admin only
  4. Pages (`/tools/seo-studio/pages`) — admin only

Admin tabs gated by user role. Show lock icon on tab. Non-admin users see "Admin access required" message.

## 1. Keywords Tab (Public)

### UI
- Search input: "Enter a topic or seed keyword"
- "Research" button (1 credit)
- Results:
  - Keyword suggestions table: Keyword, Volume (High/Med/Low), Competition (Easy/Medium/Hard), Relevance
  - Related questions ("People also ask" style)
  - Autocomplete suggestions
  - Long-tail variations
- Export as CSV button

### Data Sources (Server-Side)
- Google Autocomplete API: `https://suggestqueries.google.com/complete/search?q={query}&client=chrome`
- Related questions and volume/competition estimates: Gemini AI analysis
- No paid API dependencies

### API
- `POST /api/v1/seo-studio/keywords` — accepts `{ query: string }`, returns `{ suggestions, questions, autocomplete, longTail }`
- Deducts 1 credit
- Caches results in `seo_keyword_cache` table (24hr TTL by query hash)

## 2. Content Tab (Public)

### UI — Calendar View
- Monthly grid showing planned/drafted posts
- Post cards: title, target keyword, status (Draft/Scheduled/Published), date
- Click to edit/preview

### UI — New Post Flow
- Form: target keyword, topic/angle (optional), target tool (dropdown, optional), schedule date
- "Generate Draft" button (2 credits)
- AI generates: SEO title, meta description (150-160 chars), body (800-1200 words with H2/H3), suggested internal links

### Integration
- Drafts saved to existing `blog_posts` table with status `draft`
- "Publish" triggers VBlog's publishing flow
- No duplicate blog system

### Database
- `seo_content_plans` table: id, user_id, keyword, topic, tool_slug, scheduled_date, status (planned/generating/draft/published), draft_content (JSONB), created_at, updated_at

### API
- `POST /api/v1/seo-studio/content/generate` — accepts `{ keyword, topic?, toolSlug? }`, returns draft content, deducts 2 credits
- `GET /api/v1/seo-studio/content/plans` — list user's content plans
- `POST /api/v1/seo-studio/content/plans` — create/update content plan
- `POST /api/v1/seo-studio/content/publish` — push draft to blog_posts table

## 3. Audit Tab (Admin Only)

### UI
- "Run Full Audit" button — scans all tool pages
- Progress bar (1/33, 2/33...)
- Last scan timestamp

### Results Dashboard
- Overall score: 0-100 (red < 50, amber 50-79, green 80+)
- Issues grouped by severity:
  - Critical (red): missing title, missing meta description, no H1, missing structured data
  - Warning (amber): title too long/short, description too long/short, missing alt text, no canonical URL
  - Info (blue): suggestions (add FAQ schema, more internal links)

### Per-Tool Detail
- Click tool → specific issues with current value + recommended fix
- "Auto-fix" button for simple fixes (meta tags, structured data)

### Scan Logic (Server-Side)
- Fetch each `/tools/{slug}` page HTML via internal fetch
- Parse with regex/cheerio: `<title>`, `<meta name="description">`, `<h1>`, `<h2>` count, `<img>` alt, `<link rel="canonical">`, JSON-LD, OpenGraph
- Compare against rules:
  - Title: 50-60 chars
  - Description: 150-160 chars
  - Exactly one H1
  - All images have alt text
  - Canonical URL present
  - JSON-LD structured data present
  - OpenGraph tags present

### Database
- `seo_audit_results` table: id, scanned_at, results (JSONB — array of per-tool results), overall_score

### API
- `POST /api/v1/seo-studio/audit/scan` — admin only, triggers full scan, returns results
- `GET /api/v1/seo-studio/audit/latest` — admin only, returns most recent scan results

## 4. Pages Tab (Admin Only)

### UI — Page List
- Table: URL, target keyword, status (Draft/Live), created date
- Click to edit/preview

### UI — Generate New Page
- Form: target tool (dropdown), target keyword, page type (`use-case` or `free-tool`)
- "Generate" button (3 credits)
- AI produces:
  - SEO title + meta description
  - Hero headline + subheadline
  - 3-4 benefit sections
  - FAQ section (4-6 questions)
  - CTA linking to actual tool
  - JSON-LD (FAQPage + SoftwareApplication schemas)

### Output
- Content stored in `seo_landing_pages` table
- Rendered via existing `/use-cases/[slug]` or `/free/[slug]` dynamic routes
- ISR with `revalidate: 86400`

### Bulk Generation
- "Generate for all tools" button — queues pages for tools without one
- Background cron worker processes queue

### Database
- `seo_landing_pages` table: id, tool_slug, keyword, page_type ('use-case' | 'free-tool'), slug, title, meta_description, content (JSONB), structured_data (JSONB), status ('draft' | 'live'), created_at, updated_at

### API
- `POST /api/v1/seo-studio/pages/generate` — admin only, generates one page, deducts 3 credits
- `GET /api/v1/seo-studio/pages` — admin only, list generated pages
- `PATCH /api/v1/seo-studio/pages/:id` — admin only, update page content/status
- `POST /api/v1/seo-studio/pages/bulk` — admin only, queue bulk generation

## File Structure

### Frontend
| File | Responsibility |
|---|---|
| `app/tools/seo-studio/page.tsx` | Keywords tab (default) |
| `app/tools/seo-studio/layout.tsx` | ToolFrame wrapper with tabs |
| `app/tools/seo-studio/content/page.tsx` | Content calendar tab |
| `app/tools/seo-studio/audit/page.tsx` | SEO audit tab (admin) |
| `app/tools/seo-studio/pages/page.tsx` | Landing pages tab (admin) |
| `tools/seo-studio/keyword-research.tsx` | Keyword research UI |
| `tools/seo-studio/content-calendar.tsx` | Calendar grid + post editor |
| `tools/seo-studio/audit-dashboard.tsx` | Audit results display |
| `tools/seo-studio/page-generator.tsx` | Landing page generator UI |
| `tools/seo-studio/types.ts` | Shared types |
| `tools/seo-studio/admin-gate.tsx` | Admin access check wrapper |

### API Routes
| Route | Method | Auth | Credits |
|---|---|---|---|
| `/api/v1/seo-studio/keywords` | POST | Yes | 1 |
| `/api/v1/seo-studio/content/generate` | POST | Yes | 2 |
| `/api/v1/seo-studio/content/plans` | GET/POST | Yes | 0 |
| `/api/v1/seo-studio/content/publish` | POST | Yes | 0 |
| `/api/v1/seo-studio/audit/scan` | POST | Admin | 0 |
| `/api/v1/seo-studio/audit/latest` | GET | Admin | 0 |
| `/api/v1/seo-studio/pages/generate` | POST | Admin | 3 |
| `/api/v1/seo-studio/pages` | GET/PATCH | Admin | 0 |
| `/api/v1/seo-studio/pages/bulk` | POST | Admin | 0 |

### Database Tables
- `seo_keyword_cache` — query hash, results JSONB, cached_at
- `seo_content_plans` — content calendar entries
- `seo_audit_results` — audit scan results
- `seo_landing_pages` — generated landing page content

## Credit Model

| Action | Credits |
|---|---|
| Keyword research | 1 |
| Content draft generation | 2 |
| Landing page generation | 3 |
| Audit scan | 0 (admin) |
| Viewing/editing | 0 |

## Admin Detection

For MVP: check if user email matches a hardcoded admin list (e.g. `ADMIN_EMAILS` env var). No role system needed initially.

## Out of Scope

- Social media content generation (Phase 2)
- Referral/viral system (Phase 3)
- Analytics dashboard (Phase 4)
- Paid keyword API integrations
- Competitor analysis
- Backlink tracking

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Hybrid access (public + admin) | All public; all admin | Keywords & content add user value; audit & pages are internal |
| 2 | Google Autocomplete + Gemini | Paid APIs | Free, no keys needed, directional data sufficient |
| 3 | Integrate with VBlog | Separate blog | No duplication |
| 4 | Existing route patterns | New routes | `/use-cases/` and `/free/` already work with ISR |
| 5 | Server-side HTML parsing | Lighthouse | Simpler, faster |
| 6 | Credit-based generation | Free/subscription | Consistent with platform |
| 7 | ToolFrame with tabs | Custom layout | Consistent layout system |
