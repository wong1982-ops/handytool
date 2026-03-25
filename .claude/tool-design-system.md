# Tool Design System — Toolk1t

This is the design system and behavioral guideline for ALL tools. Every new tool and every update to an existing tool MUST follow these rules. This acts as the single source of truth for typography, colors, spacing, components, layout, and interaction patterns.

---

## 1. Foundation Tokens

### Colors

All tools use the dark theme by default. Use these exact values — NO hardcoding one-off hex values.

| Token | Value | Usage |
|-------|-------|-------|
| `--page-bg` | `#090f16` | Page background |
| `--card-bg` | `#131a23` | Cards, panels, inputs, dropdowns |
| `--card-bg-hover` | `#1e2631` | Card/button hover state |
| `--border` | `#1e2631` | Borders, dividers, input borders |
| `--text-primary` | `#FFFFFF` | Headings, important text |
| `--text-secondary` | `#a6abb5` | Labels, descriptions |
| `--text-muted` | `#70767f` | Hints, placeholders, metadata |
| `--text-disabled` | `#4a5060` | Disabled text, char counters |
| `--primary` | `#3D6AF2` | Primary actions, links, active states |
| `--primary-glow` | `rgba(61,106,242,0.4)` | Selection glow, focus rings |
| `--primary-gradient` | `from-[#3D6AF2] to-[#7C3AED]` | Gradient buttons, progress rings |
| `--secondary` | `#32A9D9` | Secondary accents (teal/cyan) |
| `--success` | `#10B981` / emerald-500 | Free actions, success states |
| `--danger` | `#EF4444` / red-500 | Errors, destructive actions, record button |
| `--credit` | `#7C3AED` / purple | Credit-gated features |

**Tailwind usage in code:**
```tsx
// ✅ Correct — use the token values directly
className="bg-[#090f16]"          // page bg
className="bg-[#131a23]"          // card bg
className="text-[#a6abb5]"        // label text
className="border-[#1e2631]"      // border
className="text-[#3D6AF2]"        // primary text/link

// ✅ Correct — use Tailwind colors for semantic states
className="bg-emerald-600"        // free action button
className="bg-red-500"            // error / record
className="bg-[#7C3AED]/30 text-[#c084fc]"  // credit badge

// ❌ Wrong — never invent new hex values
className="bg-[#0d1117]"          // use #090f16 or #131a23
className="text-[#93aaff]"        // use #a6abb5 or #3D6AF2
```

### Typography

| Element | Style | Tailwind |
|---------|-------|----------|
| Page title | 24-36px, extrabold, white | `text-2xl sm:text-4xl font-extrabold text-white` |
| Title gradient word | Blue-to-purple gradient | `text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9]` |
| Section label | 14px, medium, secondary | `text-sm font-medium text-[#a6abb5]` |
| Body text | 14px, normal, secondary | `text-sm text-[#a6abb5]` |
| Muted text | 12px, normal, muted | `text-xs text-[#70767f]` |
| Tiny label | 10px, bold, uppercase, muted | `text-[10px] font-bold uppercase tracking-wider text-[#70767f]` |
| Input text | 14px, normal, white | `text-sm text-white` |
| Button text | 14px, semibold, white | `text-sm font-semibold text-white` |

### Spacing

| Context | Value | Tailwind |
|---------|-------|----------|
| Page padding | 16px mobile, 24px desktop | `px-4 md:px-6` |
| Section gap | 24px | `space-y-6` |
| Card padding | 12-16px | `p-3` or `p-4` |
| Grid gap | 12px | `gap-3` |
| Button gap in row | 12px | `gap-3` |
| Element spacing (tight) | 8px | `gap-2` |

### Borders & Radius

| Element | Radius | Border |
|---------|--------|--------|
| Cards, panels | `rounded-xl` (12px) | `border border-[#1e2631]` |
| Buttons | `rounded-xl` (12px) | none (filled) or `border border-[#3D6AF2]` (outline) |
| Inputs | `rounded-xl` (12px) | `border border-[#1e2631] focus:border-[#3D6AF2]` |
| Small pills / badges | `rounded-full` | varies |
| Images / thumbnails | `rounded-lg` (8px) | none or `border-2 border-white/10` |

---

## 2. Foundation Components

Every tool MUST use these shared components from `components/ui/`. Do NOT recreate them inline.

### `AILoadingSpinner` — `components/ui/ai-loading-spinner.tsx`

Used for ALL AI generation loading states. Never build a custom spinner.

