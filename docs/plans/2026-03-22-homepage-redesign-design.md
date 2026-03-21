# Homepage Redesign — Design Document

**Date:** 2026-03-22
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** Redesign the homepage as a modern dark-themed landing page — interactive hero with rotating tool demos, visual bento grid showcase with glassmorphism cards, three-layer animated background, followed by trending, all tools grid, blog, and CTA
- **Why:** Current homepage is a plain tools listing — needs engaging, professional landing page to attract and retain users
- **Who:** New visitors via search/social + returning users
- **Key constraints:** Single `/` route merging homepage and tools listing. Dark theme. Mobile responsive. Lightweight animations (CSS/Canvas, no heavy libs). Respects prefers-reduced-motion.
- **Non-goals:** Not a rebrand. Not changing individual tool pages. Not adding new tools.

## Assumptions

- Server component page with client-side interactive sections
- Animated backgrounds use CSS + Canvas (no Three.js)
- Tool demo previews are lightweight CSS mockups
- Glassmorphism: backdrop-blur + semi-transparent borders
- Bento grid: CSS grid with mixed spans
- Animations pause off-screen (IntersectionObserver)
- Hero auto-rotates through 5 tools every 5s
- No particle canvas on mobile <640px

---

## Page Sections

### Section 1: Hero (100vh)

**Three-layer animated background:**
1. Gradient mesh: 3-4 radial-gradient blobs, animated position over 15-20s. Colors: #3D6AF2, #8B5CF6, #32D9D9 at 10-15% opacity on #101922
2. Particle dot grid: Canvas, ~50 dots drifting slowly, constellation lines on mouse proximity. Pauses off-screen. Skipped on mobile <640px.
3. Floating tool icons: 8-10 SVG icons at 5-8% opacity, CSS float animation (translateY + rotation), different speeds for depth

**Content (centered):**
```
"Free Online Tools,
 Supercharged."

[Try  [IP Check ▾]  —  input: [192.168.1.1]  [→ Go]]

[Explore All Tools ↓]
```

**Interactive demo:**
- Dropdown selector: IP Check, Regex Tester, JSON Converter, Currency Exchange, Color Palette
- Input field adapts to selected tool
- "Go" shows mini result preview (inline styled card ~200px)
- Auto-rotates every 5s, pauses on hover/focus
- Title: 4xl-6xl font-bold, subtitle: text-lg text-slate-400

### Section 2: Bento Grid Showcase

**Heading:** "Powerful Tools, Zero Cost" — centered, text gradient

**7 curated tools in CSS grid bento:**
- A (large): Image Editor — mini canvas + sliders mockup
- B (small): Regex Tester — pattern + highlights
- C (small): Favicon Generator — preview grid
- D (medium): Color Palette — 5-color swatch strip
- E (small): JSON Converter — formatted snippet
- F (small): Speed Test — gauge mockup
- G (medium): Story Studio — book cover + sparkle

**Card style:** `bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl`
**Hover:** `scale-[1.02]` + glow shadow + slight tilt (CSS perspective)
**Each card:** tool name, 1-line description, CSS mini-preview, "Try it →" link

### Section 3: Trending This Week

Existing implementation, restyled with glassmorphism cards. Full-width `max-w-6xl`. Conditional render (only when data available).

### Section 4: All Tools Grid

Existing grid, restyled: glassmorphism cards (`bg-white/5 backdrop-blur border-white/10`). 3-col desktop / 2-col tablet / 1-col mobile. `max-w-6xl`. Section heading: "All Tools".

### Section 5: Latest from Blog

Existing LatestBlogPosts, restyled with glassmorphism cards.

### Section 6: CTA Banner

Full-width gradient (primary → purple). "Start using Toolk1t — it's free" + "Explore Tools" button. Centered, rounded-2xl.

---

## Components

| File | Responsibility |
|---|---|
| `app/page.tsx` | Remove redirect, become the new homepage |
| `app/tools/page.tsx` | Rewrite with all sections |
| `components/home/hero-section.tsx` | Hero with interactive demo + animated bg |
| `components/home/particle-canvas.tsx` | Canvas particle dot grid |
| `components/home/gradient-mesh.tsx` | Animated gradient mesh background |
| `components/home/floating-icons.tsx` | Floating tool icon layer |
| `components/home/tool-demo.tsx` | Interactive tool selector + mini demo |
| `components/home/bento-showcase.tsx` | Bento grid with glassmorphism cards |
| `components/home/bento-previews/*.tsx` | Mini CSS preview for each featured tool |
| `components/home/cta-banner.tsx` | Bottom CTA banner |

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| prefers-reduced-motion | Disable all animations |
| No trending data | Skip section |
| No blog posts | Skip section |
| Mobile <640px | No particle canvas, stacked layout, smaller hero title |
| Hero demo fails | Static placeholder |
| SSR | Animations client-only (mounted check) |
| Scroll performance | will-change sparingly, IntersectionObserver |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | Rotating hero + user-selectable demo | Static; Search-first | Most engaging |
| 2 | Glassmorphism cards | Flat; Solid bg | Modern aesthetic |
| 3 | Bento grid (CSS grid, mixed sizes) | Uniform grid; Netflix rows | Visual interest |
| 4 | Merge / and /tools | Separate pages | Single experience |
| 5 | Three-layer animated bg | Single gradient; Three.js | Rich + lightweight |
| 6 | Canvas particles (custom) | tsparticles library | Small bundle |
| 7 | CSS mini-previews | Screenshots; Embeds | Lightweight, always current |
| 8 | No particles on mobile | Keep all | Performance |
| 9 | 7 curated bento tools | All tools; Random | Best visual impact |
| 10 | CTA banner at bottom | No CTA | Capture scroll-through users |
