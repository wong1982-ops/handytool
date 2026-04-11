# AI Action Gate — Implementation Plan

**Date:** 2026-04-07
**Design doc:** [`docs/superpowers/specs/2026-04-07-ai-action-gate-design.md`](../specs/2026-04-07-ai-action-gate-design.md)
**Status:** Phases 1 + 2 complete (2026-04-08). Phase 3 deferred.

---

## Execution log (2026-04-08)

### Phase 1 — Foundation ✅ DONE
- `components/auth/action-gate.tsx` created — `<ActionGate>` + private `<SignInCard>`, `<TopUpCard>`, `<GateSkeleton>`. Inline SVG icons. Window-focus refetch scoped to top-up state.
- 10 of the 14 planned routes auth-prepended. **4 skipped after reading actual code:**
  - `component-lab/explore` — public read of `is_public=true` library items (discovery feed). Gating would break the explore page.
  - `blog/{generate,auto-generate,backfill-covers}` — all three are `verifyCronSecret(request)`-gated, cron-only. Not user-facing AI.
- `tsc` + `eslint` clean.

### Phase 2 — Wire per tool ✅ DONE
- 17 sites wrapped (plan said 16; +1 because Component Lab needed both `prompt-panel` for initial generate and `chat-bar` for refine).
- All 4 batches complete + the 2 originally-deferred tools (ID Photo, Music Studio) addressed.
- Per-tool deviations:
  - **ID Photo**: removed auto-trigger of `runEnhance(url)` from `handleFileSelect`; added a manual "Enhance with AI" floating button (bottom-center of canvas, shown when `photoUrl && enhanceState === 'idle'`) wrapped in `<ActionGate>`. Face analysis still auto-runs.
  - **Music Studio**: gated the "Start Session" button in `transport-bar.tsx` (idle state only). "Retry" button intentionally not gated.
  - **Image Editor**: replaced existing custom auth-gate render with a single `<ActionGate>` wrapping the panel body (cleaner than per-button).
  - **eCard Studio**: gated `logo-upload.tsx`'s "Analyze Brand" CTA (first AI hit) instead of the auto-triggered generate-cards step.
  - **Story Video**: uses dynamic `cost={credits || 1}` from page-count estimate.
  - **Sketch to Art**: also removed pre-flight `if (!user && !authLoading) return` from `handleGenerate` per Phase 2 cleanup spec.
  - **Favicon Generator** + **Color Palette**: ripped out inline `UNAUTHORIZED`/`INSUFFICIENT_CREDITS` error text per spec.
- `tsc` + `eslint` clean (only pre-existing warnings in untouched code).

### Phase 3 — Polish ⏸ NOT STARTED
- All 17 sites still use `cost={1}` placeholder (except Story Video which is dynamic). Real per-action costs not yet wired.
- No copy tuning yet.
- No analytics hook.

### Outstanding for follow-up
- End-of-phase smoke testing in browser (signed-out / signed-in / zero-credits) for each of the 17 sites
- Phase 3 cost archaeology and replacement
- Possible follow-up: adding credit metering to `story/{voice-preview,enrich-page,refine}` (currently auth-only)

---

---

## Overview

Three phases. Phase 1 is security-critical and self-contained. Phases 2 and 3 are UX refinement and can be deferred or batched.

```
Phase 1 — Foundation         (security-critical, ~2 hours)
  ├── Step 1.1: Build <ActionGate>
  ├── Step 1.2: Add auth to 14 API routes
  └── Step 1.3: Verify build + lint

Phase 2 — Wire per tool      (UX consistency, ~3 hours)
  ├── Step 2.1: Wire batch A (4 simple wizards)
  ├── Step 2.2: Wire batch B (4 tab/panel tools)
  ├── Step 2.3: Wire batch C (4 specialized tools)
  ├── Step 2.4: Wire batch D (final 4)
  └── Step 2.5: Smoke test signed-out / signed-in / no-credits

Phase 3 — Polish              (deferred, optional)
  ├── Step 3.1: Replace cost={1} placeholders with real costs
  ├── Step 3.2: Copy tuning
  └── Step 3.3: Optional analytics hook
```

---

## Phase 1 — Foundation

**Goal:** Lock down the 14 API routes and ship the gate component. After Phase 1, the security gap is closed even before any tool wires up the gate.

### Step 1.1 — Build `<ActionGate>` component

**File to create:** `components/auth/action-gate.tsx`

**What to include** (full source in design doc, condensed here):
- Default export none; named export `ActionGate`
- Props: `cost: number`, `children: (state: { ready: true }) => ReactElement`, `signInLabel?`, `topUpLabel?`
- Reads `useAuth()` and `useCredits()`
- Render decision tree:
  1. `authLoading || creditsLoading` → `<GateSkeleton />`
  2. `!user` → `<SignInCard label={signInLabel} />`
  3. `(balance?.total ?? 0) < cost` → `<TopUpCard label={topUpLabel} />`
  4. else → `children({ ready: true })`
