# Google Stitch Prompt — Favicon Generator

## Tool Summary

The Favicon Generator lets users create favicons in four modes:
- **Text** — type 1–10 characters/emoji, customize font family, font size, foreground color, background (solid/gradient/transparent), shape, padding, border, shadow
- **Upload** — drag-and-drop or browse PNG/JPEG/SVG/WebP (max 10 MB), set zoom, background color, and shape
- **Icons** — search bundled + Iconify API icons, filter by category, pick one, then apply the same style controls as Text mode (minus font options)
- **AI** — sign-in gated; describe a favicon, pick a style (Flat / 3D / Pixel Art / Minimal / Gradient), generate 4 SVG options (1 credit), select one; customization continues via style controls

**Right panel — Preview** shows the favicon rendered in:
1. Browser tab (16 px)
2. Bookmarks bar
3. Mobile home screen (60 px)
4. Google search result snippet

**Right panel — Export** lets the user check/uncheck 6 sizes (16, 32, 48, 180, 192, 512 px), then Download ZIP, Copy HTML Tags, or Copy manifest.json.

Layout: two-column (left = creation area + tab bar, right = Preview card + Export card), collapses to single column on mobile.

---

## Google Stitch Prompt

```
Favicon Generator tool page — Toolk1t dark-themed SaaS tool

SCREEN: Desktop web, 1280 px wide, full page from nav to footer

DESIGN SYSTEM
- Page background: #090f16
- Card/panel background: #131a23
- Border color: #1e2631
- Primary accent: #3D6AF2
- Text primary: #ffffff
- Text secondary: #a6abb5
- Text muted: #70767f
- Success green: #10B981
- Error red: #EF4444
- Font: Inter (system fallback)
- All interactive elements: min-height 44 px
- Card border radius: 12 px
- Section border radius: 8 px

PAGE STRUCTURE
1. Sticky top nav bar (dark, #090f16) with breadcrumb: "Tools / Favicon Generator" in text-secondary, Toolk1t logo left
2. Page heading section:
   - H1 "Favicon Generator" in white, 28 px bold
   - Subtitle "Create favicons from text, icons, images, or AI — download a complete package" in text-secondary
3. Two-column layout below heading:
   LEFT COLUMN (flex: 1, min-width 0):
     a) Mode tab bar
     b) Active tab content panel (card bg, border)
   RIGHT COLUMN (380 px fixed, flex shrink 0):
     a) Preview card
     b) Export card

MODE TAB BAR
- Four tabs: Upload | Text | Icons | AI
- Each tab has a small icon + label
- Active state: white pill on dark #131a23 pill container, shadow
- Inactive: text-muted, hover text-secondary
- Tab container bg: #1e2631 rounded-xl
- Min-height 44 px per tab

ACTIVE TAB: TEXT MODE (show this state)
Card with bg #131a23, border #1e2631, border-radius 12 px, padding 20 px

  Section: "Text / Emoji" label (10 px uppercase, text-muted)
  Large centered text input: value "Tk", 24 px bold centered, bg #090f16, border #1e2631, rounded-lg, focus ring primary

  Section divider

  STYLE CONTROLS (inside same card):

  Shape selector — label "SHAPE" (10 px uppercase, text-muted)
  4 square buttons in a row: Circle | Square | Rounded | Hexagon
  Each button has an SVG icon + label below, 44 px min-height
  Active (Rounded): bg #3D6AF2, white text/icon
  Inactive: bg #1e2631, text-secondary, hover #2a3447

  Background type — label "BACKGROUND" (10 px uppercase)
  3-segment pill: Solid | Gradient | Transparent
  Active (Gradient): bg #3D6AF2 text white
  Inactive: text-muted
  Below: two color swatches row (From / To)
  From: swatch #3D6AF2, hex label "#3D6AF2"
  To: swatch #32D9D9, hex label "#32D9D9"
  Angle row: range slider 135°, value label "135°"

  Foreground Color row — label left, color swatch right (#FFFFFF), hex "#FFFFFF"

  Font row — label "FONT"
  5 pill chips: Sans | Serif | Mono | Rounded | Hand
  Active (Sans): bg #3D6AF2 white
  Inactive: bg #1e2631 text-secondary

  Font Size row — range slider, value "70%"

  Padding row — range slider, value "15%"

  Border row — label left, toggle switch right (OFF state, inactive gray)

  Shadow row — label left, toggle switch right (OFF state)

PREVIEW PANEL (right column, top card)
Card: bg #131a23, border #1e2631, rounded-xl

  Header "Preview" in white, 14 px semibold

  Sub-section: "BROWSER TAB" (10 px uppercase, text-muted)
  Realistic browser tab strip:
    Active tab: white/light bg, small 14 px favicon (rounded square "Tk" on blue gradient bg), text "My Website", × close button
    Inactive tab: gray bg, "New Tab" text
  URL bar below with lock icon and "mywebsite.com"

  Sub-section: "BOOKMARKS"
  Bookmark bar with small favicon + "My Site" pill (highlighted), then folder icons for News, GitHub, Gmail

  Sub-section: "MOBILE HOME SCREEN"
  Mini phone outline (120×200 px), dark screen, 3×3 app icon grid
  Center icon = the favicon ("Tk" rounded square on blue/teal gradient), label "My App" below
  Other 8 = placeholder gray rounded squares with "App" labels

  Sub-section: "GOOGLE SEARCH RESULT"
  White card inside the dark panel, simulating a SERP snippet:
    Row: small favicon + "mywebsite.com" in text-muted
    Blue link: "My Website — Home"
    Gray description text snippet

EXPORT PANEL (right column, bottom card)
Card: bg #131a23, border #1e2631, rounded-xl, padding 16 px

  Header "Export" in white, 14 px semibold

  Label "SIZES" (10 px uppercase, text-muted)
  2-column checklist, 6 rows:
    ✓ 16×16              ✓ 32×32
    ✓ 48×48              ✓ 180×180 (Apple)
    ✓ 192×192 (Android)  ✓ 512×512 (PWA)
  Checkboxes use primary accent color #3D6AF2

  Primary CTA button: full-width, gradient left #3D6AF2 → right #3D9DF2
  "↓ Download ZIP" white text, 14 px semibold, 44 px height, rounded-lg

  Secondary row of 2 ghost buttons side by side:
    [Copy icon] HTML Tags
    [Copy icon] manifest.json
  Each: border #1e2631, bg #1e2631, text-secondary, rounded-lg, 44 px

OVERALL FEEL
- Spacious dark tool UI, consistent with VS Code / Vercel aesthetics
- Cards float on the deep navy background
- Accent blue used only on active/selected states and CTAs
- Range sliders styled with #3D6AF2 thumb
- Section labels always 10 px uppercase letter-spacing-wider text-muted
- No decorative gradients on backgrounds — only functional (button CTA, favicon preview)
- All inputs/selects have bg #090f16 and border #1e2631 to stay recessed
```

