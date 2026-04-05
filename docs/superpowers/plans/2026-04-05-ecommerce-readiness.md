# E-commerce Readiness Calculator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a quiz-based e-commerce readiness assessment for NZ small businesses — scoring, platform recommendation, NZD cost estimate, personalized roadmap, and PDF export.

**Architecture:** Wizard-style tool using ToolFrame. All logic is client-side (scoring, recommendation, cost calculation) — no AI needed. Questions/answers defined in data files. Results computed from answers. Roadmap generated from gaps. Assessment saved to Supabase for authenticated users. PDF exported via jsPDF.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, jsPDF (already installed), ToolFrame, Supabase.

**Spec:** `docs/superpowers/specs/2026-04-05-ecommerce-readiness.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/ecommerce-readiness/types.ts` | Types for questions, answers, scores, results |
| `tools/ecommerce-readiness/questions.ts` | All 18 questions with answers and point values |
| `tools/ecommerce-readiness/scoring.ts` | Score calculation, platform recommendation, cost estimate |
| `tools/ecommerce-readiness/roadmap-data.ts` | Roadmap items per category gap |
| `tools/ecommerce-readiness/quiz-wizard.tsx` | Quiz step-through UI |
| `tools/ecommerce-readiness/results-view.tsx` | Score display + recommendation + cost table |
| `tools/ecommerce-readiness/roadmap-view.tsx` | Phased action plan with checkboxes |
| `tools/ecommerce-readiness/pdf-export.ts` | PDF report generation |
| `tools/ecommerce-readiness/ecommerce-readiness.tsx` | Main orchestrator (welcome → quiz → results → roadmap) |
| `app/tools/ecommerce-readiness/page.tsx` | Route page |
| `app/api/v1/ecommerce-readiness/save/route.ts` | Save assessment + roadmap progress |
| `supabase/migrations/041_ecommerce_assessments.sql` | Database table |

### Modified Files
| File | Changes |
|---|---|
| `lib/tools.tsx` | Add E-commerce Readiness entry |
| `components/home/bento-showcase.tsx` | Add preview card |
| `components/layout/tool-categories.ts` | Add 'ecommerce-readiness': 'utility' |

---

## Task 1: Types + Questions + Scoring Data

**Files:**
- Create: `tools/ecommerce-readiness/types.ts`
- Create: `tools/ecommerce-readiness/questions.ts`
- Create: `tools/ecommerce-readiness/scoring.ts`
- Create: `tools/ecommerce-readiness/roadmap-data.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// tools/ecommerce-readiness/types.ts

export interface AnswerOption {
  label: string
  score: number
  hint?: string
}

export interface Question {
  id: string
  category: CategoryId
  question: string
  hint?: string
  options: AnswerOption[]
}

export type CategoryId = 'business' | 'technical' | 'legal' | 'marketing'

export interface CategoryInfo {
  id: CategoryId
  label: string
  weight: number  // 0-1, all weights sum to 1
  icon: string    // emoji
}

export interface UserAnswers {
  [questionId: string]: number  // score for that question
}

export interface CategoryScore {
  id: CategoryId
  label: string
  score: number      // 0-100
  maxScore: number
  rawScore: number
}

export interface PlatformRecommendation {
  name: string
  tagline: string
  monthlyCost: number   // NZD
  processingFee: string // e.g. "2.9% + $0.30"
  pros: string[]
  cons: string[]
  whyFits: string
}

export interface CostEstimate {
  platform: string
  monthlyFee: number
  processingNote: string
  domainYearly: number
  firstYearTotal: number
}

export interface AssessmentResult {
  overallScore: number
  label: string
  categoryScores: CategoryScore[]
  primaryRecommendation: PlatformRecommendation
  secondaryRecommendation: PlatformRecommendation
  costEstimate: CostEstimate
}

export interface RoadmapItem {
  id: string
  phase: number
  phaseLabel: string
  phaseTimeline: string
  title: string
  description: string
  cost?: string
  time?: string
  categoryId: CategoryId
  triggerBelow: number  // show this item when category score is below this threshold
}

export type WizardStep = 'welcome' | 'quiz' | 'results' | 'roadmap'
```