```tsx
<AILoadingSpinner
  messages={['Generating...', 'Almost there...']}
  subtitle="Processing 12 items"
  icon="✦"              // or custom SVG
  size="lg"             // sm | md | lg
  interval={2500}
/>
```

### `ToolBreadcrumb` — `components/ui/tool-breadcrumb.tsx`

Used on EVERY tool page. Placed above the main content.

```tsx
<ToolBreadcrumb toolName="Logo Generator" toolSlug="logo-generator" />
```

### `FavoriteButton` — `components/ui/favorite-button.tsx`

Used in tool headers for star/favorite functionality.

### `BackButton` — `components/ui/back-button.tsx`

Used in mobile navigation and tool headers.

### Credit Badge Pattern

For credit-gated actions, use this consistent badge:

```tsx
<span className="text-xs font-medium bg-[#7C3AED]/30 text-[#c084fc] px-2 py-0.5 rounded-full">
  1 credit
</span>
```

### Error Banner Pattern

All tools MUST display errors the same way:

```tsx
{error && (
  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
    {error}
  </div>
)}
```

---

## 3. Layout Patterns

Tools fall into two categories. Choose the appropriate one and follow it exactly.

### Pattern A: Wizard Flow

**Use for:** Sequential generation tools (Logo Generator, Font Generator, Sketch to Art)

```
┌────────────────────────────────────────┐
│  ToolBreadcrumb                        │
│                                        │
│  Title  <gradient>Word</gradient>      │
│  Subtitle (step description)           │
│                                        │
│  [Create] [My History]   ← tab toggle  │
│                                        │
│  ① ─── ② ─── ③ ─── ④ ─── ⑤  ← steps │
│                                        │
│  ┌──────────────────────────┐          │
│  │    Step Content           │          │
│  │                           │          │
│  │    [Back]    [Next]       │          │
│  └──────────────────────────┘          │
└────────────────────────────────────────┘
```

Rules:
- `max-w-4xl mx-auto` centered content
- Page bg: `bg-[#090f16]`
- Tab toggle: Create / My [Items] — pill buttons, active `bg-[#3D6AF2] text-white`
- Step indicator: numbered circles connected by lines (desktop), compact pills (mobile)
- Step labels: descriptive verb phrases ("Choose your style", "Preview results")
- Navigation: Back (outline) + Next (gradient) buttons at bottom of each step
- Auto-save after generation step completes

### Pattern B: Studio Layout

**Use for:** Real-time / canvas tools (Music Studio, Mood Board, ID Photo)

```
Desktop:
┌────────────────────────────────────────────┐
│  ToolBreadcrumb    [Studio] [My Items]     │
├─────────────┬──────────────────────────────┤
│  Left Panel │      Main Canvas / Content    │
│  (w-80)     │                              │
│  Controls   │                              │
│  Inputs     │                              │
│  Actions    │                              │
├─────────────┴──────────────────────────────┤
│  Bottom Bar (transport / status / actions)  │
└────────────────────────────────────────────┘

Mobile:
┌────────────────────┐
│  ToolBreadcrumb    │
│  Main Content      │
│                    │
│  ┌────────────┐    │
│  │  [+] FAB   │    │  ← opens controls as bottom sheet
│  └────────────┘    │
│  Bottom Bar        │
└────────────────────┘
```

Rules:
- Full-width layout (no `max-w-4xl`)
- Left panel: `w-80 shrink-0 overflow-y-auto border-r border-[#1e2631]`
- Mobile: hide left panel, show floating action button (FAB) at bottom-right
- FAB opens controls as bottom sheet / drawer
- Add to `FULL_SCREEN_PATHS` in `mobile-shell.tsx`

---

## 4. Interaction Patterns

### Touch Targets

ALL interactive elements: `min-h-[44px]` minimum height. No exceptions.

### Cursor

- Clickable elements: `cursor-pointer`
- Disabled: `disabled:cursor-not-allowed disabled:opacity-40`
- Draggable: `cursor-grab` / `cursor-grabbing`

### Buttons

| Type | Style |
|------|-------|
| Primary (Next, Generate) | `bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px]` |
| Secondary (Back) | `border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] font-semibold hover:bg-[#3D6AF2]/10` |
| Free action | `bg-emerald-600 hover:bg-emerald-500 text-white` |
| Credit action | `bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white` + credit badge |
| Danger | `bg-red-500 text-white` |
| Ghost | `text-[#a6abb5] hover:text-white hover:bg-[#1e2631] rounded-lg` |

### Selection States

Active/selected cards and buttons:
```tsx
className="shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)]"
```

### Input Fields

```tsx
className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors"
```

