# SEO Automation & Google Crawling Design

**Goal:** Ensure Google crawls all Toolk1t pages, expand search surface with automated content, and keep the site fresh with zero manual effort.

**Architecture:** ISR pages + Vercel Cron Jobs + Supabase for blog storage + Google Indexing API for automated crawl requests.

**Tech Stack:** Next.js 16 ISR, Vercel Cron, Supabase, Google Indexing API, JSON-LD structured data.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Vercel Cron Jobs                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Daily 2am    │  │ Weekly Mon   │  │ Daily 4am  │ │
│  │ Refresh stats│  │ Generate post│  │ Ping Google│ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
└─────────┼──────────────────┼────────────────┼───────┘
          │                  │                │
          ▼                  ▼                ▼
┌─────────────────┐  ┌──────────────┐  ┌───────────────┐
│  Supabase       │  │ Supabase     │  │ Google APIs   │
│  page_events    │  │ blog_posts   │  │ - Indexing API │
│  (read stats)   │  │ (store posts)│  │ - Sitemap Ping │
└─────────────────┘  └──────────────┘  └───────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              Next.js ISR Pages                       │
│  /blog/*          → revalidate: 3600 (1hr)          │
│  /free/*          → revalidate: 86400 (24hr)        │
│  /use-cases/*     → revalidate: 86400 (24hr)        │
│  /sitemap.xml     → regenerated with all URLs        │
└─────────────────────────────────────────────────────┘
```

### Three New Route Groups
- `/blog/` — Data-driven weekly posts (e.g., "Top Tools This Week")
- `/free/` — Keyword variation landing pages (e.g., `/free/json-formatter-online`)
- `/use-cases/` — Use-case pages (e.g., `/use-cases/compress-pdf-for-email`)

### Three Cron Jobs
1. **Daily (2am UTC)** — Aggregate analytics stats, cache in Supabase
2. **Weekly (Monday 3am UTC)** — Generate blog post from analytics data
3. **Daily (4am UTC)** — Ping Google Indexing API with new/updated URLs

---

## 2. SEO Landing Pages

### Keyword Variation Pages (`/free/*`)

Each maps to an existing tool with pre-set context:

| Landing Page | Target Tool | Search Intent |
|---|---|---|
| `/free/json-formatter-online` | json-converter (format) | "json formatter online" |
| `/free/json-to-csv-converter` | json-converter (csv) | "json to csv converter" |
| `/free/yaml-to-json-converter` | json-converter (yaml) | "yaml to json" |
| `/free/online-ip-lookup` | ipcheck | "ip lookup tool" |
| `/free/what-is-my-ip-address` | myip | "what is my ip" |
| `/free/internet-speed-test` | speedtest | "internet speed test" |
| `/free/passport-photo-maker` | id-photo | "passport photo maker" |
| `/free/pdf-to-png-converter` | pdf-converter | "pdf to png" |
| `/free/merge-pdf-online` | pdf-converter (merge) | "merge pdf online" |
| `/free/image-filter-editor` | image-editor | "image filter editor" |
| `/free/png-to-svg-converter` | svg-converter | "png to svg" |
| `/free/usd-to-eur-converter` | currency-exchange | "usd to eur" |
| `/free/business-ecard-maker` | ecard-studio | "business ecard maker" |
| `/free/reaction-time-test` | human-benchmark | "reaction time test" |
| `/free/swagger-api-editor` | swagger-editor | "swagger editor online" |

### Use-Case Pages (`/use-cases/*`)

| Use-Case Page | Target Tool |
|---|---|
| `/use-cases/prepare-visa-photo` | ID Photo |
| `/use-cases/format-api-response` | JSON Converter |
| `/use-cases/compress-pdf-for-email` | PDF Converter |
| `/use-cases/check-vpn-working` | My IP |
| `/use-cases/test-wifi-speed` | Speed Test |
| `/use-cases/design-thank-you-card` | ECard Studio |
| `/use-cases/convert-excel-to-json` | JSON Converter |
| `/use-cases/debug-openapi-spec` | Swagger Editor |
| `/use-cases/remove-image-background` | Image Editor |
| `/use-cases/vectorize-logo` | SVG Converter |

### Shared Page Template Structure

```
H1: Page title (primary keyword)
Description paragraph (SEO copy, ~150 words)

CTA: "Try it now →" (links to actual tool)

H2: "How to [do the thing]"
Step-by-step instructions (3-5 steps)

H2: "Why use this tool?"
Feature bullets (4-6 points)

H2: "Related tools"
Internal links to 3-4 related tools

JSON-LD: WebApplication + BreadcrumbList + FAQPage schemas
```

All pages are server components with ISR (`revalidate: 86400`). Content defined in config files.

---

## 3. Data-Driven Blog Posts

### Supabase Table

```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL,
  post_type TEXT NOT NULL,     -- 'weekly-roundup' | 'trending' | 'tool-spotlight'
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Auto-Generated Post Types

| Type | Frequency | Example Title | Data Source |
|------|-----------|---------------|-------------|
| Weekly Roundup | Every Monday | "Toolk1t Weekly: Feb 24-Mar 2, 2026" | page_events aggregated |
| Trending Tools | When tool spikes 2x+ | "JSON Converter usage surges" | page_events comparison |
| Tool Spotlight | Every 2 weeks (rotating) | "5 ways to use PDF Converter" | Static templates + stats |

### Content Generation Flow

```
Weekly Cron (Monday 3am UTC)
    │
    ▼
POST /api/cron/generate-blog
    │
    ├── Query page_events: top 5 tools, total views,
    │   unique visitors, avg duration (last 7 days)
    │
    ├── Compare with previous week (growth %)
    │
    ├── Build structured content:
    │   {
    │     hero_stat: "1,234 tool uses this week",
    │     top_tools: [{name, views, change%}],
    │     highlight: "Currency Exchange up 45%",
    │     weekly_visitors: 567,
    │   }
    │
    ├── Insert into blog_posts table
    │
    └── Ping Google Indexing API with new URL
```

### Blog Page Template

```
/blog                             → Listing (paginated, ISR 1hr)
/blog/weekly-feb-24-mar-2-2026    → Individual post (ISR 1hr)

H1: "Toolk1t Weekly: Feb 24-Mar 2"
Published: Mar 3, 2026

H2: "This Week's Highlights"
  - 1,234 tool uses (+12%)
  - 567 unique visitors

H2: "Top 5 Tools"
  1. JSON Converter — 342 uses
  2. PDF Converter — 256 uses
  (with bar chart visual)

H2: "Trending"
  Currency Exchange up 45%

H2: "Try These Tools"
  CTA links to top tools

JSON-LD: Article + BlogPosting schema
```

---

## 4. Google Crawling & Indexing Automation

### Layer 1: Technical SEO Fixes

| Fix | What |
|-----|------|
| Twitter cards | `twitter: { card: 'summary_large_image' }` to root layout |
| Contact page metadata | Title, description, canonical, OG |
| Privacy/Terms canonicals | Add `alternates.canonical` |
| Tools listing H1 | Add `<h1>` to `/tools/page.tsx` |
| Search Console verification | `google-site-verification` meta tag |

### Layer 2: Enhanced Dynamic Sitemap

```
Priority 1.0  — / (homepage)
Priority 0.9  — /tools
Priority 0.8  — /tools/* (12 tool pages)
Priority 0.7  — /free/* (~15 keyword pages)
Priority 0.7  — /use-cases/* (~10 use-case pages)
Priority 0.6  — /blog/* (fetched from Supabase)
Priority 0.3  — /contact, /terms, /privacy
```

### Layer 3: Google Indexing API

```
Daily Cron (4am UTC)
    │
    ▼
POST /api/cron/ping-google
    │
    ├── Fetch blog_posts published in last 24h
    ├── Combine with static URLs
    ├── POST https://indexing.googleapis.com/v3/urlNotifications:publish
    │   { "url": "...", "type": "URL_UPDATED" }
    └── GET https://www.google.com/ping?sitemap=https://toolk1t.app/sitemap.xml
```

### Vercel Cron Config (vercel.json)

```json
{
  "crons": [
    { "path": "/api/cron/aggregate-stats", "schedule": "0 2 * * *" },
    { "path": "/api/cron/generate-blog", "schedule": "0 3 * * 1" },
    { "path": "/api/cron/ping-google", "schedule": "0 4 * * *" }
  ]
}
```

---

## 5. Security & Cron Auth

All `/api/cron/*` routes verify Vercel's `CRON_SECRET`:

```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 })
}
```

---

## 6. File Structure

```
app/
├── api/cron/
│   ├── aggregate-stats/route.ts
│   ├── generate-blog/route.ts
│   └── ping-google/route.ts
├── blog/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── free/
│   └── [slug]/page.tsx
├── use-cases/
│   └── [slug]/page.tsx
├── sitemap.ts                   (updated)
└── robots.ts                    (no changes)
lib/
├── seo/
│   ├── landing-pages.ts
│   ├── use-cases.ts
│   ├── schemas.ts
│   └── google-indexing.ts
├── blog/
│   ├── generator.ts
│   └── templates.ts
supabase/migrations/
│   └── 002_blog_posts.sql
vercel.json                      (new)
```

### New Vercel Environment Variables

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Auto-set by Vercel |
| `GOOGLE_INDEXING_KEY` | Service account JSON |
| `GOOGLE_SITE_VERIFICATION` | Search Console code |

---

## 7. Automated vs Manual

| Task | Automated | Manual (one-time) |
|------|-----------|-------------------|
| Weekly blog posts | Cron Monday 3am | - |
| Analytics aggregation | Cron daily 2am | - |
| Google ping | Cron daily 4am | - |
| Sitemap updates | Auto-includes new posts | - |
| SEO landing pages | ISR serves & revalidates | Define in config |
| Google Search Console | - | Verify site, add service account |
| Google Cloud setup | - | Create project, enable API |
| New landing page | - | Add entry to config file |

### Expected SEO Impact

- ~15 keyword pages targeting long-tail searches
- ~10 use-case pages targeting problem-based queries
- Weekly blog posts → fresh content signal (52 posts/year)
- Daily Google pings → faster indexing
- Enhanced sitemap → ~40+ URLs vs current 17