- [ ] **Step 2: Create questions.ts**

All 18 questions organized by category. Each question has 3 answer options scoring 0, 5, or 10.

```typescript
// tools/ecommerce-readiness/questions.ts
import type { Question, CategoryInfo } from './types'

export const CATEGORIES: CategoryInfo[] = [
  { id: 'business', label: 'Business Readiness', weight: 0.30, icon: '🏪' },
  { id: 'technical', label: 'Technical Readiness', weight: 0.20, icon: '💻' },
  { id: 'legal', label: 'Legal & Compliance', weight: 0.25, icon: '⚖️' },
  { id: 'marketing', label: 'Marketing Readiness', weight: 0.25, icon: '📣' },
]

export const QUESTIONS: Question[] = [
  // Business (5)
  { id: 'b1', category: 'business', question: 'Do you have a defined product or service catalogue?', options: [
    { label: 'Yes, fully defined', score: 10, hint: 'Great foundation' },
    { label: 'Partially defined', score: 5, hint: 'Needs refinement' },
    { label: 'No', score: 0, hint: 'Important first step' },
  ]},
  { id: 'b2', category: 'business', question: 'Do you have professional product photos?', hint: 'Good photos significantly increase online sales', options: [
    { label: 'Yes, professional quality', score: 10 },
    { label: 'Yes, phone photos', score: 5 },
    { label: 'No photos yet', score: 0 },
  ]},
  { id: 'b3', category: 'business', question: 'Do you have a pricing strategy for online sales?', options: [
    { label: 'Yes, including shipping costs', score: 10 },
    { label: 'Yes, but no shipping plan yet', score: 5 },
    { label: 'No pricing strategy', score: 0 },
  ]},
  { id: 'b4', category: 'business', question: 'How do you currently accept payments?', options: [
    { label: 'EFTPOS + online payments', score: 10 },
    { label: 'EFTPOS only', score: 5 },
    { label: 'Cash only', score: 0 },
  ]},
  { id: 'b5', category: 'business', question: 'Do you have inventory tracking?', options: [
    { label: 'Digital system (POS/software)', score: 10 },
    { label: 'Spreadsheet', score: 5 },
    { label: 'No tracking', score: 0 },
  ]},
  // Technical (4)
  { id: 't1', category: 'technical', question: 'Do you own a domain name?', options: [
    { label: 'Yes', score: 10 },
    { label: 'No, but I know how to get one', score: 5 },
    { label: 'No idea what that is', score: 0 },
  ]},
  { id: 't2', category: 'technical', question: 'How would you rate your digital skills?', options: [
    { label: 'Confident with technology', score: 10 },
    { label: 'Basic — email and social media', score: 5 },
    { label: 'Need help with everything', score: 0 },
  ]},
  { id: 't3', category: 'technical', question: 'Do you currently have a website?', options: [
    { label: 'Yes, with a CMS I can edit', score: 10 },
    { label: 'Yes, but it\'s static/outdated', score: 5 },
    { label: 'No website', score: 0 },
  ]},
  { id: 't4', category: 'technical', question: 'How do you handle customer communications?', options: [
    { label: 'Email + CRM system', score: 10 },
    { label: 'Email only', score: 5 },
    { label: 'Phone and text only', score: 0 },
  ]},
  // Legal (5)
  { id: 'l1', category: 'legal', question: 'Is your business GST registered?', hint: 'Required if turnover exceeds $60,000/year', options: [
    { label: 'Yes', score: 10 },
    { label: 'No, under $60K threshold', score: 5 },
    { label: 'Not sure', score: 0 },
  ]},
  { id: 'l2', category: 'legal', question: 'Are you aware of Consumer Guarantees Act obligations for online sales?', options: [
    { label: 'Yes, I understand them', score: 10 },
    { label: 'Somewhat aware', score: 5 },
    { label: 'No', score: 0 },
  ]},
  { id: 'l3', category: 'legal', question: 'Do you have a privacy policy?', hint: 'Required under NZ Privacy Act 2020', options: [
    { label: 'Yes, NZ Privacy Act compliant', score: 10 },
    { label: 'Have one, not sure if compliant', score: 5 },
    { label: 'No privacy policy', score: 0 },
  ]},
  { id: 'l4', category: 'legal', question: 'Do you have clear returns and refund terms?', options: [
    { label: 'Yes, written and published', score: 10 },
    { label: 'Informal policy', score: 5 },
    { label: 'No policy', score: 0 },
  ]},
  { id: 'l5', category: 'legal', question: 'Are you registered with the Companies Office?', options: [
    { label: 'Yes, as a company', score: 10 },
    { label: 'Operating as sole trader', score: 5 },
    { label: 'Not sure of my status', score: 0 },
  ]},
  // Marketing (4)
  { id: 'm1', category: 'marketing', question: 'Do you have active social media for your business?', options: [
    { label: 'Yes, multiple platforms', score: 10 },
    { label: 'Yes, one platform', score: 5 },
    { label: 'No business social media', score: 0 },
  ]},
  { id: 'm2', category: 'marketing', question: 'Is your business on Google My Business?', options: [
    { label: 'Yes, optimised with photos and reviews', score: 10 },
    { label: 'Listed but not managed', score: 5 },
    { label: 'No', score: 0 },
  ]},
  { id: 'm3', category: 'marketing', question: 'Do you have an email list of customers?', options: [
    { label: 'Yes, 100+ contacts', score: 10 },
    { label: 'Yes, small list', score: 5 },
    { label: 'No email list', score: 0 },
  ]},
  { id: 'm4', category: 'marketing', question: 'Have you ever run online advertising?', options: [
    { label: 'Yes, regularly', score: 10 },
    { label: 'Tried it once', score: 5 },
    { label: 'Never', score: 0 },
  ]},
]
```

