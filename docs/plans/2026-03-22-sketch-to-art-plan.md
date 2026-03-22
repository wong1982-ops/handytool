# Sketch to Art Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI Sketch-to-Art tool that transforms hand-drawn sketches into 18+ art styles — with upload/camera/canvas input, 4 variations per generation, chat refinement, fun/pro mode toggle, and public gallery.

**Architecture:** Wizard-style flow on a single page (5 steps: input → style → generate → refine → save/share). Nano Banana (gemini-3.1-flash-image-preview) for image generation. Drawing canvas uses HTML5 Canvas API. Gallery stored in Supabase with R2 for images. Fun/Pro mode toggle affects UI styling only (not functionality).

**Tech Stack:** Next.js App Router, React 19, TypeScript, Nano Banana (@google/genai), HTML5 Canvas API, Cloudflare R2, Supabase, Tailwind CSS v4.

**Design doc:** `docs/plans/2026-03-22-sketch-to-art-design.md`

---

### Task 1: Types & Style Data

**Files:**
- Create: `tools/sketch-to-art/types.ts`

**Step 1: Create types and constants**

NO `'use client'`. All types, style presets, and mode config.

Types:
- `SketchMode = 'fun' | 'pro'`
- `InputMethod = 'upload' | 'camera' | 'draw'`
- `WizardStep = 1 | 2 | 3 | 4 | 5`
- `ArtStyleCategory = 'classic' | 'modern' | 'fantasy'`
- `ArtStyle { id: string, name: string, category: ArtStyleCategory, funLabel: string, gradient: string }`
- `GeneratedVariation { imageUrl: string, prompt: string }`
- `RefinementMessage { role: 'user' | 'assistant', content: string, imageUrl?: string }`
- `GalleryEntry { id: string, title: string, originalSketchUrl: string, resultImageUrl: string, style: string, createdAt: string }`
- `WizardState { step, sketchDataUrl, inputMethod, selectedStyle, customStyle, variations, selectedIndex, currentImage, chatHistory, refinementCount, loading, error }`

Constants:
- `ART_STYLES: ArtStyle[]` — 18 styles in 3 categories (classic: Watercolor, Oil Painting, Impressionist, Van Gogh, Picasso, Chalk/Pastel; modern: Cartoon, Anime/Manga, Pixel Art, 3D Render, Comic Book, Pop Art; fantasy: Studio Ghibli, Stained Glass, Steampunk, Cyberpunk, Claymation, Fantasy Illustration)
- `MAX_REFINEMENTS = 5`
- `STYLE_CATEGORIES: { id: ArtStyleCategory, label: string }[]`
- `FUN_LOADING_MESSAGES: string[]` — ["Mixing paint...", "Adding sparkles...", "Waving the magic wand...", "Almost ready...", "Creating your masterpiece..."]
- `QUICK_REFINEMENTS` — fun mode: [{label, funLabel, value}] / pro mode labels

Each ArtStyle has: id (slug), name, category, funLabel (emoji version), gradient (for the card bg).

**Step 2: Commit**

```bash
git add tools/sketch-to-art/types.ts
git commit -m "feat(sketch-to-art): add types and style preset data"
```

---

### Task 2: Drawing Canvas Component

**Files:**
- Create: `tools/sketch-to-art/drawing-canvas.tsx`

**Step 1: Build the in-browser drawing tool**

`'use client'` component.

Props: `onExport: (dataUrl: string) => void, mode: SketchMode`

Features:
- HTML5 Canvas element (512x512 logical, scales to fit container width while maintaining aspect ratio)
- Tools: pen (default), eraser
- Pen sizes: thin (2px), medium (5px), thick (10px) — 3 buttons
- 8 color swatches: black, red, blue, green, yellow, orange, purple, brown
- Undo stack (max 30 states, captures canvas ImageData on each stroke end)
- Redo stack (cleared on new stroke)
- Clear canvas button (with confirmation in fun mode: "Erase everything? 🧹")
- Touch support: handle `touchstart`, `touchmove`, `touchend` alongside mouse events. Prevent scroll during drawing via `touch-action: none` on the canvas.
- Export: `canvas.toDataURL('image/png')` — called when user clicks "Next"

Fun mode: colorful toolbar bg, emoji labels ("✏️ Draw", "🧹 Erase"), larger buttons
Pro mode: minimal icon toolbar, compact

**Step 2: Commit**

