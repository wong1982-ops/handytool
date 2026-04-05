# NZ Tenancy Manager — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NZ tenancy tool with 4 tabs: agreement generator (wizard → PDF), bond calculator, notice templates (5 types → PDF), and Know Your Rights educational content.

**Architecture:** Tab-based tool using ToolFrame with nested routes. All logic is client-side — form data generates PDFs via jsPDF, bond calculates instantly, content is static. No database, no AI. Sign-in required for PDF downloads only.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, jsPDF (already installed), ToolFrame.

**Spec:** `docs/superpowers/specs/2026-04-05-tenancy-manager.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/tenancy-manager/types.ts` | Agreement, notice, form data types |
| `tools/tenancy-manager/tenancy-data.ts` | Chattels list, notice types, rights content |
| `tools/tenancy-manager/agreement-wizard.tsx` | 3-step agreement form |
| `tools/tenancy-manager/bond-calculator.tsx` | Bond calculator UI |
| `tools/tenancy-manager/notice-generator.tsx` | Notice picker + form + preview |
| `tools/tenancy-manager/know-your-rights.tsx` | Educational accordion |
| `tools/tenancy-manager/pdf-agreement.ts` | Agreement PDF generation |
| `tools/tenancy-manager/pdf-notice.ts` | Notice PDF generation |
| `app/tools/tenancy-manager/layout.tsx` | ToolFrame with 4 tabs |
| `app/tools/tenancy-manager/page.tsx` | Agreement tab (default) |
| `app/tools/tenancy-manager/bond/page.tsx` | Bond tab |
| `app/tools/tenancy-manager/notices/page.tsx` | Notices tab |
| `app/tools/tenancy-manager/rights/page.tsx` | Rights tab |

### Modified Files
| File | Changes |
|---|---|
| `lib/tools.tsx` | Add Tenancy Manager entry |
| `components/home/bento-showcase.tsx` | Add preview card |
| `components/layout/tool-categories.ts` | Add 'tenancy-manager': 'utility' |

---

## Task 1: Types + Data

**Files:**
- Create: `tools/tenancy-manager/types.ts`
- Create: `tools/tenancy-manager/tenancy-data.ts`

- [ ] **Step 1: Create types.ts**

Types for agreement form data, notice data, and wizard state.

```typescript
// tools/tenancy-manager/types.ts

export interface AgreementData {
  // Landlord
  landlordName: string
  landlordAddress: string
  landlordPhone: string
  landlordEmail: string
  // Property
  propertyAddress: string
  propertyType: 'house' | 'apartment' | 'unit' | 'room' | 'other'
  bedrooms: number
  parkingSpaces: number
  insured: boolean
  // Tenancy
  tenantNames: string[]
  tenancyType: 'fixed' | 'periodic'
  startDate: string
  endDate: string // only for fixed-term
  weeklyRent: number
  paymentMethod: string
  paymentDay: string
  bondAmount: number
  petBond: boolean
  petBondAmount: number
  petsAllowed: boolean
  petDescription: string
  // Terms
  smokingAllowed: boolean
  maxOccupants: number
  chattels: string[]
  additionalConditions: string
  healthyHomesCompliant: boolean
}

export type NoticeType = '90-day' | '42-day' | '14-day-arrears' | '28-day-tenant' | '21-day-fixed'

export interface NoticeData {
  type: NoticeType
  senderName: string
  senderAddress: string
  recipientName: string
  recipientAddress: string
  propertyAddress: string
  noticeDate: string
  tenancyStartDate: string
  reason?: string // for 42-day
  amountOwed?: number // for 14-day arrears
  arrearsFromDate?: string // for 14-day arrears
}

export interface NoticeTypeInfo {
  id: NoticeType
  title: string
  from: string
  period: string
  description: string
}

export interface RightsSection {
  title: string
  content: string // HTML-safe plain text with line breaks
  link?: { label: string; url: string }
}

export type AgreementStep = 1 | 2 | 3 | 'preview'
```

- [ ] **Step 2: Create tenancy-data.ts**

All static data: chattels list, notice type definitions, Know Your Rights content.

