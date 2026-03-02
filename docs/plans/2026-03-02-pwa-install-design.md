# PWA / Add to Home Screen — Design

## Overview

Add full Progressive Web App support to Toolk1t so users can install it as a mobile home screen shortcut app with offline capabilities.

## Approach

**Serwist** (successor to next-pwa) — provides a Next.js plugin that auto-generates a service worker at build time using Workbox under the hood. Handles precaching, runtime caching strategies, and cache versioning.

## Web App Manifest

Next.js `app/manifest.ts` auto-generates the `<link rel="manifest">` tag.

- **name**: "Toolk1t - Free Online Tools"
- **short_name**: "Toolk1t"
- **display**: standalone (no browser chrome)
- **background_color**: `#0a0a0a` (dark theme)
- **theme_color**: `#3D6AF2` (brand primary blue)
- **Icons**: Reuse existing `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` from `public/`

## Service Worker Caching Strategy

| Strategy | What | Rationale |
|---|---|---|
| Precache | App shell (layout, nav, footer CSS/JS) | Instant load on revisit |
| StaleWhileRevalidate | Client-side tool pages (HB, JSON, SVG, Image Editor, eCard, PDF, Swagger) | Serve from cache, update in background |
| NetworkFirst | API-dependent pages (IP Check, MyIP, Speed Test, Currency Exchange) | Try network first, fall back to cache |
| CacheFirst | Static assets (icons, images) | Long-lived, rarely changes |

**Cache size limit**: 100MB max with LRU eviction for runtime caches.

## Offline Classification

**Fully offline** (7 tools):
- Human Benchmark (all 28 tests)
- JSON Converter
- SVG Converter
- Image Editor
- eCard Studio
- PDF Converter
- Swagger Editor

**Online required** (5 tools):
- IP Check, MyIP, Speed Test, Currency Exchange, ID Photo

**Offline fallback page** (`/offline`) shows when network-required tools are accessed offline, with links to the 7 tools that work offline.

## Install Prompt Banner

- Listens for `beforeinstallprompt` event
- Bottom toast/banner: "Install Toolk1t for quick access" + Install button + dismiss X
- On dismiss: `localStorage` flag, don't show again for 30 days
- Auto-hides in standalone mode
- Dark glass card, brand blue button, 44px touch targets

## Files

| Component | File(s) | Action |
|---|---|---|
| Manifest | `app/manifest.ts` | Create |
| Serwist plugin | `next.config.ts` | Modify |
| Service worker | `app/sw.ts` | Create |
| Offline page | `app/offline/page.tsx` | Create |
| Install banner | `components/layout/install-prompt.tsx` | Create |
| Layout wiring | `app/layout.tsx` | Modify (add InstallPrompt + theme-color) |

**New dependency:** `@serwist/next` + `serwist`

No changes to existing tool implementations — purely additive infrastructure.
