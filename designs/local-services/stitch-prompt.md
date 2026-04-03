# Google Stitch Prompt — Local Services Tool (UI Redesign)

## Context

UI-only redesign of the Toolk1t "Local Services" tool for visual consistency with the Toolk1t dark theme. Features are unchanged — this is purely a cosmetic/style pass.

---

## Stitch Prompt

```
Full-screen local services finder app — dark theme redesign

The layout is a full-screen map experience with two overlay layers:
1. A floating top bar (search + category chips)
2. A side panel (left on desktop, bottom sheet on mobile) that shows results or a detail view

---

SCREEN 1: Default State (Map + Floating Search Bar, no results yet)

Full-screen dark map (OpenStreetMap/Leaflet placeholder — use a dark muted map tile graphic).

Top floating bar (pinned to top, full width, dark card):
- Background: #131a23 with slight backdrop blur, 1px bottom border #1e2631
- Row 1: Back arrow button (circle, 44×44px, bg #1e2631, icon #a6abb5) | Search input (pill shape, bg #0d1420, border #1e2631, placeholder "Search Service Finder…", icon: search symbol in #70767f) | Favourites button (circle, 44×44px, bg #1e2631, heart icon #a6abb5)
- Row 2 (below search): horizontally scrollable category chips
  - "All" chip: active state = bg #3D6AF2, text white, rounded-full
  - Other chips: bg #1e2631, text #a6abb5, rounded-full, 36px height
  - Categories (with emoji icons): 🚛 Moving | 🔧 Plumber | ⚡ Electrician | ✂️ Hairdresser | 🌿 Lawn & Garden | 🧹 Cleaning | 🔑 Locksmith | 🔧 Mechanic | 🏥 Doctor | 🦷 Dentist | 💊 Pharmacy | 🐾 Vet | 👶 Childcare | 🍽️ Restaurant | ☕ Cafe | 🛒 Supermarket | 💪 Gym | 👕 Laundry
- Active category "Plumber" is highlighted with #3D6AF2

Bottom-right map controls:
- Location pin button: circle 44×44px, bg #131a23, border #1e2631, location_on Material Symbol icon in #a6abb5

---

SCREEN 2: Results Panel (left side desktop, bottom sheet mobile) — "Plumber" search active

Left panel: 380px wide, full height from below search bar, bg #131a23, right border #1e2631, rounded-tr-2xl rounded-br-2xl

Panel header (sticky, bg #131a23, border-b #1e2631):
- "8 results nearby" in text-primary #ffffff, font-semibold, 14px
- Drag handle for mobile (hidden on desktop)

Scrollable list:

SECTION LABEL: "Community Recommended 社区推荐" — uppercase, 10px, color #10B981 (emerald), letter-spacing wide

RESULT CARD (community — highlighted):
- bg #0d1420, border #3D6AF2/30, ring-2 ring-#3D6AF2/20, rounded-2xl, padding 12px
- Left: 56×56px rounded-xl thumbnail placeholder (gradient dark to slightly lighter)
- Center:
  - Name: "Mike's Plumbing Solutions" — #ffffff, 14px, font-semibold
  - Category: "Plumber" — #70767f, 12px
  - Rating: "4.8 ★" — #ffffff bold + amber star icon
  - Bottom row: "📍 0.8km away" in #70767f | "AVAILABLE" badge: bg #10B981/15, text #10B981, 10px uppercase, rounded-full
- Right: heart icon (filled red if favourite)
- Verified badge: small pill "✓ Verified" bg #3D6AF2, white text, 10px

RESULT CARD (community):
- bg #131a23, border #1e2631, rounded-2xl
- "Sam's Fix-It Plumbing" | 4.6 ★ | 1.2km | AVAILABLE

SECTION LABEL: "Google Places" — uppercase, 10px, color #70767f

RESULT CARD (google):
- bg #131a23, border #1e2631
- "Auckland City Plumbers" | 4.4 ★ | 1.5km | AVAILABLE
- "Waterworks Ltd" | 4.1 ★ | 2.3km | BUSY (badge: bg #ef4444/15, text #ef4444)
- "Capital Plumbing Co." | 3.9 ★ | 3.1km | BUSY
- "ProFlow Plumbing" | 4.7 ★ | 4.8km | AVAILABLE

Panel footer (sticky, border-t #1e2631, bg #131a23):
- Dashed border button: full width, "＋ Suggest a local provider", border-2 dashed #1e2631, text #70767f, hover: border #3D6AF2, text #3D6AF2, rounded-xl, 44px height

---

SCREEN 3: Detail Panel — "Mike's Plumbing Solutions" selected

Same panel position as Screen 2. Full height, overflow-y scroll.

Sticky top bar:
- Back arrow (circle 44×44px, bg #1e2631, chevron-left icon #a6abb5) + "Back to results" in #70767f, 12px
- Community badge pill: bg #10B981, white text "★ Community 社区推荐"

Hero image area (192px tall):
- Dark gradient placeholder rectangle (represents a photo)
- Top-left overlay: "★ Community 社区推荐" pill, bg #10B981, white text, 10px
- Top-right overlay: "✓ Verified" pill, bg #3D6AF2, white text, 10px

Content area (px-16, py-16):

NAME + RATING block:
- "Mike's Plumbing Solutions" — #ffffff, 18px, font-bold
- Heart icon (favourite toggle) — right-aligned, 24×24px
- Category: "Plumber" — #70767f, 12px
- Stars: 4.8 ★★★★★ (amber) + "(127 reviews)" in #70767f, 12px
- Open now dot: green dot (#10B981) + "Open now" in #10B981, 12px

Description block:
- "Expert residential and commercial plumbing. Burst pipes, hot water systems, leak detection, and full bathroom renovations." — #a6abb5, 14px

Pricing + Availability cards (2-column row):
- Card: bg #0d1420, border #1e2631, rounded-xl
  - Label "PRICING" — uppercase #70767f, 10px
  - Value "$80–$120/hr" — #ffffff, 14px, font-medium
- Card:
  - Label "AVAILABILITY" — uppercase #70767f
  - Value "Mon–Sat" — #ffffff, 14px, font-medium

Action buttons (2-column):
- Call: bg #3D6AF2, white, rounded-xl, 44px height, phone icon + "Call"
- Website: bg #1e2631, #a6abb5, rounded-xl, 44px height, globe icon + "Website"

Contact info list:
- 📍 address icon + "12 Water St, Auckland CBD" — #a6abb5, 14px
- 📞 phone icon + "+64 9 123 4567" — #3D6AF2 (clickable)
- 🗺️ map icon + "Serves: Auckland CBD, Ponsonby, Grey Lynn" — #a6abb5, 14px

Social links row:
- Pills: "Facebook" "Instagram" — bg #1e2631, text #a6abb5, rounded-lg, 12px

Portfolio section:
- Label "PORTFOLIO" — uppercase #70767f, 10px, tracking-wide
- Horizontal scroll of 3 dark placeholder squares (96×96px, rounded-xl, bg #0d1420)

Hours section:
- Label "HOURS" — uppercase #70767f, 10px
- List: "Mon–Fri   7:00am – 6:00pm", "Saturday   8:00am – 4:00pm", "Sunday   Closed" — #a6abb5, 12px

Reviews section (2 shown):
- Label "REVIEWS (127)" — uppercase #70767f, 10px
- Review card: bg #0d1420, rounded-xl, border #1e2631
  - Author "Sarah T." — #ffffff, 12px, font-semibold | Stars (amber) right
  - Text "Mike was prompt and professional. Fixed our burst pipe within the hour. Would absolutely recommend!" — #70767f, 12px

Write a Review button:
- Full width, border #1e2631, rounded-xl, 44px, text "Write a Review" in #3D6AF2

---

SCREEN 4: Location Modal (centered overlay on map)

Overlay: semi-transparent backdrop (#090f16/80)
Modal: bg #131a23, border #1e2631, rounded-2xl, shadow-2xl, max-width 480px, centered
- Title "Set your location" — #ffffff, 18px, font-bold
- Subtitle "Choose how we find services near you" — #a6abb5, 14px
- Option card: "Use my GPS location" — icon: location_on Material Symbol in #3D6AF2, title #ffffff, desc #70767f, border #1e2631, rounded-xl, active ring #3D6AF2
- Option card: "Enter location manually" — icon: edit Material Symbol in #a6abb5
- Text input (when manual selected): bg #0d1420, border #1e2631, placeholder "Enter suburb or city…", text #ffffff
- Recent locations list: "Auckland CBD", "Ponsonby" — each row with history icon, #a6abb5
- Confirm button: full width, bg #3D6AF2, white, rounded-xl, 48px height, "Confirm Location"
- Cancel link: text #70767f, centered below button

---

SCREEN 5: Suggest a Provider (modal/drawer overlay)

Overlay + dark modal
Title: "Suggest a Local Provider" — #ffffff, 18px, bold
Form fields (all: bg #0d1420, border #1e2631, rounded-xl, text #ffffff, placeholder #70767f, 48px height):
- Provider name input
- Category select dropdown (shows categories list)
- Phone input
- Description textarea (3 rows)
- Service area multi-select tags (shows selected suburbs as pills: bg #3D6AF2/20, text #3D6AF2, rounded-full)
Submit button: full width, bg #3D6AF2, white, "Submit Provider", rounded-xl, 48px

---

VISUAL STYLE

Theme: Dark, sophisticated, utility-focused
Page background: #090f16
Card background: #131a23
Elevated surfaces: #0d1420
Border color: #1e2631
Text primary: #ffffff
Text secondary: #a6abb5
Text muted: #70767f
Primary/accent: #3D6AF2
Success/community: #10B981
Error/busy: #ef4444
Rating stars: amber (#f59e0b)

Typography: Inter (system font stack)
Icon set: Material Symbols Rounded (google)
Border radius: 2xl on panels, xl on cards, full on chips/badges
Min touch target: 44px on all interactive elements
Spacing: 16px base padding, 12px card padding, 8px gap between cards

---

Platform: Responsive web — desktop (1440px) with 380px left panel + full-screen map; mobile (390px) with bottom sheet (50vh max)

Show all 5 screens as a connected flow, desktop viewport, dark background.
```

---

## Output Files

- `designs/local-services/stitch-prompt.md` — this file (Stitch prompt)
- `designs/local-services/code.html` — self-contained HTML/Tailwind CDN reference implementation

## Notes

- Features are **unchanged** — this is UI consistency only
- All 5 screens represent the complete interactive flow
- Community vs Google results distinction preserved
- Bilingual label "Community 社区推荐" preserved
