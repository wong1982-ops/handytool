# Design: SEO & Sitemap Gap Fixes

**Date**: 2026-02-24
**Status**: Approved
**Scope**: Fix existing SEO gaps — no new capabilities

---

## Problem

The current SEO setup has 4 gaps:

1. **Static sitemap** — `app/sitemap.ts` has a hardcoded tool list. Adding a new tool requires editing sitemap.ts separately from `lib/tools.tsx`.
2. **Missing pages in sitemap** — `/contact`, `/terms`, `/privacy` are public pages not included in the sitemap. ecard-studio and human-benchmark are also missing from the sitemap tool list.
3. **ecard-studio missing SEO** — No `layout.tsx` with metadata or JSON-LD structured data.
4. **Thin root metadata** — `app/layout.tsx` has "Toolk1t - Free online tools" with no title template, no Organization schema, no metadataBase.

## Changes

### 1. Dynamic Sitemap (`app/sitemap.ts`)

**Current**: Hardcoded array of 10 tool slugs.

**New**: Import from `lib/tools.tsx` and add static pages.

```typescript
import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toolk1t.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Home
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    // Tools index
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // All tools — dynamic from lib/tools.tsx
    ...tools.map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Static pages
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
```

**Note**: All tools get uniform priority 0.8. No per-tool priority overrides — keeps it simple and maintainable. The `href` field from `lib/tools.tsx` is the single source of truth for URLs.

### 2. ecard-studio SEO (`app/tools/ecard-studio/layout.tsx`)

Create a new layout file following the exact pattern used by other tools (e.g., `human-benchmark/layout.tsx`):

- **Metadata**: title, description, canonical, Open Graph
- **JSON-LD**: WebApplication schema + BreadcrumbList schema
- **Title**: "ECard Studio - Design Professional E-Cards | Toolk1t"
- **Description**: "Design and customize professional e-cards for business occasions. Choose templates, personalize messages, and download instantly. Free online tool."
- **applicationCategory**: "DesignApplication"

### 3. Root Layout Metadata (`app/layout.tsx`)

**Current**:
```typescript
export const metadata: Metadata = {
  title: "Toolk1t",
  description: "Toolk1t - Free online tools",
};
```

**New**:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://toolk1t.app"),
  title: {
    default: "Toolk1t - Free Online Tools",
    template: "%s | Toolk1t",
  },
  description: "Free online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
  openGraph: {
    type: "website",
    siteName: "Toolk1t",
  },
};
```

Add Organization JSON-LD to the root layout body:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Toolk1t",
  "url": "https://toolk1t.app",
  "description": "Free online tools for developers and creators"
}
```

**Title template effect**: Child pages with `title: "IP Check - Look Up Any IP"` will render as "IP Check - Look Up Any IP | Toolk1t" in the browser tab. Pages that already set their own title via `metadata.title` in their layout.tsx will use that title with the template suffix.

### 4. No Changes

- `robots.ts` — already correct
- `manifest.ts` — already correct
- Existing tool layout.tsx files — no changes needed (they already have full SEO)
- No dynamic OG images, no sitemap index, no i18n

## Files Changed

| File | Action |
|---|---|
| `app/sitemap.ts` | Rewrite — dynamic from lib/tools.tsx |
| `app/layout.tsx` | Edit — improve metadata, add Organization JSON-LD |
| `app/tools/ecard-studio/layout.tsx` | Create — full SEO setup |

## Verification

After implementation, verify:
- `curl localhost:3000/sitemap.xml` shows all tools + static pages
- ecard-studio page has correct meta tags in `<head>`
- Browser tab shows title template (e.g., "IP Check - ... | Toolk1t")
- `pnpm build` passes
