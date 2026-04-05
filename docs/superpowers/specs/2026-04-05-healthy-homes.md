# NZ Healthy Homes Compliance Checker — Design Spec

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

Interactive compliance checker for all 5 NZ Healthy Homes Standards with heating calculator, compliance statement PDF generator, and multi-property tracker. Free with sign-in for PDFs and property tracking.

## Route

`/tools/healthy-homes` — ToolFrame, utility theme (blue), 3 tabs

## Tabs

1. **Check** (`/tools/healthy-homes`) — compliance checklist + heating calculator
2. **Statement** (`/tools/healthy-homes/statement`) — compliance statement PDF generator
3. **Properties** (`/tools/healthy-homes/properties`) — multi-property tracker (sign-in)

## Tab 1: Check (Compliance Checklist)

### 5 Sections

**Standard 1 — Heating (4 questions + calculator):**
- Fixed heater in main living area? (Yes/No)
- Heater type: Heat pump / Wood burner / Flued gas / Electric panel / Other
- Room dimensions: length (m) × width (m) × ceiling height (m)
- Location: city/region dropdown → auto-maps to Zone 1/2/3
- Calculator output: required kW capacity, pass/fail

**Heating formula (simplified Tenancy Services method):**
- Room volume = L × W × H (cubic metres)
- Zone 1 (warm): kW = volume × 0.09
- Zone 2 (moderate): kW = volume × 0.11
- Zone 3 (cold): kW = volume × 0.13
- Result rounded to 1 decimal place

**Standard 2 — Insulation (2 questions):**
- Ceiling insulation: Yes meets 2008 code / Yes old / No / Don't know
- Underfloor insulation: Yes / No / Concrete slab / Don't know

**Standard 3 — Ventilation (3 questions):**
- Kitchen extractor: Yes vents outside / Yes recirculating / No
- Bathroom extractor: Yes vents outside / Yes recirculating / No
- Any unflued gas heaters? Yes (warning) / No

**Standard 4 — Moisture & Drainage (3 questions):**
- Gutters/downpipes functional? Yes / No / Don't know
- Ground moisture barrier? Yes / No / Concrete slab / Don't know
- Pooling water under house? Yes / No / Not accessible

**Standard 5 — Draught Stopping (2 questions):**
- Unused chimneys blocked? Yes / No / N/A
- Gaps/holes sealed? Yes / Partially / No

### Results Summary

5 standard cards showing pass/fail/warning:
- Pass: green check + "Compliant"
- Fail: red X + "Action Required" + what to fix
- Warning: amber ! + "Check Required"

Overall: "Compliant" (all pass) or "Not Compliant — X standards need attention"

## Tab 2: Statement (PDF Generator)

### Form Fields
- Landlord name
- Property address
- Tenant name(s)
- Tenancy start date
- Signature date

### 5 Compliance Declarations (checkboxes)
Pre-ticked from Check tab results if completed. Failed standards show amber warning.

### PDF Output
Follows Tenancy Services compliance statement format. Includes all 5 declarations, property details, signature lines, disclaimer.

Sign-in gated for download.

## Tab 3: Properties (Multi-Property Tracker)

### Sign-in Required

### Property List
- Cards: address, status badge (Compliant/Non-Compliant/Not Checked), last checked date
- Actions: Re-check, Generate Statement, Delete
- "Add Property" button → address + city form

### Database

**Table: `healthy_homes_properties`**
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
address TEXT NOT NULL
city TEXT
climate_zone INT (1/2/3)
checklist JSONB
compliance_status TEXT DEFAULT 'not-checked'
last_checked TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

## Climate Zone Mapping

```typescript
const ZONE_MAP: Record<string, number> = {
  // Zone 1 (warm)
  'Auckland': 1, 'Northland': 1, 'Whangarei': 1, 'Tauranga': 1,
  'Hamilton': 1, 'Waikato': 1, 'Bay of Plenty': 1, 'Gisborne': 1,
  // Zone 2 (moderate)
  'Wellington': 2, 'Christchurch': 2, 'Napier': 2, 'Hastings': 2,
  'New Plymouth': 2, 'Palmerston North': 2, 'Whanganui': 2,
  'Nelson': 2, 'Kapiti Coast': 2, 'Lower Hutt': 2, 'Upper Hutt': 2,
  'Dunedin': 2, 'Invercargill': 2, 'Timaru': 2,
  // Zone 3 (cold)
  'Queenstown': 3, 'Central Otago': 3, 'Mackenzie': 3,
  'Taupo': 3, 'Rotorua': 3, 'Ruapehu': 3, 'South Canterbury': 3,
}
```

## File Structure

| File | Responsibility |
|---|---|
| `tools/healthy-homes/types.ts` | Types for checklist, property, results |
| `tools/healthy-homes/climate-zones.ts` | City → zone mapping, heating formula |
| `tools/healthy-homes/questions.ts` | All checklist questions per standard |
| `tools/healthy-homes/compliance-checker.tsx` | 5-standard checklist + heating calc |
| `tools/healthy-homes/statement-generator.tsx` | Statement form + PDF |
| `tools/healthy-homes/property-tracker.tsx` | Multi-property list + CRUD |
| `tools/healthy-homes/pdf-statement.ts` | Statement PDF generation |
| `app/tools/healthy-homes/layout.tsx` | ToolFrame with 3 tabs |
| `app/tools/healthy-homes/page.tsx` | Check tab |
| `app/tools/healthy-homes/statement/page.tsx` | Statement tab |
| `app/tools/healthy-homes/properties/page.tsx` | Properties tab |
| `app/api/v1/healthy-homes/properties/route.ts` | Properties CRUD API |
| `supabase/migrations/042_healthy_homes.sql` | Database table |

## Styling

Dark theme. ToolFrame utility blue. Standard cards with pass/fail coloring. Heating calculator in a highlighted card. All inputs 44px.

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Free + sign-in for PDF/tracking | Credits | Max adoption |
| 2 | 3 tabs | Single wizard | Functions distinct |
| 3 | City → auto zone | Manual zone | Easier for users |
| 4 | Room dims + zone formula | Simplified | Matches govt method |
| 5 | Pre-fill statement from check | Manual | Saves time |
| 6 | Supabase for properties | localStorage | Cross-device |
| 7 | Client-side PDF | Server | Consistent |
| 8 | Always disclaim | None | Legal protection |
