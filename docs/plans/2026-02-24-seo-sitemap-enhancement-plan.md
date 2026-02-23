# SEO & Sitemap Gap Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 4 SEO gaps — dynamic sitemap, ecard-studio SEO, root metadata, Organization schema.

**Architecture:** Rewrite sitemap.ts to import from lib/tools.tsx; create ecard-studio layout.tsx with metadata + JSON-LD; enhance root layout metadata with title template and Organization schema.

**Tech Stack:** Next.js 16 App Router, TypeScript, Schema.org JSON-LD

**Design doc:** `docs/plans/2026-02-24-seo-sitemap-enhancement-design.md`

---

### Task 1: Dynamic Sitemap

**Files:**
- Modify: `app/sitemap.ts`

**Step 1: Rewrite sitemap.ts**

Replace the entire file with:

```typescript
import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toolk1t.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...tools.map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
```

**Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds. If `lib/tools.tsx` has JSX (SVG icons), Next.js may complain about importing a client-side module in a server context. The `tools` array export is plain data with JSX `icon` fields — sitemap.ts only uses `href`, so the import should be fine. If it fails, extract a `toolSlugs` array from `lib/tools.tsx` that contains only `{ name, href }` without JSX.

**Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "fix(seo): make sitemap dynamic from lib/tools.tsx, add static pages"
```

---

### Task 2: ecard-studio SEO Layout

**Files:**
- Create: `app/tools/ecard-studio/layout.tsx`

**Step 1: Create the layout file**

Create `app/tools/ecard-studio/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECard Studio - Design Professional E-Cards',
  description:
    'Design and customize professional e-cards for business occasions. Choose templates, personalize messages, and download instantly. Free online tool.',
  alternates: { canonical: '/tools/ecard-studio' },
  openGraph: {
    title: 'ECard Studio | Toolk1t',
    description:
      'Design professional e-cards for business occasions. Free online tool.',
    url: '/tools/ecard-studio',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ECard Studio',
    description:
      'Design and customize professional e-cards for business occasions. Choose templates, personalize messages, and download instantly.',
    url: 'https://toolk1t.app/tools/ecard-studio',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Toolk1t',
      url: 'https://toolk1t.app',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toolk1t.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://toolk1t.app/tools',
      },
      { '@type': 'ListItem', position: 3, name: 'ECard Studio' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
```

**Step 2: Verify build passes**

Run: `pnpm build`
Expected: PASS — ecard-studio page still renders, now with metadata in `<head>`.

**Step 3: Commit**

```bash
git add app/tools/ecard-studio/layout.tsx
git commit -m "fix(seo): add metadata and JSON-LD for ecard-studio"
```

---

### Task 3: Root Layout Metadata + Organization Schema

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update metadata export**

In `app/layout.tsx`, replace the metadata export:

```typescript
// OLD:
export const metadata: Metadata = {
  title: "Toolk1t",
  description: "Toolk1t - Free online tools",
};

// NEW:
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toolk1t.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toolk1t - Free Online Tools",
    template: "%s | Toolk1t",
  },
  description:
    "Free online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
  openGraph: {
    type: "website",
    siteName: "Toolk1t",
  },
};
```

**Step 2: Add Organization JSON-LD**

Add a `const organizationJsonLd` before the `RootLayout` function, and render the `<script>` tag as the first child inside `<body>`:

```typescript
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toolk1t",
  url: SITE_URL,
  description: "Free online tools for developers and creators",
};
```

Inside `<body>`, add before `<Header>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
/>
```

**Step 3: Verify build passes**

Run: `pnpm build`
Expected: PASS. Check that child pages now get the title template suffix (e.g., "IP Check - ... | Toolk1t").

**Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(seo): improve root metadata with title template and Organization schema"
```

---

### Task 4: Verify with webapp-testing

**Step 1: Start dev server if not running**

Run: `pnpm dev`

**Step 2: Use webapp-testing skill to verify**

Use the `webapp-testing` skill to:

1. Navigate to `http://localhost:3000/sitemap.xml` — confirm all 12 tools + 3 static pages are listed
2. Navigate to `http://localhost:3000/tools/ecard-studio` — take snapshot, verify page renders
3. Check page source for `<script type="application/ld+json">` on ecard-studio page
4. Navigate to `http://localhost:3000/tools/ipcheck` — verify browser tab title includes "| Toolk1t"

**Step 3: Final commit if any fixes needed**

---

## Dependency Graph

```
Task 1 (sitemap) ──┐
Task 2 (ecard)  ───┤── Task 4 (verify)
Task 3 (root)   ───┘
```

Tasks 1, 2, 3 are independent and can run in parallel. Task 4 depends on all three.

## Summary

| # | Task | Files |
|---|---|---|
| 1 | Dynamic sitemap from lib/tools.tsx | `app/sitemap.ts` |
| 2 | ecard-studio SEO layout | `app/tools/ecard-studio/layout.tsx` (new) |
| 3 | Root metadata + Organization schema | `app/layout.tsx` |
| 4 | Verify with webapp-testing | — |
