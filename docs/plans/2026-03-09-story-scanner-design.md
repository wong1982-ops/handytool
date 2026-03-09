# Story Scanner — Design Document

**Date:** 2026-03-09
**Status:** Approved

## Understanding Summary

- **What:** A "Story Scanner" feature — users photograph pages of physical storybooks (handwritten or printed), upload the images, and the system extracts a clean plot summary via Gemini vision
- **Why:** Allow users to turn their existing physical stories into AI-illustrated digital storybooks
- **Who:** All users can see it; free users see it locked with a Premium badge. Premium users can use it.
- **Flow:** Upload images → Gemini extracts + deduplicates overlapping content + rewrites as plot summary → user reviews → clicks "Build Story" → pre-fills plot input → normal generation flow
- **Location:** Standalone page within Story Studio (`/tools/story-studio/scan`), linked from sidebar
- **Image limits:** Default 10 (normal) / 30 (premium), configurable per-user via admin portal
- **First premium feature** — introduces a new user entitlements system (reusable for character limits, future features)

## Assumptions

- Gemini vision handles both handwritten and printed text well enough
- Images are sent directly to Gemini and discarded — no persistence
- The entitlements system stores per-user overrides in the database, with role-based defaults
- No image preprocessing (rotation, cropping) needed — users upload as-is
- This does NOT create a new "tool" — it lives within Story Studio as a sub-page

## Decision Log

| # | Decision | Alternatives Considered | Reason |
|---|----------|------------------------|--------|
| 1 | Any physical text source (handwritten + printed) | Printed only, handwritten only | User flexibility |
| 2 | Extracted text feeds into plot input (normal flow) | Direct page content, dedicated editor | Simpler, reuses existing pipeline |
| 3 | Standalone page within Story Studio | Inline in Build Story, modal | Clean separation, dedicated UX |
| 4 | Full rewrite as plot summary | Light cleanup, user toggle | Best fit for generation pipeline |
| 5 | Visible but locked for free users | Hidden, limited trial | Drives upgrade interest |
| 6 | Configurable per-user image limits (10/30 defaults) | Fixed limits | Admin flexibility |
| 7 | Gemini vision for extraction + polishing | Dedicated OCR + LLM, Claude vision | Already in stack, handles both tasks |
| 8 | No image persistence | Supabase Storage, temp storage | Simplicity, privacy |
| 9 | Simple `user_entitlements` table with JSONB | Feature flags table, Stripe integration | YAGNI, easy to extend later |
| 10 | sessionStorage for plot transfer | Query params, localStorage | Avoids URL length limits, auto-clears |

## Design

### Data Model

#### New table: `user_entitlements`

```sql
CREATE TABLE user_entitlements (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier       TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  limits     JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can read their own row, admin can read/write all
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
```

**Default limits (defined in code, not DB):**

| Feature | Free | Premium |
|---------|------|---------|
| `scan_images` | 10 | 30 |
| `max_characters` | 2 | 20 |
| `max_series` | 1 | 10 |

**Lookup logic:**
1. Query `user_entitlements` for user
2. If no row → use free-tier defaults
3. If row exists → merge tier defaults with per-user `limits` overrides (overrides win)

### API Endpoints

#### `POST /api/v1/story/scan`

Main scanning endpoint.

```
Request:
  Content-Type: multipart/form-data
  images: File[] (up to user's limit)

Flow:
  1. Auth check → get user_id
  2. Check entitlements: is feature enabled? Image count within limit?
  3. Send all images to Gemini vision with prompt to extract,
     deduplicate, and rewrite as clean plot summary
  4. Return extracted plot summary

Responses:
  200: { data: { plotSummary: "..." } }
  401: Unauthorized
  403: { error: "Premium feature", code: "PREMIUM_REQUIRED" }
  400: { error: "Too many images", code: "IMAGE_LIMIT_EXCEEDED",
         details: { limit: 10, uploaded: 15 } }
```

#### `GET /api/v1/user/entitlements`

Check current user's tier and limits.

```
Response:
  200: { data: { tier: "free", limits: { scan_images: 10, max_characters: 4 } } }
```

#### Admin endpoints

- `GET /api/v1/admin/users/:id/entitlements`
- `PATCH /api/v1/admin/users/:id/entitlements` — update tier or individual limits

### Frontend

#### New page: `/tools/story-studio/scan`

**Step 1 — Upload:**
- Drop zone + file picker for images (jpg, png, heic, webp)
- Thumbnail previews with remove button per image
- Image count indicator: "3 / 10 images"
- "Extract Story" button (disabled until at least 1 image uploaded)
- Free user: overlay with lock icon, "Premium Feature" badge, upgrade CTA

**Step 2 — Processing:**
- Skeleton/loading state while Gemini processes
- Messaging: "Extracting text from your pages..."
- Timeout: 60s

**Step 3 — Review:**
- Extracted plot summary in editable text area
- Two actions:
  - **"Build Story"** → stores text in sessionStorage (`toolk1t-story-scanned-plot`), navigates to `/tools/story-studio?fromScan=true`
  - **"Try Again"** → re-sends images to Gemini

**Sidebar update:**
- Add "Scan" nav item (Build, Bookshelf, Series, Scan)
- Premium badge next to it for free users

**Plot pre-fill (main page):**
- On load, check `searchParams.get('fromScan')` → read from sessionStorage → pre-fill PlotInput → clear sessionStorage

### Edge Cases & Error Handling

**Image validation (client-side):**
- Max file size: 10MB per image
- Accepted formats: jpg, png, heic, webp
- Reject non-image files with inline error
- Disable upload when limit reached

**Gemini processing:**
- 60s timeout
- Empty/garbage result → "We couldn't extract readable text from these images. Try clearer photos."
- API failure → generic error with retry button
- No automatic retries

**Premium gating:**
- Entitlements checked server-side (API returns 403) — not just client-side
- Client checks entitlements on page load via `GET /api/v1/user/entitlements`

## Implementation Plan

### Phase 1: Entitlements System
1. Create `user_entitlements` table (migration)
2. Create RPC `get_user_entitlements(p_user_id)` for lookup
3. Create shared helper `lib/entitlements.ts` with tier defaults + merge logic
4. Create `GET /api/v1/user/entitlements` endpoint
5. Create admin endpoints for managing user entitlements

### Phase 2: Scan API
1. Create `POST /api/v1/story/scan` endpoint
2. Implement Gemini vision call with multi-image support
3. Add entitlements check (premium gate + image limit)
4. Add image validation (size, format)

### Phase 3: Scan UI
1. Create `/tools/story-studio/scan/page.tsx`
2. Build upload dropzone with thumbnails + count indicator
3. Build processing state (skeleton + messaging)
4. Build review state (editable text area + actions)
5. Add premium lock overlay for free users
6. Update sidebar in both `page.tsx` and `studio-layout.tsx`

### Phase 4: Plot Pre-fill Integration
1. Add `fromScan` query param handling to main Story Studio page
2. Read scanned plot from sessionStorage
3. Pre-fill PlotInput component
