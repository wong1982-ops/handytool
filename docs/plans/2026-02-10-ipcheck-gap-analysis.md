# IP Check Tool — Gap Analysis & Polish Plan

**Date:** 2026-02-10
**Design source:** `designs/ipcheck/screen.png`, `designs/ipcheck/code.html`
**Current implementation:** `handytool-client/app/tools/ipcheck/`

---

## Summary

The IP Check tool is functionally complete with all major sections built (hero card, info grid, location map, search bar, header, footer). This plan documents visual and functional gaps between the design and current implementation, prioritized by impact.

---

## Gap Inventory

### GAP-1: Font conflict (Geist vs Inter)

**Design:** Inter font family
**Current:** `globals.css` defines `--ht-font-family-sans: 'Inter'` and applies it to `body`, but `layout.tsx` loads Geist fonts and `@theme inline` maps `--font-sans` to Geist. These conflict.

**Fix:**
- Decide on one font: Inter (matches design) or Geist (Next.js default)
- If Inter: replace Geist imports in `layout.tsx` with Inter from `next/font/google`, update `@theme inline`
- If Geist: remove Inter references from `globals.css`

**Files:** `app/layout.tsx`, `app/globals.css`
**Effort:** Small

---

### GAP-2: Missing Sign In button in header

**Design:** Blue "Sign In" button in header (right side, after dark mode toggle)
**Current:** Only dark mode toggle, no Sign In button

**Fix:**
- Add a `SignInButton` or an optional `action` slot to the Header component
- Style: `bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20`

**Files:** `components/layout/header.tsx`
**Effort:** Small

---

### GAP-3: No mobile hamburger menu

**Design:** Nav links hidden on mobile (implied mobile menu needed)
**Current:** Nav links simply disappear on mobile via `hidden md:flex` with no alternative access

**Fix:**
- Add a hamburger toggle button visible on `md:hidden`
- Add a slide-down or slide-in mobile nav panel
- Include nav items + Sign In button in mobile panel

**Files:** `components/layout/header.tsx`
**Effort:** Medium

---

### GAP-4: InfoCard border inconsistency

**Design:** Info cards use `.glass` class → `border: 1px solid rgba(255, 255, 255, 0.3)` (light) / `rgba(255, 255, 255, 0.1)` (dark)
**Current:** InfoCard uses `border-slate-200 dark:border-slate-800` — opaque borders instead of translucent glass borders

**Fix:**
- Update InfoCard to use `border-white/30 dark:border-white/10` to match the glass aesthetic
- OR refactor InfoCard to use the `GlassCard` component internally for consistency

**Files:** `components/ui/info-card.tsx`
**Effort:** Small

---

### GAP-5: Map tile style mismatch

**Design:** Stylized mint/teal colored map (appears to be a custom or artistic tile set)
**Current:** Default OpenStreetMap tiles (busy, colorful, very different feel)

