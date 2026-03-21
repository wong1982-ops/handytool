# Homepage Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the homepage into a modern dark-themed landing page with interactive hero (rotating tool demos), bento grid showcase with glassmorphism cards, three-layer animated background, and unified sections for trending, all tools, blog, and CTA.

**Architecture:** Merge `/` and `/tools` into a single page. Remove redirect from `app/page.tsx`. New client components for hero (particle canvas, gradient mesh, floating icons, tool demo) and bento showcase. Restyle existing sections (trending, tools grid, blog) with glassmorphism. All animations respect prefers-reduced-motion and use IntersectionObserver for performance.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Canvas API (particles), CSS animations (gradient mesh, floating icons).

**Design doc:** `docs/plans/2026-03-22-homepage-redesign-design.md`

---

### Task 1: Animated Background Components

**Files:**
- Create: `components/home/gradient-mesh.tsx`
- Create: `components/home/particle-canvas.tsx`
- Create: `components/home/floating-icons.tsx`

**Step 1: Create gradient mesh background**

`'use client'` component. No props needed.

- Renders 3-4 `div` blobs with `radial-gradient`, positioned absolutely
- Each blob: ~40-60% width/height, blur-3xl, opacity 10-15%
- Colors: #3D6AF2 (blue), #8B5CF6 (purple), #32D9D9 (cyan), #EC4899 (pink)
- CSS `@keyframes` animation: each blob moves on a different path over 15-20s, infinite, ease-in-out
- Respects `prefers-reduced-motion`: check via `useEffect` + `matchMedia`, if reduced → no animation (static positions)
- Container: `absolute inset-0 overflow-hidden pointer-events-none`

**Step 2: Create particle canvas**

`'use client'` component. No props.

- Canvas element filling parent container
- On mount: create ~50 particles with random positions, slow velocity (0.2-0.5px/frame)
- Animation loop via `requestAnimationFrame`:
  - Move particles, wrap around edges
  - Draw as small dots (1.5-2px radius, white at 30% opacity)
  - On mouse move: find particles within 120px radius, draw connecting lines (white at 8% opacity)
- IntersectionObserver: pause animation when not visible
- `prefers-reduced-motion`: render static dots only (no animation)
- On mobile (check `window.innerWidth < 640` on mount): don't render at all (return null)
- Cleanup: cancel RAF on unmount

**Step 3: Create floating icons**

`'use client'` component. No props.

- 8-10 tool SVG icons (simplified versions — just simple shapes, not full icons from lib/tools)
- Each positioned with absolute + random top/left (spread across container)
- CSS animation: `translateY(-20px)` to `translateY(20px)` + slight `rotate(-5deg to 5deg)`, different `animation-duration` per icon (15-25s), infinite ease-in-out
- Opacity: 5-8% (barely visible, atmospheric)
- `prefers-reduced-motion`: static positions, no animation
- Container: `absolute inset-0 overflow-hidden pointer-events-none`

**Step 4: Commit**

```bash
git add components/home/gradient-mesh.tsx components/home/particle-canvas.tsx components/home/floating-icons.tsx
git commit -m "feat(homepage): add animated background components (gradient mesh, particles, floating icons)"
```

---

### Task 2: Interactive Tool Demo Component

**Files:**
- Create: `components/home/tool-demo.tsx`

**Step 1: Build the interactive tool demo**

`'use client'` component. This is the core interactive element in the hero.

**Tool definitions (inline data):**
```typescript
const DEMO_TOOLS = [
  { id: 'ipcheck', label: 'IP Check', placeholder: '192.168.1.1', href: '/tools/ipcheck',
    mockResult: (input: string) => input ? `📍 Melbourne, AU · ISP: Telstra · IPv4` : null },
  { id: 'regex-tester', label: 'Regex Tester', placeholder: '\\d{3}-\\d{4}', href: '/tools/regex-tester',
    mockResult: (input: string) => input ? `✓ 3 matches found` : null },
  { id: 'json-converter', label: 'JSON Converter', placeholder: '{"name": "test"}', href: '/tools/json-converter',
    mockResult: (input: string) => { try { JSON.parse(input); return '✓ Valid JSON · 1 key' } catch { return '✗ Invalid JSON' } } },
  { id: 'currency-exchange', label: 'Currency Exchange', placeholder: '100 USD', href: '/tools/currency-exchange',
    mockResult: (input: string) => input ? `💱 100 USD ≈ 153.20 AUD` : null },
  { id: 'color-palette', label: 'Color Palette', placeholder: '#3D6AF2', href: '/tools/color-palette',
    mockResult: (input: string) => input?.startsWith('#') ? `🎨 Complementary: ${input} ↔ #F2993D` : null },
]
```

**State:**
- `activeIndex` — current tool (auto-increments every 5s, pauses on hover/focus)
- `inputValue` — user's input
- `showResult` — whether to show mock result

**UI layout:**
```
Try  [ IP Check ▾ ]  —  [ 192.168.1.1        ] [ → Go ]

     ┌──────────────────────────────────┐
     │  📍 Melbourne, AU · ISP: Telstra │
     └──────────────────────────────────┘
