# Google Stitch Prompt — NZ Healthy Homes Compliance Checker

## Screen Overview

NZ Healthy Homes compliance tool with 3 tabs: interactive checklist with heating calculator, compliance statement PDF generator, and multi-property tracker. Dark theme, utility blue ToolFrame.

**Platform:** Responsive web (desktop 1440px, mobile 390px)
**Theme:** Dark mode with Toolk1t utility blue

---

## Brand Tokens

```
page-bg:        #090f16
card-bg:        #131a23
card-hover:     #1e2631
border:         #1e2631
text-primary:   #ffffff
text-secondary: #a6abb5
text-muted:     #70767f
primary:        #3D6AF2
success:        #10B981
warning:        #F59E0B
danger:         #EF4444
```

---

## ToolFrame

Utility blue gradient header: back arrow + house/shield icon + "Healthy Homes" title.
3 tabs: Check | Statement | Properties

---

## Tab 1: Check (Compliance Checklist)

### Layout: 5 standard sections in vertical stack (max-w-2xl, centered)

**Progress indicator** at top: 5 circles labeled "Heating · Insulation · Ventilation · Moisture · Draughts" — completed green, active blue, pending grey.

**Each standard section** is a card: card-bg, border, 16px radius, 20px padding.

**Section header:** standard number badge (rounded-full, primary bg, white text, "1") + standard name (16px bold white) + status badge right (grey "Not Checked" / green "Pass" / red "Fail")

**Standard 1 — Heating** (expanded by default):

- Question: "Does the main living area have a fixed heater?" — Yes/No radio pills
- If Yes: "What type?" — select dropdown (Heat pump / Wood burner / Flued gas / Electric panel / Other)
- **Heating Calculator card** (highlighted, bg-[#0d1117], border-primary/20, mt-3):
  - Title: "🔥 Heating Calculator" (14px bold)
  - 3 number inputs in a row: Length (m) × Width (m) × Height (m)
  - City dropdown: sorted list of NZ cities → shows "Zone X" badge next to selection
  - **Result box** (mt-3, p-3, rounded-lg):
    - "Room volume: XX.X m³"
    - "Required heater output: **X.X kW**" (20px bold, primary blue)
    - Pass: green bg/10 + "✓ Most heat pumps meet this requirement"
    - Fail: red bg/10 + "✗ Your heater may not be sufficient"

**Standards 2-5:** simpler question cards with radio/select options. Each collapses to show just the header + status after answering.

### Results Summary (below all standards)

Card with border-t-2 (primary):
- "Compliance Summary" heading
- 5 rows: standard name + status icon (✓ green / ✗ red / ⚠ amber) + brief note
- Overall result: large text — "✓ Compliant" (green) or "✗ Not Compliant — X standards need attention" (red)
- "Generate Compliance Statement →" button (gradient, links to Statement tab)

---

## Tab 2: Statement

### Form (max-w-lg, centered)

Card: card-bg, border, rounded-xl, p-6.

- Landlord name (text input)
- Property address (text input, pre-filled if from Check tab)
- Tenant name(s) (text input, comma-separated)
- Tenancy start date (date input)
- Signature date (date input, defaults to today)

### 5 Declaration Checkboxes (mt-4)

Each: card with checkbox left + standard name + declaration text (13px text-secondary).

Pre-ticked if Check tab passed that standard. Failed standards: amber border-l-4 + warning "This standard did not pass. Address issues before signing."

### Generate Button

"Generate Compliance Statement" — gradient, full width, 44px. Sign-in gated.

### Disclaimer

Amber banner: "This statement follows the Tenancy Services format. Signing confirms your property meets all standards."

---

## Tab 3: Properties

### Sign-in gate (if not authenticated)

Lock icon + "Sign in to track multiple properties" + Google sign-in button.

### Property List (authenticated)

**Header:** "Your Properties" (18px bold) + "Add Property" button (gradient, 44px)

**Property cards** (space-y-3):
- Card: card-bg, border, rounded-xl, p-4, hover card-hover
- Left: house icon (24px, text-muted)
- Middle: address (14px bold white) + city + zone badge ("Zone 2" rounded-full) + last checked date (12px text-muted)
- Right: status badge — green "Compliant" / red "Non-Compliant" / grey "Not Checked"
- Click expands to show action buttons: "Re-check" (primary) + "Statement" (secondary) + "Delete" (text-red, small)

**Add Property modal:**
- Property address (text input)
- City/region (dropdown)
- Climate zone auto-fills from city
- "Save" button

**Empty state:** house icon + "No properties yet" + "Add your first rental property"

---

## Mobile

- Checklist sections stack, full width
- Heating calculator inputs stack vertically
- Property cards full width
- All buttons 44px
- Tabs horizontally scrollable

## Interaction Notes

- Checklist: answering a section auto-calculates pass/fail
- Heating calculator: updates instantly on dimension/zone change
- Statement pre-fills from Check tab answers
- Properties: CRUD via API, optimistic updates
- PDF downloads trigger sign-in modal if unauthenticated
