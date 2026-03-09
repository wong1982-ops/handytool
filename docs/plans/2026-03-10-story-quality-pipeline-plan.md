# Story Quality Pipeline — Implementation Plan

**Date**: 2026-03-10
**Design**: [2026-03-10-story-quality-pipeline-design.md](2026-03-10-story-quality-pipeline-design.md)

---

## Implementation Steps

### Step 1: Update credit costs
- `lib/story/validation.ts` — change `CREDIT_COSTS.generate` from 50 to 65
- `app/api/v1/credits/balance/route.ts` — change `WELCOME_CREDITS` from 50 to 65

### Step 2: Add `generateStoryBible` to `lib/story/enrich.ts`
- Define `StoryBible` TypeScript interface
- New function with Gemini 2.5 Flash, `responseMimeType: 'application/json'`, typed `responseSchema`
- System instruction: world-building specialist role
- Input: concept + plot + optional series context
- Output: StoryBible JSON

### Step 3: Refactor `generateStoryText` → `generateStoryDraft`
- Rename function
- Add `storyBible` parameter
- Inject Story Bible into system instruction as grounding context
- Add rule: copy `physicalDescription` verbatim into image prompts
- Keep existing `responseSchema`

### Step 4: Add `validateAndFix` to `lib/story/enrich.ts`
- Define `ValidationResult` TypeScript interface
- New function with "Senior Narrative Editor" role
- Input: Story Bible + draft JSON
- Output: `ValidationResult` with status + issues array
- Apply fixes: patch draft pages from issues array, return validated draft

### Step 5: Update `app/api/v1/story/generate/route.ts`
- Replace single `generateStoryText` call with 3-step pipeline
- Add SSE status messages for each step
- Pass validated draft to illustration pipeline (rest unchanged)

### Step 6: Test & verify
- Generate a standalone book — verify pipeline completes
- Generate a series book — verify series context flows through
- Check latency stays within budget (~60s extra)
