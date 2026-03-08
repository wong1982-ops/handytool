# Story Studio — UX & Audio Enhancement Plan

**Date**: 2026-03-08
**Design**: [2026-03-08-story-studio-ux-audio-design.md](./2026-03-08-story-studio-ux-audio-design.md)
**Status**: Ready

---

## Batch 1 — TTS Reliability + OpenAI Fallback (5 tasks)

### Task 1: Add OpenAI TTS function to `lib/story/tts.ts`
1. Add `generateWithOpenAI(text: string): Promise<Buffer>` function
2. Call `POST https://api.openai.com/v1/audio/speech` with `{ model: "tts-1", voice: "alloy", input: text, response_format: "mp3" }`
3. Use `OPENAI_API_KEY` env var (already configured)
4. Return the response as a Buffer
5. **Verify**: Function exists and TypeScript compiles

### Task 2: Add internal retry logic to `generatePageAudio()`
1. Wrap Gemini TTS call in a retry loop: 3 attempts with exponential backoff (1s, 2s, 4s + random jitter)
2. If all 3 Gemini attempts fail, call `generateWithOpenAI()` with 2 retries
3. For OpenAI output, upload as `.mp3` with `contentType: 'audio/mp3'`
4. In dev mode, return OpenAI audio as base64 data URL (same pattern as Gemini dev mode)
5. **Verify**: TypeScript compiles, function signature unchanged (backward compatible)

### Task 3: Remove route-level TTS retry wrapper
1. In `app/api/v1/story/generate/route.ts`, remove `withRetry()` wrapper around `generatePageAudio()` calls (retry is now internal)
2. Keep `withRetry()` for image generation (still needed there)
3. **Verify**: TypeScript compiles, route still functions

### Task 4: Remove browser Speech Synthesis from book-viewer
1. In `tools/story-studio/book-viewer.tsx`:
   - Remove `voiceRef` ref
   - Remove voice caching `useEffect` (the one with `pickVoice` and `onvoiceschanged`)
   - Remove `createUtterance()` helper
   - Remove all `window.speechSynthesis.cancel()` calls
   - Remove all `SpeechSynthesisUtterance` usage
2. Update `speakPage()`: if `targetPage.audioUrl` exists → play via `Audio` element; if not → `setIsSpeaking(false)` immediately (no playback)
3. Update unmount cleanup: only clean up `audioRef`, no `speechSynthesis.cancel()`
4. **Verify**: No `speechSynthesis` references in `book-viewer.tsx`, TypeScript compiles

### Task 5: Add disabled state for pages without audio
1. In the TTS button (and future narration bar), if `!page?.audioUrl`:
   - Show button as disabled/grayed out
   - Tooltip: "No audio available"
2. Auto-play should skip pages without audio (advance to next page immediately)
3. **Verify**: TypeScript compiles, button visually grayed when no audioUrl

---

## Batch 2 — Viewer UX (5 tasks)

### Task 6: Image treatment — rounded corners + shadow
1. In `book-viewer.tsx`, wrap the page image in a container div
2. Add `rounded-xl shadow-md overflow-hidden` to the container
3. Add `m-4 md:m-6` padding around the image area (not full-bleed)
4. Apply same treatment to cover page image
5. **Verify**: Images show rounded corners and shadow on both cover and pages

### Task 7: Image zoom — magnify icon + lightbox component
1. Create `tools/story-studio/image-lightbox.tsx`:
   - Props: `src: string`, `alt: string`, `onClose: () => void`
   - Full-screen fixed overlay (`fixed inset-0 bg-black/80 z-50 flex items-center justify-center`)
   - Image: `max-w-[90vw] max-h-[90vh] object-contain`
   - Close button: absolute top-4 right-4, white X icon
   - Click backdrop to close
   - Escape key to close (`useEffect` with keydown listener)
2. In `book-viewer.tsx`, add zoom icon button on each page image:
   - Absolute bottom-right of image container
   - Semi-transparent circle with magnify glass SVG icon
   - `onClick` opens the lightbox with that page's image
3. Add `zoomImage` state: `string | null` — the URL of the image being zoomed
4. **Verify**: Clicking magnify opens lightbox, Escape/backdrop click closes it

### Task 8: Reposition auto-play to top-right pill
1. Remove auto-play button from the bottom navigation bar
2. Add auto-play pill toggle inside the book container, positioned `absolute top-4 right-4`
3. Style: amber rounded-full pill with play/pause icon + "Auto-play" label
4. Same click handler logic as current auto-play
5. Ensure it doesn't overlap with book content on mobile (add `z-10`)
6. **Verify**: Auto-play pill visible top-right, functions same as before, bottom nav only has Prev + Flip Page

