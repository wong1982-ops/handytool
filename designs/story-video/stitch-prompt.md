# Google Stitch Prompt — Story Video Generator

## Tool Summary

Story Video Generator is an AI-powered tool that turns completed storybooks into cartoon videos with character voices, sound effects, and music. It has two tabs: **Create** (select a book, pick art style and duration, then generate) and **My Videos** (track job progress with a pipeline stepper, and watch/download completed videos).

---

## Stitch Prompt

```
Story Video Generator tool page for a dark-themed AI toolkit web app called Toolk1t.

Layout:
- Full-page dark background (#090f16)
- Max-width 896px centered column with 40px vertical padding

Sections (top to bottom):

1. BREADCRUMB NAV
   - Small text: "Tools / Story Video" in muted gray (#70767f)
   - Clickable links with chevron separators

2. PAGE HEADER
   - Large bold heading (32–40px): "Story Video" in white, "Generator" in blue-to-cyan gradient (#3D6AF2 → #32A9D9)
   - Subtitle text (14px, #a6abb5): "Turn your storybooks into AI-generated cartoon videos with character voices, sound effects, and music."

3. TAB TOGGLE
   - Two pill-shaped toggle buttons: "Create" (active, filled blue #3D6AF2) and "My Videos" (inactive, dark card bg #131a23 with border #1e2631)
   - Minimum height 44px, rounded-full, 16px horizontal padding

4. CREATE TAB — BOOK SELECTOR
   - Section label: "Select a Book" (12px, #a6abb5, medium weight)
   - Horizontally scrollable row of book cards (no visible scrollbar on desktop)
   - Each book card: 144px wide, rounded-xl, dark card (#131a23), border (#1e2631)
     - Top: portrait-ratio (3:4) cover image area with dark placeholder showing a book icon if no image
     - Bottom: 8px padding — book title (white, 12px, semibold, truncated) + page count (10px, #70767f)
     - Selected state: bright blue border (#3D6AF2) with blue glow ring shadow (0 0 0 3px #3D6AF2, 0 0 20px rgba(61,106,242,0.4))
     - Hover state: border lightens to #3D6AF2/30, card bg shifts to #1e2631
   - Show 4–5 mock books: "The Dragon's Quest" (12 pages), "Starlight Forest" (8 pages), "Ocean Friends" (16 pages), "Magic Garden" (10 pages), "Robot School" (6 pages)
   - "The Dragon's Quest" is the selected book

5. ART STYLE SELECTOR
   - Section label: "Art Style" (12px, #a6abb5, medium weight)
   - 2×2 grid on mobile, 4-column row on desktop, 12px gap
   - Each style card: rounded-xl, dark card (#131a23), border (#1e2631), 12px padding, text-left, min-height 44px
     - Style name as gradient text (bold, 12px):
       - Cartoon: yellow-to-orange gradient
       - Anime: pink-to-purple gradient
       - Pixar: blue-to-cyan gradient
       - Watercolor: emerald-to-teal gradient
     - Style description (10px, #70767f): brief one-liner below the name
     - Selected state (Cartoon is active): blue ring border (#3D6AF2) with glow shadow

6. DURATION SELECTOR
   - Section label: "Duration" (12px, #a6abb5, medium weight)
   - Row of 4 pill buttons: "Auto" (active, blue #3D6AF2 fill), "Short", "Medium", "Long" (inactive dark with border)
   - Same pill style as tab toggle

7. GENERATE BUTTON ROW
   - Primary CTA button: gradient left-to-right (#3D6AF2 → #7C3AED), white text, "Generate Video", rounded-xl, 44px height, 24px horizontal padding
   - Inside the button after the label: a small pill badge showing "10 credits" in light purple text (bg: #7C3AED/30, text: #c084fc)
   - Button is enabled because a book is selected

8. ACTIVE JOB CARD (in-progress)
   - Section label: "In Progress" (12px, #a6abb5)
   - Card: rounded-xl, dark card (#131a23), border (#1e2631), 16px padding
   - Header row: book title "Starlight Forest" left (white, 14px semibold) + art style + time ago right; status badge "PROCESSING" (blue bg #3D6AF2/20, blue text #3D6AF2, 10px uppercase)
   - Pipeline progress bar: 8 equal segments, gap 4px
     - Segments: characterLock=done (green #10B981), script=done (green), scenes=processing (blue, pulsing), voices=pending (dark #1e2631), narration=pending, sfx=pending, music=pending, assembly=pending
     - Each segment: height 6px, rounded-full
   - Step labels row below the bars: abbreviated first word of each step label at 10px (Character · Screenplay · Scene · Character · Narration · Sound · Music · Assembly)
     - done steps in green (#10B981), processing in blue (#3D6AF2 bold), pending in muted (#70767f)
   - Scene grid: small label "Scenes (4/12)" then a row of 20px square dots — 4 green, 1 pulsing blue, 7 dark gray

Visual Style:
- Dark mode throughout — page bg #090f16, cards #131a23, borders #1e2631
- Primary accent: #3D6AF2 (blue), secondary gradient cyan #32A9D9
- Success: #10B981 (green), danger: #EF4444 (red), muted text: #70767f, secondary text: #a6abb5
- Cards use rounded-xl (12px radius), 1px borders
- No shadows on cards except active/selected glow rings
- All interactive elements: min-height 44px for touch accessibility
- Typography: system font stack (Inter/SF Pro style), sizes: heading 32–40px, labels 12px, body 14px, meta 10px

Platform: Responsive web — mobile-first, max 896px, desktop-ready

Show the "Create" tab as the active state. Include realistic mock data. Show one in-progress job at the bottom of the Create tab below the generate button.
```

---

## Screen Variants to Generate

1. **Create tab — default state** (as described above, book selected, Cartoon art style, Auto duration)
2. **My Videos tab — mixed state** (one complete job with Watch/Download actions, one processing job with pipeline bars)
3. **My Videos tab — complete video expanded** (video player shown below completed job card, scene clips list toggled open)

---

## Reference Components

| Component | Location in prompt |
|---|---|
| Breadcrumb | Top of page |
| Tab toggle | Below header |
| Book selector | Horizontal scroll cards |
| Art style grid | 2×2 / 4-col cards |
| Duration pills | Row of 4 pills |
| Generate button | CTA with credit badge |
| Job progress card | Pipeline stepper + scene dots |
| Video player | aspect-video inside rounded-xl |
| Scene clips list | Expandable below video |

---

## Key Design Constraints

- **No feature changes** — this is a visual consistency redesign only
- **All 8 pipeline steps** must be visible in the job progress bar: Character Lock, Screenplay, Scene Generation, Character Voices, Narration, Sound Effects, Background Music, Final Assembly
- **4 art styles** each with their own gradient: Cartoon (yellow→orange), Anime (pink→purple), Pixar (blue→cyan), Watercolor (emerald→teal)
- **44px minimum touch targets** on all buttons, pills, and book cards
- **Glow ring selection state** on book cards and art style cards (not just border change)
