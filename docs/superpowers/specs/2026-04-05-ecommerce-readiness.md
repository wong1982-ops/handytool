# E-commerce Readiness Calculator — Design Spec

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

A free e-commerce readiness assessment tool for NZ small businesses. 18-question quiz across 4 categories, scoring 0-100, with platform recommendation, NZD cost estimate, personalized action roadmap, and PDF export. Sign-in required for save/export.

## Route

`/tools/ecommerce-readiness` — ToolFrame, utility theme (blue)

## Flow

1. Welcome → "Start Assessment"
2. Quiz — 4 sections, progress bar, Back/Next in ToolFrame actions bar
3. Results — score, breakdown, platform recommendation, cost estimate
4. Roadmap — phased checklist with save progress (sign-in required)
5. Export — PDF download (sign-in required)

## Quiz (18 Questions)

### Category 1 — Business Readiness (5 questions, weight 30%)

| # | Question | Answers (score) |
|---|---|---|
| 1 | Do you have a defined product/service catalogue? | Yes (10) / Partially (5) / No (0) |
| 2 | Do you have professional product photos? | Professional (10) / Phone photos (5) / No (0) |
| 3 | Do you have a pricing strategy for online sales? | Yes incl shipping (10) / Yes no shipping (5) / No (0) |
| 4 | How do you currently accept payments? | EFTPOS + online (10) / EFTPOS only (5) / Cash only (0) |
| 5 | Do you have inventory tracking? | Digital system (10) / Spreadsheet (5) / None (0) |

### Category 2 — Technical Readiness (4 questions, weight 20%)

| # | Question | Answers (score) |
|---|---|---|
| 6 | Do you own a domain name? | Yes (10) / No but know how (5) / No idea (0) |
| 7 | Rate your digital skills | Confident (10) / Basic (5) / Need help (0) |
| 8 | Do you have a website currently? | Yes with CMS (10) / Static (5) / No (0) |
| 9 | How do you handle customer communications? | Email + CRM (10) / Email only (5) / Phone/text (0) |

### Category 3 — Legal & Compliance (5 questions, weight 25%)

| # | Question | Answers (score) |
|---|---|---|
| 10 | Is your business GST registered? | Yes (10) / No, under $60K (5) / Not sure (0) |
| 11 | Aware of Consumer Guarantees Act for online? | Yes (10) / Somewhat (5) / No (0) |
| 12 | Do you have a privacy policy? | NZ compliant (10) / Have one, unsure (5) / No (0) |
| 13 | Clear returns/refund terms? | Yes written (10) / Informal (5) / No (0) |
| 14 | Registered with Companies Office? | Yes (10) / Sole trader (5) / Not sure (0) |

### Category 4 — Marketing Readiness (4 questions, weight 25%)

| # | Question | Answers (score) |
|---|---|---|
| 15 | Active social media for business? | Multiple platforms (10) / One (5) / None (0) |
| 16 | On Google My Business? | Optimised (10) / Listed not managed (5) / No (0) |
| 17 | Email list of customers? | 100+ (10) / Small list (5) / No (0) |
| 18 | Ever run online ads? | Regularly (10) / Tried once (5) / Never (0) |

### Scoring

Category score = (sum of answers / max possible) × 100
Overall score = weighted average: Business 30% + Technical 20% + Legal 25% + Marketing 25%

## Results

### Score Display
- 80-100: green, "Ready to Launch!"
- 60-79: amber, "Almost There"
- 40-59: orange, "Needs Work"
- 0-39: red, "Early Stage"

### Category Breakdown
4 horizontal bars with scores. Categories below 50 get warning icon + recommendation.

### Platform Recommendation

| Condition | Platform | Why |
|---|---|---|
| Low tech + small catalogue + low budget | Trade Me | NZ's largest marketplace, no website needed |
| Low tech + own store + some budget | Shopify ($39/mo NZD) | Hosted, easy, NZ payments |
| Medium tech + wants control + low budget | Square Online (free tier) | Free, POS integration |
| High tech + full control | WooCommerce ($20/mo hosting) | Self-hosted, flexible |
| Has website + needs checkout | Stripe/PayStation | Add payments to existing site |

Show top 2 with pros/cons.

### Cost Estimate (NZD)
- Platform monthly fee
- Payment processing (% + per txn)
- Domain (~$25/year)
- First-year total estimate

## Roadmap

4 phases generated from quiz gaps:

**Phase 1 — Foundation (Week 1-2):** domain, photos, product catalogue
**Phase 2 — Setup (Week 3-4):** platform account, product upload, shipping config
**Phase 3 — Legal (Week 3-4):** privacy policy, returns terms, GST pricing
**Phase 4 — Launch (Week 5-6):** Google My Business, social media, email blast

Only show items where user scored low. Checkboxes save progress (authenticated users).

## PDF Export

Client-side jsPDF. Includes: score breakdown, platform recommendation, cost estimate, full roadmap. Sign-in required.

## Persistence

### Table: `ecommerce_assessments`
```sql
id UUID PRIMARY KEY
user_id UUID
answers JSONB
score INT
results JSONB (scores, recommendation, costs)
roadmap_progress JSONB (checkbox states)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## File Structure

| File | Responsibility |
|---|---|
| `tools/ecommerce-readiness/types.ts` | Types, questions data, scoring logic |
| `tools/ecommerce-readiness/questions.ts` | All 18 questions with answers and scores |
| `tools/ecommerce-readiness/scoring.ts` | Score calculation + platform recommendation |
| `tools/ecommerce-readiness/quiz-wizard.tsx` | Quiz step-through UI |
| `tools/ecommerce-readiness/results-view.tsx` | Score display + recommendation + costs |
| `tools/ecommerce-readiness/roadmap-view.tsx` | Phased action plan with checkboxes |
| `tools/ecommerce-readiness/pdf-export.ts` | PDF generation |
| `tools/ecommerce-readiness/ecommerce-readiness.tsx` | Main orchestrator |
| `app/tools/ecommerce-readiness/page.tsx` | Route page |
| `app/api/v1/ecommerce-readiness/save/route.ts` | Save assessment + roadmap progress |
| `supabase/migrations/041_ecommerce_assessments.sql` | Database table |

## Styling

Dark theme tokens. ToolFrame utility blue. Quiz cards: `rounded-xl bg-[#131a23] border border-[#1e2631]`. Answer options: radio-style pills. Progress bar: blue fill. Score: large centered number with color.

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Free, sign-in for PDF/save | Credit-based | Max traffic |
| 2 | Rule-based scoring | AI | Fast, deterministic |
| 3 | 18 questions, 4 categories | More/fewer | < 5 min, comprehensive |
| 4 | Platform from rules | AI; user picks | Actionable |
| 5 | NZD costs hardcoded | API | Prices stable |
| 6 | Phased roadmap from gaps | Generic | Personalized |
| 7 | Client-side PDF | Server | No API needed |
| 8 | ToolFrame wizard | Custom | Consistent UX |