- [ ] **Step 3: Create scoring.ts**

Pure functions: `calculateScores(answers)` returns `AssessmentResult`. `recommendPlatform(answers, categoryScores)` returns top 2 platforms. `estimateCosts(platform)` returns NZD breakdown.

Platform logic:
- techScore < 40 && businessScore < 50 → Trade Me
- techScore < 50 → Shopify
- techScore >= 50 && answers.t3 < 10 → Square Online
- techScore >= 70 → WooCommerce
- answers.t3 === 10 → Stripe/PayStation (add to existing site)
- Default fallback: Shopify

Cost data hardcoded in NZD:
- Trade Me: $0/mo platform + 7.9% success fee
- Shopify: $39/mo + 2.9% + $0.30
- Square Online: $0/mo + 2.6% + $0.10
- WooCommerce: $20/mo hosting + 2.9% + $0.30 (Stripe)
- Domain: $25/year

Score labels: 80-100 "Ready to Launch!", 60-79 "Almost There", 40-59 "Needs Work", 0-39 "Early Stage"

- [ ] **Step 4: Create roadmap-data.ts**

Array of `RoadmapItem` objects. Each item has a `triggerBelow` threshold — it only shows when the relevant category score is below that threshold.

4 phases with 4-5 items each covering: foundation (photos, catalogue, domain), setup (platform account, products, shipping), legal (privacy, returns, GST), launch (social, Google, email).

- [ ] **Step 5: Commit**

```bash
git add tools/ecommerce-readiness/
git commit -m "feat(ecommerce-readiness): add types, questions, scoring, and roadmap data"
```

---

## Task 2: Database + API

**Files:**
- Create: `supabase/migrations/041_ecommerce_assessments.sql`
- Create: `app/api/v1/ecommerce-readiness/save/route.ts`

- [ ] **Step 1: Create migration**

```sql
CREATE TABLE IF NOT EXISTS public.ecommerce_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL,
  score INT NOT NULL,
  results JSONB NOT NULL,
  roadmap_progress JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_assessments_user ON ecommerce_assessments (user_id, created_at DESC);
ALTER TABLE ecommerce_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assessments" ON ecommerce_assessments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON ecommerce_assessments TO authenticated, service_role;
```

Apply via Supabase MCP.

