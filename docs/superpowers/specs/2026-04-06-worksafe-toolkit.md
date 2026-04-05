# NZ WorkSafe H&S Toolkit — Design Spec

**Date:** 2026-04-06
**Status:** Approved

---

## Overview

Health & safety compliance toolkit for NZ small businesses. 4 tabs: H&S Plan generator (industry-specific), Hazard Register (persistent), Incident Report templates, and Worker Engagement checklist. Free with sign-in for PDFs and saved data.

## Route

`/tools/worksafe-toolkit` — ToolFrame, utility theme, 4 tabs

## Tabs

1. **Plan** (`/tools/worksafe-toolkit`) — industry selection + questions → H&S plan PDF
2. **Hazards** (`/tools/worksafe-toolkit/hazards`) — hazard register (CRUD, saved)
3. **Incidents** (`/tools/worksafe-toolkit/incidents`) — incident report form → PDF
4. **Workers** (`/tools/worksafe-toolkit/workers`) — engagement checklist + score

## Industries

6 pre-built industry profiles:
- Construction
- Hospitality
- Office
- Retail
- Agriculture
- Manufacturing

## Tab 1: H&S Plan

### Flow
1. Select industry (6 cards)
2. Answer 8 workplace questions (yes/no)
3. Preview generated plan
4. Download PDF (sign-in gated)

### Questions (adapt per industry)
- Do workers operate at height?
- Is heavy machinery used?
- Are hazardous chemicals handled?
- Is food prepared or served?
- Do workers operate vehicles?
- Are there lone workers?
- Is manual handling required?
- Do workers interact with the public?

### Generated Plan Sections
1. H&S Policy Statement (template with business name)
2. Responsibilities (PCBU, workers, contractors)
3. Hazard Management (identification, assessment, control)
4. Emergency Procedures (fire, earthquake, medical, evacuation)
5. Worker Engagement (consultation, participation, representation)
6. Incident Reporting (how to report, investigation process)
7. Review Schedule (annual review commitment)

## Tab 2: Hazard Register

### Pre-populated per industry

Construction: falls from height, electrocution, manual handling, noise, falling objects, trench collapse, hot works, asbestos
Hospitality: burns/scalds, slips/falls, knife injuries, manual handling, chemical exposure, fatigue
Office: ergonomic injury, trips/falls, electrical, stress/fatigue, fire
Retail: manual handling, slips/falls, aggression/robbery, repetitive strain, fire
Agriculture: machinery entanglement, chemical exposure, animal handling, quad bike, manual handling, sun/heat
Manufacturing: machinery guarding, noise, chemical exposure, manual handling, forklift, confined spaces

### Hazard Entry Fields
- Hazard description
- Risk level: Low / Medium / High / Critical
- Likelihood: Rare / Unlikely / Possible / Likely / Almost Certain
- Consequence: Insignificant / Minor / Moderate / Major / Catastrophic
- Controls in place (text)
- Person responsible
- Review date

### Persistence
Saved to Supabase `worksafe_hazards` table (authenticated users).

## Tab 3: Incident Reports

### Form Fields
- Date and time of incident
- Location
- Type: Near miss / Minor injury / Serious injury / Notifiable event
- Description of what happened
- People involved (names)
- Injuries sustained
- Immediate actions taken
- Root cause (text)
- Corrective actions planned
- Reported by (name)

### Output
PDF incident report. No persistence — fill and download.

Notifiable event warning: "Serious injuries, deaths, and certain dangerous incidents MUST be reported to WorkSafe NZ immediately. Call 0800 030 040."

## Tab 4: Worker Engagement

### 10-item checklist
1. H&S representative elected or nominated?
2. Regular H&S meetings/toolbox talks held?
3. Hazard reporting process communicated to all workers?
4. Induction process for new workers?
5. PPE provided and maintained?
6. Workers trained for their specific tasks?
7. Workers consulted on H&S changes?
8. Emergency procedures known by all workers?
9. First aid kit stocked and accessible?
10. H&S noticeboard displayed?

### Scoring
Each item: Yes (10) / Partially (5) / No (0). Total /100.
- 80-100: green "Strong Engagement"
- 50-79: amber "Needs Improvement"
- 0-49: red "Significant Gaps"

Failed items show specific recommendations.

## Database

### Table: `worksafe_hazards`
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
industry TEXT
hazard TEXT NOT NULL
risk_level TEXT
likelihood TEXT
consequence TEXT
controls TEXT
responsible TEXT
review_date DATE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## File Structure

| File | Responsibility |
|---|---|
| `tools/worksafe-toolkit/types.ts` | Types |
| `tools/worksafe-toolkit/industry-data.ts` | 6 industries, questions, pre-built hazards |
| `tools/worksafe-toolkit/plan-generator.tsx` | Industry select + questions + plan preview |
| `tools/worksafe-toolkit/hazard-register.tsx` | Hazard CRUD with pre-populated list |
| `tools/worksafe-toolkit/incident-report.tsx` | Incident form + PDF |
| `tools/worksafe-toolkit/worker-engagement.tsx` | Checklist + scoring |
| `tools/worksafe-toolkit/pdf-plan.ts` | H&S plan PDF |
| `tools/worksafe-toolkit/pdf-incident.ts` | Incident report PDF |
| `app/tools/worksafe-toolkit/layout.tsx` | ToolFrame 4 tabs |
| `app/tools/worksafe-toolkit/page.tsx` | Plan tab |
| `app/tools/worksafe-toolkit/hazards/page.tsx` | Hazards tab |
| `app/tools/worksafe-toolkit/incidents/page.tsx` | Incidents tab |
| `app/tools/worksafe-toolkit/workers/page.tsx` | Workers tab |
| `app/api/v1/worksafe/hazards/route.ts` | Hazard CRUD API |
| `supabase/migrations/043_worksafe_hazards.sql` | DB table |

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Free + sign-in | Credits | Max adoption |
| 2 | 4 tabs | Single wizard | Functions distinct |
| 3 | 6 industries | Generic | Specific guidance needed |
| 4 | Hazards persisted | All; none | Ongoing register |
| 5 | Rule-based | AI | Deterministic |
| 6 | Client-side PDF | Server | Consistent |
| 7 | Always disclaim | None | Legal |
