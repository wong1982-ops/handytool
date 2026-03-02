# PWA / Add to Home Screen — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full PWA support (manifest, service worker, offline caching, install prompt) so Toolk1t can be installed as a mobile home screen app with offline capabilities.

**Architecture:** Serwist generates a service worker at build time via webpack plugin. The manifest is created via Next.js `app/manifest.ts`. A custom install prompt banner intercepts `beforeinstallprompt`. An offline fallback page shows for network-dependent tools.

**Tech Stack:** Serwist (`@serwist/next` + `serwist`), Next.js 16 App Router, TypeScript

---

### Task 1: Install Serwist and update build config

**Files:**
- Modify: `package.json` (scripts section)
- Modify: `next.config.ts`
- Modify: `tsconfig.json`
- Gitignore: `public/sw.js`, `public/sw.js.map`

**Step 1: Install Serwist packages**

```bash
pnpm add @serwist/next && pnpm add -D serwist
```

**Step 2: Update build script for webpack**

Serwist's SW generation requires webpack. Dev can stay on Turbopack.

In `package.json`, change the `"build"` script:

```json
"build": "next build --webpack"
```

Leave `"dev": "next dev"` unchanged (Turbopack is fine for dev — SW is only generated at build time).

**Step 3: Wrap next.config.ts with withSerwist**

```ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdfjs-dist",
    "exceljs",
    "docx",
    "jspdf",
    "jszip",
    "@neplex/vectorizer",
    "nodemailer",
  ],
  experimental: {
    optimizePackageImports: [
      "@wong1982-ops/toolk1t-ui",
      "react-leaflet",
      "leaflet",
    ],
  },
};

export default withSerwist(nextConfig);
```

**Step 4: Update tsconfig.json**

Add `"@serwist/next/typings"` to `compilerOptions.types` and `"webworker"` to `compilerOptions.lib`. Add `"public/sw.js"` to `exclude`.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "types": ["@serwist/next/typings"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules", "admin", "ui", "public/sw.js"]
}
```

**Step 5: Add generated SW to .gitignore**

Append to `.gitignore`:
```
# Serwist generated service worker
public/sw.js
public/sw.js.map
```

**Step 6: Verify build**

```bash
pnpm build
```

Expected: Build succeeds. `public/sw.js` is generated. Console shows Serwist precache manifest entries.

**Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json .gitignore
git commit -m "feat(pwa): install Serwist and configure build"
```

---

### Task 2: Create Web App Manifest

**Files:**
- Create: `app/manifest.ts`

**Step 1: Create manifest.ts**

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Toolk1t - Free Online Tools',
    short_name: 'Toolk1t',
    description: 'Free online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#3D6AF2',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
```

**Step 2: Verify manifest is served**

```bash
pnpm build && pnpm start
```

Then check `http://localhost:3000/manifest.webmanifest` returns valid JSON with the correct fields.

**Step 3: Commit**

```bash
git add app/manifest.ts
git commit -m "feat(pwa): add web app manifest with icons"
```

---

### Task 3: Create Service Worker

**Files:**
- Create: `app/sw.ts`

**Step 1: Create the service worker entry**

```ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

**Step 2: Verify build generates SW with precache manifest**

```bash
pnpm build
```

Expected: Build succeeds. `public/sw.js` contains precache entries for app shell assets.

**Step 3: Commit**

```bash
git add app/sw.ts
git commit -m "feat(pwa): add service worker with precaching and offline fallback"
```

---

### Task 4: Create Offline Fallback Page

**Files:**
- Create: `app/offline/page.tsx`

**Step 1: Create the offline page**

This page is shown when a user navigates to a network-dependent page while offline. It lists the tools that work offline.

```tsx
'use client'

const OFFLINE_TOOLS = [
  { name: 'Human Benchmark', href: '/tools/human-benchmark', description: '28 cognitive tests' },
  { name: 'JSON Converter', href: '/tools/json-converter', description: 'Convert between JSON formats' },
  { name: 'SVG Converter', href: '/tools/svg-converter', description: 'Convert SVG to other formats' },
  { name: 'Image Editor', href: '/tools/image-editor', description: 'Edit and filter images' },
  { name: 'eCard Studio', href: '/tools/ecard-studio', description: 'Create digital cards' },
  { name: 'PDF Converter', href: '/tools/pdf-converter', description: 'Convert documents to PDF' },
  { name: 'Swagger Editor', href: '/tools/swagger-editor', description: 'Edit OpenAPI specs' },
]

