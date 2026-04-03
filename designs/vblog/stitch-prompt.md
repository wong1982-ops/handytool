# Google Stitch Prompt — VBlog Studio

## Overview

VBlog Studio is an AI-powered marketing video generator tool inside the Toolk1t platform. Users select one of their tools, pick a script style, voice type, and duration, then trigger an automated video production pipeline. The tool tracks a 6-step pipeline (Script → Screen Record → Voiceover → Assets → Assembly → Platform Variants), shows real-time progress, and delivers multi-platform video downloads (YouTube, TikTok, Instagram Reels, Twitter/X) plus a generated script and hashtags.

---

## Stitch Prompt

```
VBlog Studio — AI marketing video generator dashboard for a SaaS tool platform

Screens to design (2 screens):
1. Main dashboard — "Videos" tab (default view)
2. Preview modal — shown after a completed video job

---

SCREEN 1: Main Dashboard

Layout: Single-column, max-width 896px, centered. Dark page background (#090f16).

Header area:
- Page title "VBlog Studio" — large bold white text (36px), with "Studio" word in blue-to-cyan gradient (#3D6AF2 → #32A9D9)
- ToolBreadcrumb below title: small secondary text "Tools / VBlog Studio" in muted gray (#70767f)

Tab bar (below title):
- Two pill-shaped toggle tabs: "Videos" (active) and "Templates"
- Active tab: solid blue (#3D6AF2), white text
- Inactive tab: dark card background (#131a23), gray border (#1e2631), secondary text (#a6abb5)
- Both tabs min-height 44px, rounded-full

--- NEW VIDEO FORM CARD ---
Dark card (#131a23), rounded-xl, border (#1e2631), 16px padding

Section label: "New Video" — small uppercase muted text (#a6abb5), 12px

Field 1 — Tool selector:
- Label "Tool" in muted gray (#70767f), 12px, above the input
- Full-width dropdown/select with dark background, white text, blue focus ring
- Placeholder value shown: "IP Address Checker"
- Rounded-xl, 12px+ padding, border (#1e2631)

Field 2 — Script Style:
- Label "Script Style", 12px muted
- Two pill toggle buttons side by side: "Feature Walkthrough" (selected) and "Problem-Solution"
- Selected state: blue tinted bg (#3D6AF2 at 20% opacity), blue text (#3D6AF2), 2px solid blue ring around button
- Unselected: dark card bg, gray text, gray border
- Both min-height 44px, rounded-xl

Field 3 — Voice:
- Label "Voice", 12px muted
- Two pill toggle buttons: "Clone" and "AI" (selected)
- Same selected/unselected styling as Script Style

Field 4 — Duration:
- Label "Duration", 12px muted
- Full-width dropdown showing "2 min — Standard" as selected option
- Same styling as Tool selector

Generate CTA button:
- Full-width, gradient background (left: #3D6AF2, right: #7C3AED), white bold text
- Text: "Generate IP Address Checker Video"
- Rounded-xl, min-height 44px, 12px vertical padding

--- VIDEO JOB LIST (below the form) ---

Show 3 job cards in different states:

JOB CARD 1 — "Complete" state:
Dark card (#131a23), rounded-xl, border (#1e2631), 16px padding, 12px gap between elements

Header row: 
- Left: bold white text "IP Address Checker Demo" + small muted timestamp "3 min ago"
- Right: small muted text "Step 6/6"

Progress bar: 6 equal segments in a horizontal pill, all segments filled emerald green (#10B981), full-width, 8px height

Step icons row: 6 columns evenly spaced
- Each column: small emoji icon on top, tiny ALL-CAPS label below
- All showing ✅ icon
- Labels (tiny, muted gray, 10px): SCRIPT, SCREEN REC, VOICEOVER, ASSETS, ASSEMBLY, PLATFORMS

Action buttons row (two side by side):
- "Preview" button: gradient blue-to-purple, white text, flex-1, rounded-xl, min 44px height
- "Download" button: emerald green (#10B981 area), white text, flex-1, rounded-xl, min 44px height

JOB CARD 2 — "In Progress" state (Processing):
Same card structure.
Header: "JSON Converter Demo" + "just now" + "Step 3/6"
Progress bar: 3 segments emerald green, 1 segment blue with pulse animation (⏳ running), 2 segments dark/pending (#1e2631)
Step icons: ✅ ✅ ✅ ⏳ ⚪ ⚪
Step labels: SCRIPT, SCREEN REC, VOICEOVER, ASSETS, ASSEMBLY, PLATFORMS
No action buttons (still processing)

JOB CARD 3 — "Failed" state:
Header: "Speed Test Demo" + "12 min ago" + "Step 2/6"
Progress bar: 2 emerald segments, 1 red segment (failed), 3 dark segments
Step icons: ✅ ✅ ❌ ⚪ ⚪ ⚪
Error banner below steps: red tinted background (#EF4444 at 10% opacity), red border, red text reading "Voiceover generation timed out. Please retry."
Retry button inside error banner (right side): solid red button, white text "Retry Voiceover", rounded-xl, min 44px height

---

SCREEN 2: Video Preview Modal

Full-screen dark overlay (black at 60% opacity) over the main dashboard.

Modal card: centered, max-width 768px, dark card (#131a23), rounded-xl, border (#1e2631), 16px padding

Modal header:
- Left: white bold text "IP Address Checker Demo"
- Right: X close icon button (muted gray, 44x44px min touch target)

Video player:
- 16:9 aspect ratio video placeholder
- Dark black background (#000) with a centered play button icon
- Native video controls bar at bottom
- Full-width, rounded-xl

Platform download grid (2x2 on mobile, 4 columns on desktop):
4 cards, each:
- Dark background (#090f16), rounded-xl, border (#1e2631), centered content
- Platform name: white bold (e.g. "YouTube (Master)", "TikTok", "Instagram Reels", "Twitter / X")
- Aspect ratio label: tiny muted uppercase (e.g. "16:9", "9:16", "9:16", "1:1")
- Download button: emerald green, white text, full-width, min 44px, rounded-xl

"Download All" button: full-width, blue-to-purple gradient, white bold text, rounded-xl, min 44px

Script section:
- Dark bg (#090f16), rounded-xl, border (#1e2631), 16px padding
- Header row: "Script" label (small, muted) on left + "Copy Script" link in blue (#3D6AF2) on right
- 3-4 lines of muted gray script text below (truncated with scroll if long)

Hashtags section:
- Header row: "Hashtags" label + "Copy Hashtags" link in blue on right
- Row of blue pill badges: #IPAddressChecker #NetworkTools #TechTips #SaaS #DemoVideo #Toolk1t

---

VISUAL STYLE (applies to all screens)

Color palette:
- Page background: #090f16 (very dark navy)
- Card background: #131a23 (dark slate)
- Card hover: #1e2631
- Border: #1e2631
- Primary blue: #3D6AF2
- Gradient: #3D6AF2 → #7C3AED (blue to purple, for CTAs)
- Title gradient: #3D6AF2 → #32A9D9 (blue to cyan)
- Text primary: #ffffff
- Text secondary: #a6abb5
- Text muted: #70767f
- Success/done: #10B981 (emerald)
- Danger/failed: #EF4444 (red)
- Running/active: #3D6AF2 with pulse animation

Typography:
- Font: Inter (system-style sans-serif)
- Labels: 12px, muted gray, regular weight
- Body: 14px, secondary gray
- Card titles: 14-16px, white, semibold
- Page title: 32-36px, white, extrabold
- Step labels: 10px, muted, bold, uppercase, tracked

Components & interactions:
- All interactive elements: min 44px height (touch-safe)
- Cards: rounded-xl (12px radius), subtle border, no box-shadow
- Buttons: rounded-xl, semibold text
- Selected states: 2px inset ring in primary blue + blue-tinted background
- Pill tabs: rounded-full
- Inputs/selects: dark bg, blue focus ring + blue border on focus
- Progress bar: segmented pill, 8px height, 4px gap between segments
- Step indicators: emoji icons above 10px uppercase labels in a flex row
- Error states: red tinted card with retry action inline
- Gradient CTAs: blue-to-purple for primary actions

Design aesthetic:
- Dark mode only, deep navy foundation
- Minimal and data-focused — no decorative elements
- Consistent card-based layout throughout
- Compact but breathable — 16px internal padding, 12-16px gap between cards
- Professional SaaS tool feel — not consumer/playful

Platform: Responsive web, mobile-first
Primary viewport: 390px (mobile), 896px max-width centered (desktop)
```

