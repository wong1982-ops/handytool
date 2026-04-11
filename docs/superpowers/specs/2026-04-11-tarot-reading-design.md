# Tarot Card Reading Tool — Design Spec

**Date**: 2026-04-11
**Status**: APPROVED (brainstorming complete)
**Reference**: https://p.taluo.com/

---

## Understanding Summary

- **What**: A bilingual (EN + ZH) AI-powered tarot card reading tool for Toolk1t
- **Why**: Fun, engaging divination tool that leverages Gemini AI for personalized card interpretations and trend analysis
- **Who**: General public — casual users exploring tarot, no expertise required
- **Key features**:
  - 20+ spread types from launch, organized by category + AI-recommended spreads
  - Hybrid card art: pre-generated 78-card base deck (Gemini Imagen) + personalized premium art
  - Shuffle animation → card-by-card interpretation → holistic narrative
  - Optional login to save reading history with AI-generated trend insights across readings
  - Under 5 seconds response time, streamed interpretation
- **Constraints**: Medium scale (hundreds of daily users), Gemini API cost-awareness, partial offline support
- **Non-goals**: Not a social/community platform, not a paid subscription service (yet), not a tarot education course

---

## Assumptions

1. Gemini Imagen is available and suitable for generating consistent tarot card art
2. A standard 78-card deck (22 Major + 56 Minor Arcana) is the basis
3. Reversed cards (upside-down) are included in readings for traditional depth
4. Credit system follows existing Toolk1t pattern (AI actions cost credits)
5. Pre-generated deck art is stored as static assets in the client repo
6. Reading history is stored in Supabase (like Resume Builder)

---

## Architecture

### UX Pattern: Wizard + Reading Theater

**Wizard Phase** (3 steps — reuses existing Toolk1t wizard pattern):

1. **Question Step** — user types their question or picks a life area category (Love, Career, Finance, Growth, General). If they type a question, Gemini suggests the best spread.
2. **Spread Step** — grid of available spreads (filtered by category or AI-recommended). Each tile shows: spread name, card count, brief description, thumbnail of layout shape.
3. **Reading Step (Theater)** — immersive full-screen experience.

### Theater Experience

**Stage 1 — Shuffle** (2-3 seconds)
- Dark backdrop, deck of cards center-screen
- CSS animation: cards riffle/shuffle
- Subtle ambient glow/particle effects

**Stage 2 — Deal** (1-2 seconds)
- Cards fly from deck to spread positions (face-down)
- Positions match spread's x/y layout coordinates
- Staggered animation (200ms between cards)

**Stage 3 — Reveal + Interpret** (streamed)
- Cards auto-flip one by one (0.5s flip animation)
- Each card's interpretation streams into side panel (desktop) or bottom sheet (mobile)
- Reversed cards shown upside-down with visual indicator
- Active card glows, others dim

**Stage 4 — Narrative**
- Holistic narrative fades in after all cards revealed
- "Save Reading" button (prompts login if anonymous)
- "New Reading" button to restart

### Mobile Layout
- Theater goes full-screen portrait
- Cards scale down, spread adapts to vertical space
- Interpretation as swipeable bottom drawer
- Horizontal scroll for wide spreads

---

## Data Model

### TarotCard

```typescript
interface TarotCard {
  id: number                    // 0-77
  name: { en: string; zh: string }
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  number?: number               // 1(Ace)–14(King)
  imageUrl: string              // pre-generated base art
  meanings: {
    upright: { en: string; zh: string }
    reversed: { en: string; zh: string }
  }
  keywords: { en: string[]; zh: string[] }
}
```

### TarotSpread

```typescript
interface TarotSpread {
  id: string                    // e.g. 'celtic-cross'
  name: { en: string; zh: string }
  description: { en: string; zh: string }
  category: 'love' | 'career' | 'finance' | 'growth' | 'general'
  cardCount: number
  positions: {
    label: { en: string; zh: string }
    x: number                   // layout coordinate (%)
    y: number
    rotation?: number           // degrees
  }[]
  thumbnail: string
}
```

### Spread Categories (20+)

| Category | Example Spreads |
|---|---|
| General | Three-Card, Celtic Cross, Five-Card Cross, Star Spread |
| Love | Lovers Triangle, Venus Spread, Relationship Mirror, Twin Flame |
| Career | Career Path, Decision Fork, Success Ladder, Work-Life Balance |
| Finance | Wealth Tree, Money Flow, Investment Compass |
| Growth | Chakra Spread, Shadow Self, Year Ahead, Moon Phases |

### Supabase Schema

```sql
-- readings table
id              uuid PRIMARY KEY
user_id         uuid REFERENCES auth.users
spread_id       text NOT NULL
question        text
language        text DEFAULT 'en'
cards           jsonb NOT NULL        -- [{cardId, position, reversed, customArtUrl?}]
interpretation  jsonb NOT NULL        -- {cards: [...], narrative: "..."}
created_at      timestamptz DEFAULT now()

-- RLS: users can only read/write their own readings
```

---

## API Routes

```
POST /api/v1/tarot/recommend-spread    → AI spread suggestion from question
POST /api/v1/tarot/reading             → main card interpretation (streamed)
POST /api/v1/tarot/trends              → cross-reading pattern analysis
POST /api/v1/tarot/generate-card-art   → premium Imagen personalized card
```

