# Story Studio — UX & Audio Enhancement Design

**Date**: 2026-03-08
**Status**: Approved

---

## Understanding Summary

- **What**: Improve Story Studio audio reliability, viewer UX, and plot input controls
- **Why**: Audio inconsistency (Gemini/browser fallback mix) breaks immersion; viewer lacks polish vs design reference
- **Who**: Story Studio users creating and reading AI-illustrated story books
- **Key constraints**: Simplified architecture (no sidebar/tabs), system fonts, Gemini + OpenAI stack, credit-based model
- **Non-goals**: Pixel-perfect design match, bookshelf redesign, sidebar navigation, ElevenLabs integration

---

## Assumptions

- OpenAI TTS `tts-1` is acceptable fallback quality (better than browser, cheaper than `tts-1-hd`)
- Voice re-generation costs 5x original TTS cost per page
- Story Length dropdown maps directly to `pageCount` in `StoryConcept.tags`
- Image zoom is a simple lightbox (no pan/pinch editing)
- Existing `OPENAI_API_KEY` env var is already configured
- Gemini TTS voice list is hardcoded (not fetched dynamically)

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| 1 | Cherry-pick design, not pixel-perfect | Pixel-perfect, style-only | Balances polish with simplified architecture |
| 2 | Retry Gemini 3x + OpenAI TTS fallback | ElevenLabs, Google Cloud TTS, browser-only | OpenAI key already exists, good quality, no new setup |
| 3 | All Gemini voices exposed | 2 voices, 4-6 curated | Maximum user choice, minimal implementation difference |
| 4 | Re-generate audio on demand per voice switch | Pre-generate all voices, browser fallback only | Balances cost/quality — user pays only when switching |
| 5 | 5x cost for re-generation | Same cost, fixed credit amount | Discourages excessive re-rolls while staying fair |
| 6 | Dropdowns optional with defaults | Required, optional no defaults | Lowers friction while still guiding the AI |
| 7 | 3 story length tiers (Short/Chapter/Novel) | Free-form page count, 2 tiers | Matches design, clear user mental model |

---

## Risks

- Gemini TTS voice list may change — hardcoded list needs manual updates
- OpenAI TTS adds API cost on top of Gemini failures — should be rare with 3 retries
- On-demand voice re-generation adds latency to the reading experience

---

## Batch 1 — TTS Reliability + OpenAI Fallback

**Goal**: Every page gets server-generated audio. Browser Speech Synthesis is never used.

### Backend: `lib/story/tts.ts`

1. Add `generateWithOpenAI(text: string, voiceName?: string): Promise<Buffer>` function
   - Calls OpenAI TTS `tts-1` endpoint: `POST https://api.openai.com/v1/audio/speech`
   - Body: `{ model: "tts-1", voice: "alloy", input: text, response_format: "mp3" }`
   - Returns mp3 buffer
   - Upload to Supabase same path pattern as Gemini audio

2. Modify `generatePageAudio()` internal flow:
   - Try Gemini TTS with **3 retries** (exponential backoff: 1s, 2s, 4s + jitter)
   - If all Gemini retries fail → call OpenAI TTS with **2 retries**
   - If OpenAI also fails → throw error
   - Retry logic is internal to `generatePageAudio()`, not in `route.ts`

3. Update file extension handling:
   - Gemini output: `.wav` (existing)
   - OpenAI output: `.mp3` (new)
   - Content type set accordingly on Supabase upload

### Frontend: `tools/story-studio/book-viewer.tsx`

4. Remove all `window.speechSynthesis` code:
   - Remove `voiceRef`, `createUtterance`, voice caching `useEffect`
   - Remove `SpeechSynthesisUtterance` usage in `speakPage()`
   - Remove `window.speechSynthesis.cancel()` calls

5. Update `speakPage()`:
   - If `targetPage.audioUrl` exists → play it via `Audio` element (no change)
   - If no `audioUrl` → skip playback, show muted speaker state
   - No fallback to browser TTS

6. Update TTS button / narration bar:
   - Disabled state for pages without audio (grayed out, tooltip "No audio available")

### Files changed:
- `lib/story/tts.ts` — add OpenAI fallback, internal retry
- `tools/story-studio/book-viewer.tsx` — remove browser Speech Synthesis
- `app/api/v1/story/generate/route.ts` — remove `withRetry` wrapper around TTS calls (retry is now internal)

### Verification:
- Generate a book in dev mode → all pages should have `audioUrl`
- Temporarily break Gemini TTS → should fall back to OpenAI, audio still plays
- No `window.speechSynthesis` references remain in the codebase

---

## Batch 2 — Viewer UX

**Goal**: Polish the book viewer with image treatment, zoom, repositioned auto-play, and narration bar.

### 2a. Image Treatment

Changes to `book-viewer.tsx` page image area:
- Wrap image in a container with `rounded-xl shadow-md overflow-hidden` and `m-4 md:m-6` padding
- Add a zoom/magnify button: absolute positioned bottom-right of image, semi-transparent circle with magnify glass icon
- Button triggers the image lightbox (2b)

### 2b. Image Zoom Lightbox

New file: `tools/story-studio/image-lightbox.tsx`
- Props: `src: string`, `alt: string`, `onClose: () => void`
- Full-screen fixed overlay: `bg-black/80 z-50`
- Image centered with `max-w-[90vw] max-h-[90vh] object-contain`
- Close button (X) in top-right corner
- Click backdrop or press Escape to dismiss
- Focus trap for accessibility

### 2c. Auto-play Repositioned

