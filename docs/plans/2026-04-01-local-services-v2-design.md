# Local Services v2 — Community Providers + Google Maps UX

**Date:** 2026-04-01
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Summary

Major upgrade to the Local Services tool: add community-sourced service providers alongside Google Places results, and redesign the entire UI to match Google Maps UX (map-first, floating search, bottom sheet results).

### Key Changes
- Community providers: admin-curated local service providers stored in Supabase
- Rich listings: photos, portfolio, social links, pricing, availability, reviews
- Community results shown FIRST, above Google results, with green badges
- Full Google Maps clone UX: full-screen map, floating search, category chips, left panel / bottom sheet results
- User reviews for community providers (trust-based, flaggable)
- User "Suggest a Provider" submissions (pending admin approval)
- Green map pins for community, blue for Google, red for selected

### Non-Goals (v1)
- No provider self-service portal
- No booking/appointments
- No payment processing
- No admin dashboard yet (direct Supabase for now, toolk1t-admin later)

---

## Layout

Full-screen map with floating UI:

### Desktop
```
┌──────────────────────────────────────────────────┐
│ [←] [🔍 Search services nearby...     ] [♡][🕐][⚙]│
│ [All] [Plumber] [Hairdresser] [Cafe] [→ more]   │
│                                                  │
│ ┌─────────────┐                                  │
│ │ 🟢 Community│         FULL-SCREEN MAP          │
│ │  Provider 1 │                                  │
│ ├─────────────┤        📍🟢  📍    📍              │
│ │  Google     │            📍        📍           │
│ │  Result 1   │                                  │
│ ├─────────────┤                           [+]    │
│ │  Google     │                           [-]    │
│ │  Result 2   │                           [◎]    │
│ └─────────────┘                                  │
└──────────────────────────────────────────────────┘
```

### Mobile
- Full-screen map
- Bottom sheet (draggable): collapsed shows 1-2 cards, drag up for full list
- Search bar + chips at top

### Detail View
- Replaces results in same panel position (left panel or bottom sheet)
- Back arrow returns to results list
- No page navigation

---

## Community Provider Data

### Tables

```sql
community_providers (id, name, category_id, description, phone, email,
  website, social_links JSONB, profile_photo, portfolio_photos TEXT[],
  pricing_info, availability, service_area TEXT[], lat, lng, address,
  is_verified, is_approved, status, created_at, updated_at)

community_reviews (id, provider_id FK, user_id FK, rating 1-5, text,
  is_flagged, flag_reason, created_at, UNIQUE(provider_id, user_id))

community_submissions (id, submitted_by FK, provider_name, category_id,
  phone, description, service_area TEXT[], status, admin_notes, created_at)
```

### Photos
- Supabase Storage bucket: `community-provider-photos`
- Profile: 400x400, Portfolio: max 1200px wide

---

## Search & Result Merging

```
User searches category
  → Parallel:
    1. Supabase: community_providers (category + area/distance match)
    2. Google Places API (with cache)
  → Merge: community first (verified → rating → distance), then Google
  → Display in results panel
```

### MergedResult Type
```typescript
interface MergedResult {
  id: string
  source: 'community' | 'google'
  name: string
  address: string
  lat: number | null
  lng: number | null
  distance: number | null
  phone: string | null
  website: string | null
  rating: number | null
  reviewCount: number
  isOpenNow: boolean
  category: string
  photoUrl: string | null
  // Community-only
  isVerified?: boolean
  description?: string
  pricingInfo?: string
  availability?: string
  serviceArea?: string[]
  socialLinks?: Record<string, string>
  portfolioPhotos?: string[]
  profilePhoto?: string
}
```

### Map Pins
- Community: green pin
- Google: blue pin
- Selected: red pin
- Service-area-only providers: no pin, badge in card

---

## Detail Panel

### Community Provider Detail
- Hero photo, name + verified badge, green "Community" badge
- Rating + review count
- Description
- Pricing, availability, service area
- Phone, social links
- Portfolio photo gallery (horizontal scroll)
- Reviews with star ratings
- "Write a Review" inline form
- Action buttons: Call, Message, Save

### Google Result Detail
- Same layout minus community fields
- Google hours, rating, reviews

---

## Reviews

- Any logged-in user, one review per provider
- Star rating (1-5) + text
- Visible immediately (trust-based)
- "Report" button flags for admin
- Admin moderates flagged reviews

---

## Suggest a Provider

- Form: name, category, phone, description, service area
- Creates `community_submissions` entry (status: pending)
- Admin reviews and converts to provider or rejects

---

## File Structure

```
app/tools/local-services/page.tsx          # Full-screen map layout
tools/local-services/local-services-types.ts
tools/local-services/local-services-provider.tsx
tools/local-services/components/
├── floating-search.tsx      # Search bar + chips + action buttons
├── results-panel.tsx        # Left panel / bottom sheet
├── result-card.tsx          # Unified card (community + google)
├── detail-panel.tsx         # Place detail view
├── review-form.tsx          # Star rating + text review
├── suggest-provider.tsx     # User submission form
├── results-map.tsx          # Leaflet wrapper
├── results-map-inner.tsx    # Leaflet implementation
├── bottom-sheet.tsx         # Mobile drag sheet
└── location-modal.tsx       # Location picker

app/api/v1/local-services/
├── search/route.ts          # Merge community + Google
├── place/route.ts           # Place detail
├── favourites/route.ts      # User favourites
├── reviews/route.ts         # Review CRUD + flagging
└── submissions/route.ts     # User submissions

supabase/migrations/038_community_providers.sql
```

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Admin + user submissions | Admin only, crowdsourced | Quality + community |
| 2 | Rich listings | Basic, standard | Differentiates from Google |
| 3 | Community first in results | Mixed, tabs | Unique value |
| 4 | Exact location + service area | One or other | Supports all provider types |
| 5 | Trust-based reviews | Moderated, none | Good UX + safety net |
| 6 | Supabase Storage | External URLs | Simple, controlled |
| 7 | Admin-only CRUD | Self-service | YAGNI for v1 |
| 8 | Google Maps clone UX | Sidebar layout | Familiar, map-first |
| 9 | Green/blue/red pins | Same pins | Visual distinction |
| 10 | Floating search + chips | Sidebar search | Google Maps pattern |
| 11 | Left panel / bottom sheet | Full-page, modal | Matches Google Maps |
| 12 | Detail in same panel | Drill-in page | Compact, contextual |
