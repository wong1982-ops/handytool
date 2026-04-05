# NZ Visa Pathway Finder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free NZ immigration visa pathway finder with quiz, pathway matching, SMC points calculator, Green List search, document checklists, and fee estimates.

**Architecture:** Single-page tool using ToolFrame. All logic client-side — quiz answers fed into rule-based matcher, results displayed as expandable cards. No database, no AI, no sign-in required. Data files contain Green List occupations, document checklists, and fee schedules.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, ToolFrame.

**Spec:** `docs/superpowers/specs/2026-04-06-visa-pathway.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/visa-pathway/types.ts` | Types for quiz, pathways, points, Green List |
| `tools/visa-pathway/quiz-data.ts` | 6 questions with options |
| `tools/visa-pathway/green-list.ts` | ~100 Green List occupations (Tier 1 + 2) |
| `tools/visa-pathway/document-checklists.ts` | Per-visa document requirements |
| `tools/visa-pathway/fees-data.ts` | Fees and processing times per visa |
| `tools/visa-pathway/pathway-matcher.ts` | Match logic, points calc, requirements |
| `tools/visa-pathway/visa-pathway.tsx` | Main component (quiz → results) |
| `tools/visa-pathway/pathway-card.tsx` | Expandable pathway result card |
| `tools/visa-pathway/points-calculator.tsx` | SMC points breakdown display |
| `tools/visa-pathway/green-list-search.tsx` | Searchable occupation list |
| `app/tools/visa-pathway/page.tsx` | Route page |

### Modified Files
| File | Changes |
|---|---|
| `lib/tools.tsx` | Add Visa Pathway entry |
| `components/home/bento-showcase.tsx` | Add preview card |
| `components/layout/tool-categories.ts` | Add 'visa-pathway': 'utility' |

---

## Task 1: Types + All Data Files

**Files:**
- Create: `tools/visa-pathway/types.ts`
- Create: `tools/visa-pathway/quiz-data.ts`
- Create: `tools/visa-pathway/green-list.ts`
- Create: `tools/visa-pathway/document-checklists.ts`
- Create: `tools/visa-pathway/fees-data.ts`

- [ ] **Step 1: Create types.ts**

Types for quiz answers, pathway matching, points calculation, Green List, documents, fees.

```typescript
export interface QuizOption { label: string; value: string }
export interface QuizQuestion { id: string; question: string; options: QuizOption[] }
export type QuizAnswers = Record<string, string>

export type PathwayId = 'smc' | 'aewv' | 'green-list-1' | 'green-list-2' | 'post-study' | 'student' | 'partner' | 'parent'
export type MatchLevel = 'strong' | 'possible' | 'unlikely'

export interface PathwayMatch {
  id: PathwayId
  name: string
  description: string
  matchLevel: MatchLevel
  requirements: RequirementCheck[]
  fee: FeeInfo
}

export interface RequirementCheck {
  label: string
  status: 'met' | 'not-met' | 'unknown'
}

export interface PointsBreakdown {
  age: number
  qualifications: number
  experience: number
  jobOffer: number
  greenListBonus: number
  partnerBonus: number
  nzStudyBonus: number
  total: number
}

export interface GreenListOccupation {
  title: string
  anzsco: string
  tier: 1 | 2
}

export interface DocumentItem {
  name: string
  note?: string
  required: boolean
}

export interface FeeInfo {
  applicationFee: number
  immigrationLevy: number
  total: number
  processingTime: string
}
```

- [ ] **Step 2: Create quiz-data.ts**

6 questions as specified in the spec.

- [ ] **Step 3: Create green-list.ts**

Export `GREEN_LIST: GreenListOccupation[]` — approximately 80-100 occupations across both tiers. Include major ones: software engineer, registered nurse, electrician, construction project manager, chef, teacher, doctor, etc. Each with ANZSCO code and tier.

Research-based Green List data — include the most common Tier 1 (straight to residence) and Tier 2 (work to residence) occupations from Immigration NZ's published Green List.

- [ ] **Step 4: Create document-checklists.ts**

Export `DOCUMENT_CHECKLISTS: Record<PathwayId, { required: DocumentItem[]; ifApplicable: DocumentItem[] }>`. Common documents (passport, police cert, medical, photos) plus visa-specific ones.

- [ ] **Step 5: Create fees-data.ts**

Export `FEES: Record<PathwayId, FeeInfo>` with NZD amounts and processing time estimates from Immigration NZ.

- [ ] **Step 6: Commit**

```bash
git add tools/visa-pathway/
git commit -m "feat(visa-pathway): add types, quiz data, Green List, documents, and fees"
```

---

## Task 2: Pathway Matcher + Points Calculator Logic

**Files:**
- Create: `tools/visa-pathway/pathway-matcher.ts`

- [ ] **Step 1: Create pathway-matcher.ts**

Pure functions:

`matchPathways(answers: QuizAnswers): PathwayMatch[]` — evaluates all 8 pathways against answers, returns sorted by match level (strong first).

`calculatePoints(answers: QuizAnswers): PointsBreakdown` — SMC points calculation from age, qualifications, experience, job offer.

`checkRequirements(pathwayId: PathwayId, answers: QuizAnswers): RequirementCheck[]` — returns per-requirement met/not-met/unknown status.

Matching rules per pathway as specified in the spec. Points table as specified.

- [ ] **Step 2: Commit**

```bash
git add tools/visa-pathway/pathway-matcher.ts
git commit -m "feat(visa-pathway): add pathway matching and points calculation logic"
```

---

## Task 3: UI Components

**Files:**
- Create: `tools/visa-pathway/pathway-card.tsx`
- Create: `tools/visa-pathway/points-calculator.tsx`
- Create: `tools/visa-pathway/green-list-search.tsx`

- [ ] **Step 1: Create pathway-card.tsx**

'use client'. Expandable card showing pathway match result with 5 detail sections (requirements, points, Green List, documents, fees).

Props: `pathway: PathwayMatch`, `answers: QuizAnswers`, `pointsBreakdown: PointsBreakdown | null`

Border-left color by match level. Expand/collapse toggle. 5 inner accordion sections. Green List search embedded. Document checklist with cosmetic checkboxes. Fees table.

- [ ] **Step 2: Create points-calculator.tsx**

'use client'. SMC points breakdown table.

Props: `breakdown: PointsBreakdown`

Table with category, your score, max columns. Total row. Pass/fail message.

- [ ] **Step 3: Create green-list-search.tsx**

'use client'. Searchable occupation list.

Props: none (uses GREEN_LIST data directly)

Search input filters by title or ANZSCO code. Shows matching occupations with tier badge. "Not on Green List" message if no match.

- [ ] **Step 4: Commit**

```bash
git add tools/visa-pathway/pathway-card.tsx tools/visa-pathway/points-calculator.tsx tools/visa-pathway/green-list-search.tsx
git commit -m "feat(visa-pathway): add pathway card, points calculator, and Green List search"
```

---

## Task 4: Main Component + Page Route

**Files:**
- Create: `tools/visa-pathway/visa-pathway.tsx`
- Create: `app/tools/visa-pathway/page.tsx`

- [ ] **Step 1: Create visa-pathway.tsx**

'use client' default export. Main component managing quiz → results flow.

State: `step: 'quiz' | 'results'`, `answers: QuizAnswers`, `pathways: PathwayMatch[]`, `pointsBreakdown: PointsBreakdown | null`

ToolFrame: toolName "Visa Pathway Finder", toolSlug "visa-pathway", globe icon, utility theme.

Quiz view: all 6 questions on one page with pill-button options. "Find My Pathways" gradient button.

Results view: header + match legend + pathway cards. "Edit Answers" link to go back. Disclaimer banner. Footer link to Immigration Advisers Authority.

- [ ] **Step 2: Create page.tsx**

```typescript
import type { Metadata } from 'next'
import VisaPathway from '@/tools/visa-pathway/visa-pathway'

export const metadata: Metadata = {
  title: 'NZ Visa Pathway Finder — Immigration Guide | Toolk1t',
  description: 'Free NZ immigration tool. Find which visa you qualify for, calculate SMC points, check the Green List, and get document checklists.',
}

export default function VisaPathwayPage() {
  return <VisaPathway />
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/visa-pathway/visa-pathway.tsx app/tools/visa-pathway/
git commit -m "feat(visa-pathway): add main component and page route"
```

---

## Task 5: Tool Registry + Build + E2E Test

**Files:**
- Modify: `lib/tools.tsx`, `components/home/bento-showcase.tsx`, `components/layout/tool-categories.ts`

- [ ] **Step 1: Add to registries**

tools.tsx: "Visa Pathway Finder", href "/tools/visa-pathway", globe SVG icon, "from-indigo-500 to-blue-500".
tool-categories.ts: `'visa-pathway': 'utility'`
bento-showcase.tsx: preview card with globe/passport mockup.

- [ ] **Step 2: Build check**

```bash
pnpm build
```

- [ ] **Step 3: E2E screenshot**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/tools/visa-pathway', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/visa-pathway.png')
    browser.close()
"
```

- [ ] **Step 4: Fix issues, commit**

```bash
git add -A && git commit -m "feat(visa-pathway): add to registry, build verification, e2e test"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types + all data files (5 files) | None | Medium (lots of data) |
| 2 | Pathway matcher + points logic | Task 1 | Medium |
| 3 | UI components (card, points, Green List) | Tasks 1, 2 | Medium |
| 4 | Main component + page route | Tasks 1-3 | Medium |
| 5 | Registry + build + e2e | Task 4 | Simple |

Sequential: 1 → 2 → 3 → 4 → 5. Tasks 1-2 can be batched. Tasks 3-4 can be batched.
