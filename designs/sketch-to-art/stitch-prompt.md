# Google Stitch Design Prompt — Sketch to Art Tool

## Tool Overview
"Sketch to Art" is an AI-powered tool that transforms hand-drawn sketches into polished artwork. It runs as a 5-step wizard: (1) Upload / Draw sketch → (2) Pick art style → (3) AI generates variations → (4) Refine via chat → (5) Save & Share. It also has a "My Creations" gallery tab.

There are two UX modes: **Fun** (casual, emoji-friendly labels like "Magic!", "Refine", "Share") and **Pro** (professional labels like "Upload", "Generate", "Refine", "Save").

---

## Design Request

Redesign the Sketch to Art tool UI for visual consistency with the Toolk1t design system (Google Stitch format). **Do NOT change any features — only update the visual design.**

---

## Brand Tokens (MUST use)

```
page-bg:      #090f16
card-bg:      #131a23
card-hover:   #1e2631
border:       #1e2631
primary:      #3D6AF2
primary-light:#3D9DF2
secondary:    #32A9D9
accent:       #af88ff   (purple accent used for icons, pulse dots)

text-primary:   #ffffff
text-secondary: #a6abb5
text-muted:     #70767f

success:  #10B981
danger:   #EF4444
warning:  #F59E0B
```

---

## Layout Structure (top-to-bottom)

### 1. Themed Header
- Dark gradient background: `from-[#0c1424] via-[#111b2e] to-[#0c1424]`
- Subtle radial particle overlay (6 dots at 1–2px, colors: `#3D6AF2`, `#af88ff`, `#3D9DF2`, 30% opacity)
- Soft glow band at bottom: `#3D6AF2/10` + `#af88ff/5`
- Left: breadcrumb (desktop) / home icon (mobile) + brush icon (blue, `#3D6AF2`, 28–32px) with a purple pulse dot in top-right corner + "Sketch to Art" h1 bold white
- Right: Fun/Pro mode toggle pill (two segments, active = `bg-[#3D6AF2]` white text, inactive = `#a6abb5`)

### 2. Sticky Tab Navigation
- Sticky, `z-30`, full-width dark strip (`#090f16/95`, `backdrop-blur-md`)
- Bottom border: `#1e2631`
- Two tabs centered at `max-w-4xl`:
  - **Create** (pencil icon) | **My Creations** (grid icon)
- Active tab: bold white text + 2px `#3D6AF2` bottom underline
- Inactive tab: `#70767f`, hover white

### 3. Wizard Stepper
- Shown only in "Create" tab
- Subtitle text (`text-sm`, `#a6abb5`, centered): in Pro mode shows "Step N: [label]", in Fun mode shows "Upload a sketch and watch AI transform it into art"
- **Desktop stepper** (sm+): horizontal `ol`, 5 numbered circles (36px diameter, `border-2`)
  - Completed: filled `#3D6AF2` background, white checkmark
  - Current: `#3D6AF2/20` bg, `#3D6AF2` border, glow shadow `0 0 15px rgba(61,106,242,0.4)`, step number in `#93aaff`
  - Future: `#1e2631` border, transparent bg, `#70767f` number
  - Connector lines: 48–80px wide, 2px tall, `#3D6AF2` gradient for completed, `#1e2631` for future
  - Labels below each circle (11px, `#93aaff` active/done, `#70767f` future): Sketch / Style / Magic / Refine / Share (Fun) or Upload / Style / Generate / Refine / Save (Pro)
- **Mobile stepper**: pill badges — active pill is wider (number + label), completed pills show checkmark, future pills show number only

---

## Step-by-Step Content

### Step 1 — Sketch Input (two-column on desktop, stacked on mobile)

**Left column (lg:col-span-4) — Creation Hub sidebar card** (`#131a23`, `rounded-2xl`, `p-5`):
- Header: sparkle icon (`#af88ff`) + "Creation Hub" bold white title
- Two method buttons (each `min-h-[44px]`, `rounded-xl`, `p-3`):
  - **Upload**: icon box (`#3D6AF2/20` bg, `#3D6AF2` upload icon) + "Upload" bold + "Import your PNG/JPG" subtitle `#a6abb5`
    - Active state: `#3D6AF2/15` bg + `ring-1 ring-[#3D6AF2]/40`
  - **Canvas Draw**: icon box (`#7C3AED/20` bg, `#af88ff` pencil icon) + "Canvas Draw" bold + "Sketch in real-time" subtitle
    - Active state: `#7C3AED/15` bg + `ring-1 ring-[#7C3AED]/40`
- Divider + "Quick Tips" section:
  - Label: `text-[10px]`, uppercase, `#70767f`
  - 3 bullet points in `#a6abb5`, `#3D6AF2` dot prefix:
    - "High contrast sketches work best."
    - "Keep lines clean and continuous."
    - "PNG or JPG up to 10 MB accepted."