```

- Dropdown: styled `<select>` or custom dropdown with tool names
- Input: text input, placeholder changes per tool, border glow on focus
- Go button: small primary-colored button with arrow icon
- Result card: appears below with slide-up animation, glassmorphism style (`bg-white/10 backdrop-blur border-white/10 rounded-xl`)
- On tool switch (auto or manual): clear input + result, update placeholder

**Auto-rotation:** `useEffect` with `setInterval(5000)`. Clears on hover (track via `onMouseEnter`/`onMouseLeave` on the container) and on focus (any input/select focus).

**"Go" action:** Sets `showResult = true` with the mock result. On real usage, user would click through to the actual tool — "Go" also shows a small "Open tool →" link in the result card.

**Step 2: Commit**

```bash
git add components/home/tool-demo.tsx
git commit -m "feat(homepage): add interactive tool demo with auto-rotation and mock results"
```

---

### Task 3: Hero Section Component

**Files:**
- Create: `components/home/hero-section.tsx`

**Step 1: Build the hero section**

`'use client'` component. Composes the background layers + tool demo.

**Layout:**
```
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background layers */}
  <GradientMesh />
  <ParticleCanvas />
  <FloatingIcons />

  {/* Content */}
  <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
    {/* Title */}
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
      Free Online Tools,<br />
      <span className="bg-gradient-to-r from-[var(--tk-color-primary-400)] to-purple-400 bg-clip-text text-transparent">
        Supercharged.
      </span>
    </h1>
    <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
      Developer tools, image editors, converters, and more — all free, all in your browser.
    </p>

    {/* Tool demo */}
    <ToolDemo />

    {/* Scroll CTA */}
    <button className="mt-12 text-slate-500 hover:text-white transition-colors animate-bounce">
      <span className="text-sm">Explore All Tools</span>
      <svg>↓ chevron</svg>
    </button>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add components/home/hero-section.tsx
git commit -m "feat(homepage): add hero section composing backgrounds + tool demo"
```

---

### Task 4: Bento Grid Showcase

**Files:**
- Create: `components/home/bento-showcase.tsx`

**Step 1: Build the bento showcase**

`'use client'` component (needs hover interactions).

**CSS Grid layout:**
```css
Desktop (lg):
  grid-template-columns: repeat(4, 1fr)
  grid-template-rows: auto auto auto

  A: col-span-2 row-span-2 (Image Editor)
  B: col-span-1 row-span-1 (Regex Tester)
  C: col-span-1 row-span-1 (Favicon Generator)
  D: col-span-2 row-span-1 (Color Palette)
  E: col-span-1 row-span-1 (JSON Converter)
  F: col-span-1 row-span-1 (Speed Test)
  G: col-span-2 row-span-1 (Story Studio)