```typescript
// tools/tenancy-manager/tenancy-data.ts
import type { NoticeTypeInfo, RightsSection } from './types'

export const CHATTELS = [
  'Stove/oven', 'Refrigerator', 'Washing machine', 'Dryer',
  'Dishwasher', 'Curtains/blinds', 'Floor coverings', 'Garage door opener',
]

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'unit', label: 'Unit' },
  { value: 'room', label: 'Room' },
  { value: 'other', label: 'Other' },
]

export const PAYMENT_METHODS = ['Bank transfer', 'Automatic payment', 'Cash', 'Other']
export const PAYMENT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const NOTICE_TYPES: NoticeTypeInfo[] = [
  { id: '90-day', title: 'No-Cause Termination', from: 'Landlord → Tenant', period: '90 days', description: 'End a periodic tenancy without giving a reason' },
  { id: '42-day', title: 'Special Reasons Notice', from: 'Landlord → Tenant', period: '42 days', description: 'Landlord selling, moving in, or major renovations' },
  { id: '14-day-arrears', title: 'Rent Arrears Notice', from: 'Landlord → Tenant', period: '14 days', description: 'Tenant is 14 or more days behind on rent' },
  { id: '28-day-tenant', title: 'Tenant Notice', from: 'Tenant → Landlord', period: '28 days', description: 'Tenant ending a periodic tenancy' },
  { id: '21-day-fixed', title: 'Fixed-Term Non-Renewal', from: 'Either party', period: '21 days', description: 'Notice that a fixed-term tenancy will not be renewed (before expiry)' },
]

export const LANDLORD_RIGHTS: RightsSection[] = [
  {
    title: 'Healthy Homes Standards',
    content: 'Since 1 July 2025, ALL private rental properties must comply with the Healthy Homes Standards. These cover five areas:\n\n1. Heating — a fixed heater in the main living area that can heat to at least 18°C\n2. Insulation — ceiling and underfloor insulation meeting 2008 Building Code levels\n3. Ventilation — extractor fans in kitchen, bathroom, and any rooms with a fixed gas heater\n4. Moisture and drainage — efficient drainage, guttering, and downpipes; no puddles under the house\n5. Draught stopping — all unused chimneys and fireplaces blocked; gaps/holes in walls, ceilings, windows, and floors blocked\n\nYou must provide a compliance statement with every new or renewed tenancy.',
    link: { label: 'Tenancy Services — Healthy Homes', url: 'https://www.tenancy.govt.nz/healthy-homes/' },
  },
  {
    title: 'Rent Increases',
    content: 'You can only increase rent once every 12 months. You must give tenants at least 60 days\' written notice. The increase must not be excessive — tenants can challenge it at the Tenancy Tribunal if they believe it is substantially above market rent.\n\nThe notice must state the new amount and the date it takes effect. It must be in writing (email is acceptable).',
    link: { label: 'Tenancy Services — Rent Increases', url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/rent/rent-increases/' },
  },
  {
    title: 'Property Inspections',
    content: 'You may inspect the property up to 4 times per year (once every 4 weeks). You must give at least 48 hours\' written notice. The tenant has the right to be present during any inspection.\n\nInspections must be at a reasonable time (between 8am and 7pm). You cannot enter without notice except in an emergency.',
    link: { label: 'Tenancy Services — Inspections', url: 'https://www.tenancy.govt.nz/maintenance-and-inspections/inspections/' },
  },
  {
    title: 'Maintenance Obligations',
    content: 'Landlords must maintain the property in a reasonable state of repair. This includes:\n\n• Urgent repairs (no hot water, no heating, serious water leak, broken toilet, dangerous electrical faults) — must be addressed as soon as possible\n• Non-urgent repairs — must be done within a reasonable time after being notified\n\nIf you fail to do repairs, the tenant can apply to the Tenancy Tribunal for an order.',
    link: { label: 'Tenancy Services — Maintenance', url: 'https://www.tenancy.govt.nz/maintenance-and-inspections/repairs-and-maintenance/' },
  },
  {
    title: 'Tenancy Tribunal',
    content: 'The Tenancy Tribunal resolves disputes between landlords and tenants. Either party can apply. The filing fee is $20.44.\n\nCommon applications: unpaid rent, bond disputes, property damage, unlawful termination, failure to do repairs.\n\nThe Tribunal can order compensation up to $100,000. Decisions are legally binding.',
    link: { label: 'Tenancy Tribunal', url: 'https://www.tenancy.govt.nz/disputes/taking-a-case-to-the-tenancy-tribunal/' },
  },
  {
    title: 'Anti-Retaliation Rules (2024 Act)',
    content: 'Under the Residential Tenancies Amendment Act 2024, landlords cannot terminate a tenancy or take retaliatory action because a tenant has:\n\n• Exercised their rights (e.g., requested repairs)\n• Made a complaint to a government agency\n• Taken a case to the Tenancy Tribunal\n\nIf a tenant believes a termination notice is retaliatory, they can challenge it at the Tribunal.',
    link: { label: 'Tenancy Services — Retaliatory Notices', url: 'https://www.tenancy.govt.nz/ending-a-tenancy/giving-notice-to-end-a-tenancy/' },
  },
]

export const TENANT_RIGHTS: RightsSection[] = [
  {
    title: 'Your Rights as a Tenant',
    content: 'As a tenant in New Zealand, you have the right to:\n\n• Quiet enjoyment — your landlord cannot unreasonably disturb your use of the property\n• Privacy — the landlord must give 48 hours\' notice before entering (except emergencies)\n• Repairs — the landlord must maintain the property in a reasonable state\n• A written tenancy agreement\n• A safe and habitable home that meets Healthy Homes Standards',
    link: { label: 'Tenancy Services — Tenant Rights', url: 'https://www.tenancy.govt.nz/starting-a-tenancy/tenants-responsibilities/' },
  },
  {
    title: 'Bond Refund Process',
    content: 'When your tenancy ends, your bond should be refunded within a reasonable time. The process:\n\n1. Both landlord and tenant complete a bond refund form\n2. If both agree on the refund amount, Tenancy Services pays it within 5-10 working days\n3. If there is a dispute, either party can apply to the Tenancy Tribunal\n\nThe landlord cannot withhold bond for normal wear and tear. Bond can only be used for unpaid rent, damages beyond normal wear, or cleaning if the property was left unreasonably dirty.',
    link: { label: 'Tenancy Services — Bond Refund', url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/bond/getting-your-bond-back/' },
  },
  {
    title: 'Rent Arrears — What to Do',
    content: 'If you are behind on rent:\n\n• Talk to your landlord — many will agree to a payment plan\n• Contact Work and Income (WINZ) — you may be eligible for emergency housing assistance\n• If you receive a 14-day notice, you have 14 days to pay the full amount owed\n• The landlord can apply to the Tenancy Tribunal if rent remains unpaid\n• You cannot be locked out — only the Tribunal can order an eviction',
    link: { label: 'Tenancy Services — Rent Arrears', url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/rent/rent-arrears/' },
  },
  {
    title: 'Flatting & Boarding',
    content: 'Different rules apply depending on your living situation:\n\n• Tenant (on the agreement) — full protection under the Residential Tenancies Act\n• Flatmate (not on the agreement) — limited protection; disputes handled by the Disputes Tribunal, not the Tenancy Tribunal\n• Boarder (living with the landlord) — different rules; the RTA does not apply to boarders in the same way\n\nAlways check whether you are named on the tenancy agreement.',
    link: { label: 'Tenancy Services — Flatting', url: 'https://www.tenancy.govt.nz/starting-a-tenancy/flatting/' },
  },
  {
    title: 'Meth Contamination (2026)',
    content: 'From 2026, new rules will apply to methamphetamine contamination in rental properties:\n\n• Landlords will be required to test properties in certain circumstances\n• There will be clear contamination level standards\n• Landlords must disclose any known contamination to tenants\n• Remediation will be required before re-letting\n\nThese rules are still being finalised. Check Tenancy Services for updates.',
    link: { label: 'Tenancy Services', url: 'https://www.tenancy.govt.nz/' },
  },
]
```