---

## Key Design Decisions for Consistency

| Element | Current (light-mode mix) | Target (Toolk1t dark) |
|---|---|---|
| Page bg | `bg-gray-50` / `dark:bg-slate-900` | Always `#090f16` |
| Card bg | `bg-white dark:bg-gray-900` | Always `#131a23` |
| Card border | `border-gray-200 dark:border-gray-700` | Always `#1e2631` |
| Inputs | `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700` | `bg-#090f16 border-#1e2631` |
| Section labels | `text-gray-500 dark:text-gray-400` | `#70767f` |
| Body text | `text-gray-900 dark:text-white` | `#ffffff` |
| Secondary text | `text-gray-600 dark:text-gray-300` | `#a6abb5` |
| Inactive bg | `bg-gray-100 dark:bg-gray-800` | `#1e2631` |
| Active accent | `--tk-color-primary-500` ✓ | `#3D6AF2` ✓ |
| Tab container | `bg-slate-100 dark:bg-slate-800` | `#1e2631` |

## Screens to Generate in Stitch

1. **Desktop — Text tab active** (primary screen described above)
2. **Desktop — Icons tab active** (search bar + category chips + 6×N icon grid + style controls)
3. **Desktop — Upload tab active** (drop zone or image preview + zoom slider + background color + shape selector)
4. **Desktop — AI tab active** (sign-in gate OR textarea + style pills + Generate button + 4 result thumbnails)
5. **Mobile — Text tab, stacked single column** (375 px, preview collapsed with chevron toggle)