**Fix:**
- Switch to a minimal/light tile provider that better matches the design aesthetic
- Options:
  - CartoDB Positron: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` (light, clean)
  - Stadia Maps Alidade Smooth: similar minimal style
  - Mapbox with custom style (requires API key)
- CartoDB Positron (free, no API key) is recommended — closest to the teal/minimal look

**Files:** `tools/ipcheck/location-map.tsx`
**Effort:** Small

---

### GAP-6: Dark mode persistence

**Design:** N/A (static mockup)
**Current:** Header uses `useState(false)` for dark mode — resets to light mode on every page refresh

**Fix:**
- Read initial state from `localStorage` or `prefers-color-scheme` media query
- Persist toggle to `localStorage`
- Apply `dark` class before hydration to prevent flash (use a `<script>` in `layout.tsx` or a theme provider)

**Files:** `components/layout/header.tsx`, `app/layout.tsx`
**Effort:** Medium

---

### GAP-7: Loading states (skeleton UI)

**Design:** N/A (shows populated state only)
**Current:** No loading skeletons or spinners when data would be fetching

**Fix:**
- Add skeleton variants for:
  - `IpHeroCard` — pulsing placeholder for IP text, badges, buttons
  - `IpInfoGrid` — 4 skeleton cards with pulsing icon box + text lines
  - `LocationDetail` — skeleton list items + map placeholder (map already has a loading fallback via `dynamic()`)
- Use Tailwind `animate-pulse` with `bg-slate-200 dark:bg-slate-800` blocks

**Files:**
- `tools/ipcheck/ip-hero-card.tsx` (or new `ip-hero-card-skeleton.tsx`)
- `tools/ipcheck/ip-info-grid.tsx` (or new `ip-info-grid-skeleton.tsx`)
- `tools/ipcheck/location-detail.tsx` (already has map loading)
- `app/tools/ipcheck/page.tsx` (conditional rendering)

**Effort:** Medium

---

### GAP-8: Error states

**Design:** N/A
**Current:** No error handling UI — `handleSearch` and `handleRefresh` are TODO stubs

**Fix:**
- Add an error state component (e.g. alert banner or inline message)
- Handle cases: invalid IP/domain input, API unreachable, rate limited
- Show user-friendly message with retry option

**Files:**
- New `components/ui/error-banner.tsx` or inline in page
- `app/tools/ipcheck/page.tsx`

**Effort:** Medium

---

### GAP-9: Accessibility improvements

**Design:** N/A (HTML mockup lacks accessibility features)
**Current:** Several a11y gaps

**Fix:**
- **Search input:** Add a visually hidden `<label>` element (or `aria-label`) associated with the input
- **Copy button:** Already has visible text, OK
- **Refresh button:** Add `aria-label="Refresh IP address"`
- **Info cards:** Consider `role="group"` with `aria-label` for the grid
- **Map:** Add `aria-label="Map showing IP location"` on the map container
- **Badge icons:** SVG icons should have `aria-hidden="true"` since they're decorative (text conveys meaning)
- **Dark mode toggle:** Already has `aria-label` ✅
- **Color contrast:** Verify `text-slate-500` labels meet 4.5:1 ratio against white/70 glass backgrounds

**Files:** `components/ui/search-bar.tsx`, `tools/ipcheck/ip-hero-card.tsx`, `tools/ipcheck/ip-info-grid.tsx`, `tools/ipcheck/location-map.tsx`, `components/ui/badge.tsx`
**Effort:** Small–Medium

---

## Implementation Priority

| Priority | Gap | Effort | Impact |
|----------|-----|--------|--------|
| P1 | GAP-1: Font conflict | Small | Visual consistency — currently unpredictable |
| P1 | GAP-4: InfoCard borders | Small | Visual consistency with glass theme |
| P1 | GAP-5: Map tiles | Small | Large visual difference from design |
| P1 | GAP-9: Accessibility | Small–Med | WCAG compliance (project requirement) |
| P2 | GAP-2: Sign In button | Small | Missing UI element from design |
| P2 | GAP-3: Mobile menu | Medium | Mobile usability (no nav access) |
| P2 | GAP-6: Dark mode persist | Medium | UX annoyance on refresh |
| P3 | GAP-7: Loading states | Medium | Needed before API integration |
| P3 | GAP-8: Error states | Medium | Needed before API integration |

---

## Execution Order

### Phase 1 — Visual Polish (P1)
1. Resolve font conflict (GAP-1)
2. Fix InfoCard borders to match glass style (GAP-4)
3. Switch map tiles to CartoDB Positron (GAP-5)
4. Accessibility pass (GAP-9)

### Phase 2 — Missing UI (P2)
5. Add Sign In button to header (GAP-2)
6. Add mobile hamburger menu (GAP-3)
7. Dark mode persistence with localStorage (GAP-6)

### Phase 3 — State Handling (P3)
8. Add skeleton loading states (GAP-7)
9. Add error states (GAP-8)

---

## Notes

- Brand colors (#3D79F2 vs design's #137fec): The implementation uses the brand spec from CLAUDE.md. This is **intentional**, not a gap.
- Branding (HandyTool vs IPCheck): Intentional rebrand. Not a gap.
- Country flag (emoji vs image): Emoji approach is cleaner and doesn't depend on external image URLs. Not a gap.
- Interactive Leaflet map vs static image: Interactive is better than the design's static image. Not a gap.