- [ ] **Step 3: Commit**

```bash
git add tools/tenancy-manager/
git commit -m "feat(tenancy-manager): add types and tenancy data (chattels, notices, rights content)"
```

---

## Task 2: PDF Generators

**Files:**
- Create: `tools/tenancy-manager/pdf-agreement.ts`
- Create: `tools/tenancy-manager/pdf-notice.ts`

- [ ] **Step 1: Create pdf-agreement.ts**

Uses jsPDF to generate a tenancy agreement PDF from `AgreementData`. Follows Tenancy Services standard format: title, parties, property details, tenancy terms, bond, chattels, additional conditions, signatures section, disclaimer.

Function: `generateAgreementPdf(data: AgreementData): void` — triggers download as `tenancy-agreement-{date}.pdf`.

Key sections in the PDF:
1. Title: "Residential Tenancy Agreement"
2. Landlord details table
3. Tenant details table
4. Property details
5. Tenancy type + dates
6. Rent details
7. Bond details (including pet bond if applicable)
8. Chattels list
9. Additional conditions
10. Healthy Homes compliance statement
11. Signatures section (blank lines for signing)
12. Disclaimer footer

- [ ] **Step 2: Create pdf-notice.ts**

Uses jsPDF. Function: `generateNoticePdf(data: NoticeData): void`.

