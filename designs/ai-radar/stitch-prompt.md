# AI Radar — Google Stitch Prompt

## Tool Description

AI Radar is a daily-updated news feed tracking new AI model releases and major updates across LLMs, image/video generation, audio/speech, code models, multimodal, embedding/search, and robotics/agents. Users browse categorised news cards, filter by time range and keyword search, then click a card to read a full-detail modal.

---

## Stitch Prompt

```
AI Radar tool page — dark theme news feed for tracking AI model releases and updates.

Screen: Full desktop page (1200px max-width, centered), dark background #090f16.

--- PAGE HEADER ---
Breadcrumb row: "Tools / AI Radar" in muted text (#70767f), with a chevron separator.
Below that, large bold heading "AI Radar" in white, and a subtitle line
"New AI model releases and major updates — updated daily" in secondary text (#a6abb5).

--- CATEGORY TAB BAR ---
Horizontal pill tab group (fits in one line on desktop) with a dark container background (#131a23),
border-radius 12px, padding 4px. Tabs: All · LLMs · Image / Video · Audio / Speech · Code Models · Multimodal · Embedding / Search · Robotics / Agents.
Active tab: white background, white text, subtle shadow. Inactive: transparent, muted text (#70767f), hover brightens to #a6abb5.
Tab height: 40px, min-width 44px, font-size 14px, font-weight 500.

--- SEARCH + TIME FILTER ROW ---
Full-width row directly below the tab bar with 12px gap.
Left: search input (flex-1), height 48px, border-radius 12px, background #131a23, border 1px solid #1e2631,
placeholder "Search by model name, topic, or keyword...", search icon on left (#70767f),
focus ring color #3D6AF2 with 50% opacity.
Right: time-range dropdown (shrink-0, width ~140px), same height/style as search field.
Options: All time · Today · Last 3 days · Last 7 days · Last 30 days.

--- NEWS CARD GRID ---
2-column grid with 12px gap (single column on mobile).
Each news card: background #131a23, border 1px solid #1e2631, border-radius 12px, padding 20px,
hover border-color shifts to #3D6AF2 at 50% opacity, hover shadow-md, cursor pointer.

Card anatomy (horizontal flex, gap 16px):
  LEFT: thumbnail image 80×80px, border-radius 8px, object-cover. Hidden on mobile.
  RIGHT (flex-1):
    - Title: 14px / semibold / white, line-clamp 2, hover color #3D6AF2, mb 4px.
    - Summary: 14px / regular / #a6abb5, line-clamp 2, mb 8px.
    - Footer row (flex-wrap, gap 8px):
        Model badge: pill, background #3D6AF2/10, text #3D6AF2, 12px font, semibold. Shown when model_name exists.
        Provider badge: pill, background purple/20, text purple-300, 12px font, medium. Shown when provider but no model_name.
        Source · Relative date: "VentureBeat · 2h ago", 12px / #70767f.

Show 6 cards in mockup with realistic AI news data — mix of LLMs, image gen, code models.
Sample cards:
  1. "GPT-5o Released with Extended Reasoning and Multimodal Code Generation" — OpenAI · LLMs · model badge "GPT-5o" · "1h ago" · summary about new capabilities
  2. "Google Imagen 4 Achieves Photorealistic Output at 4K Resolution" — Google AI · Image/Video · model badge "Imagen 4" · "3h ago"
  3. "Anthropic Claude 4 Sonnet Benchmarks Beat GPT-4o on MMLU" — Anthropic · LLMs · model badge "Claude 4 Sonnet" · "5h ago"
  4. "Meta Releases Code Llama 3 with 200K Context Window" — Meta AI · Code Models · model badge "Code Llama 3" · "Yesterday"
  5. "ElevenLabs Launches Voice Studio 2.0 with Emotion Control" — VentureBeat · Audio/Speech · provider badge "ElevenLabs" · "2 days ago"
  6. "Mistral Releases Embedding Model with State-of-the-Art MTEB Score" — Hugging Face · Embedding/Search · model badge "Mistral Embed v3" · "3 days ago"

--- PAGINATION ---
Centred below grid. Result count "142 articles found" in muted text.
Pagination row: Prev button, page numbers 1(active, filled primary blue), 2, 3, ..., 8, Next button.
Buttons: 40×40px, border-radius 8px, border #1e2631. Active: background #3D6AF2, white text.
Hover: background #1e2631.

--- DETAIL MODAL (open state on right side or overlay) ---
Show modal triggered by clicking card 1.
Bottom sheet on mobile / centred dialog on desktop (max-width 640px).
Background #131a23, border 1px solid #1e2631, border-radius 16px (top corners on mobile), shadow-2xl.
Backdrop: black 50% opacity.

Modal header (sticky): title bold white, source · date in muted text, X close button top-right (44×44px touch target).
Body:
  - Hero image full-width, border-radius 8px, max-height 200px, object-cover.
  - Badges row: model badge (primary blue pill) + category badge (slate pill).
  - "Summary" label + body text in #a6abb5.
  - "Topics" label + tag pills: reasoning · multimodal · code-gen · function-calling (slate bg pills, 12px).
Footer (sticky): "Read original on OpenAI" CTA button (flex-1, height 48px, bg #3D6AF2, white, border-radius 12px, external link icon) + "Share" ghost button (border #1e2631, slate text, same height).

Visual style: dark (#090f16 page, #131a23 cards), accent blue #3D6AF2, clean minimal layout,
Inter font, system font stack, no decorative graphics or gradients.
Platform: Responsive web, desktop-first (1200px container).
```

---

## Key Design Decisions

| Element | Spec |
|---|---|
| Page background | `#090f16` |
| Card background | `#131a23` |
| Card hover | `#1e2631` border |
| Border | `#1e2631` |
| Primary accent | `#3D6AF2` |
| Text primary | `#ffffff` |
| Text secondary | `#a6abb5` |
| Text muted | `#70767f` |
| Border radius (cards) | `12px` |
| Border radius (modal) | `16px` |
| Min touch target | `44px` |
| Font | Inter, system-ui |

## Screens to Generate

1. **Main feed** — default state, "All" tab active, 6 cards in 2-col grid, search + filter row, pagination
2. **Category filtered** — "LLMs" tab active, search results visible
3. **Detail modal open** — modal overlaying blurred/dimmed feed

## Iteration Notes for Stitch

- After initial generation: annotate the card thumbnails and request sharper aspect-ratio enforcement
- If tabs wrap to two lines: reduce font size to 13px or use a horizontal scroll on the tab bar
- Modal backdrop should be `backdrop-filter: blur(4px)` in addition to 50% black overlay
- The "Read original" CTA must use the brand primary blue — annotate if generated grey