- `useEffect` adds `window.addEventListener('focus', refetch)` only when `isShowingTopUp` is true. Cleans up on unmount.
- Three private sub-components in the same file:
  - `GateSkeleton` — `<div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-[#131a23] animate-pulse" />`
  - `SignInCard` — horizontal layout, lock icon, label + "Your work is saved" subtext, Google sign-in button calling `signInWithOAuth('google')`. Local `pending` state to prevent double-click.
  - `TopUpCard` — horizontal layout, coin icon, label + "See all options →" link to `/billing` with `target="_blank"`, primary button labeled `Top up — {pack.credits} credits (${(pack.priceCents/100).toFixed(0)})` where `pack = CREDIT_PACKS[0]`. Click handler POSTs to `/api/v1/credits/purchase` with `{ pack_id: pack.id }`, opens `json.data.checkout_url` in new tab.
- Imports: `useAuth`, `useCredits`, `signInWithOAuth`, `CREDIT_PACKS`, `Link` from next/link, `useEffect`/`useState` from react.

**Verification:**
- File compiles
- No new lint errors
- TypeScript: `children` prop type is strict — passing a function that doesn't return `ReactElement` should fail to compile

### Step 1.2 — Add auth to 14 API routes

For **each** of the routes below, apply this exact diff:

**Add to imports:**
```ts
import { getAuthUserId, API_ERRORS } from '@/lib/api/response'
```
(If `apiSuccess` / `apiError` are already imported from the same module, add `getAuthUserId, API_ERRORS` to the existing import line.)

**Add as the first statement inside `POST(...)` (or `GET` for any read-style AI route):**
```ts
const userId = await getAuthUserId()
if (!userId) return API_ERRORS.UNAUTHORIZED()
```

**Routes:**

1. `app/api/v1/logo-generator/generate/route.ts`
2. `app/api/v1/mood-board/generate/route.ts`
3. `app/api/v1/id-photo/enhance/route.ts`
4. `app/api/v1/component-lab/generate/route.ts`
5. `app/api/v1/component-lab/refine/route.ts`
6. `app/api/v1/component-lab/explore/route.ts`
7. `app/api/v1/resume/ai-assist/route.ts`
8. `app/api/v1/resume/ai-analyze/route.ts`
9. `app/api/v1/blog/generate/route.ts`
10. `app/api/v1/blog/auto-generate/route.ts`
11. `app/api/v1/blog/backfill-covers/route.ts`
12. `app/api/v1/story/voice-preview/route.ts`
13. `app/api/v1/story/enrich-page/route.ts`
14. `app/api/v1/story/refine/route.ts`