- [ ] **Step 2: Create save API**

GET returns user's latest assessment. POST upserts assessment (answers, score, results, roadmap_progress). Uses `getAdminSupabase()` with `(supabase.from as any)('ecommerce_assessments')`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/041_ecommerce_assessments.sql app/api/v1/ecommerce-readiness/
git commit -m "feat(ecommerce-readiness): add database table and save API"
```

---

## Task 3: Quiz Wizard UI

**Files:**
- Create: `tools/ecommerce-readiness/quiz-wizard.tsx`

- [ ] **Step 1: Create quiz-wizard.tsx**

'use client' component. Steps through 18 questions one at a time.

Props: `onComplete: (answers: UserAnswers) => void`, `onBack: () => void`

State: `currentIndex: number` (0-17), `answers: UserAnswers`

UI:
- Progress bar: thin blue bar at top (width = currentIndex/18 * 100%)
- Category label: "Business Readiness 1/4" (from CATEGORIES, based on current question's category)
- Question card: centered max-w-2xl, card-bg, question number + text + hint
- Answer options: 3 radio-style cards, selected has blue ring
- Auto-advance: selecting an answer waits 300ms then advances to next question
- ToolFrame actions prop: Back button (goes to prev question or welcome if index 0) + Next button (disabled if no answer for current question) + "Q3 of 18" center text

On last question answered: call `onComplete(answers)`

- [ ] **Step 2: Commit**

```bash
git add tools/ecommerce-readiness/quiz-wizard.tsx
git commit -m "feat(ecommerce-readiness): add quiz wizard UI with auto-advance"
```

---

## Task 4: Results View

**Files:**
- Create: `tools/ecommerce-readiness/results-view.tsx`

- [ ] **Step 1: Create results-view.tsx**

'use client' component displaying assessment results.

Props: `result: AssessmentResult`, `onViewRoadmap: () => void`, `onExportPdf: () => void`, `isAuthenticated: boolean`

UI sections:
1. Overall score circle: large number, colored border (green/amber/orange/red), label below
2. Category breakdown: 4 horizontal bars with labels and percentages, warning icon on < 50
3. Platform recommendation: primary card (name, tagline, cost, pros/cons, "why fits"), secondary card smaller
4. Cost estimate table: monthly + annual breakdown in NZD
5. Actions in ToolFrame actions bar: "View Action Plan" (gradient) + "Download PDF" (secondary, triggers sign-in modal if !isAuthenticated)

All dark theme styling.

- [ ] **Step 2: Commit**

```bash
git add tools/ecommerce-readiness/results-view.tsx
git commit -m "feat(ecommerce-readiness): add results view with score, recommendation, costs"
```

---

## Task 5: Roadmap View + PDF Export

**Files:**
- Create: `tools/ecommerce-readiness/roadmap-view.tsx`
- Create: `tools/ecommerce-readiness/pdf-export.ts`

- [ ] **Step 1: Create roadmap-view.tsx**

'use client' component showing phased action plan.

Props: `result: AssessmentResult`, `answers: UserAnswers`, `progress: Record<string, boolean>`, `onToggleItem: (itemId: string) => void`, `onExportPdf: () => void`, `onBackToResults: () => void`

Filters `ROADMAP_ITEMS` to only show items where the relevant category score is below the item's `triggerBelow`. Groups by phase. Shows completion progress.

Each item: checkbox + title + description + optional cost/time badge. Checkbox toggles call `onToggleItem`. Completed items show line-through.

- [ ] **Step 2: Create pdf-export.ts**

Uses jsPDF (already installed). Generates a report with:
- Title: "E-commerce Readiness Report"
- Date
- Overall score + label
- Category breakdown (text-based, not chart)
- Platform recommendation + cost estimate
- Roadmap checklist

Export function: `generatePdf(result: AssessmentResult, roadmapItems: RoadmapItem[]): void` — triggers download.

- [ ] **Step 3: Commit**

```bash
git add tools/ecommerce-readiness/roadmap-view.tsx tools/ecommerce-readiness/pdf-export.ts
git commit -m "feat(ecommerce-readiness): add roadmap view and PDF export"
```

---

## Task 6: Main Orchestrator + Page Route

**Files:**
- Create: `tools/ecommerce-readiness/ecommerce-readiness.tsx`
- Create: `app/tools/ecommerce-readiness/page.tsx`

- [ ] **Step 1: Create ecommerce-readiness.tsx**

'use client' default export. Manages the wizard flow: welcome → quiz → results → roadmap.

State: `step: WizardStep`, `answers: UserAnswers`, `result: AssessmentResult | null`, `roadmapProgress: Record<string, boolean>`

Welcome screen: icon + heading + subtitle + feature pills + "Start Assessment" button + "Free · No credit card · Takes 5 minutes"

On quiz complete: calculate scores via `calculateScores(answers)`, set result, move to 'results' step. Auto-save if authenticated.

ToolFrame: utility theme, toolName "E-commerce Readiness", shopping cart icon. Actions prop changes per step (quiz: back/next, results: roadmap/pdf, roadmap: export/back).

Sign-in modal: shown when user clicks PDF export or save without auth. Uses existing `signInWithOAuth` pattern.

- [ ] **Step 2: Create page.tsx**

```typescript
import type { Metadata } from 'next'
import EcommerceReadiness from '@/tools/ecommerce-readiness/ecommerce-readiness'

