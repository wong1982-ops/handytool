# AI Action Gate — Design

**Date:** 2026-04-07
**Status:** Implemented (Phases 1 + 2 shipped 2026-04-08; Phase 3 deferred)
**Author:** Brainstorming session (loicwong1982 + Claude)

---

## Understanding Summary

- **What** — A unified `<ActionGate>` component + matching API auth audit. Wraps the primary CTA on every AI tool. When the user is signed-out, swaps the CTA for an inline "Sign in to continue" card with a Google button. When the user is signed-in but out of credits, swaps it for an inline "Top up credits" card with one primary purchase button + a "See all options" link to `/billing`. Otherwise renders the original CTA. Backed by API-side 401 / `INSUFFICIENT_CREDITS` enforcement on every AI/credit-consuming route.

- **Why** — Today, anonymous users can hit AI generation endpoints (some routes lack auth entirely), and signed-in users with empty balances see inconsistent error text. We want one consistent gate that lets people freely explore + edit drafts, fails closed only on the actual paid action, and recovers cleanly from the OAuth round-trip thanks to the draft persistence already shipped.

- **Who it's for**
  1. Anonymous visitors who land on an AI tool, configure their inputs, then need a frictionless path to sign in without losing their work.
  2. Signed-in users who run out of credits mid-session and need a one-click path to top up without leaving their tool tab.
  3. Tool authors who want to add AI gating with one component import instead of bespoke per-tool error handling.

- **Key constraints**
  - No new auth infra — reuse `getAuthUserId()`, `API_ERRORS.UNAUTHORIZED()`, existing Supabase session
  - No new billing infra — reuse `CREDIT_PACKS`, `useCredits()`, `/api/v1/credits/purchase` → Stripe Checkout
  - Defense-in-depth: client gate is UX, API 401 / `INSUFFICIENT_CREDITS` is the security boundary
  - Draft persistence (already shipped via `useDraft` / `useIdbDraft`) is a hard dependency
  - No backwards-compat shims; rip out per-tool ad-hoc 401 text and replace with the gate

- **Explicit non-goals**
  - Not gating free utility tools (PDF, IP check, speedtest, analytics, ai-news reads)
  - Not auto-running the user's pending action after sign-in — they click Generate themselves
  - Not building a sign-in modal or full-screen auth wall
  - Not changing rate-limit middleware
  - Not adding new observability / conversion tracking
  - Not persisting canvas-side state for image-editor (separate concern)
  - Not redesigning `/billing` page

---

## Assumptions

1. `useAuth()` returns `{ user, loading }` synchronously enough that the gate can decide its render state on first paint without flicker. If not, the gate will render a neutral skeleton during `loading=true`.
2. `useCredits()` exposes `{ balance, loading, refetch }` — **verified** by reading `lib/hooks/use-credits.ts`. `balance` is an object with `.total`, not a number.
3. `/api/v1/credits/purchase` reliably returns a `checkout_url` and the existing Stripe webhook updates the user's balance — **verified** by reading `app/billing/page.tsx`.
4. Every AI tool has exactly one (or very few) primary CTAs that need gating — not dozens of scattered actions.
5. The API routes in scope all already validate input and return JSON via `apiError` / `apiSuccess`, so adding the auth check is a 3-line prepend in each.
6. The default credit pack to surface in the top-up card is `CREDIT_PACKS[0]` (`pack_800`, $5/800 credits) — **verified** by reading `lib/stripe/config.ts`.
7. Tools built around modes/tabs (favicon-generator, color-palette) have their AI tab as a clearly identifiable component the gate can wrap.
8. The gate's "Sign in" card uses the existing `signInWithOAuth()` helper — Google only.

---

## NFRs

| NFR | Defined behavior |
|---|---|
| **Performance** | Pre-flight gate is a single `useAuth()` + `useCredits()` hook read (already in memory). API auth check is one `getAuthUserId()` call (~5–50ms with Supabase). No new latency budget. |
| **Scale** | No new infrastructure. Same Supabase auth that already gates other authenticated routes. |
| **Security** | Defense-in-depth: client gate is UX, API 401 is the security boundary. Routes use existing `getAuthUserId()` + `API_ERRORS.UNAUTHORIZED()`. |
| **Privacy** | No new data collected. No tracking of gate trips. |
| **Reliability** | If Supabase auth check fails, `getAuthUserId()` returns null → 401. Tools degrade to "please sign in" rather than silently breaking. |
| **Maintenance** | Single shared component + single API helper. New AI tools import the component, import the helper. No per-tool auth logic. |
| **Rate limiting** | Out of scope; not changing existing rate-limit middleware. |
| **Observability** | No new logs/metrics. Conversion tracking is a follow-up if needed. |

