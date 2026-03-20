# AI Business Card Generator — Design Document

**Date:** 2026-03-20
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** AI-powered business card generator within ECard Studio — dynamic form with progressive disclosure collects business info, optional logo upload triggers brand analysis, AI generates 3 card design images via Imagen, user picks one and refines via chat
- **Why:** Replace manual template picking with an intelligent flow where AI creates a personalized card from business information and logo
- **Who:** Professionals, freelancers, small businesses needing quick business cards
- **Key constraints:** Imagen 3 for image generation, Gemini 2.5 Flash for brand analysis and prompt rewriting, chat-based refinement (1 credit per round), max 10 refinements per session
- **Non-goals:** Not replacing existing template-based flow, no print-ready output with bleed marks (MVP), no address book/contact management

## Assumptions

- Imagen 3 via Vertex AI already set up (used by Story Studio)
- Gemini 2.5 Flash for brand analysis and prompt rewriting
- Progressive disclosure uses client-side rules (no AI cost for field suggestions)
- 3 designs generated in parallel (1 credit total)
- Logo color extraction done client-side via Canvas API
- Generated images stored temporarily (R2 or data URLs)
- Max 10 refinement rounds per session
- State not persisted across page refreshes (MVP)

---

## Route & Entry Point

**Route:** `/tools/ecard-studio/ai-business-card`

**Entry point:** "Create with AI" button on ECard Studio page, alongside existing template picker.

---

## Wizard Steps

```
Step 1: Business Info    →  Dynamic form (progressive disclosure)
Step 2: Logo & Brand     →  Logo upload + AI brand analysis
Step 3: Generate         →  AI creates 3 card images (loading state)
Step 4: Pick & Refine    →  Select a design + chat refinement
Step 5: Download         →  Final card preview + download PNG
```

---

## State Model

```typescript
interface BusinessInfo {
  name: string           // required
  title: string          // required
  company: string        // required
  phone?: string
  email?: string
  website?: string
  address?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  tagline?: string
  industry?: string
}

interface BrandAnalysis {
  suggestedColors: { primary: string; secondary: string; accent: string }
  suggestedStyle: 'classic' | 'modern' | 'bold' | 'minimal' | 'creative' | 'elegant'
  suggestedTagline: string | null
  suggestedFonts: { heading: string; body: string }
  brandPersonality: string
}

interface GeneratedDesign {
  imageUrl: string
  style: string
  prompt: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5
  businessInfo: BusinessInfo
  logoDataUrl: string | null
  brandAnalysis: BrandAnalysis | null
  designs: GeneratedDesign[]
  selectedIndex: number | null
  chatHistory: ChatMessage[]
  currentDesign: GeneratedDesign | null
  refinementCount: number
}
```

---

## Step 1: Dynamic Form (Progressive Disclosure)

**Always visible:** Name, Title, Company (all required)

**Revealed after initial 3 are filled:** Phone, Email, Website (always shown)

**Context-based fields (client-side rules based on title keywords):**
- Tech roles → website, linkedin
- Sales/marketing → phone, linkedin, twitter
- Creative roles → instagram, website
- Default → phone, email, website, linkedin

**"Add more fields" button** at bottom for manual field addition.

Optional: tagline (free text), industry dropdown.

---

## Step 2: Logo Upload & Brand Analysis

**Logo upload:** Drag & drop, PNG/JPG/SVG/WebP, max 5MB. Optional — "Skip" button.

**Brand analysis API:** `POST /api/v1/ecard/analyze-brand`
- Client-side: Canvas API extracts dominant colors from logo
- Server-side: Gemini analyzes colors + business info → returns BrandAnalysis
- Free (bundled with generation credit cost)

**UI:** Brand Profile card showing color swatches, style badge, suggested tagline (editable), personality tag. User can accept or tweak.

**No logo:** AI infers style from business info alone in Step 3.

---

## Step 3: AI Image Generation