**Right column (lg:col-span-8) — Workspace card** (`#131a23`, `rounded-2xl`, `p-4 lg:p-6`):
- Internal mini tab bar (Upload / Draw) — `text-sm font-bold`, active: `border-b-2 border-[#3D6AF2] text-white`, inactive: `#70767f`
- **Upload zone** (dashed border `#1e2631`, `rounded-xl`, `p-10`, centered layout):
  - Blue glow blob in center (blurred radial, `#3D6AF2/10`)
  - Upload icon box (`#1e2631` bg, 56px, `#3D6AF2` arrow-up icon inside)
  - "Drag & drop your sketch here" (white, semibold) / "Drop your awesome sketch here!" (fun mode)
  - "PNG, JPG, or WebP — max 10 MB" (`#70767f`, `text-xs`)
  - "Browse Files" button: `min-h-[44px]`, `px-6`, `rounded-xl`
    - Pro: solid `#3D6AF2`
    - Fun: gradient `from-pink-400 to-purple-500`
  - Drag-over state: border turns `#3D6AF2`, `bg-[#3D6AF2]/5`
- **Draw tab** shows a canvas drawing area (white/light bg surface, brush/eraser controls at top, color swatch row)

### Step 2 — Style Picker

**Three category sections** (Classic Art / Modern Digital / Fantasy Creative), each with:
- Section header: small category icon (brush for classic, lightning for modern, sparkle for fantasy) + category name (`text-sm`, `uppercase`, `tracking-wider`, `#a6abb5`)
- **Style card grid**: `grid-cols-2 sm:grid-cols-3` (6 cards per category, 18 total)
  - Each card: `rounded-2xl`, `p-2`, aspect-square image area + style name label below (`text-xs`)
  - Image area: shows reference image or gradient fallback matching the style's color palette:
    - watercolor: `from-sky-300 to-blue-400`
    - oil-painting: `from-amber-600 to-yellow-700`
    - impressionist: `from-pink-300 to-purple-400`
    - van-gogh: `from-blue-500 to-yellow-400`
    - picasso: `from-red-400 to-blue-500`
    - chalk-pastel: `from-rose-300 to-orange-300`
    - cartoon: `from-yellow-400 to-orange-400`
    - anime: `from-pink-500 to-rose-500`
    - pixel-art: `from-green-400 to-emerald-500`
    - 3d-render: `from-cyan-400 to-blue-500`
    - comic-book: `from-red-500 to-yellow-500`
    - pop-art: `from-fuchsia-500 to-cyan-400`
    - ghibli: `from-green-300 to-sky-400`
    - stained-glass: `from-violet-500 to-amber-400`
    - steampunk: `from-amber-700 to-stone-500`
    - cyberpunk: `from-purple-600 to-pink-500`
    - claymation: `from-orange-300 to-yellow-300`
    - fantasy: `from-indigo-500 to-purple-600`
  - Selected state: `box-shadow: 0 0 0 3px #3D6AF2, 0 0 20px rgba(61,106,242,0.4)` + white checkmark circle overlay centered on image
  - Hover: `scale(1.03)` + `bg-[#131a23]/60`
  - Label: `text-xs text-[#a6abb5]` (pro) or `text-xs font-medium text-white` (fun)

**Custom style input** (below all grids):
- Label: "Or describe your own style" (fun) or "Custom style" (pro, uppercase tracking)
- Input: `min-h-[44px]`, `rounded-xl`, `border border-[#1e2631]`, `bg-[#131a23]`, `text-sm text-white`, `placeholder-[#70767f]`
  - Active/filled border: `#3D6AF2`, focus ring `2px #3D6AF2`

**Generate button** (bottom of step 2):
- Pro: `w-full min-h-[44px] rounded-xl bg-[#3D6AF2] text-white font-bold` + "Generate"
- Fun: `w-full min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold text-lg` + "✨ Make Magic!"
- Disabled state: `opacity-40 cursor-not-allowed`
- Auth gate fallback: "Sign in to generate art" message + "Sign in with Google" button (gradient `from-pink-500 to-violet-500`)

### Step 3 — Generation Results

**Loading state** (AILoadingSpinner pattern):
- Centered card on `#131a23` bg
- Animated sparkle icon (`#93aaff`, 32px)
- Rotating ring (conic-gradient or animated border)
- Cycling messages: "Mixing paint...", "Adding sparkles...", "Waving the magic wand...", "Splashing colors...", "Almost ready...", "Creating your masterpiece..."
- Subtitle: "Weaving your brushstrokes into art" (fun) / "Generating variations" (pro)

**Results carousel**:
- Heading: "Pick your favourite!" (fun) / "Variation N of N" (pro) — `text-base font-semibold text-white`
- Carousel viewport: `max-w-[480px]`, `rounded-2xl`, aspect-square, swipeable
- Prev/Next arrow buttons: 40px circles, `bg-black/40 backdrop-blur-sm`, white arrow icon, positioned absolutely at left/right center
- Dot indicators: 8px circles, `#3D6AF2` active, `#a6abb5` inactive; swells to 12px when active
- "Select this variation" / "Use this one!" button: `rounded-xl px-6 py-3 text-sm font-semibold`
  - Unselected: `#131a23` bg, white text, hover → `#3D6AF2` bg
  - Selected: `#3D6AF2` bg, white text, `ring-2 ring-[#3D6AF2]`