- Remove auto-play button from the bottom navigation bar
- Add pill toggle inside the book container, top-right corner: `absolute top-4 right-4`
- Style: amber pill with play/pause icon + "Auto-play" label
- Same logic as current auto-play, just repositioned

### 2d. Narration Bar

Replace floating speaker button with a bar at the bottom of the book container (inside the rounded card, above page navigation):

```
┌──────────────────────────────────────────────────────────┐
│  NARRATION          │◄  ▶/❚❚  ►│       READ ALOUD  [●] │
│  ⊙ Story Voice      │          │                        │
└──────────────────────────────────────────────────────────┘
```

- Left: "NARRATION" label (amber, small caps) + voice name text (display-only in Batch 2)
- Center: prev track `│◄` / play-pause `▶❚❚` / next track `►│` buttons
  - Prev/next track = go to previous/next page and play audio
  - Play-pause = play or stop current page audio
- Right: "READ ALOUD" label + toggle switch
  - Toggle on = auto-play narration on every page flip
  - Toggle off = manual play only
- Bar is always visible but dimmed when Read Aloud is off or on cover page
- Bar sits between book content and page navigation

### Files changed:
- `tools/story-studio/book-viewer.tsx` — image treatment, auto-play reposition, narration bar
- `tools/story-studio/image-lightbox.tsx` — new file

### Verification:
- Page images show rounded corners + shadow + zoom icon
- Tapping zoom opens full-screen lightbox, Escape closes it
- Auto-play pill appears top-right, functions as before
- Narration bar shows controls, play/pause works
- Floating speaker button is gone
- Mobile responsive: narration bar stacks gracefully

---

## Batch 3 — Plot Input Dropdowns + Voice Selection

**Goal**: Add user controls for story parameters and voice switching.

### 3a. Plot Input Dropdowns

**`tools/story-studio/plot-input.tsx`:**
- Add 3-column grid (`grid-cols-1 md:grid-cols-3`) below textarea, above button
- Each dropdown:
  - Label: uppercase small bold text (e.g., "STORY LENGTH")
  - `<select>` with amber focus ring
- Options:
  - **Story Length**: "Short Story (5-8 pages)" (default), "Chapter Book (10-12 pages)", "Novel (15-20 pages)"
  - **Target Audience**: "Children" (default), "Middle Grade", "Young Adult", "Adult"
  - **Genre**: "Fantasy" (default), "Science Fiction", "Mystery", "Romance", "Historical Fiction"

**`tools/story-studio/plot-input.tsx` props:**
- Update `onSubmit` signature: `(plot: string, options: { storyLength: string; audience: string; genre: string }) => void`

**`tools/story-studio/use-story-book.ts`:**
- Pass dropdown values to `fetchConcepts()`

**`lib/story/enrich.ts`:**
- Update concept generation prompt to include: story length, audience, genre
- Map story length to page count in the generated concept's `tags.pageCount`

**`lib/story/types.ts` (Zod schema):**
- Add optional `storyLength`, `audience`, `genre` to concept request schema

### 3b. Voice Selection

**`tools/story-studio/types.ts`:**
- Add `voiceName?: string` to `Page` interface
- Add `GEMINI_VOICES` constant:
  ```typescript
  export const GEMINI_VOICES = [
    { id: 'Kore', label: 'Kore', gender: 'Female' },
    { id: 'Charon', label: 'Charon', gender: 'Male' },
    { id: 'Fenrir', label: 'Fenrir', gender: 'Male' },
    { id: 'Aoede', label: 'Aoede', gender: 'Female' },
    { id: 'Puck', label: 'Puck', gender: 'Male' },
    // ... all available Gemini voices
  ] as const
  ```

**`lib/story/tts.ts`:**
- Add `voiceName` parameter to `generatePageAudio()` (default: `'Kore'`)
- Pass to `prebuiltVoiceConfig.voiceName`

**New API: `app/api/v1/story/regenerate-audio/route.ts`:**
- `POST` handler
- Request body: `{ bookId: string, pageNumber: number, voiceName: string }`
- Auth required
- Deduct credits: 5x original TTS cost
- Fetch book from DB, get page text + dialogue
- Call `generatePageAudio()` with specified `voiceName`
- Update book JSONB: set `pages[n].audioUrl` and `pages[n].voiceName`
- Return `{ audioUrl: string }`

**Narration bar voice selector (wiring from Batch 2):**
- Populate dropdown with `GEMINI_VOICES`
- Show current page's `voiceName` as selected (default "Kore" if not set)
- On voice change:
  1. Show confirmation: "Switching voice will regenerate audio (costs X credits). Continue?"
  2. On confirm → call `POST /api/v1/story/regenerate-audio`
  3. Show loading spinner on the voice selector
  4. On success → update page's `audioUrl` and `voiceName` in local state, auto-play new audio
  5. On error → show toast, revert selector

### Files changed:
- `tools/story-studio/plot-input.tsx` — add 3 dropdowns
- `tools/story-studio/use-story-book.ts` — pass options to API
- `tools/story-studio/types.ts` — add `voiceName`, `GEMINI_VOICES`
- `tools/story-studio/book-viewer.tsx` — wire voice selector
- `lib/story/enrich.ts` — accept story params in prompt
- `lib/story/types.ts` — update Zod schema
- `lib/story/tts.ts` — add `voiceName` parameter
- `app/api/v1/story/regenerate-audio/route.ts` — new endpoint
- `app/tools/story-studio/page.tsx` — pass new props

### Verification:
- Plot input shows 3 dropdowns with correct defaults
- Generated concepts reflect selected audience, genre, and page count
- Voice selector lists all Gemini voices
- Switching voice shows cost confirmation
- After confirmation, new audio plays with selected voice
- Voice name persists in book data
