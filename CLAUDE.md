# HandyTool Workspace — Project Context

## GitHub & Deployment
- **GitHub org**: `wong1982-ops` (account: loicwong1982@gmail.com)
- **SSH key**: `~/.ssh/handytool` — alias `github-handytool` in SSH config
- **Remote URL format**: `git@github-handytool:wong1982-ops/<repo>.git`
- **Repos**: handytool-client, handytool-admin, handytool-api, handytool-ui — all under `wong1982-ops`
- **Note**: local `gh` CLI is logged in as `coolloic`, cannot create repos in `wong1982-ops` org — create repos manually on GitHub if needed

## Project Stack
- **Package manager**: pnpm (NOT npm) — always use `pnpm` for scripts, installs, etc.
- **Monorepo**: pnpm workspaces (`pnpm-workspace.yaml`)
- **Styling**: Tailwind CSS v4 + SCSS (always `.scss`, never `.css`) + system font stack (no external fonts)
- **UI**: shadcn/ui + Tailwind, CSS custom properties for theming (`--ht-*`)
- **Framework**: Next.js 16 App Router, React 19, TypeScript strict

## Repo Responsibilities (MUST follow — put code in the correct repo)

| Repo | Role | What goes here | What does NOT go here |
|---|---|---|---|
| **handytool-client** | Public web client | Tool pages (`app/tools/`), tool-specific components (`tools/`), page layouts, client-side UI, `components/ui/` and `components/layout/` for client-only reusable parts | API routes, database queries, admin features |
| **handytool-admin** | Admin dashboard | Admin pages, admin-specific components, admin auth, internal management UI | Public tools, REST API endpoints, shared UI components |
| **handytool-api** | REST API service | API route handlers (`app/api/`), Supabase database access, Zod validation, auth middleware, business logic, response helpers | UI components, page templates, CSS/styling |
| **handytool-ui** | Shared UI library | Design tokens (SCSS), CSS custom properties, React components shared across client AND admin, exported via `src/index.ts` | App-specific logic, API calls, routing, page components |

### Dependency Rules
```
handytool-client  →  handytool-ui (workspace:*)
handytool-admin   →  handytool-ui (workspace:*)
handytool-api     →  (standalone, no UI dependency)
handytool-ui      →  (no app dependencies, only react/react-dom peers)
```

- **handytool-ui** must NEVER import from client, admin, or api
- **handytool-client** and **handytool-admin** must NEVER import from each other
- **handytool-api** is independently deployable (port 3001), no UI dependency
- If a component is needed by BOTH client and admin → extract to **handytool-ui**
- If a component is only used in one app → keep it in that app's repo

## Tool Development Pattern (FOLLOW FOR ALL NEW TOOLS)
See [.claude/tool-pattern.md](.claude/tool-pattern.md) for full details.

**Summary:**
- Each tool gets its own directory: `app/tools/<toolname>/page.tsx` (route)
- Tool-specific components go in: `tools/<toolname>/` (at project root)
- Reusable UI primitives go in: `components/ui/`
- Layout components go in: `components/layout/`
- Use `@/` path alias for imports
- Mobile-first responsive design
- Mock data first, API integration later
- Use CSS custom properties `var(--ht-color-primary-500)` for brand colors

## Brand Colors (from design)
- Primary (blue): #3D6AF2 → #3D79F2 → #3D9DF2
- Secondary (teal/cyan): #32A9D9 → #32D9D9

## Existing Reusable Components (components/ui/)
- `glass-card.tsx` — Glass morphism card with optional glow
- `search-bar.tsx` — Input with icon + action button
- `info-card.tsx` — Icon + label + value + status card
- `badge.tsx` — Pill badge with icon + text
- `detail-list.tsx` — Key-value row list
- `icon-box.tsx` — Colored icon container
- `copy-button.tsx` — Copy-to-clipboard with feedback

## Existing Layout Components (components/layout/)
- `header.tsx` — Sticky nav with dark mode toggle
- `footer.tsx` — Footer with links

## UI/UX Implementation Guideline
See [.claude/ui-ux-guideline.md](.claude/ui-ux-guideline.md) — MUST follow for all UI work.
Key rules: WCAG 2.1 AA, 4.5:1 contrast for text, 44px touch targets, mobile-first, semantic HTML, Core Web Vitals 90+.

## Skills (global ~/.claude/skills/)
- **seo-expert** — SEO audit, meta tags, structured data, Core Web Vitals
- **ui-ux-react-dev** — Accessibility, responsive design, performance, component architecture
- **api-dev** — REST/tRPC APIs, validation, error handling, auth, rate limiting
- **architect** — System design, monorepo structure, rendering strategy, state management

## Session Continuity (MANDATORY)
Before starting any implementation, write a summary to [.claude/session-log.md](.claude/session-log.md).

**Rules:**
1. At session start: read `.claude/session-log.md` to check for unfinished work
2. Before executing: append a new entry with task, plan, and file list
3. During execution: update status as steps complete
4. If interrupted: the next session reads the log and continues from last checkpoint

## Key Learnings
- Tailwind v4 uses `@import "tailwindcss"` and `@theme inline` in globals.css
- Leaflet must be dynamically imported with `ssr: false` in Next.js
- Use `workspace:*` for local package dependencies in pnpm