### Textarea with Counter

```tsx
<textarea maxLength={500} className="..." />
<p className="text-[10px] text-[#4a5060] mt-1 text-right">{value.length}/500</p>
```

---

## 5. History / Persistence Pattern

Every AI generation tool MUST persist user-generated content.

### Rules:

1. **Tab toggle** at the top: "Create" / "My [Items]" (e.g., My Logos, My Fonts, My Clips)
2. **Auto-save** after generation succeeds — fire-and-forget POST, don't block UX
3. **History API**: `GET /api/v1/{tool}/history` (auth required, last 50 items)
4. **History component** follows this pattern:
   - Loading: `AILoadingSpinner` with size="sm"
   - Error: message + retry button
   - Empty: icon + "No [items] yet" + description
   - Entry card: thumbnail + title + metadata + date, click to reload into editor
5. **Database table** with RLS: users read/update own rows only

### Entry Card Pattern:

```tsx
<button className="w-full rounded-xl bg-[#131a23] hover:bg-[#1e2631] border border-[#1e2631] hover:border-[#3D6AF2]/30 transition-all p-4 text-left cursor-pointer group">
  <div className="flex gap-4">
    {/* Thumbnail */}
    <img src={previewUrl} className="w-16 h-16 rounded-lg object-cover bg-white shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-white font-semibold text-sm truncate group-hover:text-[#3D6AF2]">{title}</p>
      <p className="text-[#70767f] text-xs mt-0.5">{metadata} · {date}</p>
    </div>
  </div>
</button>
```

---

## 6. Credit Model Pattern

| Action Type | Cost | Button Style |
|-------------|------|-------------|
| Generate / Preview | Free | Primary gradient |
| Download basic (PNG, MP3) | Free | Emerald `bg-emerald-600` |
| Download premium (SVG, WAV, PDF) | 1-2 credits | Purple `bg-[#7C3AED]` + credit badge |
| Iterative AI generation | 1 credit | Purple with badge |

### Insufficient Credits Error:

```tsx
return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
```

Client-side: show credit purchase prompt or redirect to billing.

---

## 7. Mobile Rules

1. **All tools**: Add `style={{ overscrollBehaviorX: 'none' }}` on `<main>` to prevent swipe-back
2. **Studio tools**: Add to `FULL_SCREEN_PATHS` in `components/mobile/mobile-shell.tsx`
3. **Sidebars on mobile**: Hidden by default, opened via FAB or gear icon
4. **Bottom sheets**: Use fixed positioning with backdrop overlay `bg-black/40`
5. **Responsive grids**:
   - Cards: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
   - Character grids: `grid-cols-3 sm:grid-cols-4 md:grid-cols-6`
   - Launchpads: `grid-cols-2 sm:grid-cols-4`

---

## 8. API Route Pattern

Every tool API follows this structure:

```ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 30  // adjust per route

export async function POST(request: Request) {
  // 1. Auth check (if required)
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // 2. Parse & validate body
  let body: { ... }
  try { body = await request.json() }
  catch { return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400) }

  // 3. Credit deduction (if required)
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', { ... })
  if (creditError) return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)

  // 4. Business logic (Gemini, R2, etc.)
  // 5. Return apiSuccess({ data })
}
```

### Gemini Helper Pattern

Each tool creates a shared helper at `lib/{tool-name}/gemini.ts`:
```ts
export async function callGeminiImage(prompt: string): Promise<Buffer>
```

Do NOT duplicate the Gemini call function across multiple route files.

### R2 Storage Path

```
{tool-name}/{projectUuid}/{identifier}.{ext}
```

---

## 9. Checklist for New Tools

Before a tool is considered complete, verify:

- [ ] Uses `ToolBreadcrumb` at the top
- [ ] Uses `AILoadingSpinner` for all AI loading states
- [ ] Uses standard error banner pattern
- [ ] Has "Create" / "My [Items]" tab toggle (if AI-generated)
- [ ] Auto-saves generated content to DB
- [ ] Credit-gated features use purple styling + badge
- [ ] All buttons have `min-h-[44px]`
- [ ] All clickable elements have `cursor-pointer`
- [ ] Mobile layout tested (375px viewport)
- [ ] Added to `lib/tools.tsx` and `bento-showcase.tsx`
- [ ] Added to `FULL_SCREEN_PATHS` if studio layout
- [ ] Gemini helper is in `lib/{tool}/gemini.ts` (not duplicated in routes)
- [ ] Uses token colors from Section 1 (no custom hex values)
- [ ] Passes `npx tsc --noEmit` and `pnpm build`
