# NZ Healthy Homes Compliance Checker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Healthy Homes compliance checker with interactive checklist (5 standards + heating calculator), compliance statement PDF generator, and multi-property tracker.

**Architecture:** Tab-based tool using ToolFrame. Checklist and heating calculator are client-side logic. Properties stored in Supabase. PDFs generated client-side via jsPDF. City→climate zone mapping in a data file.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, jsPDF (already installed), ToolFrame, Supabase.

**Spec:** `docs/superpowers/specs/2026-04-05-healthy-homes.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/healthy-homes/types.ts` | Types for checklist, property, results |
| `tools/healthy-homes/climate-zones.ts` | City→zone mapping, heating kW formula |
| `tools/healthy-homes/questions.ts` | All checklist questions per standard |
| `tools/healthy-homes/compliance-checker.tsx` | 5-standard checklist + heating calc |
| `tools/healthy-homes/statement-generator.tsx` | Statement form + PDF |
| `tools/healthy-homes/property-tracker.tsx` | Multi-property CRUD |
| `tools/healthy-homes/pdf-statement.ts` | Statement PDF generation |
| `app/tools/healthy-homes/layout.tsx` | ToolFrame with 3 tabs |
| `app/tools/healthy-homes/page.tsx` | Check tab |
| `app/tools/healthy-homes/statement/page.tsx` | Statement tab |
| `app/tools/healthy-homes/properties/page.tsx` | Properties tab |
| `app/api/v1/healthy-homes/properties/route.ts` | Properties CRUD API |
| `supabase/migrations/042_healthy_homes.sql` | Database table |

### Modified Files
| File | Changes |
|---|---|
| `lib/tools.tsx` | Add Healthy Homes entry |
| `components/home/bento-showcase.tsx` | Add preview card |
| `components/layout/tool-categories.ts` | Add 'healthy-homes': 'utility' |

---

## Task 1: Types + Climate Zones + Questions

**Files:**
- Create: `tools/healthy-homes/types.ts`
- Create: `tools/healthy-homes/climate-zones.ts`
- Create: `tools/healthy-homes/questions.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// tools/healthy-homes/types.ts

export type StandardId = 'heating' | 'insulation' | 'ventilation' | 'moisture' | 'draught'
export type ComplianceStatus = 'pass' | 'fail' | 'warning' | 'not-checked'

export interface ChecklistAnswers {
  [questionId: string]: string | number | boolean
}

export interface StandardResult {
  id: StandardId
  label: string
  status: ComplianceStatus
  issues: string[]
}

export interface HeatingCalcResult {
  roomVolume: number
  requiredKw: number
  zone: number
  zoneName: string
}

export interface ComplianceResult {
  standards: StandardResult[]
  overallCompliant: boolean
  heatingCalc: HeatingCalcResult | null
}

export interface StatementData {
  landlordName: string
  propertyAddress: string
  tenantNames: string
  tenancyStartDate: string
  signatureDate: string
  declarations: Record<StandardId, boolean>
}

export interface Property {
  id: string
  address: string
  city: string
  climateZone: number
  checklist: ChecklistAnswers | null
  complianceStatus: 'compliant' | 'non-compliant' | 'not-checked'
  lastChecked: string | null
  createdAt: string
  updatedAt: string
}

export interface QuestionOption {
  label: string
  value: string
}

export interface ChecklistQuestion {
  id: string
  standard: StandardId
  question: string
  hint?: string
  type: 'radio' | 'select' | 'number'
  options?: QuestionOption[]
  unit?: string
}
```

- [ ] **Step 2: Create climate-zones.ts**

City→zone mapping for NZ. Heating kW formula per zone.

