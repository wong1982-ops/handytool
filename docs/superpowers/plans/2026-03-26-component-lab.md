# Component Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered UI component builder with multi-framework output (React, Vue, Svelte, HTML), split-panel studio with live preview, CodeMirror editor, AI chat refinement, personal library, and public sharing.

**Architecture:** Split-panel studio layout. Gemini generates code for all 4 frameworks in a single API call. Live preview via sandboxed iframe with CDN framework runtimes. CodeMirror 6 for code editing (already in project). AI chat sends refinement instructions with full context for iterative improvement. Components saved to Supabase, thumbnails to R2.

**Tech Stack:** Next.js 16, React 19, TypeScript, Gemini API, CodeMirror 6, sandboxed iframe, Supabase, Cloudflare R2, html-to-image, Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/component-lab/types.ts` | Types, settings, framework list, constants |
| `tools/component-lab/prompts.ts` | Gemini prompt templates for generation + refinement |
| `tools/component-lab/component-lab.tsx` | Main studio orchestrator (split panel) |
| `tools/component-lab/prompt-panel.tsx` | Left panel: prompt, image upload, settings |
| `tools/component-lab/live-preview.tsx` | Iframe sandbox with viewport controls |
| `tools/component-lab/code-editor.tsx` | CodeMirror with framework tabs |
| `tools/component-lab/chat-bar.tsx` | AI refinement chat input + history |
| `tools/component-lab/library-grid.tsx` | My Library grid view |
| `tools/component-lab/explore-grid.tsx` | Public explore grid view |
| `tools/component-lab/component-viewer.tsx` | Shared component read-only view |
| `app/tools/component-lab/page.tsx` | Main studio page |
| `app/tools/component-lab/library/page.tsx` | My Library page |
| `app/tools/component-lab/explore/page.tsx` | Explore page |
| `app/tools/component-lab/view/[slug]/page.tsx` | Shared component view |
| `app/api/v1/component-lab/generate/route.ts` | Generate component (4 frameworks) |
| `app/api/v1/component-lab/refine/route.ts` | AI refinement |
| `app/api/v1/component-lab/save/route.ts` | Save to library (1 credit) |
| `app/api/v1/component-lab/library/route.ts` | Fetch user's components |
| `app/api/v1/component-lab/explore/route.ts` | Fetch public components |
| `app/api/v1/component-lab/[slug]/route.ts` | Fetch single component |
| `supabase/migrations/031_components.sql` | DB table + RLS |

---

### Task 1: Types, Constants & Prompt Templates

**Files:**
- Create: `tools/component-lab/types.ts`
- Create: `tools/component-lab/prompts.ts`

**Dependencies:** Install missing CodeMirror language packages:
```bash
pnpm add @codemirror/lang-javascript @codemirror/lang-html
```

- [ ] **Step 1: Create types and constants**

```ts
// tools/component-lab/types.ts

export type Framework = 'react' | 'vue' | 'svelte' | 'html'
export type ThemeSetting = 'light' | 'dark' | 'both'
export type AnimationLevel = 'none' | 'subtle' | 'rich'
export type A11yLevel = 'standard' | 'wcag-aa'
export type CssFramework = 'tailwind' | 'vanilla' | 'none'

export const FRAMEWORKS: { id: Framework; label: string; lang: string }[] = [
  { id: 'react', label: 'React', lang: 'jsx' },
  { id: 'vue', label: 'Vue', lang: 'html' },
  { id: 'svelte', label: 'Svelte', lang: 'html' },
  { id: 'html', label: 'HTML', lang: 'html' },
]

export interface ComponentSettings {
  theme: ThemeSetting
  responsive: boolean
  animations: AnimationLevel
  accessibility: A11yLevel
  cssFramework: CssFramework
}

export const DEFAULT_SETTINGS: ComponentSettings = {
  theme: 'light',
  responsive: true,
  animations: 'subtle',
  accessibility: 'standard',
  cssFramework: 'tailwind',
}