### Task 9: Narration bar — layout and playback controls
1. Add narration bar between book container and page navigation
2. Layout: flex row with 3 sections
   - Left: "NARRATION" label (amber uppercase) + voice name text (static "Kore" for now)
   - Center: prev track / play-pause / next track icon buttons (44px touch targets)
   - Right: "READ ALOUD" label + toggle switch
3. Prev track: go to previous page + play audio. Next track: go to next page + play audio
4. Play-pause: play or stop current page audio (same as old speaker button)
5. Read Aloud toggle: when on, auto-play audio on every page flip; when off, manual only
6. Bar dimmed/muted on cover page or when Read Aloud is off
7. Remove the floating speaker button (replaced by narration bar)
8. **Verify**: Narration bar renders, play/pause works, prev/next track advances and plays

### Task 10: Mobile responsive narration bar
1. On mobile (`md:` breakpoint), narration bar stacks or simplifies:
   - Voice name hidden on mobile (show on `md:` and up)
   - "READ ALOUD" label hidden, just show toggle
   - Controls stay centered and tappable (44px min)
2. Auto-play pill: ensure it doesn't overlap book content on small screens
3. **Verify**: Test at 320px, 768px, 1280px widths

---

## Batch 3 — Plot Dropdowns + Voice Selection (5 tasks)

### Task 11: Add 3 dropdowns to plot input
1. In `tools/story-studio/plot-input.tsx`:
   - Add state for `storyLength`, `audience`, `genre` with defaults
   - Add 3-column grid below textarea with select dropdowns
   - Labels: uppercase small bold text ("STORY LENGTH", "TARGET AUDIENCE", "GENRE")
   - Options as defined in design doc
   - Amber focus ring on selects
2. Update `onSubmit` to pass `{ storyLength, audience, genre }` alongside plot text
3. Update `PlotInputProps` interface
4. **Verify**: Dropdowns render with correct defaults, values passed to parent

### Task 12: Wire dropdowns to concept generation
1. In `tools/story-studio/use-story-book.ts`:
   - Update `fetchConcepts()` to accept and pass dropdown values
2. In `lib/story/types.ts` (Zod schema):
   - Add optional `storyLength`, `audience`, `genre` to concept request schema
3. In `lib/story/enrich.ts`:
   - Update concept generation prompt to include story length, audience, genre
   - Map story length to `pageCount`: "Short Story" → 6, "Chapter Book" → 11, "Novel" → 17
4. Update `app/tools/story-studio/page.tsx` to pass new props through
5. **Verify**: Generated concepts reflect selected options (audience, genre, page count match)

### Task 13: Add `GEMINI_VOICES` constant and `voiceName` to types
1. In `tools/story-studio/types.ts`:
   - Add `voiceName?: string` to `Page` interface
   - Add `GEMINI_VOICES` constant with all available Gemini TTS voices (id, label, gender)
2. In `lib/story/tts.ts`:
   - Add `voiceName` parameter to `generatePageAudio()` (default: `'Kore'`)
   - Pass to Gemini `prebuiltVoiceConfig.voiceName`
   - Pass to OpenAI fallback voice mapping (map Gemini voice to closest OpenAI voice)
3. **Verify**: TypeScript compiles, existing generation still uses "Kore" by default

### Task 14: Create regenerate-audio API endpoint
1. Create `app/api/v1/story/regenerate-audio/route.ts`:
   - `POST` handler
   - Auth required (same pattern as other story endpoints)
   - Request body schema: `{ bookId: string, pageNumber: number, voiceName: string }`
   - Deduct credits: `CREDIT_COSTS.generate / 10 * 5` (5x per-page cost)
   - Fetch book from DB, extract page text + dialogue
   - Call `generatePageAudio()` with specified `voiceName`
   - Update book JSONB in Supabase: set `pages[n].audioUrl` and `pages[n].voiceName`
   - Return `{ audioUrl: string }`
2. Add credit cost constant to `types.ts`: `regenerateAudio: 25`
3. **Verify**: Endpoint accepts POST, deducts credits, returns new audioUrl

### Task 15: Wire voice selector in narration bar
1. In `book-viewer.tsx` narration bar:
   - Replace static voice name with `<select>` populated from `GEMINI_VOICES`
   - Show current page's `voiceName` as selected (default "Kore")
   - On change:
     a. Show confirmation dialog: "Switching voice will regenerate audio for this page (costs 25 credits). Continue?"
     b. On confirm → call `POST /api/v1/story/regenerate-audio`
     c. Show loading state on voice selector
     d. On success → update page `audioUrl` and `voiceName` in book state, play new audio
     e. On error → show error message, revert selector
2. Add `onRegenerateAudio` callback prop to `BookViewer` (or handle internally with fetch)
3. **Verify**: Voice selector lists all voices, switching triggers confirmation, new audio plays after regeneration