```bash
git add tools/sketch-to-art/drawing-canvas.tsx
git commit -m "feat(sketch-to-art): add in-browser drawing canvas with pen, eraser, colors, undo"
```

---

### Task 3: Sketch Input Component (Upload + Camera + Draw)

**Files:**
- Create: `tools/sketch-to-art/sketch-input.tsx`

**Step 1: Build the tabbed sketch input**

`'use client'` component.

Props: `onSketchReady: (dataUrl: string) => void, mode: SketchMode`

Three tabs: Upload | Camera | Draw

**Upload tab:**
- Drag & drop zone (PNG/JPG/WebP, max 10MB)
- Thumbnail preview + "Remove" button after upload
- Converts to base64 data URL

**Camera tab:**
- On mount: request `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`
- Show live video feed in a `<video>` element
- "Capture" button: draws video frame to hidden canvas, gets data URL
- "Retake" button to go back to live feed
- If getUserMedia fails or unsupported: show message "Camera not available on this device" + link to Upload tab
- Cleanup: stop media tracks on unmount and tab switch

**Draw tab:**
- Renders `<DrawingCanvas>` component
- "Done drawing" button exports canvas and calls `onSketchReady`

**After any method produces a data URL:** Show preview thumbnail with "Use this sketch" button → calls `onSketchReady(dataUrl)`

Fun mode labels: "📸 Upload", "📱 Camera", "✏️ Draw"
Pro mode labels: "Upload", "Camera", "Draw"

**Step 2: Commit**

```bash
git add tools/sketch-to-art/sketch-input.tsx
git commit -m "feat(sketch-to-art): add sketch input with upload, camera, and draw tabs"
```

---

### Task 4: Style Picker Component

**Files:**
- Create: `tools/sketch-to-art/style-picker.tsx`

**Step 1: Build the style picker**

`'use client'` component.

Props: `selectedStyle: string | null, customStyle: string, onSelectStyle: (id: string) => void, onCustomStyleChange: (text: string) => void, mode: SketchMode`

- Category headers: "Classic Art", "Modern/Digital", "Fantasy/Creative"
- Grid of style cards: 3-col mobile, 4-col tablet, 6-col desktop
- Each card: small colored gradient square (unique per style from ART_STYLES), style name below, selected = primary border + checkmark
- Selecting a preset clears `customStyle`, typing custom clears `selectedStyle`
- Custom input at bottom: text input with placeholder "Or describe your own style..."
- Fun mode: larger cards, bounce hover (`hover:scale-105`), funLabel shown instead of name
- Pro mode: compact cards, subtle hover

**Step 2: Commit**

```bash
git add tools/sketch-to-art/style-picker.tsx
git commit -m "feat(sketch-to-art): add style picker with 18 presets and custom input"
```

---

### Task 5: Generation & Refinement API Routes

**Files:**
- Create: `app/api/v1/sketch-to-art/generate/route.ts`
- Create: `app/api/v1/sketch-to-art/refine/route.ts`

**Step 1: Build generate endpoint**

`POST /api/v1/sketch-to-art/generate`

Input: `{ sketch: string (base64 data URL), style: string, customStyle?: string }`

1. Auth required
2. Deduct 1 credit (tool_id `'sketch-to-art'`)
3. Build 4 prompt variations:
   - "Transform this child's sketch into beautiful {style} art. Maintain the original composition and subjects but elevate the artistic quality."
   - "Reimagine this hand-drawn sketch as a stunning {style} masterpiece. Keep all the elements from the drawing."
   - "Convert this sketch into {style} style art. Emphasize rich colors and details while preserving the original drawing's charm."
   - "Create a {style} interpretation of this drawing with creative artistic flair. Honor the original sketch's composition."
4. If customStyle provided, replace {style} with it
5. Generate 4 images in parallel using Nano Banana (`gemini-3.1-flash-image-preview`):
   - Each: send sketch as inline image + text prompt
   - Use `@google/genai` GoogleGenAI client with `responseModalities: ['IMAGE', 'TEXT']`
6. Upload results to R2 (`sketch-art/{uuid}-{1-4}.png`)
7. Return: `{ variations: [{ imageUrl, prompt }] }`

Error handling: collect results via `Promise.allSettled`, return whatever succeeded. If all fail, return error.

**Step 2: Build refine endpoint**

`POST /api/v1/sketch-to-art/refine`

Input: `{ originalSketch: string, currentImageUrl: string, feedback: string, style: string }`