---

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Client-side pre-flight gate before API call | Inline error after 401, modal-on-401, pre-flight + auto-retry | Avoids wasted API round-trip, instant feedback. API 401 stays as defense-in-depth. |
| 2 | Inline sign-in card replaces the CTA, no modal/redirect | Full-page redirect, modal, bottom-sheet | Keeps user in context. OAuth redirects after explicit click, not as a surprise. |
| 3 | Card replaces only the CTA, rest of tool stays interactive | Replace whole step, full overlay, persistent banner | Lets user keep refining inputs while signed out. Works with draft persistence. |
| 4 | Gate trips only on AI action, not on input/navigation | Gate on any AI-adjacent action, on tool entry, on first keystroke | Maximally permissive; people get to try the tool before being asked to sign in. |
| 5 | After sign-in: restore draft, leave CTA enabled, user clicks Generate themselves | Auto-run pending action, toast nudge, countdown auto-run | Zero new infra, no surprise credit charges, draft persistence handles state. |
| 6 | API audit scope = AI/credit-consuming routes only | Gate everything, gate writes too, route-by-route | Matches "all AI tools" intent without breaking free utilities. |
| 7 | NFR defaults accepted (see table above) | Override individual fields | Single shared component + existing helpers = low maintenance, no new latency. |
| 8 | One unified `<ActionGate>` handles both auth and credits | Auth-only gate, credits stay inline error | One component, one mental model. |
| 9 | Top-up card = one default-pack button + secondary "See all options" link to `/billing` (Stripe Checkout in new tab) | Navigate to /billing, new tab only, full pack picker inline | One-click happy path, escape hatch for choice, no duplication. |
| 10 | Approach 1: render-prop wrapper component | Imperative hook + render, HOC wrapping whole tool | Simplest mental model; honors Decisions #3 and #4; testable; props pattern handles dynamic costs. |
| 11 | `useCredits().refetch` exists; **don't patch the hook**, instead add a focus listener inside `<ActionGate>` scoped to top-up state | Patch hook to always refresh on focus, add polling | Localizes refresh logic; no impact on other consumers; no polling on tools that don't need it. |
| 12 | `balance` is an object — gate compares against `balance.total` | Treat balance as a number | Reading the actual hook shape rather than guessing. |
| 13 | Default credit pack = `CREDIT_PACKS[0]` (`pack_800`, $5/800 credits) | Hardcode, expose as ENV, add `popular` flag | Smallest pack = lowest commitment for the "just keep going" case. |
| 14 | TopUpCard button shows price + credit count from `CREDIT_PACKS[0]` directly | Hardcoded copy | If pack lineup changes, the gate updates automatically. |
| 15 | All `story/jobs/[id]/*` step routes are already gated by `withJobStep` — skip | Re-add per-route checks | Verified by reading `lib/story/job-step.ts:78`. |
| 16 | `svg/vectorize` is free local processing — skip | Gate it anyway | Matches Decision #6 scope. |
| 17 | 14 routes get a 3-line auth prepend; no other route changes | Refactor routes during audit | Smallest possible diff per route, reuses existing helpers. |
| 18 | `story/voice-preview`, `enrich-page`, `refine` get auth-only gates (no credit metering) | Add credit metering during audit | Adding credit deduction is out of scope; auth alone closes the abuse vector. |
| 19 | `blog/*` routes get auth gates even though they may have admin checks elsewhere | Trust existing admin gating | Defense-in-depth. |
| 20 | `cost={1}` placeholder for first rollout, real costs in Phase 3 | Block on cost archaeology | Don't block security work on UX refinement. |
| 21 | Three-phase rollout (Foundation → Wire → Polish) | Single big-bang merge | Phase 1 ships security alone; Phases 2/3 are UX refinement. |
| 22 | Rip out ad-hoc 401/INSUFFICIENT_CREDITS text per-tool during Phase 2; no shim period | Coexist for a release | No backwards-compat hacks per project guidelines. |

---

## Final Design

### Component shape

`components/auth/action-gate.tsx`:

```tsx
'use client'

import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { CREDIT_PACKS } from '@/lib/stripe/config'

interface ActionGateProps {
  /** Credits this action will consume. Use 1 as a placeholder for auth-only gating. */
  cost: number
  /** Render the gated CTA. Only called when signed in AND has enough credits. */
  children: (state: { ready: true }) => ReactElement
  signInLabel?: string
  topUpLabel?: string
}

export function ActionGate({
  cost,
  children,
  signInLabel = 'Sign in to use AI generation',
  topUpLabel = "You're out of credits",
}: ActionGateProps) {
  const { user, loading: authLoading } = useAuth()
  const { balance, loading: creditsLoading, refetch } = useCredits()

  const totalCredits = balance?.total ?? 0
  const isShowingTopUp = !!user && totalCredits < cost

  // Refresh credits on window focus while showing top-up card
  // (catches return from Stripe Checkout in new tab)
  useEffect(() => {
    if (!isShowingTopUp) return
    const onFocus = () => { void refetch() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isShowingTopUp, refetch])

  if (authLoading || creditsLoading) return <GateSkeleton />
  if (!user) return <SignInCard label={signInLabel} />
  if (totalCredits < cost) return <TopUpCard label={topUpLabel} />
  return children({ ready: true })
}
```

### SignInCard

Horizontal layout, ~64px tall, slate styling. Contains lock icon, label, "Your work is saved" reassurance, and a Google sign-in button using `signInWithOAuth('google')`.

### TopUpCard

Same horizontal layout, amber styling to differentiate. Contains coin icon, label, "See all options →" link to `/billing` (target=_blank), and a primary button labeled `Top up — 800 credits ($5)` (computed from `CREDIT_PACKS[0]`). Clicking the button POSTs to `/api/v1/credits/purchase` with the default `pack_id` and opens the returned `checkout_url` in a new tab.

### GateSkeleton

A neutral div matching the typical CTA height (~40px) with `bg-slate-200 dark:bg-[#131a23] animate-pulse`. Prevents layout shift on first paint.

### Implementation deviations (logged 2026-04-08)

The design assumed 14 API routes + 16 tool sites. Actual implementation differed after reading each route/component:

**API routes — 10 gated, 4 skipped:**
- ✅ Gated: `logo-generator/generate`, `mood-board/generate`, `id-photo/enhance`, `component-lab/{generate,refine}`, `resume/{ai-assist,ai-analyze}`, `story/{voice-preview,enrich-page,refine}`
- ❌ Skipped — `component-lab/explore`: public discovery feed of `is_public=true` library items, not user-AI
- ❌ Skipped — `blog/{generate,auto-generate,backfill-covers}`: all three are gated by `verifyCronSecret(request)`, cron-only, not user-facing AI

**Tool sites — 17 wired, 0 deferred:**
- Plan listed 16; actual = 17 because Component Lab needed both `prompt-panel` (initial generate) and `chat-bar` (refine), not just one
- ID Photo required UX restructure: AI enhance was auto-triggering on file upload. Restructured to add a manual "Enhance with AI" button after upload (only AI action — `cost={1}` ActionGate around it). Face analysis still auto-runs since it's free.
- Music Studio: gated the "Start Session" button in `transport-bar.tsx` (idle state only). The "Retry" button (error state) is intentionally not gated — once a session is started, the user is already authenticated.
- Image Editor: replaced existing custom auth-gate render (lines 50-77 of `ai-tools-panel.tsx`) with a single `<ActionGate>` wrapping the panel body, rather than per-button gates. Cleaner; preserves prior UX.
- eCard Studio: gated the "Analyze Brand" button in `logo-upload.tsx` (first AI hit; the generate-cards step auto-triggers from step 3, so gating earlier is the only meaningful click point)
- Story Video: uses dynamic `cost={credits || 1}` from the page-count estimate, not the placeholder `cost={1}`

### API audit — 14 routes to gate (as planned; actual: 10 gated)

| Route | Notes |
|---|---|
| `app/api/v1/logo-generator/generate/route.ts` | Auth + existing credit check |
| `app/api/v1/mood-board/generate/route.ts` | Auth + existing credit check |
| `app/api/v1/id-photo/enhance/route.ts` | Auth + existing credit check |
| `app/api/v1/component-lab/generate/route.ts` | Auth + existing credit check |
| `app/api/v1/component-lab/refine/route.ts` | Auth + existing credit check |
| `app/api/v1/component-lab/explore/route.ts` | Auth + existing credit check |
| `app/api/v1/resume/ai-assist/route.ts` | Auth + existing credit check |
| `app/api/v1/resume/ai-analyze/route.ts` | Auth + existing credit check |
| `app/api/v1/blog/generate/route.ts` | Auth (admin check is separate) |
| `app/api/v1/blog/auto-generate/route.ts` | Auth |
| `app/api/v1/blog/backfill-covers/route.ts` | Auth |
| `app/api/v1/story/voice-preview/route.ts` | Auth-only (no credit metering for now) |
| `app/api/v1/story/enrich-page/route.ts` | Auth-only |
| `app/api/v1/story/refine/route.ts` | Auth-only |