Generates notice-type-specific content:
- Title varies by type (e.g. "Notice to Terminate Tenancy — 90 Days")
- From/to details
- Property address
- Notice date + effective date (calculated: notice date + period)
- Reason (for 42-day) or amount owed (for 14-day)
- Legal clause citing relevant section of the Residential Tenancies Act
- Signature section
- Disclaimer

- [ ] **Step 3: Commit**

```bash
git add tools/tenancy-manager/pdf-agreement.ts tools/tenancy-manager/pdf-notice.ts
git commit -m "feat(tenancy-manager): add agreement and notice PDF generators"
```

---

## Task 3: Agreement Wizard UI

**Files:**
- Create: `tools/tenancy-manager/agreement-wizard.tsx`

- [ ] **Step 1: Create agreement-wizard.tsx**

'use client' default export. 3-step wizard form with preview.

State: `step: AgreementStep` (1, 2, 3, 'preview'), `data: AgreementData` (with defaults).

**Step 1:** Property & landlord fields in a 2-col grid (desktop). All inputs: `rounded-xl bg-[#131a23] border border-[#1e2631] text-white min-h-[44px]`.

**Step 2:** Tenancy details. Dynamic tenant names (add/remove up to 4). Tenancy type pills. Auto-calculate bond (rent × 4) and pet bond (rent × 2) on rent change.

**Step 3:** Additional terms. Chattels checkboxes in 2-col grid. Healthy Homes checkbox.

**Preview:** Formatted HTML showing the agreement. "Download PDF" button triggers sign-in check then `generateAgreementPdf(data)`. "Edit" button goes back to step 3.

Step indicator at top: 3 dots with labels. Bottom: Back + Next buttons.

Props: `isAuthenticated: boolean`, `onSignIn: () => void`

- [ ] **Step 2: Commit**

```bash
git add tools/tenancy-manager/agreement-wizard.tsx
git commit -m "feat(tenancy-manager): add 3-step agreement wizard UI"
```

---

## Task 4: Bond Calculator + Notice Generator

**Files:**
- Create: `tools/tenancy-manager/bond-calculator.tsx`
- Create: `tools/tenancy-manager/notice-generator.tsx`

- [ ] **Step 1: Create bond-calculator.tsx**

'use client' default export. Single page with instant calculation.

State: `weeklyRent: number` (0), `petBond: boolean` (false).

Computed: standardBond = rent × 4, petBondAmount = rent × 2, total = standard + (petBond ? petBondAmount : 0).

UI: centered max-w-lg card with rent input, pet toggle, results display, info callout cards, govt link.

- [ ] **Step 2: Create notice-generator.tsx**

'use client' default export. 3-step flow: select type → fill form → preview/download.

State: `selectedType: NoticeType | null`, `noticeData: Partial<NoticeData>`, `step: 'select' | 'form' | 'preview'`.

Step 1: 5 notice type cards from `NOTICE_TYPES`. Click selects.
Step 2: Form with fields based on type (extra fields for 42-day reason, 14-day arrears amount).
Step 3: Preview + download button (sign-in gated).

Calculate effective date from notice date + period.

Props: `isAuthenticated: boolean`, `onSignIn: () => void`

- [ ] **Step 3: Commit**

```bash
git add tools/tenancy-manager/bond-calculator.tsx tools/tenancy-manager/notice-generator.tsx
git commit -m "feat(tenancy-manager): add bond calculator and notice generator"
```

---

## Task 5: Know Your Rights

**Files:**
- Create: `tools/tenancy-manager/know-your-rights.tsx`

- [ ] **Step 1: Create know-your-rights.tsx**

'use client' default export. Toggle between landlord/tenant view, accordion sections.

State: `view: 'landlord' | 'tenant'` (default 'landlord'), `expandedIndex: number | null`.

UI:
- Disclaimer banner at top (amber border-left, text about general guide + contact Tenancy Services)
- Toggle pills: "For Landlords" / "For Tenants"
- Accordion: maps `LANDLORD_RIGHTS` or `TENANT_RIGHTS` from tenancy-data.ts
- Each item: clickable header with chevron (rotates), expands to content + optional link
- Single-expand: opening one closes others