1. Auth required
2. No credit cost (included in initial generation)
3. Use Gemini 2.5 Flash to rewrite the prompt incorporating feedback
4. Fetch current image from URL → Buffer
5. Generate new image with Nano Banana: send original sketch + current image as references + refined prompt
6. Upload to R2, return: `{ imageUrl, prompt }`

**Step 3: Commit**

```bash
git add app/api/v1/sketch-to-art/generate/route.ts app/api/v1/sketch-to-art/refine/route.ts
git commit -m "feat(sketch-to-art): add generate and refine API routes"
```

---

### Task 6: Generation Results & Refinement Chat UI

**Files:**
- Create: `tools/sketch-to-art/generation-results.tsx`
- Create: `tools/sketch-to-art/refinement-chat.tsx`

**Step 1: Build generation results**

`'use client'` component.

Props: `variations: GeneratedVariation[], selectedIndex: number | null, onSelect: (index: number) => void, loading: boolean, mode: SketchMode`

- Loading: Fun mode = animated wand icon + rotating messages from FUN_LOADING_MESSAGES. Pro mode = 4 skeleton cards + spinner.
- Results: 2x2 grid of images (rounded-2xl, border). Click to select (border highlight + checkmark).
- Fun mode: selected card gets bounce + star effect. Pro mode: subtle border.
- "Next: Refine →" button appears when selected.

**Step 2: Build refinement chat**

`'use client'` component.

Props: `currentImage: GeneratedVariation, originalSketch: string, style: string, chatHistory: RefinementMessage[], onSendMessage: (msg: string) => void, refinementCount: number, loading: boolean, error: string | null, imageHistory: GeneratedVariation[], onRevert: (index: number) => void, mode: SketchMode, onDone: () => void`

- Selected image shown large at top
- Quick suggestion pills: Fun = "🌈 More color!", "🌲 Add nature!", "✨ More sparkles!", "🌙 Make darker", "☀️ Make brighter", "🎨 More detail" / Pro = "More colorful", "Add background", "Make darker", "More detailed", "Simpler", "Add sparkles"
- Chat input + send button
- History row of previous versions (small thumbnails, click to revert)
- Counter: "{count}/5 changes remaining" (fun: "🪄 {count}/5 spells left!")
- When limit reached: disable input, show "Done" message
- "Done — Save & Share" button → calls onDone

**Step 3: Commit**

```bash
git add tools/sketch-to-art/generation-results.tsx tools/sketch-to-art/refinement-chat.tsx
git commit -m "feat(sketch-to-art): add generation results grid and refinement chat"
```

---

### Task 7: Mode Toggle + Save/Share Component

**Files:**
- Create: `tools/sketch-to-art/mode-toggle.tsx`
- Create: `tools/sketch-to-art/save-share.tsx`

**Step 1: Build mode toggle**

`'use client'` component.

Props: `mode: SketchMode, onToggle: (mode: SketchMode) => void`

- Pill toggle: "🎨 Fun" / "⚡ Pro"
- Active side highlighted with accent color
- Sticky positioned top-right within the tool container

**Step 2: Build save/share component**

`'use client'` component.

Props: `finalImage: GeneratedVariation, originalSketch: string, style: string, mode: SketchMode`

- Final image shown large (max-w-lg, rounded-2xl, shadow)
- Fun mode: "🎉 Your masterpiece is ready!" / Pro mode: "Your art is ready"
- Download PNG button (fetch imageUrl → blob → download)
- Share buttons: Copy Link, Share on X, Share on LinkedIn (same pattern as blog share)
- Gallery submit section:
  - Toggle: "Share to gallery?" (fun: "🌟 Show the world!")
  - Title input (default: "{style} transformation")
  - "Publish" button → POST to `/api/v1/sketch-to-art/gallery`
  - After publish: show "Published! View in gallery" link
- "Start Over" button to reset wizard

**Step 3: Commit**

```bash
git add tools/sketch-to-art/mode-toggle.tsx tools/sketch-to-art/save-share.tsx
git commit -m "feat(sketch-to-art): add mode toggle and save/share with gallery submit"
```

---

### Task 8: Gallery API + Gallery Page

**Files:**
- Create: `app/api/v1/sketch-to-art/gallery/route.ts`
- Create: `app/tools/sketch-to-art/gallery/page.tsx`

**Step 1: Build gallery API**

`POST /api/v1/sketch-to-art/gallery` — Submit to gallery

Input: `{ title: string, originalSketchUrl: string, resultImageUrl: string, style: string }`