### Reading Route (core)

1. Client sends: `{ spreadId, question, cards: [{ cardId, position, reversed }], language }`
2. Cards drawn client-side (random selection + random upright/reversed)
3. Gemini prompt: spread context, card names, positions, orientations, question, language
4. Response streamed — card-by-card interpretations first, holistic narrative last
5. ~500 tokens input for 10-card spread

### Recommend-Spread Route

Lightweight call — question in, spread ID + reasoning out. <2s response.

### Trends Route (logged-in, min 5 readings)

Takes last N readings, sends card frequency + themes to Gemini, returns 3-5 bullet insights + narrative. Cached per user, refreshed on new readings.

### Generate-Card-Art Route

Gemini Imagen call with card identity + reading context. ~5-10s. Max 3 per reading. Stored in Supabase Storage (`tarot-custom-art/`).

### Cost Controls

- Rate limit: 10 readings/hour anonymous, 30/hour logged-in
- Cache identical spread+cards combos
- Prompt kept concise (~500 tokens input)

---

## Premium Card Art

- "Generate Unique Art" button on revealed cards
- 2 credits per card (vs 1 credit per reading)
- Max 3 custom cards per reading
- Logged-in users only
- Art style prompt includes consistency instructions matching base deck
- Custom art URL stored in reading's cards jsonb
- Cleaned up on reading deletion (cascade)

---

## Offline Support

- **Works offline**: Spread definitions, base card deck (images + data), wizard UI, shuffle/deal/flip animations
- **Requires online**: AI interpretation, spread recommendation, trend analysis, custom card art
- **Graceful degradation**: Cards drawn and revealed, interpretation shows "Connect to the internet for your AI reading"

---

## i18n

```
tools/tarot/i18n/
  en.ts     → English strings
  zh.ts     → Chinese strings
```

- All UI text, card names, spread names, position labels are bilingual
- Language toggle in wizard header
- Gemini generates interpretation in selected language
- User's question accepted in any language

---

## Reading History & Trends

### History (logged-in)

- List sorted by date (newest first)
- Each entry: date, spread type, question, miniature card layout
- Filter by category, date range
- Click to replay full reading (no re-generation)

### Trends

- "Analyze My Trends" button — requires 5+ saved readings
- Gemini analyzes: frequent cards, recurring themes, shifts over time
- Output: 3-5 bullet insights + narrative paragraph
- Cached per user, refreshed when new readings added

---

## File Structure

```
tools/tarot/
  tarot-types.ts                → TypeScript interfaces
  tarot-cards.ts                → 78 card definitions (static data)
  tarot-spreads.ts              → 20+ spread definitions (static data)
  tarot-wizard.tsx              → wizard container
  question-step.tsx             → step 1: question + categories
  spread-step.tsx               → step 2: spread selection grid
  spread-card.tsx               → spread preview tile
  reading-theater.tsx           → step 3: immersive reading
  card-flip.tsx                 → single card with flip animation
  shuffle-animation.tsx         → deck shuffle effect
  interpretation-panel.tsx      → streamed AI text panel
  history-tab.tsx               → saved readings list
  history-card.tsx              → reading summary tile
  reading-detail.tsx            → replay saved reading
  trends-panel.tsx              → AI trend insights
  i18n/en.ts                    → English strings
  i18n/zh.ts                    → Chinese strings

app/tools/tarot/page.tsx        → route entry
app/tools/tarot/layout.tsx      → SEO metadata + JSON-LD

app/api/v1/tarot/
  recommend-spread/route.ts     → AI spread suggestion
  reading/route.ts              → main interpretation (streamed)
  trends/route.ts               → cross-reading analysis
  generate-card-art/route.ts    → premium Imagen card
```

---

## Decision Log

| # | Decision | Alternatives Considered | Why Chosen |
|---|---|---|---|
| 1 | Bilingual (EN + ZH) | EN-only, ZH-only | Matches existing i18n pattern, broadest audience |
| 2 | 20+ spreads at launch | 1-2 minimal, 5-8 medium | Full feature parity with reference site |
| 3 | Hybrid card art | All static, all on-the-fly | Fast base experience + premium differentiator |
| 4 | Card-by-card + holistic narrative | Card-only, narrative-only, conversational | Most comprehensive, matches traditional tarot |
| 5 | Shuffle animation + auto-deal | Click-to-reveal, drag-to-draw, instant | Ritual feel without complexity, mobile-friendly |
| 6 | Open with optional login | Fully open, freemium, login-required | Low friction entry, login for history/trends |
| 7 | Trends with AI insights | Simple list, journal notes | Unique differentiator — AI pattern recognition |
| 8 | Category browse + AI recommendation | Category-only, AI-only | Browse for confident users, guided for unsure |
| 9 | Wizard + Reading Theater | Single-page studio, conversational | Reuses wizard pattern, enables immersive UX |
| 10 | Streamed interpretation | Wait-for-full | Meets <5s target, feels alive |
| 11 | Client-side card drawing | Server-side randomness | Simpler, faster, no round-trip |
| 12 | Reversed cards included | Upright-only | Traditional depth, richer readings |
| 13 | Partial offline | Online-only | Base deck/UI offline, graceful degradation |