```typescript
// tools/healthy-homes/climate-zones.ts

export interface CityZone {
  city: string
  zone: number
  zoneName: string
}

export const CITY_ZONES: CityZone[] = [
  // Zone 1 (warm)
  { city: 'Auckland', zone: 1, zoneName: 'Zone 1 (Warm)' },
  { city: 'Northland / Whangarei', zone: 1, zoneName: 'Zone 1 (Warm)' },
  { city: 'Tauranga', zone: 1, zoneName: 'Zone 1 (Warm)' },
  { city: 'Hamilton / Waikato', zone: 1, zoneName: 'Zone 1 (Warm)' },
  { city: 'Bay of Plenty', zone: 1, zoneName: 'Zone 1 (Warm)' },
  { city: 'Gisborne', zone: 1, zoneName: 'Zone 1 (Warm)' },
  { city: 'Coromandel', zone: 1, zoneName: 'Zone 1 (Warm)' },
  // Zone 2 (moderate)
  { city: 'Wellington', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Lower Hutt / Upper Hutt', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Kapiti Coast', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Palmerston North / Manawatu', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Whanganui', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'New Plymouth / Taranaki', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Napier / Hastings', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Nelson', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Christchurch', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Dunedin', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Invercargill / Southland', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Timaru', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Blenheim / Marlborough', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  { city: 'Ashburton', zone: 2, zoneName: 'Zone 2 (Moderate)' },
  // Zone 3 (cold)
  { city: 'Queenstown / Central Otago', zone: 3, zoneName: 'Zone 3 (Cold)' },
  { city: 'Wanaka', zone: 3, zoneName: 'Zone 3 (Cold)' },
  { city: 'Taupo', zone: 3, zoneName: 'Zone 3 (Cold)' },
  { city: 'Rotorua', zone: 3, zoneName: 'Zone 3 (Cold)' },
  { city: 'Ruapehu', zone: 3, zoneName: 'Zone 3 (Cold)' },
  { city: 'Mackenzie Country', zone: 3, zoneName: 'Zone 3 (Cold)' },
  { city: 'South Canterbury (inland)', zone: 3, zoneName: 'Zone 3 (Cold)' },
]

// kW multiplier per cubic metre by zone
const ZONE_KW_MULTIPLIER: Record<number, number> = {
  1: 0.09, // warm
  2: 0.11, // moderate
  3: 0.13, // cold
}

export function calculateHeatingKw(lengthM: number, widthM: number, heightM: number, zone: number): HeatingCalcResult {
  const roomVolume = Math.round(lengthM * widthM * heightM * 10) / 10
  const multiplier = ZONE_KW_MULTIPLIER[zone] || ZONE_KW_MULTIPLIER[2]
  const requiredKw = Math.round(roomVolume * multiplier * 10) / 10
  const zoneName = zone === 1 ? 'Zone 1 (Warm)' : zone === 3 ? 'Zone 3 (Cold)' : 'Zone 2 (Moderate)'

  return { roomVolume, requiredKw, zone, zoneName }
}

// Import type needed
import type { HeatingCalcResult } from './types'
```

- [ ] **Step 3: Create questions.ts**

All checklist questions organized by standard.