Auth required, no credit cost. Insert into `sketch_gallery` table.

`GET /api/v1/sketch-to-art/gallery` — Fetch gallery entries

Query: `SELECT * FROM sketch_gallery WHERE is_public = true ORDER BY created_at DESC LIMIT 30`

Public, no auth.

**Step 2: Build gallery page**

Server component with `revalidate = 300`.

`/tools/sketch-to-art/gallery`

- Header: "Community Gallery" + subtitle
- Masonry-style grid (CSS columns: 1 mobile, 2 tablet, 3 desktop)
- Each card: result image (rounded-xl), title, style badge, date
- Hover: show "View Original" overlay → toggles between sketch and result
- "Load more" button (pagination via offset query param)
- Empty state: "No art yet. Be the first to share!"
- Link back to main tool: "Create your own →"

**Step 3: Commit**

```bash
git add app/api/v1/sketch-to-art/gallery/route.ts app/tools/sketch-to-art/gallery/page.tsx
git commit -m "feat(sketch-to-art): add gallery API and public gallery page"
```

---

### Task 9: Wizard Page + Database Migration

**Files:**
- Create: `app/tools/sketch-to-art/page.tsx`
- Create: `supabase/migrations/018_sketch_gallery.sql`

**Step 1: Create database migration**

```sql
CREATE TABLE IF NOT EXISTS public.sketch_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  original_sketch_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sketch_gallery_public ON public.sketch_gallery (created_at DESC) WHERE is_public = true;

ALTER TABLE public.sketch_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of gallery" ON public.sketch_gallery FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Allow authenticated insert" ON public.sketch_gallery FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.sketch_gallery TO anon, authenticated;
GRANT INSERT ON public.sketch_gallery TO authenticated;
```

**Step 2: Build the wizard page**

`'use client'` page with auth gate on Step 3.

State: `useState<WizardState>(defaultState)` + `mode` from localStorage

Step rendering:
- Step 1: `<SketchInput>` — onSketchReady sets sketchDataUrl, advances to step 2
- Step 2: `<StylePicker>` — onSelectStyle/onCustomStyleChange, "Generate" button advances to step 3
- Step 3: calls `/api/v1/sketch-to-art/generate`, shows `<GenerationResults>`, selection advances to step 4
- Step 4: `<RefinementChat>` — onSendMessage calls `/api/v1/sketch-to-art/refine`, onDone advances to step 5
- Step 5: `<SaveShare>`

Step indicator at top (5 dots, active highlighted). Back button for steps 2-5.

Mode toggle: `<ModeToggle>` in top-right corner, persisted to localStorage `tk-sketch-mode`.

Layout:
```jsx
<main className={`flex-1 flex flex-col items-center py-10 px-4 ${mode === 'fun' ? 'bg-gradient-to-b from-pink-50 to-violet-50 dark:from-[#1a1025] dark:to-[#101922]' : ''}`}>
  <div className="w-full max-w-2xl">
    <ModeToggle />
    {/* Step indicator */}
    {/* Active step */}
  </div>
</main>
```

**Step 3: Run build, commit**

```bash
pnpm build
git add app/tools/sketch-to-art/page.tsx supabase/migrations/018_sketch_gallery.sql
git commit -m "feat(sketch-to-art): add wizard page and gallery migration"
```

---

### Task 10: Register Tool + Deploy

**Files:**
- Modify: `lib/tools.tsx` — add Sketch to Art entry
- Modify: `lib/blog/tool-slugs.ts` — add sketch-to-art entry

**Step 1: Add to tools array**

```typescript
{
  name: 'Sketch to Art',
  href: '/tools/sketch-to-art',
  description: 'Turn drawings into stunning art with AI',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
  ),
  color: 'from-pink-500 to-violet-500',
},
```

**Step 2: Add to tool-slugs.ts**

```typescript
{ slug: 'sketch-to-art', name: 'Sketch to Art', description: 'Turn drawings into stunning art with AI', href: '/tools/sketch-to-art' },
```

**Step 3: Add to bento showcase**

Add a bento card for Sketch to Art in `components/home/bento-showcase.tsx` with a mini-preview: pencil sketch outline → arrow → colorful art version.

**Step 4: Build, commit, push**

```bash
pnpm build
git add lib/tools.tsx lib/blog/tool-slugs.ts components/home/bento-showcase.tsx
git commit -m "feat(sketch-to-art): register tool and add to homepage bento"
git push origin main
```
