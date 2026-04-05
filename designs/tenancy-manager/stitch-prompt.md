# Google Stitch Prompt — NZ Tenancy Manager

## Screen Overview

NZ tenancy tool with 4 tabs: Agreement generator, Bond calculator, Notice templates, and Know Your Rights. Dark theme, utility blue ToolFrame.

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
primary-light:  #3D9DF2
success:        #10B981
warning:        #F59E0B
```

---

## ToolFrame

Utility blue gradient header: back arrow + house/key icon + "Tenancy Manager" title.
4 tabs: Agreement | Bond | Notices | Know Your Rights

---

## Tab 1: Agreement (default)

### 3-step wizard with progress bar

**Step indicator:** 3 dots/steps at top: "Property" · "Tenancy" · "Terms" — active step blue, completed green check, pending grey

**Step 1 card** (max-w-2xl, card-bg, border, 16px radius, 24px padding):
- Section: "Property & Landlord Details"
- Fields (2-col grid on desktop, stacked mobile):
  - Landlord name (text, required)
  - Landlord email (email)
  - Landlord phone (tel)
  - Landlord address (text)
  - Property address (text, required)
  - Property type (select: House/Apartment/Unit/Room/Other)
  - Bedrooms (number, 1-10)
  - Parking spaces (number, 0-3)
  - Property insured (radio: Yes/No)

**Step 2 card:**
- Section: "Tenancy Details"
- Tenant names: dynamic list, "Add Tenant" button (max 4)
- Tenancy type: 2 pill buttons (Fixed-term / Periodic)
- Start date (date input)
- End date (if fixed-term, date input)
- Weekly rent: NZD input with $ prefix
- Payment method (select)
- Payment day (select: Mon-Sun)
- Bond: auto-filled (rent × 4), editable number input
- Pet bond toggle + auto-calculated (rent × 2)
- Pets: radio Yes/No, if Yes: text input for description

**Step 3 card:**
- Section: "Additional Terms"
- Smoking: radio Allowed/Not allowed
- Max occupants: number input
- Chattels: checkbox grid (2 cols): stove, fridge, washing machine, dryer, dishwasher, curtains/blinds, floor coverings, garage door opener
- Additional conditions: textarea (optional)
- Healthy Homes: checkbox "I confirm this property complies with Healthy Homes Standards"

**Bottom actions bar:** Back (secondary) + Next/Generate (gradient primary)

**Preview screen** (after Step 3):
- Formatted agreement preview in a card (card-bg, border, rounded-xl, p-6)
- Looks like a real document: headings, numbered clauses, property details table
- "Download PDF" button (gradient, 44px) — shows sign-in modal if not authenticated
- "Edit Agreement" link back to wizard
- Disclaimer banner: yellow/amber border-l-4, text about not being legal advice

---

## Tab 2: Bond Calculator

**Single card** (max-w-lg, centered, card-bg, border, rounded-xl, p-6):

- Heading: "Bond Calculator" (18px bold white)
- Weekly rent input: large, NZD, card-bg, 44px
- Pet bond toggle: switch with label "Include pet bond?"
- Results (mt-4, space-y-2):
  - Standard bond: "4 × $X = **$Y**" (white, bold result)
  - Pet bond: "2 × $X = **$Z**" (only if enabled)
  - Divider line
  - Total: "Total bond: **$T**" (20px bold, success green)
- Info cards (mt-6, space-y-3):
  - Blue info card: "Maximum bond is 4 weeks' rent"
  - Blue info card: "Pet bonds (max 2 weeks extra) — Residential Tenancies Amendment Act 2024"
  - Amber warning card: "Bonds must be lodged with Tenancy Services within 23 working days"
  - Link pill: "Lodge bond at tenancy.govt.nz →" (primary blue)

---

## Tab 3: Notices

**Step 1 — Select notice type:**

5 notice cards in a grid (2 cols desktop, 1 mobile):
- Each card: card-bg, border, rounded-xl, p-4, hover card-hover, cursor-pointer
- Top: icon (document SVG) + notice period badge (e.g. "90 days" rounded-full bg-primary/20 text-primary)
- Title: "No-Cause Termination" (14px bold white)
- Subtitle: "Landlord → Tenant" (12px text-muted)
- Description: one line (12px text-secondary)

**Step 2 — Fill notice form:**

Back button + selected notice type badge at top.
Form card (max-w-2xl):
- Sender name + address
- Recipient name + address
- Property address
- Date of notice (date input)
- Tenancy start date
- Reason (for 42-day: select sale/moving in/renovation)
- Amount owed (for 14-day arrears: NZD input)

**Step 3 — Preview + Download:**

Formatted notice preview (like agreement preview).
"Download PDF" button (sign-in gated).
Disclaimer.

---

## Tab 4: Know Your Rights

**Two sections with toggle:** "For Landlords" / "For Tenants" (2 pill buttons at top)

**Accordion list** (space-y-2):
- Each item: card-bg, border, rounded-xl
- Header: px-4 py-3, flex justify-between, title (14px semibold white) + chevron (rotates on expand)
- Expanded content: px-4 pb-4, text-secondary 14px, line-height relaxed
- Links to govt sites: primary blue inline links
- Collapse/expand with smooth transition

**Disclaimer banner** at top: "This information is a general guide only. For specific legal advice, contact Tenancy Services (0800 836 262) or a lawyer."

---

## Mobile

- Wizard form fields stack vertically
- Bond calculator full width
- Notice cards single column
- Accordion full width
- All buttons 44px touch targets
- Tabs horizontally scrollable

## Interaction Notes

- Wizard: Back/Next navigation, validation per step (required fields)
- Bond: instant calculation on input change
- Notices: card click → form → preview flow
- Rights: accordion single-expand (opening one closes others)
- PDF download: sign-in modal if unauthenticated
- All PDFs include legal disclaimer