Content rendered with `whitespace-pre-wrap` to preserve line breaks from the data.

- [ ] **Step 2: Commit**

```bash
git add tools/tenancy-manager/know-your-rights.tsx
git commit -m "feat(tenancy-manager): add Know Your Rights accordion"
```

---

## Task 6: Page Routes + Layout

**Files:**
- Create: `app/tools/tenancy-manager/layout.tsx`
- Create: `app/tools/tenancy-manager/page.tsx`
- Create: `app/tools/tenancy-manager/bond/page.tsx`
- Create: `app/tools/tenancy-manager/notices/page.tsx`
- Create: `app/tools/tenancy-manager/rights/page.tsx`

- [ ] **Step 1: Create layout.tsx**

ToolFrame with 4 tabs. House/key SVG icon. Utility theme.

```typescript
'use client'
import { ToolFrame } from '@/components/layout/tool-frame'

export default function TenancyManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolFrame
      toolName="Tenancy Manager"
      toolSlug="tenancy-manager"
      icon={/* house/key SVG */}
      tabs={[
        { label: 'Agreement', href: '/tools/tenancy-manager' },
        { label: 'Bond', href: '/tools/tenancy-manager/bond' },
        { label: 'Notices', href: '/tools/tenancy-manager/notices' },
        { label: 'Know Your Rights', href: '/tools/tenancy-manager/rights' },
      ]}
    >
      {children}
    </ToolFrame>
  )
}
```

- [ ] **Step 2: Create page routes**

Each page imports its component as default import and renders it. Agreement and Notices pages need to pass `isAuthenticated` and `onSignIn` — wrap in a client component that uses `useAuth`.

Actually simpler: each tab component handles its own auth check internally using `useAuth`. No props needed from the page.

Update the tab components (agreement-wizard and notice-generator) to use `useAuth` and `signInWithOAuth` internally instead of receiving props.

4 page files with metadata + component import.

- [ ] **Step 3: Commit**

```bash
git add app/tools/tenancy-manager/
git commit -m "feat(tenancy-manager): add page routes with ToolFrame layout"
```

---

## Task 7: Tool Registry + Build

**Files:**
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`
- Modify: `components/layout/tool-categories.ts`

- [ ] **Step 1: Add to registries**

tools.tsx: name "Tenancy Manager", href "/tools/tenancy-manager", description "NZ tenancy agreements, bonds & notices", house/key SVG, color "from-blue-500 to-sky-500".

tool-categories.ts: `'tenancy-manager': 'utility'`

bento-showcase.tsx: preview card with document/house icon mockup.

- [ ] **Step 2: Build check**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx components/layout/tool-categories.ts
git commit -m "feat(tenancy-manager): add to tool registry and homepage"
```

---

## Task 8: E2E Test & Verification

- [ ] **Step 1: Screenshot all 4 tabs**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    for tab in ['tenancy-manager', 'tenancy-manager/bond', 'tenancy-manager/notices', 'tenancy-manager/rights']:
        page.goto(f'http://localhost:3000/tools/{tab}', timeout=60000)
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)
        name = tab.replace('/', '-')
        page.screenshot(path=f'/tmp/tenancy-{name}.png')
        print(f'{tab} captured')
    browser.close()
"
```

- [ ] **Step 2: Test bond calculator**

Enter $500 weekly rent, enable pet bond, verify calculations show $2000 + $1000 = $3000.

- [ ] **Step 3: Fix issues, re-test, commit**

```bash
git add -A && git commit -m "fix(tenancy-manager): e2e test fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types + data (chattels, notices, rights) | None | Medium (lots of content) |
| 2 | PDF generators (agreement + notice) | Task 1 | Medium |
| 3 | Agreement wizard UI | Tasks 1, 2 | Medium |
| 4 | Bond calculator + notice generator | Tasks 1, 2 | Medium |
| 5 | Know Your Rights accordion | Task 1 | Simple |
| 6 | Page routes + layout | Tasks 3-5 | Simple |
| 7 | Tool registry + build | Task 6 | Simple |
| 8 | E2E test | All | Medium |

Tasks 1-2 sequential (2 needs types from 1). Tasks 3, 4, 5 can run in parallel (all depend on 1+2). Task 6 depends on 3-5. Task 7 depends on 6. Task 8 last.