export default function OfflinePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold text-white">You&apos;re Offline</h1>
        <p className="text-gray-400">
          This page requires an internet connection. But these tools work offline:
        </p>
        <div className="space-y-2 text-left">
          {OFFLINE_TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="font-medium text-white">{tool.name}</div>
              <div className="text-sm text-gray-400">{tool.description}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
```

**Step 2: Verify the page renders**

```bash
pnpm dev
```

Visit `http://localhost:3000/offline` — should show the offline page with 7 tool links.

**Step 3: Commit**

```bash
git add app/offline/page.tsx
git commit -m "feat(pwa): add offline fallback page with available tools list"
```

---

### Task 5: Create Install Prompt Banner

**Files:**
- Create: `components/layout/install-prompt.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create the install prompt component**

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'toolk1t-install-dismissed'
const DISMISS_DAYS = 30

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setDeferredPrompt(null)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom fade-in duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-gray-900/90 backdrop-blur-lg p-4 shadow-2xl">
        <img src="/icon-192.png" alt="Toolk1t" className="h-10 w-10 rounded-lg" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm">Install Toolk1t</p>
          <p className="text-xs text-gray-400 truncate">Quick access from your home screen</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-[#3D6AF2] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D79F2] transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss install prompt"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Wire into layout.tsx**

Add the import and render `<InstallPrompt />` alongside `<ProfilePrompt />`:

```tsx
import { InstallPrompt } from "@/components/layout/install-prompt";
```

And in the body, after `<ProfilePrompt />`:

```tsx
<InstallPrompt />
```

**Step 3: Verify**

```bash
pnpm dev
```

The banner won't appear in dev (no `beforeinstallprompt` event without HTTPS + manifest + SW). It will be tested in production build.

**Step 4: Commit**

```bash
git add components/layout/install-prompt.tsx app/layout.tsx
git commit -m "feat(pwa): add install prompt banner with 30-day dismiss"
```

---

### Task 6: Build verification and production test

**Step 1: Full production build**

```bash
pnpm build
```

Expected: Build succeeds with `--webpack` flag. `public/sw.js` is generated.

**Step 2: Start production server and verify**

```bash
pnpm start
```

Check:
- `http://localhost:3000/manifest.webmanifest` returns valid manifest JSON
- `http://localhost:3000/sw.js` returns the service worker
- `http://localhost:3000/offline` shows the offline fallback page
- Chrome DevTools > Application > Manifest shows correct info
- Chrome DevTools > Application > Service Workers shows SW registered

**Step 3: Browser test with Playwright**

Write a test script `/tmp/test-pwa.py`:

```python
"""Verify PWA setup: manifest, SW registration, offline page."""
from playwright.sync_api import sync_playwright
import json
import time

BASE_URL = "http://localhost:3000"

def test_manifest():
    """Check manifest is served with correct fields."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        response = page.goto(f"{BASE_URL}/manifest.webmanifest")
        assert response.status == 200, f"Manifest returned {response.status}"
        data = json.loads(page.content())
        # Next.js wraps in HTML, fetch via API instead
        browser.close()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # Check manifest link exists
        manifest_link = page.locator('link[rel="manifest"]')
        assert manifest_link.count() > 0, "No manifest link tag found"
        print("  [OK] Manifest link tag present")

        browser.close()

def test_service_worker():
    """Check SW is registered."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Check if SW is registered via JS
        sw_registered = page.evaluate("""
            async () => {
                const regs = await navigator.serviceWorker.getRegistrations();
                return regs.length > 0;
            }
        """)
        assert sw_registered, "No service worker registered"
        print("  [OK] Service worker registered")

        browser.close()

def test_offline_page():
    """Check offline page renders."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"{BASE_URL}/offline")
        page.wait_for_load_state("networkidle")

        page.screenshot(path="/tmp/pwa-offline-page.png")

        content = page.content()
        assert "offline" in content.lower(), "Offline text not found"
        assert "Human Benchmark" in content, "HB not listed"
        assert "JSON Converter" in content, "JSON Converter not listed"
        print("  [OK] Offline page renders with tool links")

        browser.close()

if __name__ == "__main__":
    print("=== PWA Verification ===\n")

    print("1. Manifest")
    test_manifest()

    print("\n2. Service Worker")
    test_service_worker()

    print("\n3. Offline Page")
    test_offline_page()

    print("\n=== ALL CHECKS PASSED ===")
```

Run:
```bash
python scripts/with_server.py --server "pnpm start" --port 3000 -- python /tmp/test-pwa.py
```

Expected: All 3 checks pass.

**Step 4: Commit (if any fixes needed)**

```bash
git commit -m "fix(pwa): address verification issues"
```