```typescript
// tools/healthy-homes/questions.ts
import type { ChecklistQuestion } from './types'

export const STANDARD_LABELS: Record<string, string> = {
  heating: 'Heating',
  insulation: 'Insulation',
  ventilation: 'Ventilation',
  moisture: 'Moisture & Drainage',
  draught: 'Draught Stopping',
}

export const QUESTIONS: ChecklistQuestion[] = [
  // Heating
  { id: 'h1', standard: 'heating', question: 'Does the main living area have a fixed heater?', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { id: 'h2', standard: 'heating', question: 'What type of heater?', type: 'select', options: [
    { label: 'Heat pump', value: 'heat-pump' },
    { label: 'Wood burner', value: 'wood-burner' },
    { label: 'Flued gas heater', value: 'flued-gas' },
    { label: 'Electric panel heater', value: 'electric-panel' },
    { label: 'Other', value: 'other' },
  ]},
  { id: 'h3_length', standard: 'heating', question: 'Living room length', type: 'number', unit: 'm', hint: 'For heating calculator' },
  { id: 'h3_width', standard: 'heating', question: 'Living room width', type: 'number', unit: 'm' },
  { id: 'h3_height', standard: 'heating', question: 'Ceiling height', type: 'number', unit: 'm', hint: 'Typically 2.4m' },
  // Insulation
  { id: 'i1', standard: 'insulation', question: 'Is ceiling insulation installed?', type: 'radio', options: [
    { label: 'Yes, meets 2008 Building Code', value: 'yes-code' },
    { label: 'Yes, but old/thin', value: 'yes-old' },
    { label: 'No', value: 'no' },
    { label: 'Don\'t know', value: 'unknown' },
  ]},
  { id: 'i2', standard: 'insulation', question: 'Is underfloor insulation installed?', type: 'radio', options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'Concrete slab (not required)', value: 'slab' },
    { label: 'Don\'t know', value: 'unknown' },
  ]},
  // Ventilation
  { id: 'v1', standard: 'ventilation', question: 'Is there an extractor fan in the kitchen?', type: 'radio', options: [
    { label: 'Yes, vents to outside', value: 'yes-outside' },
    { label: 'Yes, recirculating only', value: 'yes-recirc' },
    { label: 'No', value: 'no' },
  ]},
  { id: 'v2', standard: 'ventilation', question: 'Is there an extractor fan in the bathroom?', type: 'radio', options: [
    { label: 'Yes, vents to outside', value: 'yes-outside' },
    { label: 'Yes, recirculating only', value: 'yes-recirc' },
    { label: 'No', value: 'no' },
  ]},
  { id: 'v3', standard: 'ventilation', question: 'Are there any unflued gas heaters in the property?', type: 'radio', hint: 'Unflued gas heaters are not acceptable as the main heater', options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ]},
  // Moisture
  { id: 'm1', standard: 'moisture', question: 'Are gutters and downpipes functional?', type: 'radio', options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'Don\'t know', value: 'unknown' },
  ]},
  { id: 'm2', standard: 'moisture', question: 'Is there a ground moisture barrier under the house?', type: 'radio', options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'Concrete slab (not required)', value: 'slab' },
    { label: 'Don\'t know', value: 'unknown' },
  ]},
  { id: 'm3', standard: 'moisture', question: 'Is there visible pooling water under the house?', type: 'radio', options: [
    { label: 'No (good)', value: 'no' },
    { label: 'Yes', value: 'yes' },
    { label: 'Not accessible', value: 'na' },
  ]},
  // Draught
  { id: 'd1', standard: 'draught', question: 'Are all unused chimneys and fireplaces blocked?', type: 'radio', options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'N/A — no chimneys', value: 'na' },
  ]},
  { id: 'd2', standard: 'draught', question: 'Are gaps and holes in walls, ceilings, windows, and floors sealed?', type: 'radio', options: [
    { label: 'Yes, all sealed', value: 'yes' },
    { label: 'Partially', value: 'partial' },
    { label: 'No', value: 'no' },
  ]},
]

// Evaluate compliance per standard
export function evaluateStandard(standardId: string, answers: Record<string, string | number | boolean>): { status: 'pass' | 'fail' | 'warning'; issues: string[] } {
  const issues: string[] = []

  switch (standardId) {
    case 'heating':
      if (answers.h1 === 'no') { issues.push('No fixed heater in main living area'); return { status: 'fail', issues } }
      if (answers.h2 === 'electric-panel') issues.push('Electric panel heaters may not meet capacity requirements')
      break
    case 'insulation':
      if (answers.i1 === 'no') { issues.push('No ceiling insulation'); return { status: 'fail', issues } }
      if (answers.i1 === 'yes-old') issues.push('Insulation may not meet 2008 Building Code — consider upgrading')
      if (answers.i2 === 'no') { issues.push('No underfloor insulation'); return { status: 'fail', issues } }
      if (answers.i1 === 'unknown' || answers.i2 === 'unknown') issues.push('Insulation status unknown — inspection recommended')
      break
    case 'ventilation':
      if (answers.v1 === 'no') { issues.push('No kitchen extractor fan'); return { status: 'fail', issues } }
      if (answers.v2 === 'no') { issues.push('No bathroom extractor fan'); return { status: 'fail', issues } }
      if (answers.v1 === 'yes-recirc') issues.push('Kitchen fan should vent to outside, not recirculate')
      if (answers.v2 === 'yes-recirc') issues.push('Bathroom fan should vent to outside, not recirculate')
      if (answers.v3 === 'yes') issues.push('Unflued gas heaters are not acceptable as the main heater')
      break
    case 'moisture':
      if (answers.m1 === 'no') { issues.push('Gutters/downpipes not functional'); return { status: 'fail', issues } }
      if (answers.m2 === 'no') { issues.push('No ground moisture barrier'); return { status: 'fail', issues } }
      if (answers.m3 === 'yes') { issues.push('Pooling water under the house'); return { status: 'fail', issues } }
      if (answers.m1 === 'unknown' || answers.m2 === 'unknown') issues.push('Moisture/drainage status unknown — inspection recommended')
      break
    case 'draught':
      if (answers.d1 === 'no') { issues.push('Unused chimneys/fireplaces not blocked'); return { status: 'fail', issues } }
      if (answers.d2 === 'no') { issues.push('Gaps and holes not sealed'); return { status: 'fail', issues } }
      if (answers.d2 === 'partial') issues.push('Some gaps/holes remain — complete sealing recommended')
      break
  }

  return { status: issues.length > 0 ? 'warning' : 'pass', issues }
}
```

