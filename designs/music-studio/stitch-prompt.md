# Google Stitch Prompt — Music Studio UI Redesign

## Context

Redesign for the **Music Studio** tool in the Toolk1t dark-theme web app.
**UI consistency redesign only** — all features remain identical; only visual styling changes.

---

## Stitch Prompt

```
AI Music Studio tool page for a dark-themed web app called Toolk1t

The tool has two tabs at the top: "Studio" and "My Clips".

--- STUDIO TAB (main view) ---

Layout: Responsive two-column desktop layout (8/4 column split).

Left column (main content area), stacked top-to-bottom:

1. MODE SELECTOR — Pill-style segmented control with three options: Music | Jingles | SFX.
   Active tab uses solid primary blue (#3D6AF2) fill with white text.
   Inactive tabs use ghost style with muted text on dark card background.

2. GENRE/MOOD LAUNCHPAD GRID — 2 columns on mobile, 4 columns on desktop.
   8 colorful gradient buttons (rounded-xl, 48px tall) for genre/mood selection.
   Example tiles: Lo-fi (purple→indigo), Electronic (cyan→blue), Jazz (amber→orange),
   Classical (rose→pink), Rock (red→orange), Ambient (teal→green),
   Hip-hop (yellow→amber), Cinematic (slate→zinc).
   Active/selected state: 3px solid blue ring + soft blue glow shadow.
   Each tile shows an emoji icon + label text in white.

3. INSTRUMENT SELECTOR — Horizontal scrollable row of pill chips (rounded-full).
   8 instruments: Piano, Guitar, Synth, Drums, Bass, Strings, Brass, Flute.
   Each chip shows an emoji + label.
   Inactive: dark card bg (#131a23), muted text.
   Active/selected: blue tint background (#3D6AF2 at 20% opacity), blue text,
   thin blue ring border.

4. WAVEFORM VISUALIZER — Full-width canvas bar (height 80px, rounded-xl).
   Background: very dark near-black (#0d1117).
   When playing: animated frequency bars in blue-to-purple gradient (left to right).
   When idle: flat low-height bars at 20% opacity.

5. TRANSPORT BAR — Centered controls row.
   Idle state: centered "Start Session" button, rounded-full, blue-to-purple gradient.
   Connected state:
     - Left: status dot (green = playing, yellow = paused) + "Connected" label
     - Center: three circular icon buttons in a row:
         * Play/Pause — 48px circle, solid #3D6AF2 fill, white icon
         * Record — 48px circle, red background when recording (with pulsing ring animation),
           dark red tint when idle, circle dot icon
         * Stop/Disconnect — 48px circle, dark card fill, muted icon
     - Right: mono-spaced recording timer (MM:SS format) + clip counter badge (e.g. "2/10")

6. SESSION CLIPS LIST — Stacked rows of recorded clips (if any).
   Each row: dark card (#131a23) with border, rounded-xl.
   Left: small 36px square play button (blue tint).
   Center: clip name (white, truncated) + duration in monospace font (muted).
   Right: download icon button (opens MP3 / WAV popover with credit cost labels) + remove X button.
   Empty state: centered music note icon + "No clips yet" + helper text.

Right column (sticky sidebar):

CONTROLS PANEL — Dark card (#131a23) with border, sticky, scrollable.
Contains:
  - BPM slider — label "BPM" left, current value right; range input with blue accent color
  - Brightness slider — label + percentage display; range 0–100%
  - Density slider — label + percentage display; range 0–100%
  - Scale dropdown — select menu, dark styled, shows musical key (e.g. "C Major")
  - Custom Prompt textarea — 3 rows, placeholder "Describe your sound...",
    character counter bottom-right (e.g. "0/300")

--- MY CLIPS TAB ---

Full-width list of saved clips fetched from history.
Each entry: dark card row with play button, clip name, duration badge, mode badge (e.g. "music"),
date label, and download icon link.
Loading state: centered spinner + "Loading your clips..." text.
Empty state: music note icon + "No saved clips yet" + helper subtext.

--- GLOBAL DESIGN TOKENS ---

Page background: #090f16
Card background: #131a23
Card hover: #1e2631
Border color: #1e2631
Primary blue: #3D6AF2
Text primary: #ffffff
Text secondary: #a6abb5
Text muted: #70767f
Success: #10B981
Danger: #EF4444
Font: Inter (system-ui fallback)

--- INTERACTIONS & STATES ---

All interactive elements: min-height 44px for touch accessibility.
Buttons: smooth color/opacity transitions (150ms).
Mode toggle: clears all active genre buttons on switch.
Launchpad buttons: multi-select (multiple can be active simultaneously).
Instrument chips: multi-select.
Mobile layout: single column stack; floating gear FAB (bottom-right, 48px blue circle)
  opens a right-side drawer for the controls panel with a backdrop overlay.

Style: Dark, modern, production-quality music tool.
Aesthetic: sleek dark UI, vibrant gradient launchpad tiles, clean typographic hierarchy.
Platform: Responsive web — mobile-first, desktop at 1280px+.
```

---

## Refinement Annotations (post-generation)

After initial generation, apply these targeted refinements via Stitch annotations:

1. **Launchpad grid** — Ensure gradient tiles have consistent 48px height; active ring glow should use `box-shadow: 0 0 0 3px #3D6AF2, 0 0 15px rgba(61,106,242,0.4)`
2. **Transport bar** — The three circular buttons (play, record, stop) should be evenly spaced in a row, each exactly 48px diameter
3. **Controls panel** — Sliders should use `accent-color: #3D6AF2` for thumb/track styling; all inputs have `min-height: 44px`
4. **Tab switcher** — Use `max-width: 320px` centered container for the Studio/My Clips toggle at the very top
5. **Mobile FAB** — Fixed positioned gear icon button, `bottom: 24px, right: 16px`, 48px circle, blue
6. **Waveform canvas** — Rounded corners (12px), dark background (#0d1117), bar gradient from #3D6AF2 (bottom) to #7C3AED (top)
7. **Clip rows** — Download button opens an inline popover (not a modal) anchored to the icon, showing MP3 (1 credit) and WAV (2 credits) options