### Step 4 — Refinement Chat

Two-column layout (image left, chat right on desktop; stacked on mobile):

**Left — Current image panel**:
- Image rendered in `rounded-2xl` frame, `aspect-square`, `object-cover`
- Below: "Version history" strip (thumbnail row, `rounded-lg`, 48px each)
  - Active version: `ring-2 ring-[#3D6AF2]`
  - Shows original + each refined version

**Right — Chat panel** (`#131a23`, `rounded-2xl`):
- "AI Refinement" header + refinement count badge: "3/5 refinements left" in `#af88ff/20` bg, `#af88ff` text
- Chat history: user messages right-aligned (`#3D6AF2/20` bg), AI messages left-aligned (`#131a23` bg, `#a6abb5` text)
- AI image responses: show inline image thumbnail (80px)
- **Quick refinement chips** row (horizontal scroll):
  - "More colorful", "Add background", "Make darker", "More detailed", "Simpler", "Add sparkles"
  - Style: `rounded-full px-3 py-1.5 text-xs bg-[#1e2631] text-[#a6abb5]`, hover: `bg-[#3D6AF2]/15 text-[#93aaff]`
- Text input + Send button at bottom:
  - Input: `min-h-[44px]`, `rounded-xl`, `#090f16` bg, `#1e2631` border
  - Send: `min-h-[44px] w-[44px]`, `rounded-xl`, `#3D6AF2` bg, white arrow icon
- "Done — Looks Great!" button: full-width, `min-h-[44px]`, `rounded-xl`, `#10B981` bg, white text

### Step 5 — Save & Share

**Final result display**:
- Large image (`rounded-2xl`, `max-w-[480px]`, centered)
- Style badge below: small colored pill (gradient matching the chosen style)

**Metadata section** (`#131a23` card):
- "Title" input (auto-filled, editable): `rounded-xl`, `#090f16` bg
- Style info row: "Style: Watercolor" etc.
- Tags row (optional)

**Action buttons**:
- "Download" — `#3D6AF2`, download icon + "Download PNG"
- "Copy Link" — `#1e2631` bg, link icon + "Copy Link"
- "Share to Gallery" — gradient `from-[#3D6AF2] to-[#32A9D9]`, share icon + "Share to Gallery"
- "Start Over" — text button, `#70767f`, "Start Over"
- All buttons: `min-h-[44px]`, `rounded-xl`

---

## My Creations Tab

**Filter row**: "All" | "Watercolor" | "Anime" | "Comic Book" … pill filters, `rounded-full`, active: `#3D6AF2` bg, inactive: `#1e2631`

**Gallery grid**: `grid-cols-2 sm:grid-cols-3`, gap-3
- Each card: `rounded-2xl`, `overflow-hidden`, aspect-square image + bottom overlay strip (gradient black, style name + date)
- Hover: scale `1.02`, brighter overlay, show download icon
- Empty state: illustration placeholder + "Your creations will appear here" message

---

## Sticky Footer Nav (Steps 2–4 only)

- Fixed to bottom: `bg-[#090f16]/90 backdrop-blur-lg border-t border-[#1e2631]`
- Left: "← [Previous step name]" ghost button (`#131a23` bg, `#a6abb5` text, chevron icon)
- Center: "Step N of 5" in `#70767f text-xs`
- Right: (empty in this range — Next is triggered by completing the step action)
- All buttons: `min-h-[44px]`

---

## Responsive Rules

- Mobile-first: all panels full-width stacked, stepper uses compact pills
- `lg:` breakpoint: 2-column Creation Hub layout (4/8 columns), Refinement Chat side-by-side
- Touch targets: all interactive elements `min-height: 44px`
- Carousel supports touch swipe (left/right)
- Tab navigation: `min-height: 48px` for tabs

---

## Animation & Interaction Notes

- Step transitions: fade-in/slide-up (200ms ease-out)
- Stepper circles: smooth color transition (300ms)
- Style cards: `scale(1.03)` hover, `scale(1)` default (300ms)
- Loading spinner: rotating ring + pulsing sparkle icon + cycling text
- Carousel track: `translateX` with `300ms ease-out`
- Drag-over on upload zone: border + bg color shift (150ms)
- Current step ring: `box-shadow: 0 0 15px rgba(61,106,242,0.4)`

---

## Accessibility Requirements

- WCAG 2.1 AA contrast for all text
- All interactive elements: `min-height: 44px`
- Wizard stepper: `<nav aria-label="Wizard progress">` + `<ol>` with `<li>` items
- Carousel: `aria-label="Variation carousel"`, arrow buttons have `aria-label`
- Dot indicators: `role="tablist"`, each dot has `role="tab"` + `aria-selected`
- Style cards: `<button type="button">` with meaningful `alt` text on images
- Tab nav: `role="tablist"` with `aria-selected` per tab
- Error messages: `role="alert"`
- Color is never the sole differentiator (icons + labels always accompany)