Tablet (md): 2 columns, all span-1
Mobile: 1 column
```

**Each bento card:**
```tsx
<Link href={tool.href} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden hover:scale-[1.02] hover:border-white/20 transition-all duration-300">
  {/* Hover glow effect */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-{toolColor}/10 to-transparent" />

  {/* Mini preview (CSS mockup) */}
  <div className="mb-4 h-32 lg:h-40 rounded-lg bg-white/5 overflow-hidden">
    {/* Tool-specific mini preview */}
  </div>

  {/* Label */}
  <h3 className="font-bold text-white">{name}</h3>
  <p className="text-sm text-slate-400 mt-1">{description}</p>
  <span className="text-xs text-primary-400 mt-2 inline-block">Try it →</span>
</Link>
```

**Mini-previews (inline, CSS-only — no separate components):**
- **Image Editor:** Dark canvas rect + 3 small slider bars + mini toolbar dots
- **Regex Tester:** Monospace text with highlighted spans (yellow bg)
- **Favicon Generator:** 2x2 grid of colored squares with rounded corners
- **Color Palette:** 5 horizontal color bars
- **JSON Converter:** 4-5 lines of monospace text with colored syntax (blue keys, green strings)
- **Speed Test:** Semicircle arc (SVG) with needle + "85 Mbps" text
- **Story Studio:** Book shape with sparkle icon + 2 text lines

Each preview is a small `<div>` composition — max 10-15 lines of JSX per preview. Decorative only.

**Section wrapper:** `<section className="py-20 px-4"><div className="max-w-6xl mx-auto">` with heading "Powerful Tools, Zero Cost".

**Step 2: Commit**

```bash
git add components/home/bento-showcase.tsx
git commit -m "feat(homepage): add bento grid showcase with glassmorphism cards and CSS previews"
```

---

### Task 5: CTA Banner Component

**Files:**
- Create: `components/home/cta-banner.tsx`

**Step 1: Build the CTA banner**

Server component (no interactivity needed).

Props: none.

```tsx
<section className="py-16 px-4">
  <div className="max-w-4xl mx-auto text-center rounded-2xl bg-gradient-to-r from-[var(--tk-color-primary-600)] to-purple-600 p-10 lg:p-14">
    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
      Start using Toolk1t — it's free
    </h2>
    <p className="text-white/70 mb-6 max-w-lg mx-auto">
      No sign-up required. Open any tool and start working instantly.
    </p>
    <a href="#all-tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors" style={{ minHeight: '44px' }}>
      Explore Tools
      <svg>→ arrow</svg>
    </a>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add components/home/cta-banner.tsx
git commit -m "feat(homepage): add CTA banner component"
```

---

### Task 6: Rewrite Homepage (Merge / and /tools)

**Files:**
- Modify: `app/page.tsx` — remove redirect, become the new homepage
- Modify: `app/tools/page.tsx` — rewrite with all sections

**Step 1: Update `app/page.tsx`**

Remove the redirect. Instead, import and render the same content as `/tools`:

```tsx
import ToolsPage from './tools/page'

export default function Home() {
  return <ToolsPage />
}
```

Or better: just re-export. But since `app/tools/page.tsx` uses `revalidate` and server data fetching, simplest is to make `/` render the tools page directly. Alternative: move all content to `app/page.tsx` and have `app/tools/page.tsx` redirect to `/`. Either way works.

**Recommended approach:** Keep content in `app/page.tsx`, make `app/tools/page.tsx` redirect to `/`. This way `/` is the canonical URL.

**Step 2: Rewrite `app/page.tsx` with all sections**

Server component with `revalidate = 3600`.

```tsx
import { HeroSection } from '@/components/home/hero-section'
import { BentoShowcase } from '@/components/home/bento-showcase'
import { CtaBanner } from '@/components/home/cta-banner'
// ... existing imports for trending, tools grid, blog

export default async function HomePage() {
  const trending = await getTrendingTools()
  // ... fetch blog posts

  return (
    <div className="bg-[#101922]">
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Bento Showcase */}
      <BentoShowcase />

      {/* Section 3: Trending (conditional) */}
      {trending.length > 0 && <TrendingSection trending={trending} />}

      {/* Section 4: All Tools */}
      <section id="all-tools" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2>All Tools</h2>
          {/* Glassmorphism tool cards grid */}
        </div>
      </section>

      {/* Section 5: Blog */}
      <LatestBlogPosts />

      {/* Section 6: CTA */}
      <CtaBanner />
    </div>
  )
}
```

Restyle existing tool cards and trending cards with glassmorphism:
- Cards: `bg-white/5 backdrop-blur border border-white/10 rounded-xl`
- Remove old white bg / slate-100 borders
- Keep all existing functionality (favorite button, links, descriptions)

**Step 3: Update `app/tools/page.tsx`**

Replace with redirect to `/`:
```tsx
import { redirect } from 'next/navigation'
export default function ToolsPage() { redirect('/') }
```

**Step 4: Run `pnpm build`**

Verify passes.

**Step 5: Commit**

```bash
git add app/page.tsx app/tools/page.tsx
git commit -m "feat(homepage): merge / and /tools into redesigned homepage with hero, bento, glassmorphism"
```

---

### Task 7: Build Verification & Deploy

**Step 1: Run full build**

```bash
pnpm build
```

**Step 2: Commit docs and push**

```bash
git add docs/plans/2026-03-22-homepage-redesign-design.md docs/plans/2026-03-22-homepage-redesign-plan.md
git commit -m "docs: add homepage redesign design and plan"
git push origin main
```