**Per-route diff (3 lines):**
```ts
import { getAuthUserId, API_ERRORS } from '@/lib/api/response'
// inside POST:
const userId = await getAuthUserId()
if (!userId) return API_ERRORS.UNAUTHORIZED()
```

### Per-tool wiring (16 sites)

| Tool | File | Gate location |
|---|---|---|
| Font Generator | `tools/font-generator/describe-step.tsx` | "Preview" CTA |
| Logo Generator | `tools/logo-generator/style-step.tsx` | "Generate" CTA |
| Mood Board | `tools/mood-board/wizard.tsx` | "Generate" CTA in step 3 |
| Favicon Generator (AI) | `tools/favicon-generator/ai-tab.tsx` | "Generate" CTA + rip out inline 401 |
| Color Palette (AI) | `tools/color-palette/ai-tab.tsx` | "Generate" CTA + rip out inline 401 |
| Component Lab | `tools/component-lab/chat-bar.tsx` | "Send" CTA |
| eCard Studio (AI) | `app/tools/ecard-studio/ai-business-card/page.tsx` | "Generate cards" CTA |
| Sketch to Art | `app/tools/sketch-to-art/page.tsx` | "Generate" + remove `if (!user) return` |
| Story Video | `tools/story-video/settings-form.tsx` | "Create video" CTA |
| VBlog | `tools/vblog/vblog-dashboard.tsx` | "Generate" CTA |
| Music Studio | `tools/music-studio/controls-panel.tsx` | "Connect" CTA — verify in Phase 2 |
| Accountant AI | `tools/accountant-ai/chat-input.tsx` | "Send" CTA |
| ID Photo | `app/tools/id-photo/page.tsx` | "Enhance with AI" CTA only |
| Image Editor | `tools/image-editor/ai-tools-panel.tsx` | Each AI tool button |
| Resume | `tools/resume/panels/...` (AI-assist panel) | "Improve with AI" CTA |

Story Studio is **not in the list** — already gated upstream by `withJobStep`.

### Rollout phases

**Phase 1 — Foundation (security-critical):**
1. Create `components/auth/action-gate.tsx`
2. Add 3-line auth prepend to all 14 API routes
3. Build + lint pass

**Phase 2 — Wire the gate per tool:**
4. Wire `<ActionGate>` into all 16 sites in batches of ~4 tools
5. Rip out ad-hoc 401 / `INSUFFICIENT_CREDITS` text per tool
6. Smoke test each tool signed out + signed in + zero credits

**Phase 3 — Polish (deferred):**
7. Replace `cost={1}` placeholders with real per-action costs
8. Copy tuning
9. Optional analytics hook for conversion tracking

### Testing strategy

- **Unit:** `<ActionGate>` rendered with mocked `useAuth` / `useCredits` covering all 4 states (loading / signed-out / no-credits / ready). Mock `signInWithOAuth` and `fetch` to assert call args.
- **Integration:** One e2e test per phase — Phase 1 hits a gated API anonymously and asserts 401; Phase 2 navigates a tool, verifies the sign-in card replaces the CTA when signed out and the top-up card appears when balance < cost.
- **Manual smoke:** Each tool gets a 3-step manual check: (a) anonymous → see sign-in card, (b) sign in → CTA renders, (c) drain credits → see top-up card. Window-focus refresh verified by opening Checkout in new tab and switching back.

### Risks & mitigations

| Risk | Mitigation |
|---|---|
| Layout shift while `useAuth`/`useCredits` resolve | `GateSkeleton` matches CTA height |
| Tool author wraps the wrong button | Code review against the 16-site canonical list |
| Stripe webhook delay → balance stale on focus refetch | Acceptable; user clicks Generate, gets `INSUFFICIENT_CREDITS`, refetch fires again, eventually consistent |
| Music Studio's CTA is non-obvious | Flagged for Phase 2 verification |
| Multiple gates on one page (image-editor) → multiple skeleton flashes | Same `useAuth`/`useCredits` instance shared; one flash, not five |

---

## Open items deferred to implementation

1. Look up exact `cost` per AI action (Phase 3)
2. Verify Music Studio's correct CTA location (Phase 2)
3. Decide whether `<TopUpCard>` should also display the user's current balance for context

---

## Out of scope (separate efforts)

- Persisting full image-editor canvas state (filters, layers, shapes) — requires exposing `canvas.toJSON()` from `use-fabric-canvas.ts`
- Adding credit metering to story/voice-preview, enrich-page, refine
- Conversion analytics for the gate
- Auto-running the pending action after sign-in
- Redesigning `/billing` page