- [ ] **Step 4: Commit**

```bash
git add tools/healthy-homes/
git commit -m "feat(healthy-homes): add types, climate zones, questions, and evaluation logic"
```

---

## Task 2: PDF Statement + DB + API

**Files:**
- Create: `tools/healthy-homes/pdf-statement.ts`
- Create: `supabase/migrations/042_healthy_homes.sql`
- Create: `app/api/v1/healthy-homes/properties/route.ts`

- [ ] **Step 1: Create pdf-statement.ts**

jsPDF function `generateStatementPdf(data: StatementData): void`. Creates compliance statement following Tenancy Services format: title, property/landlord/tenant details, 5 declaration sections with checkmarks, signature lines, disclaimer footer. Downloads as `healthy-homes-statement-YYYY-MM-DD.pdf`.

- [ ] **Step 2: Create migration**

```sql
CREATE TABLE IF NOT EXISTS public.healthy_homes_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  climate_zone INT DEFAULT 2,
  checklist JSONB,
  compliance_status TEXT DEFAULT 'not-checked',
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_healthy_homes_user ON healthy_homes_properties (user_id, created_at DESC);
ALTER TABLE healthy_homes_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own properties" ON healthy_homes_properties FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON healthy_homes_properties TO authenticated, service_role;
```

Apply via Supabase MCP.

- [ ] **Step 3: Create properties API**

GET: list user's properties. POST: create new property (address, city, climateZone). PATCH: update checklist/status. DELETE: remove property. Uses `getAdminSupabase()` with `(supabase.from as any)('healthy_homes_properties')`.

- [ ] **Step 4: Commit**

```bash
git add tools/healthy-homes/pdf-statement.ts supabase/migrations/042_healthy_homes.sql app/api/v1/healthy-homes/
git commit -m "feat(healthy-homes): add PDF generator, database, and properties API"
```

---

## Task 3: Compliance Checker UI

**Files:**
- Create: `tools/healthy-homes/compliance-checker.tsx`

- [ ] **Step 1: Create compliance-checker.tsx**

'use client' default export. 5 expandable standard sections with questions + heating calculator + results summary.

State: `answers: ChecklistAnswers`, `activeStandard: StandardId | null`, `heatingCalc: HeatingCalcResult | null`, `selectedCity: string`

Import questions from `./questions`, zones from `./climate-zones`, types from `./types`.

