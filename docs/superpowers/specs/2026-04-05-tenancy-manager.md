# NZ Tenancy Agreement & Bond Manager — Design Spec

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

A free NZ tenancy tool with 4 tabs: Agreement generator (wizard → PDF), Bond calculator, Notice templates (5 types → PDF), and Know Your Rights educational content. Sign-in required for PDF downloads. All content follows the Residential Tenancies Act 2024 format.

## Route

`/tools/tenancy-manager` — ToolFrame, utility theme (blue), 4 tabs

## Tabs

1. **Agreement** (`/tools/tenancy-manager`) — wizard form → tenancy agreement PDF
2. **Bond** (`/tools/tenancy-manager/bond`) — instant calculator
3. **Notices** (`/tools/tenancy-manager/notices`) — select type → fill → PDF
4. **Know Your Rights** (`/tools/tenancy-manager/rights`) — educational accordion

## Tab 1: Agreement Generator

### 3-step wizard

**Step 1 — Property & Landlord:**
- Landlord: name, address, phone, email
- Property: address, type (House/Apartment/Unit/Room/Other), bedrooms, parking spaces
- Property insured? (Yes/No)

**Step 2 — Tenancy Details:**
- Tenant names (up to 4, dynamic add)
- Tenancy type: Fixed-term / Periodic
- Start date, end date (if fixed-term)
- Weekly rent (NZD)
- Rent payment method, payment day
- Bond: auto-calculated (4 weeks rent), editable
- Pet bond: toggle, auto-adds up to 2 weeks
- Pets allowed: Yes (describe) / No

**Step 3 — Additional Terms:**
- Smoking: Allowed / Not allowed
- Maximum occupants
- Chattels: checkboxes (stove, fridge, washing machine, dryer, dishwasher, curtains/blinds, floor coverings, garage door opener)
- Additional conditions (free text)
- Healthy Homes compliance: checkbox

### Output
- HTML preview matching Tenancy Services standard format
- "Download PDF" button (sign-in gated)
- Disclaimer: "This agreement follows the standard Residential Tenancies Act format. It is not legal advice."

## Tab 2: Bond Calculator

### Single page, instant calculation

**Inputs:**
- Weekly rent (NZD)
- Pet bond toggle (Yes/No)

**Outputs:**
- Standard bond: rent × 4
- Pet bond: rent × 2 (if enabled)
- Total bond
- Lodgement info: "Must be lodged with Tenancy Services within 23 working days"
- Link to tenancy.govt.nz bond form

**Info callouts:**
- Max bond = 4 weeks rent
- Pet bond (max 2 weeks extra) — 2024 Amendment Act
- Failure to lodge = penalties

## Tab 3: Notices

### 5 notice types

| Type | From | Period | Use |
|---|---|---|---|
| 90-day no-cause | Landlord | 90 days | End periodic tenancy |
| 42-day special | Landlord | 42 days | Selling, moving in, renovations |
| 14-day rent arrears | Landlord | 14 days | Tenant 14+ days behind |
| 28-day tenant | Tenant | 28 days | Tenant ending periodic |
| 21-day fixed-term | Either | 21 days | Not renewing fixed-term |

### Flow
1. Select notice type (card grid)
2. Fill form (sender, recipient, property, date, reason/amount)
3. Preview formatted notice
4. Download PDF (sign-in gated)

## Tab 4: Know Your Rights

### Accordion sections

**For Landlords:**
- Healthy Homes Standards (5 standards, deadlines)
- Rent Increases (12-month gap, 60-day notice)
- Property Inspections (48hr notice, max 4/year)
- Maintenance Obligations (urgent vs non-urgent)
- Tenancy Tribunal (when, costs, process)
- Anti-Retaliation Rules (2024 Act)

**For Tenants:**
- Your Rights (quiet enjoyment, repairs, privacy)
- Bond Refund Process (disputes, timeframes)
- Rent Arrears (options, Tribunal)
- Flatting & Boarding (different rules)
- Meth Contamination 2026 (upcoming rules)

Each: header + chevron → expands to 2-3 paragraphs + govt link.

Disclaimer at top: general guide, contact Tenancy Services or lawyer.

## File Structure

| File | Responsibility |
|---|---|
| `app/tools/tenancy-manager/layout.tsx` | ToolFrame with 4 tabs |
| `app/tools/tenancy-manager/page.tsx` | Agreement tab (default) |
| `app/tools/tenancy-manager/bond/page.tsx` | Bond tab |
| `app/tools/tenancy-manager/notices/page.tsx` | Notices tab |
| `app/tools/tenancy-manager/rights/page.tsx` | Rights tab |
| `tools/tenancy-manager/agreement-wizard.tsx` | 3-step agreement form |
| `tools/tenancy-manager/bond-calculator.tsx` | Bond calculator UI |
| `tools/tenancy-manager/notice-generator.tsx` | Notice type picker + form |
| `tools/tenancy-manager/know-your-rights.tsx` | Educational accordion |
| `tools/tenancy-manager/pdf-agreement.ts` | Agreement PDF generation |
| `tools/tenancy-manager/pdf-notice.ts` | Notice PDF generation |
| `tools/tenancy-manager/types.ts` | Types for agreement, notice data |
| `tools/tenancy-manager/tenancy-data.ts` | Chattels, notice types, rights content |

## No Database

No persistence for MVP. Users fill forms and download PDFs. No saved agreements or history.

## Styling

Dark theme tokens. ToolFrame utility blue. Form cards: `rounded-xl bg-[#131a23] border border-[#1e2631]`. All inputs 44px min-height.

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Free + sign-in for PDF | Credits | Max adoption |
| 2 | 4 tabs | Single wizard | Focused sections |
| 3 | Client-side PDF | Server | No API |
| 4 | No database | Save agreements | Keep simple |
| 5 | Rule-based | AI | Legal docs need determinism |
| 6 | Law + education | Law only | Adds value |
| 7 | Tenancy Services format | Custom | Legal requirement |
| 8 | Always disclaim | None | Legal protection |
