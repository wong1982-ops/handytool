# Google Stitch Prompt — NZ Visa Pathway Finder

## Screen Overview

NZ immigration visa pathway finder. Single-page quiz → ranked pathway results → expandable detail cards with requirements, points calculator, Green List search, document checklist, fees. Dark theme.

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

Utility blue gradient header: back arrow + globe/passport icon + "Visa Pathway Finder" title. No tabs.

---

## Section 1: Quiz (Your Situation)

**All 6 questions on one page** (max-w-2xl centered). No step-by-step — scroll through all at once.

**Disclaimer banner** at top: blue border-l-4 card. "This tool provides general information only. It is not immigration advice."

**Each question** in a card (card-bg, border, rounded-xl, p-5, space-y-6):

- Question number: "Q1" badge (rounded-full, primary/20 bg, primary text, 12px)
- Question text (16px bold white)
- Options: vertical stack of pill buttons (full width, rounded-xl, 44px):
  - Selected: `bg-[#3D6AF2] text-white border-transparent`
  - Unselected: `bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631]`

**"Find My Pathways"** button at bottom: gradient primary, full-width max-w-sm, centered, 48px height, globe icon. Disabled until all 6 answered.

---

## Section 2: Results (Your Pathways)

**Replaces the quiz** (smooth scroll to top after submit).

**Header:** "Your Immigration Pathways" (24px bold white) + subtitle "Based on your situation, here are the visa categories you may qualify for" (14px text-secondary)

**Match legend:** 3 small pills — 🟢 Strong Match / 🟡 Possible / ⚪ Unlikely

**Pathway cards** (space-y-3, max-w-3xl):

Each card: `rounded-xl border-l-4 bg-[#131a23] border border-[#1e2631] p-5`
- Border-left color: green (strong) / amber (possible) / grey (unlikely)
- Top row: match badge (rounded-full, 12px) + visa name (16px bold white)
- Description: one-line summary (14px text-secondary)
- Key stat pills: e.g. "Fee: $750" "Processing: 2-4 weeks" (card-hover bg, rounded-full, 12px text-muted)
- "View Details ↓" button (text primary, 14px, right-aligned)

**Unlikely matches** shown at bottom, dimmed (opacity-50), collapsed by default with "Show X unlikely pathways" toggle.

**Footer:** "Not sure? Consult a licensed immigration adviser" + link to IAA website.

---

## Section 3: Pathway Detail (Expanded)

**Clicking "View Details" expands the card** to show 5 accordion sections inside it:

### 3a. Requirements Check
- Bullet list: each requirement with icon:
  - ✓ green: "Age 25-55" (you meet this based on quiz)
  - ✗ red: "Bachelor's degree or higher" (you selected high school)
  - ? grey: "English language proficiency" (not asked in quiz)
- Note below: "Items marked ? were not covered in the quiz — check immigration.govt.nz for full requirements"

### 3b. Points Calculator (SMC pathway only)
- Table card (card-bg, border, rounded-xl):
  - Rows: Category | Your Score | Max
  - Age, Qualifications, Experience, Job Offer, Bonuses
  - Highlighted cells for points earned (primary blue text)
  - Total row: bold, border-top, large text
  - Result: "✓ You have XXX points — likely to qualify" (green) or "You have XXX points — X more needed" (amber)

### 3c. Green List Search
- Search input (card-bg, border, 44px): "Search by job title or ANZSCO code..."
- Results below: matching occupation cards
  - Each: occupation title + ANZSCO code + Tier badge ("Tier 1 — Straight to Residence" green or "Tier 2 — Work to Residence" amber)
- No match: "This occupation is not currently on the Green List"

### 3d. Document Checklist
- Grouped checklist: "Required" items + "If applicable" items
- Each: checkbox + document name (14px white) + brief note (12px text-muted)
- Common: passport (valid 15+ months), passport photos, police certificates, medical examination, chest X-ray
- Visa-specific items listed per pathway

### 3e. Fees & Timeline
- Simple table: Fee item | Amount (NZD)
- Application fee + Immigration levy + Total
- Processing time: "Median: X weeks" with range
- "Check current fees at immigration.govt.nz →" link

---

## Mobile

- Quiz questions stack full width
- Pathway cards full width
- Points table scrollable horizontally
- Green List search full width
- Document checklist full width
- All buttons 44px

## Interaction Notes

- Quiz: selecting an option highlights it immediately
- "Find My Pathways" scrolls smoothly to results
- Pathway cards: click to expand/collapse detail
- Green List search: instant filter on type (debounced 200ms)
- Document checkboxes: cosmetic only (not saved)
- "Edit Answers" link at top of results → scrolls back to quiz
