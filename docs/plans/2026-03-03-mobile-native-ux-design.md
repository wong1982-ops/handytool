# Mobile Native UX Redesign — Design

## Overview

Redesign the mobile experience (<768px) to feel like a native iOS app. Desktop and tablet remain unchanged.

## Approach

**Framer Motion** for gesture detection, spring physics, and animations. Custom React components for all native patterns. No heavy libraries.

## Bottom Tab Bar

Replaces hamburger menu on mobile. Fixed at bottom, 56px height, blur backdrop.

**3 tabs:**
- **Tools** (grid icon) → `/tools` — browse all tools
- **Favorites** (star icon) → `/favorites` — user's starred tools (localStorage)
- **Profile** (person icon) → `/profile` — settings, dark mode, links

**Behavior:**
- Active: brand blue icon + label. Inactive: gray icon only.
- Safe area padding: `env(safe-area-inset-bottom)` for notched phones
- Hides on scroll down, shows on scroll up (like Safari)

**Header changes:** Remove hamburger + mobile drawer. Keep logo, search icon (full-screen overlay), dark mode toggle. Compact height.

## Swipe Navigation

Horizontal swipe between 3 tabs using Framer Motion `drag="x"` with snap points.

- Spring physics: `stiffness: 300, damping: 30`
- Rubber-band overscroll at edges
- 50px horizontal threshold before committing
- Horizontal scroll inside tools takes priority (no conflict)
- Tapping tab also spring-animates to panel

## Bottom Sheets

Replace modals/dropdowns with iOS-style bottom sheets.

- Slide up with spring animation, scrim overlay
- Draggable to dismiss (velocity-based)
- 3 snap points: peek (30vh), half (50vh), full (90vh)
- Drag handle pill at top center
- Body scroll locked while open

## Pull-to-Refresh

- Elastic pull-down past top triggers `router.refresh()`
- Spinner follows finger position
- 60px threshold to trigger
- Only when scrollY === 0

## Gesture Back Navigation

- Left-edge swipe (within 20px) to go back
- Peek of previous page with parallax
- Spring-animated, fast swipe = commit, slow = snap back
- Disabled at root level or during horizontal scroll

## Favorites System

- Star toggle on each tool card (top-right)
- `localStorage` key `toolk1t-favorites` (array of slugs)
- Hook: `useFavorites()` — `{ favorites, toggle, isFavorite }`
- Empty state: prompt to star tools

## Mobile Shell Architecture

```
<MobileShell>              ← only on <768px
  <MobileHeader />         ← compact: logo + search + dark mode
  <PullToRefresh>
    <GestureBack>
      <TabSwipeContainer>
        <ToolsTab />
        <FavoritesTab />
        <ProfileTab />
      </TabSwipeContainer>
    </GestureBack>
  </PullToRefresh>
  <BottomTabBar />         ← fixed bottom
</MobileShell>
```

Detection: `useMobileShell()` hook via `matchMedia('(max-width: 767px)')`.

## Files

| Component | File | Purpose |
|---|---|---|
| Mobile shell | `components/mobile/mobile-shell.tsx` | Mobile-specific layout wrapper |
| Bottom tab bar | `components/mobile/bottom-tab-bar.tsx` | 3-tab bottom nav |
| Tab swipe container | `components/mobile/tab-swipe-container.tsx` | Horizontal swipe between tabs |
| Bottom sheet | `components/mobile/bottom-sheet.tsx` | Draggable sheet (replaces modals) |
| Pull to refresh | `components/mobile/pull-to-refresh.tsx` | Elastic pull-down refresh |
| Gesture back | `components/mobile/gesture-back.tsx` | Left-edge swipe back |
| Mobile header | `components/mobile/mobile-header.tsx` | Compact header |
| Favorites hook | `lib/hooks/use-favorites.ts` | localStorage favorites |
| Mobile detection | `lib/hooks/use-mobile-shell.ts` | matchMedia <768px |
| Favorites tab | `components/mobile/favorites-tab.tsx` | Favorites grid |
| Profile tab | `components/mobile/profile-tab.tsx` | Settings + links |

**New dependency:** `framer-motion`

**Modified:** `app/layout.tsx` (conditional shell), `components/layout/header.tsx` (remove mobile drawer)

**Unchanged:** All existing tool pages, desktop experience, tablet+ layouts.