**Per-route caution:**
- `story/voice-preview` uses raw `Response` instead of `apiError` — keep its existing patterns; only add the auth prepend at the top of `POST`. The `API_ERRORS.UNAUTHORIZED()` return is a `NextResponse`, which is compatible.
- `story/refine` returns an SSE stream — add the auth check **before** any streaming setup (it short-circuits with a normal JSON 401, no SSE wrapping needed).
- `blog/*` routes may already have admin checks — leave those intact, add auth as a strictly earlier check.
- For routes that already have a credit check, the auth check goes **before** the credit check (you can't check credits for a null user).

**Verification:**
- For each route, the auth check is the first thing inside the handler
- Existing tests still pass
- An anonymous `curl POST` against any of the 14 routes returns 401

### Step 1.3 — Build + lint verification

```sh
pnpm exec tsc --noEmit
pnpm exec eslint components/auth/action-gate.tsx app/api/v1/{logo-generator,mood-board,id-photo,component-lab,resume,blog,story}/**/*.ts
```

Both must pass with zero new errors. Existing pre-existing errors (e.g. the `any` warnings in image-editor/page.tsx) are out of scope.

**Phase 1 done when:** Component exists, all 14 routes return 401 to anonymous callers, build is green.

---

## Phase 2 — Wire `<ActionGate>` per tool

**Goal:** Replace per-tool ad-hoc 401 handling with the consistent gate UX. Ship in batches so each batch is a self-contained PR-sized change.

### Wiring pattern

For each site:

1. Add to imports: `import { ActionGate } from '@/components/auth/action-gate'`
2. Find the primary CTA button (e.g. `<button onClick={handleGenerate}>Generate</button>`)
3. Wrap it: `<ActionGate cost={1}>{() => <button onClick={handleGenerate}>Generate</button>}</ActionGate>`
4. Delete any nearby existing `'Please sign in'` / `INSUFFICIENT_CREDITS` inline text — the gate handles those states now
5. Delete any pre-flight `if (!user) return` early-bails in the click handler — the gate prevents the click in the first place

### Step 2.1 — Batch A: simple wizards (4 tools)

| Tool | File | CTA to wrap | Cleanup |
|---|---|---|---|
| Font Generator | `tools/font-generator/describe-step.tsx` | "Preview" button | none |
| Logo Generator | `tools/logo-generator/style-step.tsx` | "Generate" button | none |
| Mood Board | `tools/mood-board/wizard.tsx` | "Generate" button in step 3 | none |
| Sketch to Art | `app/tools/sketch-to-art/page.tsx` | "Generate" button (wherever step 2/3 lives) | Delete `if (!user && !authLoading) return` at top of `handleGenerate` |

**Verify after batch:** `pnpm exec tsc --noEmit` passes. Manual smoke: open one of these in dev mode, signed out, the CTA shows the sign-in card; signed in, the CTA renders normally.

### Step 2.2 — Batch B: tab/panel tools (4 tools)

| Tool | File | CTA to wrap | Cleanup |
|---|---|---|---|
| Favicon Generator | `tools/favicon-generator/ai-tab.tsx` | "Generate" button | Delete the `if (json.code === 'UNAUTHORIZED') setError(...)` branch and any inline "Please sign in" `<p>` |
| Color Palette | `tools/color-palette/ai-tab.tsx` | "Generate" button | Same — delete inline 401 text |
| Component Lab | `tools/component-lab/chat-bar.tsx` | "Send" button | none |
| Accountant AI | `tools/accountant-ai/chat-input.tsx` | "Send" button | none |

**Verify after batch:** `tsc` + manual smoke on one tool.

### Step 2.3 — Batch C: studio tools (4 tools)

| Tool | File | CTA to wrap | Cleanup |
|---|---|---|---|
| eCard Studio (AI) | `app/tools/ecard-studio/ai-business-card/page.tsx` | "Generate cards" button | none |
| Story Video | `tools/story-video/settings-form.tsx` | "Create video" button | none |
| VBlog | `tools/vblog/vblog-dashboard.tsx` | "Generate" button | none |
| Music Studio | `tools/music-studio/controls-panel.tsx` *(verify location)* | "Connect" button | **Verify first** — read the file to confirm which CTA represents "start using AI"; it might be inside `transport-bar.tsx` instead |

**Music Studio caveat:** Real-time streaming is unusual. Before wiring, read `controls-panel.tsx` and `transport-bar.tsx` and decide which button is the moral equivalent of "Generate". If unclear, gate the button that triggers `connect()` to the Lyria stream — that's where credits start being consumed.

### Step 2.4 — Batch D: image tools + resume (final 4)

| Tool | File | CTA to wrap | Cleanup |
|---|---|---|---|
| ID Photo | `app/tools/id-photo/page.tsx` | "Enhance with AI" button **only** — file upload, crop, format selector stay free | none |
| Image Editor | `tools/image-editor/ai-tools-panel.tsx` | **Each** AI tool button (remove-bg, inpaint, enhance, segment, generative-fill). Multiple gates on the same panel — that's fine, they share the same `useAuth`/`useCredits` state. | none |
| Resume | `tools/resume/panels/...` | "Improve with AI" button (find the AI-assist panel; check `tools/resume/panels/` for the file) | none |
| Resume (analyze) | Same panel or sibling | "Analyze resume" button | none |

**Resume caveat:** Resume has its own provider/reducer pattern. The gate works inside the existing component tree without changes — it's a pure wrapper.

### Step 2.5 — End-of-phase smoke test

For **each** of the 16 sites, in dev mode:

1. **Signed out:** open the tool, configure inputs, see the inline sign-in card where the CTA was. Click "Sign in" → OAuth redirect → return → draft restored, CTA visible.
2. **Signed in with credits:** CTA renders normally, click works, AI generation succeeds.
3. **Signed in with zero credits:** (use Supabase admin to zero out the test user's `credits` table) — see the top-up card. Click "Top up" → Stripe Checkout opens in new tab. Don't actually pay; just verify the button works.

If any tool fails any of the three states, log the issue and fix before declaring Phase 2 done.

**Phase 2 done when:** All 16 sites use `<ActionGate>`, all three states verified manually for each, no inline 401/credit text remains in tool files, build is green.

---

## Phase 3 — Polish (deferred)

**Goal:** Replace placeholders with real values. Can be done incrementally or skipped if Phase 2 ships acceptably.

### Step 3.1 — Real credit costs

Find each route's actual credit cost:
- Look for `CREDIT_COSTS` constants (story already has one in `lib/story/validation`)
- Look for `reserveCredits(...)` calls in route handlers
- Match each tool's `cost={1}` to the actual number

Example:
```tsx
// Before
<ActionGate cost={1}>
// After
<ActionGate cost={LOGO_GENERATION_COST}>
```

Where to define the constant: per-tool `lib/<tool>/costs.ts` or co-located in the tool's `types.ts`.

### Step 3.2 — Copy tuning

Run the Phase 2 smoke tests with a fresh user. Note any awkward language. Common candidates:
- "Sign in to use AI generation" → tool-specific override via `signInLabel` prop
- "You're out of credits" → consider showing the user's current balance for context

### Step 3.3 — Optional analytics hook

If we want conversion tracking (anonymous → signed-in via gate trip):
- Add an `onGateTrip?: (state: 'sign-in' | 'top-up') => void` prop to `<ActionGate>`
- Fire from the appropriate render branch
- Wire up to existing analytics if any exists

This is the only piece that *might* need a separate brainstorm — gate it on whether we have a defined analytics layer.

---

## File index (everything that changes)

**Created:**
- `components/auth/action-gate.tsx`
- `docs/superpowers/specs/2026-04-07-ai-action-gate-design.md` *(already exists)*
- `docs/superpowers/plans/2026-04-07-ai-action-gate.md` *(this file)*

**Modified — API (Phase 1, 14 files):**
- `app/api/v1/logo-generator/generate/route.ts`
- `app/api/v1/mood-board/generate/route.ts`
- `app/api/v1/id-photo/enhance/route.ts`
- `app/api/v1/component-lab/{generate,refine,explore}/route.ts` (3)
- `app/api/v1/resume/{ai-assist,ai-analyze}/route.ts` (2)
- `app/api/v1/blog/{generate,auto-generate,backfill-covers}/route.ts` (3)
- `app/api/v1/story/{voice-preview,enrich-page,refine}/route.ts` (3)

**Modified — Tools (Phase 2, ~16 files):**
- `tools/font-generator/describe-step.tsx`
- `tools/logo-generator/style-step.tsx`
- `tools/mood-board/wizard.tsx`
- `app/tools/sketch-to-art/page.tsx`
- `tools/favicon-generator/ai-tab.tsx`
- `tools/color-palette/ai-tab.tsx`
- `tools/component-lab/chat-bar.tsx`
- `tools/accountant-ai/chat-input.tsx`
- `app/tools/ecard-studio/ai-business-card/page.tsx`
- `tools/story-video/settings-form.tsx`
- `tools/vblog/vblog-dashboard.tsx`
- `tools/music-studio/controls-panel.tsx` (or `transport-bar.tsx`)
- `app/tools/id-photo/page.tsx`
- `tools/image-editor/ai-tools-panel.tsx`
- `tools/resume/panels/...` (find the AI-assist panel)

**Untouched but verified:**
- `lib/hooks/use-credits.ts` — already exposes `refetch`, no patch needed
- `lib/stripe/config.ts` — `CREDIT_PACKS[0]` is the default
- `lib/supabase/auth.ts` — `signInWithOAuth` exists
- `app/billing/page.tsx` — purchase flow pattern lifted from here

---

## Acceptance criteria

**Phase 1:**
- [ ] `components/auth/action-gate.tsx` exists and exports `ActionGate`
- [ ] All 14 API routes return 401 for anonymous callers
- [ ] `tsc --noEmit` and `eslint` green for new + modified files
- [ ] No regressions: existing routes and tools still work for signed-in users

**Phase 2:**
- [ ] All 16 sites wrap their CTA with `<ActionGate>`
- [ ] No file in `tools/` or `app/tools/` contains the string "Please sign in to use AI" outside `<ActionGate>` (search-and-verify)
- [ ] All three smoke-test states pass for each tool: signed-out, signed-in, zero credits
- [ ] Window-focus refresh verified end-to-end with one tool (open Stripe Checkout in new tab, switch back, gate clears)

**Phase 3 (optional):**
- [ ] All `cost={1}` placeholders replaced with real per-action costs
- [ ] No outstanding tool-author confusion about which CTA to wrap (verified by reviewing the wired files)

---

## Rollback

Each phase is independently revertable:
- **Phase 1 rollback:** Remove the auth prepend from each route + delete `components/auth/action-gate.tsx`. Tools never depended on the component.
- **Phase 2 rollback per tool:** Unwrap the `<ActionGate>` and restore the bare CTA. The pre-flight gate disappears but API auth (Phase 1) still protects.
- **Phase 3 rollback:** Trivial — restore `cost={1}` placeholders.

No data migration. No schema changes. No feature flags needed.