export interface GeneratedCode {
  react: string
  vue: string
  svelte: string
  html: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ComponentVersion {
  code: GeneratedCode
  timestamp: number
}

export interface ComponentSession {
  prompt: string
  settings: ComponentSettings
  referenceImageBase64: string | null
  code: GeneratedCode
  versions: ComponentVersion[]
  versionIndex: number
  chatHistory: ChatMessage[]
  activeFramework: Framework
}

export interface SavedComponent {
  id: string
  name: string
  slug: string
  tags: string[]
  prompt: string
  settings: ComponentSettings
  codeReact: string
  codeVue: string
  codeSvelte: string
  codeHtml: string
  thumbnailUrl: string | null
  isPublic: boolean
  copyCount: number
  createdAt: string
  updatedAt: string
}

export const DEFAULT_SESSION: ComponentSession = {
  prompt: '',
  settings: DEFAULT_SETTINGS,
  referenceImageBase64: null,
  code: { react: '', vue: '', svelte: '', html: '' },
  versions: [],
  versionIndex: -1,
  chatHistory: [],
  activeFramework: 'react',
}

export const VIEWPORT_PRESETS = [
  { label: 'Mobile', width: 375 },
  { label: 'Tablet', width: 768 },
  { label: 'Desktop', width: 1280 },
]

export const PROMPT_PLACEHOLDERS = [
  'A pricing table with 3 tiers, toggle for monthly/annual...',
  'A dark mode toggle button with smooth animation...',
  'A file upload dropzone with drag-and-drop and progress bar...',
  'A testimonial carousel with avatar, quote, and navigation dots...',
  'A search bar with autocomplete dropdown and recent searches...',
  'A notification bell with badge count and dropdown panel...',
]
```

- [ ] **Step 2: Create prompt templates**

```ts
// tools/component-lab/prompts.ts

import type { ComponentSettings, Framework } from './types'

function settingsToPrompt(settings: ComponentSettings): string {
  const parts: string[] = []
  if (settings.theme === 'both') parts.push('Include both light and dark mode variants.')
  else parts.push(`Use a ${settings.theme} theme.`)
  if (settings.responsive) parts.push('Make it fully responsive with mobile breakpoints.')
  if (settings.animations === 'subtle') parts.push('Add subtle hover/transition animations.')
  else if (settings.animations === 'rich') parts.push('Add rich animations (enter, hover, click feedback, transitions).')
  if (settings.accessibility === 'wcag-aa') parts.push('Ensure WCAG AA: proper aria labels, focus states, 4.5:1 contrast ratio, keyboard navigation.')
  if (settings.cssFramework === 'tailwind') parts.push('Use Tailwind CSS utility classes for styling.')
  else if (settings.cssFramework === 'vanilla') parts.push('Use vanilla CSS with a <style> block.')
  else parts.push('Use inline styles only, no external CSS framework.')
  return parts.join(' ')
}

export function buildGeneratePrompt(description: string, settings: ComponentSettings): string {
  const settingsText = settingsToPrompt(settings)

  return `You are an expert frontend developer. Generate a UI component based on this description:

"${description}"

Requirements:
${settingsText}

Generate the component in ALL 4 frameworks. Each must be a complete, self-contained, production-ready component that looks visually identical across frameworks.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "react": "// Complete React component with JSX. Export default function. Include all imports. If Tailwind, use className.",
  "vue": "<!-- Complete Vue 3 SFC with <template>, <script setup>, and <style scoped> sections -->",
  "svelte": "<!-- Complete Svelte component with <script>, HTML, and <style> sections -->",
  "html": "<!-- Complete standalone HTML with inline <style> and <script> if needed. No framework dependencies. -->"
}

Rules:
- Each framework output must be COMPLETE and SELF-CONTAINED (no external imports except the framework itself)
- React: use functional component with hooks, export default
- Vue: use Composition API with <script setup>
- Svelte: standard Svelte component syntax
- HTML: pure HTML + CSS + vanilla JS, no framework
- All outputs must look visually identical when rendered
- Use modern, clean code. No comments unless complex logic.`
}

export function buildRefinePrompt(
  originalPrompt: string,
  currentCode: string,
  framework: Framework,
  instruction: string,
  settings: ComponentSettings,
): string {
  const settingsText = settingsToPrompt(settings)

  return `You are an expert frontend developer iterating on a UI component.

Original request: "${originalPrompt}"
Settings: ${settingsText}

Current ${framework} code:
\`\`\`
${currentCode}
\`\`\`

User wants this change: "${instruction}"

Apply the requested change and regenerate ALL 4 framework versions. Keep the same visual design, just apply the refinement.

Return ONLY valid JSON (no markdown):
{
  "react": "...",
  "vue": "...",
  "svelte": "...",
  "html": "...",
  "summary": "Brief description of what changed"
}`
}
```

- [ ] **Step 3: Commit**

```bash
pnpm add @codemirror/lang-javascript @codemirror/lang-html
git add tools/component-lab/types.ts tools/component-lab/prompts.ts package.json pnpm-lock.yaml
git commit -m "feat(component-lab): add types, constants, and prompt templates"
```

---

### Task 2: Database Migration & API Routes

**Files:**
- Create: `supabase/migrations/031_components.sql`
- Create: `app/api/v1/component-lab/generate/route.ts`
- Create: `app/api/v1/component-lab/refine/route.ts`
- Create: `app/api/v1/component-lab/save/route.ts`
- Create: `app/api/v1/component-lab/library/route.ts`
- Create: `app/api/v1/component-lab/explore/route.ts`
- Create: `app/api/v1/component-lab/[slug]/route.ts`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/031_components.sql
CREATE TABLE IF NOT EXISTS public.components_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  prompt TEXT,
  settings JSONB,
  code_react TEXT,
  code_vue TEXT,
  code_svelte TEXT,
  code_html TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  copy_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_components_user ON public.components_library (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_components_public ON public.components_library (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_components_slug ON public.components_library (slug);

ALTER TABLE public.components_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own components" ON public.components_library FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public read shared components" ON public.components_library FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Users insert own components" ON public.components_library FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own components" ON public.components_library FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own components" ON public.components_library FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.components_library TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.components_library TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

- [ ] **Step 3: Create generate route**

```ts
// app/api/v1/component-lab/generate/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { buildGeneratePrompt } from '@/tools/component-lab/prompts'
import type { ComponentSettings, GeneratedCode } from '@/tools/component-lab/types'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

export async function POST(request: Request) {
  let body: { prompt: string; settings: ComponentSettings; referenceImageBase64?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.prompt?.trim()) {
    return apiError('prompt is required', 'VALIDATION_ERROR', 400)
  }

  const geminiPrompt = buildGeneratePrompt(body.prompt.trim(), body.settings)

  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
    { text: geminiPrompt },
  ]
  if (body.referenceImageBase64) {
    parts.unshift({
      inlineData: { mimeType: 'image/jpeg', data: body.referenceImageBase64 },
    })
    parts.push({ text: 'Use this image as visual reference for the component design.' })
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    })

    if (!response.ok) {
      const err = await response.text()
      return apiError(`Generation failed: ${err.substring(0, 200)}`, 'GENERATION_FAILED', 500)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return apiError('Invalid AI response', 'GENERATION_FAILED', 500)

    const code: GeneratedCode = JSON.parse(jsonMatch[0])

    if (!code.react && !code.html) {
      return apiError('No code generated', 'GENERATION_FAILED', 500)
    }

    return apiSuccess(code)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return apiError(msg, 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 4: Create refine route**

```ts
// app/api/v1/component-lab/refine/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { buildRefinePrompt } from '@/tools/component-lab/prompts'
import type { ComponentSettings, Framework, GeneratedCode } from '@/tools/component-lab/types'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

export async function POST(request: Request) {
  let body: {
    prompt: string
    currentCode: string
    framework: Framework
    instruction: string
    settings: ComponentSettings
  }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.instruction?.trim()) {
    return apiError('instruction is required', 'VALIDATION_ERROR', 400)
  }

  const geminiPrompt = buildRefinePrompt(
    body.prompt,
    body.currentCode,
    body.framework,
    body.instruction.trim(),
    body.settings,
  )

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: geminiPrompt }] }] }),
    })

    if (!response.ok) {
      return apiError('Refinement failed', 'GENERATION_FAILED', 500)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return apiError('Invalid AI response', 'GENERATION_FAILED', 500)

    const result = JSON.parse(jsonMatch[0])
    const code: GeneratedCode = {
      react: result.react || '',
      vue: result.vue || '',
      svelte: result.svelte || '',
      html: result.html || '',
    }

    return apiSuccess({ code, summary: result.summary || 'Changes applied' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refinement failed'
    return apiError(msg, 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 5: Create save, library, explore, and slug routes**

`save/route.ts` — POST: auth + 1 credit deduction, generate slug from name + random suffix, insert row, return { id, slug }.

`library/route.ts` — GET: auth, fetch user's components ordered by updated_at DESC, limit 50.

`explore/route.ts` — GET: no auth, fetch public components. Query params: sort (newest|popular), tag, offset. Limit 20. Return { entries, hasMore }.

`[slug]/route.ts` — GET: no auth, fetch by slug where is_public=true. POST: increment copy_count.

All follow existing patterns: `getAuthUserId`, `apiSuccess`, `apiError`, `API_ERRORS`, `createClient`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/031_components.sql app/api/v1/component-lab/
git commit -m "feat(component-lab): add database migration and all API routes"
```

---

### Task 3: Live Preview Component

**Files:**
- Create: `tools/component-lab/live-preview.tsx`

- [ ] **Step 1: Create live preview component**

'use client' component rendering generated code in a sandboxed iframe.

Props:
```ts
interface LivePreviewProps {
  code: string
  framework: Framework
  viewportWidth: number
  background: 'white' | 'dark' | 'checker'
  onViewportChange: (width: number) => void
  onBackgroundChange: (bg: 'white' | 'dark' | 'checker') => void
}
```

Implementation:
- Uses `srcDoc` on iframe to render code
- Wraps code in a full HTML document with:
  - React: adds `<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js">`, ReactDOM, Babel standalone for JSX transform
  - Vue: adds `<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js">`
  - Svelte: code is already compiled to vanilla JS by Gemini (prompt asks for this)
  - HTML: rendered as-is
  - All: adds Tailwind CDN `<script src="https://cdn.tailwindcss.com">`
- `sandbox="allow-scripts"` (no allow-same-origin for security)
- Background toggle: 3 buttons (white/dark/checker)
- Viewport presets: 3 buttons (Mobile 375/Tablet 768/Desktop 1280) + current width display
- Container is resizable via CSS `resize: horizontal` on a wrapper
- Re-renders on code change (debounced 500ms via useEffect)
- Error handling: try-catch in the iframe, display error overlay if rendering fails

- [ ] **Step 2: Commit**

```bash
git add tools/component-lab/live-preview.tsx
git commit -m "feat(component-lab): add live preview with sandboxed iframe"
```

---

### Task 4: Code Editor Component

**Files:**
- Create: `tools/component-lab/code-editor.tsx`

- [ ] **Step 1: Create code editor component**

'use client' component using CodeMirror 6 with framework tabs.

Props:
```ts
interface CodeEditorProps {
  code: GeneratedCode
  activeFramework: Framework
  onFrameworkChange: (fw: Framework) => void
  onCodeChange: (framework: Framework, code: string) => void
  onCopy: () => void
  onReset: () => void
}
```

Implementation:
- Framework tabs at top: React / Vue / Svelte / HTML (pill buttons matching design system)
- CodeMirror 6 editor below:
  - Import from existing project packages: `codemirror`, `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`
  - New: `@codemirror/lang-javascript` (for JSX), `@codemirror/lang-html` (for Vue/Svelte/HTML)
  - Dark theme: custom theme matching `#131a23` background, `#a6abb5` text
  - Line numbers enabled
  - `onUpdate` dispatches code changes to parent (debounced)
- Copy button (top-right of editor): copies current tab's code to clipboard, shows "Copied!" toast
- Reset button: reverts to last AI-generated version
- Dynamically loaded via `next/dynamic` with `ssr: false` (CodeMirror needs DOM)
- On mobile (< md breakpoint): render a `<pre><code>` block instead of CodeMirror, with copy button

- [ ] **Step 2: Commit**

```bash
git add tools/component-lab/code-editor.tsx
git commit -m "feat(component-lab): add CodeMirror editor with framework tabs"
```

---

### Task 5: Prompt Panel & Chat Bar

**Files:**
- Create: `tools/component-lab/prompt-panel.tsx`
- Create: `tools/component-lab/chat-bar.tsx`

- [ ] **Step 1: Create prompt panel**

'use client' left sidebar.

Props:
```ts
interface PromptPanelProps {
  prompt: string
  settings: ComponentSettings
  referenceImage: string | null
  generating: boolean
  onPromptChange: (p: string) => void
  onSettingsChange: (s: Partial<ComponentSettings>) => void
  onReferenceChange: (base64: string | null) => void
  onGenerate: () => void
}
```

Sections:
1. **Component Description**: textarea max 1000 chars with counter. Rotating placeholder from `PROMPT_PLACEHOLDERS`.
2. **Reference Image**: drop zone, image/* max 10MB, thumbnail + remove. Convert to base64 via FileReader.
3. **Settings**: Theme (3 pills), Responsive (toggle), Animations (3 pills), Accessibility (2 pills), CSS Framework (3 pills). All use the design system pill button styling.
4. **Generate button**: full-width gradient primary. Disabled + spinner when generating.

- [ ] **Step 2: Create chat bar**

'use client' bottom chat bar.

Props:
```ts
interface ChatBarProps {
  chatHistory: ChatMessage[]
  versionIndex: number
  totalVersions: number
  refining: boolean
  onSend: (instruction: string) => void
  onUndo: () => void
  onRedo: () => void
}
```

Layout:
- Collapsible chat log above input (max-h-48, scroll, hidden by default, expand on click)
- User messages right-aligned blue, assistant messages left-aligned gray
- Input: single-line text input, expandable. "Describe changes..." placeholder.
- Send button (blue arrow icon). Disabled when refining.
- Version controls: "← v3 →" undo/redo buttons next to the input
- Refining indicator: pulse animation on send button

- [ ] **Step 3: Commit**

```bash
git add tools/component-lab/prompt-panel.tsx tools/component-lab/chat-bar.tsx
git commit -m "feat(component-lab): add prompt panel and chat bar"
```

---

### Task 6: Main Studio Orchestrator

**Files:**
- Create: `tools/component-lab/component-lab.tsx`
- Create: `app/tools/component-lab/page.tsx`

- [ ] **Step 1: Create main studio component**

'use client' default export composing all sub-components.

State:
- `session: ComponentSession` — from DEFAULT_SESSION
- `generating: boolean`
- `refining: boolean`

Handlers:
- `handleGenerate()`: POST to `/api/v1/component-lab/generate`, update session.code, push to versions
- `handleRefine(instruction)`: POST to `/api/v1/component-lab/refine` with current state, update code, push to versions, append to chatHistory
- `handleCodeChange(fw, code)`: update session.code[fw] directly (manual edits)
- `handleUndo/Redo()`: navigate version stack
- `handleCopy()`: copy active framework code to clipboard

Layout:
```
Desktop (lg+):
  Header: "Component" + gradient "Lab" + [Library] [Explore] [Save] buttons
  flex row flex-1:
    PromptPanel (w-72 shrink-0 overflow-y-auto border-r border-[#1e2631])
    flex-1 flex flex-col:
      flex row flex-1:
        LivePreview (flex-1)
        CodeEditor (w-[480px] shrink-0 border-l border-[#1e2631])
      ChatBar (full width, border-t)

Mobile:
  Header
  Tabbed: Preview / Code / Chat (one visible at a time)
  FAB for prompt panel (bottom sheet)
```

- [ ] **Step 2: Create page route**

```tsx
// app/tools/component-lab/page.tsx
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import ComponentLab from '@/tools/component-lab/component-lab'

export const metadata: Metadata = {
  title: 'Component Lab — AI Component Builder | Toolk1t',
  description: 'Build UI components with AI. Describe what you want, get production-ready code for React, Vue, Svelte, and HTML.',
}

export default function ComponentLabPage() {
  return (
    <main className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}>
      <div className="px-4 pt-4">
        <ToolBreadcrumb toolName="Component Lab" toolSlug="component-lab" />
      </div>
      <div className="flex-1 flex flex-col">
        <ComponentLab />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/component-lab/component-lab.tsx app/tools/component-lab/page.tsx
git commit -m "feat(component-lab): add main studio orchestrator and page route"
```

---

### Task 7: Library & Explore Pages

**Files:**
- Create: `tools/component-lab/library-grid.tsx`
- Create: `tools/component-lab/explore-grid.tsx`
- Create: `tools/component-lab/component-viewer.tsx`
- Create: `app/tools/component-lab/library/page.tsx`
- Create: `app/tools/component-lab/explore/page.tsx`
- Create: `app/tools/component-lab/view/[slug]/page.tsx`

- [ ] **Step 1: Create library grid**

'use client' component. Fetches from `/api/v1/component-lab/library`. Shows grid of saved components. Each card: thumbnail (or gradient fallback), name, tags, date, share toggle, delete button, click to open in editor.

- [ ] **Step 2: Create explore grid**

'use client' component. Fetches from `/api/v1/component-lab/explore`. Shows public components. Sort (Newest/Popular), tag filter. Each card: thumbnail, name, author, tags, copy count. Click to view. "Load more" pagination.

- [ ] **Step 3: Create component viewer**

'use client' component for shared view. Shows: live preview iframe, framework tabs with read-only code, copy button (increments copy_count via POST), "Open in Editor" link.

- [ ] **Step 4: Create page routes**

Library page: auth-gated, shows LibraryGrid.
Explore page: public, shows ExploreGrid.
View page: server component that fetches component by slug, renders ComponentViewer. 404 if not found.

- [ ] **Step 5: Commit**

```bash
git add tools/component-lab/library-grid.tsx tools/component-lab/explore-grid.tsx tools/component-lab/component-viewer.tsx app/tools/component-lab/library/ app/tools/component-lab/explore/ app/tools/component-lab/view/
git commit -m "feat(component-lab): add library, explore, and shared view pages"
```

---

### Task 8: Tool Registration

**Files:**
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`
- Modify: `components/mobile/mobile-shell.tsx`

- [ ] **Step 1: Add to tools list**

```ts
{
  name: 'Component Lab',
  href: '/tools/component-lab',
  description: 'Build UI components with AI for React, Vue, Svelte',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  color: 'from-emerald-500 to-cyan-500',
}
```

- [ ] **Step 2: Add to bento showcase**

- [ ] **Step 3: Add to FULL_SCREEN_PATHS in mobile-shell.tsx** (studio layout needs full screen)

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx components/mobile/mobile-shell.tsx
git commit -m "feat(component-lab): register tool in navigation and homepage"
```
