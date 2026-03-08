# Character Visual Consistency for Story Studio

**Date**: 2026-03-08
**Status**: Approved

## Understanding Summary

- **What**: Improve character visual consistency across all page illustrations
- **Why**: Characters look different on every page — breaks immersion
- **How**: (1) Generate a character reference image first, pass it to all pages via Gemini's reference image feature (2) Restructure prompts with character descriptions leading
- **Model change**: Switch from `imagen-3.0-generate-002` to `gemini-3.1-flash-image-preview`
- **Fallback**: If reference generation fails, proceed with prompt-only approach
- **Non-goal**: User-uploadable character images

## Design

### 1. Character Reference Image Generation

New function `generateCharacterReference(characters, style)` in `lib/story/illustrate.ts`:
- Generates a single image showing all main characters side by side
- Prompt: `"{style} style character reference sheet showing all main characters side by side, full body, clear distinct appearances, white background, no text. Characters: {detailed descriptions}"`
- Uses `gemini-3.1-flash-image-preview`
- Returns `Buffer | null` (null on failure = graceful degradation)
- Buffer kept in memory, not uploaded

### 2. Prompt Restructuring

Update `buildPrompt()` to put characters first:
```
CHARACTERS (maintain exact appearances throughout):
- Bear: brown fur, round ears, blue knitted scarf, green eyes, small and chubby
- Fox: orange-red fur, bushy tail, yellow vest, sharp amber eyes, slender

SCENE: {style} style. {scene description}...

IMPORTANT: Do not include any text, words, or writing in the image. Illustration only.
```

### 3. Model Switch & Reference Image Passing

Switch from `imagen-3.0-generate-002` to `gemini-3.1-flash-image-preview`.

Updated `IllustrateInput`:
```typescript
interface IllustrateInput {
  imagePrompt: string
  characters?: { name: string; description: string }[]
  referenceImage?: Buffer  // character reference sheet
}
```

Reference image passed in Gemini's `contents` array as `inlineData` alongside text prompt.

Fallback chain: Gemini 3.1 Flash Image → fal.ai → DALL-E (fallbacks don't receive reference image).

### 4. Generation Pipeline Integration

In `app/api/v1/story/generate/route.ts`, Step 2:
1. Generate character reference sheet before illustrations
2. Pass `referenceImage` buffer to every `generateIllustration()` call (cover + pages)
3. If reference is null, proceed without — improved prompts still help

### Files to Modify

| File | Change |
|------|--------|
| `lib/story/illustrate.ts` | Add `generateCharacterReference()`, update `buildPrompt()`, switch model, accept/pass `referenceImage` |
| `app/api/v1/story/generate/route.ts` | Call `generateCharacterReference()` before illustrations, pass to all illustration calls |

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|----------|-------------|-----------|
| 1 | Single reference sheet + structured prompts | Prompt-only; multi-reference per character | Best quality/overhead balance |
| 2 | Switch to `gemini-3.1-flash-image-preview` | Keep Imagen 3.0 | Imagen doesn't support reference input |
| 3 | Character descriptions lead the prompt | Appended at end | Stronger signal for model |
| 4 | Reference kept in memory (Buffer) | Upload to storage | Only needed during generation |
| 5 | Graceful fallback if reference fails | Abort | Reference is enhancement, not requirement |
| 6 | Fallback providers skip reference | Convert for fal/DALL-E | Different APIs — acceptable degradation |