**UI:**
- Progress: 5 circles with standard names, colored by status
- Each standard: expandable card (card-bg, border, rounded-xl). Header shows standard name + status badge. Click expands to show questions.
- Heating section: includes the heating calculator card (highlighted bg) with dimension inputs + city dropdown + result display
- Results summary at bottom: 5 rows with pass/fail/warning + issues + overall status
- "Generate Compliance Statement →" link button to Statement tab

All inputs: dark theme, 44px. Radio options as pill buttons. Number inputs with unit labels.

- [ ] **Step 2: Commit**

```bash
git add tools/healthy-homes/compliance-checker.tsx
git commit -m "feat(healthy-homes): add 5-standard compliance checker with heating calculator"
```

---

## Task 4: Statement Generator + Property Tracker

**Files:**
- Create: `tools/healthy-homes/statement-generator.tsx`
- Create: `tools/healthy-homes/property-tracker.tsx`

- [ ] **Step 1: Create statement-generator.tsx**

'use client' default export. Form for compliance statement details + 5 declaration checkboxes + generate PDF button.

Pre-fills from Check tab results if available (pass localStorage or URL state — simplest: use a shared context or just let user re-enter).

Sign-in gated for PDF download. Uses `useAuth` + `signInWithOAuth`.

- [ ] **Step 2: Create property-tracker.tsx**

'use client' default export. Sign-in gate. Property list with CRUD. Add property modal (address + city dropdown → auto zone). Status badges. Actions: Re-check, Generate Statement, Delete.

Fetches from `GET /api/v1/healthy-homes/properties`. Creates via POST. Deletes via DELETE.

- [ ] **Step 3: Commit**

```bash
git add tools/healthy-homes/statement-generator.tsx tools/healthy-homes/property-tracker.tsx
git commit -m "feat(healthy-homes): add statement generator and property tracker"
```

---

## Task 5: Page Routes + Layout + Registry

**Files:**
- Create: `app/tools/healthy-homes/layout.tsx`
- Create: `app/tools/healthy-homes/page.tsx`
- Create: `app/tools/healthy-homes/statement/page.tsx`
- Create: `app/tools/healthy-homes/properties/page.tsx`
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`
- Modify: `components/layout/tool-categories.ts`

- [ ] **Step 1: Create layout with ToolFrame**

3 tabs: Check, Statement, Properties. House/shield SVG icon. Utility theme.

- [ ] **Step 2: Create 3 page routes**

Each imports its component as default and renders with metadata.

- [ ] **Step 3: Add to registries**

tools.tsx: "Healthy Homes", href "/tools/healthy-homes", house/shield icon, "from-green-500 to-emerald-500".
tool-categories.ts: `'healthy-homes': 'utility'`
bento-showcase.tsx: preview card.

- [ ] **Step 4: Build check**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add app/tools/healthy-homes/ lib/tools.tsx components/home/bento-showcase.tsx components/layout/tool-categories.ts
git commit -m "feat(healthy-homes): add page routes, layout, and tool registry"
```

---

## Task 6: E2E Test & Verification

- [ ] **Step 1: Screenshot all 3 tabs**

- [ ] **Step 2: Test heating calculator with sample values**

Zone 2, room 5m × 4m × 2.4m = 48m³ × 0.11 = 5.3 kW

- [ ] **Step 3: Fix issues, re-test, commit**

```bash
git add -A && git commit -m "fix(healthy-homes): e2e test fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types, climate zones, questions, evaluation | None | Medium |
| 2 | PDF, database, API | Task 1 (types) | Medium |
| 3 | Compliance checker UI | Tasks 1, 2 | Medium |
| 4 | Statement generator + property tracker | Tasks 1, 2 | Medium |
| 5 | Routes, layout, registry | Tasks 3, 4 | Simple |
| 6 | E2E test | All | Medium |

Tasks 1-2 sequential. Tasks 3-4 can run in parallel. Task 5 depends on 3+4. Task 6 last.