**API:** `POST /api/v1/ecard/generate-cards`

**3 parallel Imagen generations** with varied prompts:
1. Design A — matches suggested style
2. Design B — contrasting alternative
3. Design C — bold/creative wildcard

**Prompt template:**
```
Professional business card design, {style} style.
Name: {name}, Title: {title}, Company: {company}
Colors: primary {primary}, secondary {secondary}, accent {accent}
{contact details}
{logo if provided}
High quality, clean typography, 3.5x2 inch ratio
```

**Cost:** 1 credit for all 3 designs.

**Loading:** 3 skeleton cards, each appears as it completes.

---

## Step 4: Pick & Refine

**Pick:** 3 cards displayed large, click to select, "Pick this one" confirms.

**Refinement (chat-based):**
- Selected card shown large at top (updates after each round)
- Chat input below with quick suggestion pills: "Darker colors", "Lighter colors", "More modern", "More classic", "Bigger text", "Add border"
- Each refinement: Gemini rewrites prompt + Imagen regenerates
- History row of previous versions (click to revert)
- **1 credit per refinement, max 10 per session**

**API:** `POST /api/v1/ecard/refine-card`

---

## Step 5: Download

- Final card at full size
- Download as PNG (1050x600, 3.5:2 ratio)
- "Start over" and "Make another" buttons

---

## API Routes

| Route | Method | Purpose | Cost |
|---|---|---|---|
| `/api/v1/ecard/analyze-brand` | POST | Logo brand analysis via Gemini | Free |
| `/api/v1/ecard/generate-cards` | POST | Generate 3 card images via Imagen | 1 credit |
| `/api/v1/ecard/refine-card` | POST | Refine selected card via chat | 1 credit |

---

## Components

| File | Responsibility |
|---|---|
| `app/tools/ecard-studio/ai-business-card/page.tsx` | Page route, wizard state management |
| `tools/ecard-studio/ai-card/business-info-form.tsx` | Step 1: progressive disclosure form |
| `tools/ecard-studio/ai-card/logo-upload.tsx` | Step 2: logo drag & drop + brand analysis display |
| `tools/ecard-studio/ai-card/card-gallery.tsx` | Step 3-4: 3 design thumbnails + selection |
| `tools/ecard-studio/ai-card/refinement-chat.tsx` | Step 4: chat input + history + quick pills |
| `tools/ecard-studio/ai-card/download-panel.tsx` | Step 5: final preview + download buttons |

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Logo >5MB | Reject with error |
| Non-image logo | Reject with error |
| All 3 generations fail | Error + retry, no credit charged |
| 1-2 of 3 fail | Show successful ones + note |
| Refinement fails | Keep current design, show error, don't count toward limit |
| Not signed in | Auth gate on page |
| Insufficient credits | Show message at generation/refinement step |
| Empty required fields | Client-side validation |
| Long text in fields | Max lengths (name/title/company: 100, tagline: 200) |
| Page refresh | State lost, start over (MVP) |
| 10 refinement limit | Disable chat, show "Download or start over" |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | Progressive disclosure form (client-side rules) | Static form; AI-driven | Simple, instant, no API cost |
| 2 | Full brand analysis from logo | Colors only; Just place logo | Maximum value from upload |
| 3 | AI-generated images via Imagen | Existing renderer; Config + image | More creative, not template-limited |
| 4 | 3 design variations | 1 design; 4 designs | Good choice balance |
| 5 | Chat-based refinement | Direct editing; Both | Simpler UX, natural language |
| 6 | 1 credit/generation + 1/refinement | Flat fee; Free | Fair pay-per-use |
| 7 | Wizard flow (5 steps) | Single page; Conversational | Clean mobile UX |
| 8 | Brand analysis free (bundled) | Separate cost | Encourages logo upload |
| 9 | Max 10 refinements | Unlimited; 3 | Generous, prevents abuse |
| 10 | New route within ECard Studio | Separate tool | Keeps business cards consolidated |