---

## Refinement Annotations (use after initial generation)

After the first generation, annotate these specific areas for refinement:

1. **Progress bar segments** — "Make each segment a separate rounded pill with a small 4px gap between them, not a continuous bar"
2. **Step icons row** — "Align each step icon + label directly below its corresponding progress segment"
3. **Generate button** — "Ensure the gradient goes left-to-right from #3D6AF2 to #7C3AED, not diagonal"
4. **Selected pill buttons** — "The ring outline should be 2px solid #3D6AF2 inset (like a focus ring), not a border that shifts layout"
5. **Tab pills** — "Active tab: filled #3D6AF2 bg. Inactive tab: transparent bg, #1e2631 border, #a6abb5 text"
6. **Card spacing** — "Use exactly 12px gap between the three job cards"

---

## Variant Requests

After base design, request these variants:

**Variant A:** Mobile (390px) — Videos tab only, showing the new video form collapsed into an accordion / expandable panel at the top, with job cards taking full screen below

**Variant B:** Templates tab view — same header/tab structure, but content area shows three upload slots (Intro Video, Outro Video, Background Music), each as a horizontal card with file name + status badge + Upload button

**Variant C:** Empty state — Videos tab with no jobs yet, showing a centered empty state illustration (simple video camera icon in muted color) with headline "No videos yet" and subtext "Generate your first marketing video above"