export const metadata: Metadata = {
  title: 'E-commerce Readiness Calculator — NZ Small Business | Toolk1t',
  description: 'Free assessment for NZ small businesses. Get your e-commerce readiness score, platform recommendation, cost estimate, and step-by-step launch plan.',
}

export default function EcommerceReadinessPage() {
  return <EcommerceReadiness />
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/ecommerce-readiness/ecommerce-readiness.tsx app/tools/ecommerce-readiness/
git commit -m "feat(ecommerce-readiness): add main orchestrator and page route"
```

---

## Task 7: Tool Registry + Build

**Files:**
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`
- Modify: `components/layout/tool-categories.ts`

- [ ] **Step 1: Add to registries**

Add to `lib/tools.tsx`: name "E-commerce Readiness", href "/tools/ecommerce-readiness", description "Is your NZ business ready to sell online?", shopping cart SVG icon, color "from-emerald-500 to-teal-500".

Add to `tool-categories.ts`: `'ecommerce-readiness': 'utility'`

Add to `bento-showcase.tsx`: preview card with quiz/score mockup.

- [ ] **Step 2: Build check**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx components/layout/tool-categories.ts
git commit -m "feat(ecommerce-readiness): add to tool registry and homepage"
```

---

## Task 8: E2E Test & Verification

- [ ] **Step 1: Test save API**

```bash
curl -s http://localhost:3000/api/v1/ecommerce-readiness/save | python3 -m json.tool | head -10
```

- [ ] **Step 2: Screenshot full flow**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/tools/ecommerce-readiness', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/ecommerce-welcome.png')
    # Click Start
    page.click('button:has-text(\"Start Assessment\")')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/ecommerce-quiz.png')
    # Answer first 3 questions
    for i in range(3):
        page.click('.cursor-pointer >> nth=0')
        page.wait_for_timeout(500)
    page.screenshot(path='/tmp/ecommerce-quiz-progress.png')
    browser.close()
"
```

- [ ] **Step 3: Fix issues, re-test, commit**

```bash
git add -A && git commit -m "fix(ecommerce-readiness): e2e test fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types, questions, scoring, roadmap data | None | Medium |
| 2 | Database + save API | None | Simple |
| 3 | Quiz wizard UI | Task 1 | Medium |
| 4 | Results view | Task 1 | Medium |
| 5 | Roadmap view + PDF export | Task 1 | Medium |
| 6 | Main orchestrator + page route | Tasks 1-5 | Medium (integration) |
| 7 | Tool registry + build | Task 6 | Simple |
| 8 | E2E test | All | Medium |

Tasks 1 and 2 can run in parallel. Tasks 3, 4, 5 can run in parallel (all depend on 1). Task 6 depends on 1-5. Task 7 depends on 6. Task 8 runs last.
