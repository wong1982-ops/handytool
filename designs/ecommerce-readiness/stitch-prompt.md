# Google Stitch Prompt — E-commerce Readiness Calculator

## Screen Overview

A quiz-based assessment tool for NZ small businesses evaluating their e-commerce readiness. Multi-step wizard with score results, platform recommendation, cost estimate, and action roadmap. Dark theme.

**Platform:** Responsive web (desktop 1440px, mobile 390px)
**Theme:** Dark mode with Toolk1t utility blue theme

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
danger:         #EF4444
purple:         #7C3AED
```

---

## Screen 1: Welcome

- ToolFrame header: utility blue gradient, "E-commerce Readiness" title, shopping cart icon
- Centered content (max-w-xl):
  - Shopping cart + rocket icon (48px, primary blue)
  - Heading: "Is your business ready to sell online?" (24px bold white)
  - Subtitle: "Take our 5-minute assessment to find out. Get a readiness score, platform recommendation, cost estimate, and step-by-step launch plan." (14px text-secondary)
  - 4 feature pills in a row: "📊 Score" "🛒 Platform Match" "💰 Cost Estimate" "📋 Action Plan" (card-bg, border, rounded-full, 12px)
  - "Start Assessment" button: gradient primary, full-width max-w-sm, 44px, centered
  - Below: "Free · No credit card · Takes 5 minutes" (12px text-muted)

---

## Screen 2: Quiz

- ToolFrame actions bar (fixed bottom): "Back" button (secondary, left) + "Next" button (gradient, right) + progress "3 of 18" (center, text-muted)

- **Progress bar** at top of content: thin 4px bar, card-hover track, primary blue fill proportional to progress

- **Category label**: "Business Readiness" (12px uppercase tracking-wider text-muted) + category number badge "1/4" (rounded-full card-bg border)

- **Question card** (centered max-w-2xl):
  - Card: card-bg, border, 16px radius, 24px padding
  - Question number: "Q3" (14px text-muted)
  - Question text: "Do you have professional product photos?" (18px bold white)
  - Hint text: "Good photos significantly increase online sales" (13px text-muted, mt-1)

- **Answer options** (mt-4, space-y-3):
  - Each option: full-width card, card-bg, border, 12px radius, 16px padding, cursor-pointer
  - Left: radio circle (20px, border-2, empty or filled with primary blue)
  - Right: answer text (14px white) + score hint (12px text-muted, e.g. "Strong foundation")
  - Selected: `ring-2 ring-[#3D6AF2] bg-[#3D6AF2]/5`
  - Hover: card-hover bg

---

## Screen 3: Results

- **Overall Score** (centered):
  - Large circle with score number: 120px diameter circle, 4px border colored by range, score number inside (48px bold)
  - Colors: green 80+, amber 60-79, orange 40-59, red 0-39
  - Label below: "Almost There" (18px semibold, matching color)
  - Subtitle: "Your business scores 67/100 for e-commerce readiness" (14px text-secondary)

- **Category Breakdown** (mt-6, max-w-2xl):
  - 4 horizontal bars:
    - Label left: category name (14px text-secondary)
    - Bar: h-3, card-hover track, colored fill (green/amber/orange/red based on score), rounded
    - Score right: "72%" (14px white)
  - Categories below 50: ⚠️ warning icon + "Needs attention" in amber text

- **Platform Recommendation** (mt-6):
  - Card: card-bg, border, 16px radius, 20px padding
  - Heading: "Recommended Platform" (16px bold white)
  - Primary recommendation: platform logo area + name (18px bold) + tagline + monthly cost badge
  - Pros: green bullet list (13px)
  - Cons: amber bullet list (13px)
  - "Why this fits you" paragraph (13px text-secondary)
  - Alternative: smaller card below with second choice

- **Cost Estimate** (mt-6):
  - Card: card-bg, border, 16px radius
  - Table: item | monthly | annual
  - Rows: Platform fee, Payment processing, Domain, Total
  - Total row: bold, border-top
  - All in NZD with $ prefix

- **Actions** (ToolFrame actions bar):
  - "View Action Plan" button (gradient, primary)
  - "Download PDF" button (secondary) — triggers sign-in if not authenticated

---

## Screen 4: Roadmap

- **Sign-in prompt** (if not authenticated):
  - Modal: "Sign in to save your progress" + Google OAuth button + "Your progress will be saved across devices"

- **Phase sections** (vertical stack, max-w-2xl):
  - Each phase: card-bg, border, 16px radius, 20px padding
  - Phase header: "Phase 1 — Foundation" (16px bold white) + "Week 1-2" badge (rounded-full, card-bg, border, 12px text-muted) + progress "2/5 done" (12px text-muted)
  - Items: each with checkbox + title (14px white) + description (12px text-muted) + optional cost/time badge
  - Checkbox: 20px square, rounded, border. Checked: primary blue fill + white check
  - Completed items: line-through text, text-muted
  - Only items relevant to user's gaps shown

- **Overall progress** at top: "12 of 18 steps completed" (14px text-secondary) + thin progress bar

- **Actions** (ToolFrame actions bar):
  - "Download Full Report (PDF)" button (gradient)
  - "Back to Results" link (text-secondary)

---

## Mobile Responsive

- Welcome: stack vertically, feature pills wrap
- Quiz: answer options full width, question text slightly smaller (16px)
- Results: score circle centered, bars stack, platform card full width
- Roadmap: full width cards, checkboxes remain 44px touch target

## Interaction Notes

- Answer selection auto-advances to next question after 300ms delay
- Progress bar animates smoothly
- Score circle animates from 0 to final score on mount (1s ease-out)
- Category bars animate in sequence (staggered 100ms)
- Checkbox state saved to Supabase with 1s debounce
- PDF export uses jsPDF, client-side
