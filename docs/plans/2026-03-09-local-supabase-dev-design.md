# Local Supabase Dev Setup — Design Document

**Date:** 2026-03-09
**Status:** Approved

## Understanding Summary

- **What:** Run Supabase locally via Docker for fully offline development — DB, Auth, Storage
- **Why:** Cloud Supabase is down/stuck; need to develop and test without dependency on it
- **Who:** Sole developer, local dev only
- **Key constraints:**
  - Toggled via `NEXT_PUBLIC_SUPABASE_MODE=local` env var
  - Auth bypassed locally — auto-assigns hardcoded test user (`loicwong1982@gmail.com`)
  - All existing migrations + RPCs applied automatically
  - Seed data includes: test user (premium), sample books, series with characters, credits, entitlements
  - `story-assets` Storage bucket created locally
- **Non-goals:** No changes to production code paths; no Google OAuth locally; no RLS enforcement needed locally

## Assumptions

- Docker Desktop is installed and running with enough resources (~6 containers, ~2GB RAM)
- Supabase CLI installed via Homebrew
- Seed script is idempotent (re-runnable via `ON CONFLICT DO NOTHING`)
- One premium-tier test user is sufficient to exercise all features
- Service role key used locally to bypass RLS (dev-only)

## Decision Log

| # | Decision | Alternatives Considered | Reason |
|---|----------|------------------------|--------|
| 1 | Supabase CLI local dev stack | Custom Docker Compose, Postgres-only + mock Storage | Official tooling, full parity, least custom code |
| 2 | Environment variable toggle (`NEXT_PUBLIC_SUPABASE_MODE=local`) | Auto-detect, separate npm scripts | Explicit, simple, no magic |
| 3 | Auth bypass with hardcoded user ID | Local email/password login, JWT mocking | Simplest — no login screen needed for dev |
| 4 | Service role key for local dev (bypasses RLS) | Mock JWT with user claims | Dev-only, avoids auth.uid() issues in RPCs |
| 5 | Single `lib/local-dev.ts` constants file | Scattered env vars, per-file constants | Single source of truth, shared by server + client |
| 6 | `supabase/seed.sql` with `ON CONFLICT DO NOTHING` | Separate seed script, manual data | Idempotent, runs automatically, standard Supabase pattern |
| 7 | Premium tier test user | Free tier, multiple users | Exercises all features without hitting gates |
| 8 | `.env.local.example` template | README only | Copy-paste setup, no guessing |
| 9 | Placeholder illustration URLs in seed | Real images, no images | Exercises flows without external dependencies |

## Design

### 1. Supabase CLI Setup

**Install:**
```bash
brew install supabase/tap/supabase
```

**Init (one-time):**
```bash
supabase init
```
Creates `supabase/config.toml`. Existing `supabase/migrations/` directory is picked up automatically.

### 2. Environment Configuration

**`.env.local.example`** (new file, committed):
```
# Local Supabase dev mode
NEXT_PUBLIC_SUPABASE_MODE=local

# Local Supabase (from `supabase start` output)
NEXT_PUBLIC_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
SUPABASE_LOCAL_ANON_KEY=<from supabase start>
SUPABASE_LOCAL_SERVICE_ROLE_KEY=<from supabase start>

# Cloud Supabase (existing, unchanged)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Local Dev Constants (`lib/local-dev.ts`)

```ts
export const LOCAL_DEV_USER_ID = '00000000-0000-0000-0000-000000000001'
export const LOCAL_DEV_EMAIL = 'loicwong1982@gmail.com'
export const isLocalDev = process.env.NEXT_PUBLIC_SUPABASE_MODE === 'local'
```

### 4. Supabase Client Switching (`lib/supabase/server.ts`)

- Check `isLocalDev`
- If local → create client with `NEXT_PUBLIC_SUPABASE_LOCAL_URL` + `SUPABASE_LOCAL_SERVICE_ROLE_KEY`
- If cloud → existing behavior (unchanged)

### 5. Auth Bypass

**Server-side (`lib/api/response.ts` — `getAuthUserId()`):**
- If `isLocalDev` → return `LOCAL_DEV_USER_ID`
- Else → existing session check

**Client-side (`lib/hooks/use-auth.ts`):**
- If `isLocalDev` → return mock user object `{ id: LOCAL_DEV_USER_ID, email: LOCAL_DEV_EMAIL, ... }`
- Else → existing `supabase.auth.getUser()` flow

### 6. Seed Data (`supabase/seed.sql`)

Runs automatically on `supabase start` / `supabase db reset`.

Creates (all with `ON CONFLICT DO NOTHING`):

1. **Test user** in `auth.users` — UUID `00000000-...01`, email `loicwong1982@gmail.com`
2. **User entitlements** — premium tier
3. **Credits** — 100 credits
4. **One series** — "The Adventures of Luna", with art style and setting
5. **Two characters** — Luna (main character) + Whiskers (sidekick), with descriptions and voices
6. **Two sample books** — with slugs, titles, JSON page data (placeholder illustration URLs)
7. **Storage bucket** — `story-assets` with public access

### 7. Package Scripts (`package.json`)

```json
"dev:local": "NEXT_PUBLIC_SUPABASE_MODE=local next dev",
"supabase:start": "supabase start",
"supabase:stop": "supabase stop",
"supabase:reset": "supabase db reset"
```

### 8. Edge Cases

- **RPCs with `auth.uid()`:** Bypassed by using service role key (skips RLS)
- **Storage URLs:** Auto-correct — Supabase client generates URLs based on configured base URL
- **Existing `.env.local`:** Already gitignored; `.env.local.example` provides template

## Implementation Plan

### Phase 1: CLI & Project Init
1. Install Supabase CLI (`brew install supabase/tap/supabase`)
2. Run `supabase init` to generate `config.toml`
3. Create `.env.local.example`

### Phase 2: Client Switching & Auth Bypass
1. Create `lib/local-dev.ts` constants
2. Modify `lib/supabase/server.ts` — local/cloud conditional
3. Modify `lib/api/response.ts` — `getAuthUserId()` bypass
4. Modify `lib/hooks/use-auth.ts` — mock user for client-side

### Phase 3: Seed Data
1. Create `supabase/seed.sql` with test user, entitlements, credits, series, characters, books, storage bucket

### Phase 4: Scripts & Verification
1. Add convenience scripts to `package.json`
2. Run `supabase start` → verify migrations apply
3. Run `pnpm dev:local` → verify app loads with seed data
