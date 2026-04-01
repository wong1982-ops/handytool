# Story Video — Character Consistency + Full-Story Generation

**Date:** 2026-04-02
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Summary

Fix character inconsistency in Story Video by adding a Character Lock step (Step 0) that ensures every character has a portrait + detailed appearance prompt before video generation. Then try generating the full story as one video; fall back to scene-by-scene with character references properly injected.

### Problem
- Characters look different between scenes
- Character portraits are fetched but NOT actually injected into the Veo video prompt
- No consistent text description of character appearance across scenes

### Solution
1. **Step 0 (Character Lock):** Generate missing portraits via Imagen 4.0, build a "character bible" with portrait URL + detailed appearance text for every character
2. **Step 2 (Video):** Try full-story generation first (Tier A), fall back to scene-by-scene with character bible injected (Tier B)

---

## Character Lock (Step 0)

Runs before screenplay generation. Ensures every character has:
- `portraitUrl` — guaranteed image reference
- `appearancePrompt` — detailed text description of appearance

### Flow
```
For each character:
  IF portraitUrl exists:
    → Use Gemini to generate detailed appearance description from portrait
    → Store as characterBible entry
  ELSE:
    → Generate portrait via Imagen 4.0 from name + description + art style
    → Upload to storage
    → Use Gemini to describe the generated portrait
    → Store both URL + description
```

### Character Bible Type
```typescript
interface CharacterBible {
  characters: CharacterRef[]
}

interface CharacterRef {
  name: string
  portraitUrl: string          // guaranteed after Step 0
  appearancePrompt: string     // detailed: "5-year-old girl, brown curly hair..."
  role: string
}
```

### Portrait Generation (Imagen 4.0)
- Prompt: "{name} is {description}. {role}. Full character portrait, {artStyle} style, centered, white background, detailed features."
- Size: 1024x1024, square
- Upload to R2/Supabase Storage

### Appearance Description (Gemini)
- Input: portrait image + existing character description
- Prompt: "Describe this character's physical appearance in detail for use as a video generation reference. Include: hair color/style, eye color, skin tone, clothing, build, age appearance, any distinguishing features."
- Output: 2-3 sentence detailed appearance text

---

## Video Generation (Step 2 — Reworked)

### Tier A: Full-Story Generation

Single mega-prompt to Veo 3.1:
```
CHARACTER BIBLE:
- {name}: {appearancePrompt} [portrait image attached]
- ...

ART STYLE: {artStyle}

STORY SEQUENCE:
Scene 1: {description} ({duration}s)
Scene 2: {description} ({duration}s)
...

Generate a continuous video with smooth transitions.
Total duration: ~{totalDuration} seconds.
```

- Attach all character portrait images as references
- If Veo returns a video → use it, skip scene-by-scene
- If Veo errors or returns too-short → fall to Tier B

### Tier B: Scene-by-Scene with Character Bible

Same as current but FIXED — every scene prompt includes:
```
MAINTAIN EXACT CHARACTER APPEARANCE:
- {name}: {appearancePrompt}
[portrait images attached]

ART STYLE: {artStyle}

SCENE: {description}
CAMERA: {cameraDirection}
MOOD: {mood}
CHARACTERS PRESENT: {characters.join(', ')}
```

Critical fix: **actually pass portrait images to the Veo API call** (currently fetched but not injected in gemini.ts lines 147-177).

### Tracking
```typescript
videoStrategy: 'full-story' | 'scene-by-scene'
fullStoryAttempted: boolean
fullStoryFailed: boolean
fullStoryError?: string
```

---

## Pipeline (8 Steps)

```
Step 0: Character Lock (NEW)
  → Generate missing portraits (Imagen 4.0)
  → Build character bible (portrait + appearance text)

Step 1: Screenplay (unchanged, but receives character bible context)

Step 2: Video Generation (REWORKED)
  → Tier A: Full-story single generation
  → Tier B: Scene-by-scene with character bible

Step 3: Voice Generation (unchanged)
Step 4: Narration (unchanged)
Step 5: SFX (unchanged)
Step 6: Music (unchanged)
Step 7: Assembly (unchanged)
```

---

## Code Changes

### Modified Files (4)

**tools/story-video/types.ts**
- Add `CharacterBible`, `CharacterRef` interfaces
- Add `videoStrategy`, `fullStoryAttempted`, `characterBible` to job type

**tools/story-video/providers/gemini.ts**
- Fix `generateScene()`: inject character portraits + appearance text into prompt
- Add `generateFullStoryVideo()`: Tier A full-story generation
- Add `generateCharacterPortrait()`: Imagen 4.0 call
- Add `describeCharacterAppearance()`: Gemini vision call

**app/api/cron/story-video-worker/route.ts**
- Add Step 0 (Character Lock) before Step 1
- Rework Step 2: try full-story, fallback to scene-by-scene
- Pass character bible through pipeline

**tools/story-video/screenplay-generator.ts**
- Include character bible in screenplay context

### Unchanged
- Steps 3-7 (voices, narration, sfx, music, assembly)
- UI components (progress polling works as-is)
- Database schema (uses existing JSONB fields)

### New Functions
```typescript
// gemini.ts
generateCharacterPortrait(name, description, artStyle): Promise<string>
describeCharacterAppearance(portraitUrl, description): Promise<string>
generateFullStoryVideo(screenplay, characterBible, artStyle): Promise<{url, duration} | null>

// Updated
generateScene(scene, characterBible, artStyle, stylePrefix): Promise<{url, duration}>
```

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Hybrid: full-story first, scene fallback | One approach only | Safe fallback |
| 2 | Portrait image + text description | Text only, image only | Best consistency |
| 3 | Imagen 4.0 for missing portraits | Nano Banana, Gemini | Highest quality |
| 4 | Character Lock as Step 0 | Inline during gen | Clean, reusable |
| 5 | Poll-based progress, no timeout | Email, fixed timeout | Existing UI works |
| 6 | Character bible in job JSONB | Separate table | Simple, no migration |
| 7 | Gemini describes existing portraits | Manual text | Consistent prompts |
| 8 | Art style in appearance prompt | Separate field | Visual alignment |
