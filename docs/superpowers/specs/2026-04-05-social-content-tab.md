# Social Content Tab — Design Spec

**Date:** 2026-04-05
**Status:** Approved
**Parent:** SEO Studio tool

---

## Overview

A new "Social" tab inside SEO Studio that generates platform-optimized social media content for promoting tools. Produces 15 posts per generation (5 platforms × 3 variants), displayed in a tabbed preview with CSV export.

## Tab Details

- **Route:** `/tools/seo-studio/social`
- **Tab label:** "Social" (5th tab, after Pages)
- **Access:** Public (no admin gate)
- **Credits:** 1 per generation

## UI

### Input Form

- **Target tool** — dropdown of all tools from `lib/tools.tsx` (required)
- **Content type** — 3 pill buttons, single select (required):
  - "Announcement" — promotional post
  - "Tips & How-to" — educational/value post
  - "Engagement" — polls, questions, hot takes
- **Custom angle** — text input, optional (e.g. "focus on speed", "compare with competitors")
- **"Generate Posts" button** — gradient, disabled until tool + type selected, "1 credit" badge

### Results Preview

- **Platform tabs** — horizontal pills: Twitter / LinkedIn / Instagram / Facebook / TikTok
- **3 variant cards per platform:**
  - Platform icon + character count badge (green if within limit, red if over)
  - Post text (14px white, preserves line breaks)
  - Hashtags row (pill badges, text-muted)
  - "Copy" button per card
- **"Download All as CSV" button** — top-right of results section, secondary style

### States

- **Empty:** form only, no results
- **Generating:** spinner in button, form disabled
- **Results:** form + results below
- **Error:** red banner above results

## Generation Logic

### Single Gemini Call

One API call produces all 15 posts. The prompt includes tool info, content type, custom angle, and platform-specific rules.

### Platform Rules (in prompt)

| Platform | Max Chars | Hashtags | Tone |
|---|---|---|---|
| Twitter | 280 | 2-3 | Punchy, casual, emojis OK |
| LinkedIn | 500 | 3-5 at end | Professional, can include question |
| Instagram | 2200 | 5-10 separate block | Storytelling, emoji-heavy |
| Facebook | 500 | 1-2 | Conversational, question OK |
| TikTok | 2200 | 3-5 | Hook-style, casual/Gen-Z, trending |

### Response Format

```typescript
interface SocialPostSet {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok'
  variants: {
    content: string
    hashtags: string[]
    charCount: number
  }[]
}

interface SocialGenerationResponse {
  posts: SocialPostSet[]
}
```

## Export

### CSV Format

```csv
Platform,Variant,Content,Hashtags,CharCount
Twitter,1,"Post text here...","#tag1 #tag2",142
Twitter,2,"Another version...","#tag1 #tag3",98
LinkedIn,1,"Professional post...","#tag1 #tag2 #tag3",234
...
```

Download triggers as `social-posts-{toolSlug}-{date}.csv`.

## No Persistence

Results live in component state only. No database table needed. User exports CSV or copies individual posts.

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `tools/seo-studio/social-generator.tsx` | Social tab UI component |
| `app/tools/seo-studio/social/page.tsx` | Social tab route |
| `app/api/v1/seo-studio/social/generate/route.ts` | Generation API |

### Modified Files

| File | Changes |
|---|---|
| `app/tools/seo-studio/layout.tsx` | Add "Social" tab to tabs array |
| `lib/seo-studio/gemini.ts` | Add `generateSocialPosts()` function |

## API

### POST `/api/v1/seo-studio/social/generate`

**Auth:** Yes (any authenticated user)
**Credits:** 1
**Body:** `{ toolSlug: string, contentType: 'announcement' | 'tips' | 'engagement', customAngle?: string }`
**Response:** `{ posts: SocialPostSet[] }`
**maxDuration:** 30

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Tab inside SEO Studio | Standalone tool | Marketing tools unified |
| 2 | Generate + export only | Direct API posting | No OAuth needed |
| 3 | 3 variants per platform | 1 or 5 | Choice without overwhelm |
| 4 | Single Gemini call | Per-platform calls | Faster, cheaper |
| 5 | No persistence | DB storage | YAGNI |
| 6 | Public tab | Admin only | Useful for all users |
| 7 | 1 credit per generation | Free or 2 | Good value for 15 posts |
