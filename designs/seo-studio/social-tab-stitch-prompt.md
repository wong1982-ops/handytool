# Google Stitch Prompt — SEO Studio: Social Content Tab

## Screen Overview

Social Content Tab for the SEO Studio tool on Toolk1t. This is the 5th tab in the existing SEO Studio tool. It generates platform-optimized social media posts (Twitter, LinkedIn, Instagram, Facebook, TikTok) with 3 variants per platform.

**Platform:** Responsive web (desktop-first, 1440px)
**Theme:** Dark mode with Toolk1t utility-category blue theme

---

## Brand Tokens

```
page-bg:        #090f16
card-bg:        #131a23
card-hover:     #1e2631
border:         #1e2631
text-primary:   #ffffff
text-secondary: #a6abb5
text-muted:     #70767f

primary:        #3D6AF2
primary-light:  #3D9DF2
purple:         #7C3AED

success:  #10B981
danger:   #EF4444
```

---

## Layout Context

The tab sits inside ToolFrame with a compact blue gradient header ("SEO Studio") and sticky tab bar with 5 tabs: Keywords | Content | Audit | Pages | **Social** (active).

Only design the **content area below the tabs** — the header and tabs are handled by ToolFrame.

---

## Screen: Social Content Generator

### Section 1 — Input Form (top, centered max-w-2xl)

**Card container:** card-bg background, border, 16px radius, 24px padding, centered with max-w-2xl.

**Field 1 — Target Tool**
- Label: `"Which tool to promote?"` (13px, text-secondary, above input)
- Select dropdown: full width, card-bg fill, border, 12px radius, 44px height, text-primary
  - Default option: `"Select a tool..."` (text-muted)
  - Options: list of 34 tool names (e.g. "JSON Converter", "Image Editor", "Mood Board")
  - Dropdown chevron icon on right

**Field 2 — Content Type**
- Label: `"Content type"` (13px, text-secondary)
- 3 pill buttons in a row, equal width:
  - `"📢 Announcement"` — promote the tool
  - `"💡 Tips & How-to"` — educational value
  - `"🔥 Engagement"` — polls, questions, hot takes
- Active pill: primary blue fill, white text
- Inactive pill: card-bg, border, text-secondary, hover to card-hover
- Each pill: 44px min-height, 12px radius

**Field 3 — Custom Angle (optional)**
- Label: `"Custom angle"` (13px, text-secondary) + `"optional"` tag (11px, text-muted, italic)
- Text input: full width, card-bg fill, border, 12px radius, 44px height
  - Placeholder: `"e.g. focus on speed, compare with alternatives..."` (text-muted)

**Generate Button**
- Full width within the card, primary gradient (from-[#3D6AF2] to-[#3D9DF2]), white text, 44px height, 12px radius
- Label: `"✨ Generate Posts"`
- Disabled state: 40% opacity when tool or type not selected
- Loading state: spinner replacing sparkle icon + `"Generating..."`
- Credit badge below button: `"1 credit"` (12px, purple #7C3AED text, centered)

---

### Section 2 — Results (below form, full width max-w-5xl, visible after generation)

**Header row:**
- Left: `"Generated Posts"` (18px, bold, white)
- Right: `"📥 Download All as CSV"` button — secondary style (card-bg, border, text-secondary, 12px radius, 44px height, hover to card-hover)

**Platform tabs row:**
- 5 tabs in a horizontal row with gap-2:
  - Each tab: pill shape (rounded-full), 44px min-height, px-5
  - Active: primary blue fill, white text
  - Inactive: card-bg, border, text-secondary, hover to card-hover
  - Tab labels with platform icons (use simple emoji or SVG):
    - `"𝕏 Twitter"`
    - `"in LinkedIn"`
    - `"📷 Instagram"`
    - `"f Facebook"`
    - `"♪ TikTok"`

**Variant cards (3 per active platform):**
- Vertical stack with gap-3
- Each card: card-bg, border, 12px radius, 16px padding

  **Card header row:**
  - Left: `"Variant 1"` / `"Variant 2"` / `"Variant 3"` (13px, text-muted)
  - Right: character count badge
    - Within limit: `"142/280"` — success green bg (green-500/20), green-400 text, rounded-full, px-2 py-0.5
    - Over limit: `"305/280"` — danger red bg (red-500/20), red-400 text

  **Post content:**
  - Text block: 14px, text-primary, line-height 1.6, preserves line breaks (whitespace-pre-wrap)
  - Padding: 12px 0

  **Hashtags row:**
  - Horizontal flex-wrap of hashtag pills
  - Each pill: card-hover bg, rounded-full, px-2.5 py-1, 12px text, text-secondary
  - Example: `#jsonformatter` `#devtools` `#free` `#coding`

  **Card footer:**
  - Right-aligned: `"📋 Copy"` button — small secondary style (card-bg, border, rounded-lg, px-3 py-1.5, 13px text-secondary)
  - On click: text changes to `"✓ Copied!"` briefly (success green text)

---

### Empty State (before first generation)

- Below the form card, centered, py-12:
  - Large icon: social media icons cluster (or a megaphone SVG, 48px, text-muted)
  - Heading: `"Generate social content for any tool"` (16px, text-secondary)
  - Subtitle: `"Pick a tool and content type above to create posts for 5 platforms"` (14px, text-muted)

---

## Mobile Responsive (< 768px)

- Form card: full width, 16px horizontal padding
- Content type pills: stack 1 per row (full width each)
- Platform tabs: horizontally scrollable row
- Variant cards: full width
- CSV download button: full width below platform tabs
- Character count badge: stays in header row

---

## Interaction Notes

- Platform tab switching is instant (no API call — all 15 posts loaded in state)
- Copy button shows "Copied!" for 2 seconds then reverts
- CSV download triggers immediate file save, filename: `social-posts-{toolSlug}-{YYYY-MM-DD}.csv`
- Form stays visible above results (scroll down to see results)
- Generating state: form inputs disabled, button shows spinner
- Error state: red banner below form card with error message
