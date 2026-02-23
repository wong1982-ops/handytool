# Toolk1t Workspace — Project Context

## GitHub & Deployment
- **GitHub org**: `wong1982-ops` (account: loicwong1982@gmail.com)
- **SSH key**: `~/.ssh/handytool` — alias `github-handytool` in SSH config
- **Remote URL format**: `git@github-handytool:wong1982-ops/<repo>.git`
- **Repos**: toolk1t-client, toolk1t-admin, toolk1t-api, toolk1t-ui — all under `wong1982-ops`
- **Note**: local `gh` CLI is logged in as `coolloic`, cannot create repos in `wong1982-ops` org — create repos manually on GitHub if needed

## Project Stack
- **Package manager**: pnpm (NOT npm) — always use `pnpm` for scripts, installs, etc.
- **Monorepo**: pnpm workspaces (`pnpm-workspace.yaml`)
- **Styling**: Tailwind CSS v4 + SCSS (always `.scss`, never `.css`) + system font stack (no external fonts)
- **UI**: shadcn/ui + Tailwind, CSS custom properties for theming (`--tk-*`)
- **Framework**: Next.js 16 App Router, React 19, TypeScript strict
- **Testing**: Use `webapp-testing` skill for verifying UI functionality via browser automation

## Repo Responsibilities (MUST follow — put code in the correct repo)

| Repo | Role | What goes here | What does NOT go here |
|---|---|---|---|
| **toolk1t-client** | Public web client | Tool pages (`app/tools/`), tool-specific components (`tools/`), page layouts, client-side UI, `components/ui/` and `components/layout/` for client-only reusable parts | API routes, database queries, admin features |
| **toolk1t-admin** | Admin dashboard | Admin pages, admin-specific components, admin auth, internal management UI | Public tools, REST API endpoints, shared UI components |
| **toolk1t-api** | REST API service | API route handlers (`app/api/`), Supabase database access, Zod validation, auth middleware, business logic, response helpers | UI components, page templates, CSS/styling |
| **toolk1t-ui** | Shared UI library | Design tokens (SCSS), CSS custom properties, React components shared across client AND admin, exported via `src/index.ts` | App-specific logic, API calls, routing, page components |

### Dependency Rules
```
toolk1t-client  →  toolk1t-ui (workspace:*)
toolk1t-admin   →  toolk1t-ui (workspace:*)
toolk1t-api     →  (standalone, no UI dependency)
toolk1t-ui      →  (no app dependencies, only react/react-dom peers)
```

- **toolk1t-ui** must NEVER import from client, admin, or api
- **toolk1t-client** and **toolk1t-admin** must NEVER import from each other
- **toolk1t-api** is independently deployable (port 3001), no UI dependency
- If a component is needed by BOTH client and admin → extract to **toolk1t-ui**
- If a component is only used in one app → keep it in that app's repo

### toolk1t-ui — Shared Component Library (IMPORTANT)

**toolk1t-ui** is the single source of truth for reusable UI components shared across apps. It can be consumed in two ways:

| Method | When | How |
|---|---|---|
| **pnpm workspace** (local dev) | During development in the monorepo | `"@wong1982-ops/toolk1t-ui": "workspace:*"` in `package.json` |
| **npm install** (published) | External projects or CI without monorepo | `pnpm add @wong1982-ops/toolk1t-ui` after publishing to npm |

**What goes in toolk1t-ui:**
- Design tokens (SCSS variables, CSS custom properties)
- Reusable React components used by **both** client and admin (buttons, cards, badges, inputs, modals, etc.)
- Component exports via `src/index.ts` (barrel file)
- No app-specific logic, no API calls, no routing, no page components

**Package structure:**
```
toolk1t-ui/
├── package.json              # name: "@wong1982-ops/toolk1t-ui"
├── src/
│   ├── index.ts              # Barrel export — all public components
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── styles/
│       ├── tokens.scss       # Design tokens (colors, spacing, typography)
│       └── globals.scss      # Global styles
└── tsconfig.json
```

**Import pattern (from client or admin):**
```tsx
// ✅ Import from package name (works with workspace:* AND npm)
import { Button, Card, Badge } from '@wong1982-ops/toolk1t-ui'

// ❌ Never import from relative paths across packages
import { Button } from '../../toolk1t-ui/src/components/button'
```

**Publishing to npm:**
```bash
cd toolk1t-ui
pnpm build
npm publish --access public
```

**Component extraction rule:**
- Component used in **1 app only** → keep in that app's `components/ui/`
- Component used in **2+ apps** → extract to `toolk1t-ui`, export from `src/index.ts`
- When extracting: move the component, update imports in all consumers, verify build passes

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
- Use CSS custom properties `var(--tk-color-primary-500)` for brand colors

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

## Development Lifecycle (MANDATORY)
All features MUST follow the 3-phase lifecycle defined in [.claude/dev-lifecycle.md](.claude/dev-lifecycle.md):
- **Phase 1 — Discovery**: PO + BA + UX + UI + Architect + QA Lead collaborate on PRD
- **Phase 2 — Build**: Dev + QA work in parallel (implementation + webapp-testing verification)
- **Phase 3 — Review**: PO + UX + UI + QA + Architect review, score 7 dimensions, APPROVED or NEEDS ITERATION
- **Iteration**: Back to Phase 1 with refined PRD, max 3 cycles per feature

## Team Roles & Skills (global ~/.claude/skills/)

### Discovery (Phase 1)
- **product-owner** — Product vision, PRD authoring, backlog priority, competitive benchmarking, approval gate
- **business-analyst** — Requirements elicitation, user stories, acceptance criteria, edge cases, process mapping
- **ux-designer** — User research, personas, user flows, wireframes, 5-state design, usability heuristics
- **ui-designer** — Visual design, color/typography specs, component styling, dark mode, design consistency

### Build (Phase 2)
- **ui-ux-react-dev** — Front-end dev: React/Next.js, responsive layouts, accessibility, component architecture
- **api-dev** — Back-end dev: REST APIs, Zod validation, auth, rate limiting, caching
- **architect** — System design, NFRs (security, encryption, performance, caching, scalability)
- **seo-expert** — Meta tags, structured data, Core Web Vitals, semantic HTML

### Review & Quality (Phase 3)
- **qa-engineer** — Test planning, `webapp-testing` skill for browser verification, manual testing, bug reports, QA sign-off

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
