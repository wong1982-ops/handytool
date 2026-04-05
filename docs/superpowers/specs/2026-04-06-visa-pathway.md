# NZ Immigration Visa Pathway Finder — Design Spec

**Date:** 2026-04-06
**Status:** Approved

---

## Overview

Free visa pathway finder for NZ immigration. 6-question situation quiz → ranked pathway matches → expandable detail per pathway with requirements check, SMC points calculator, Green List search, document checklists, fees, and processing times. Completely free, no sign-in required.

## Route

`/tools/visa-pathway` — ToolFrame, utility theme (blue), no tabs

## Flow

1. **Your Situation** — 6 questions on one page
2. **Your Pathways** — ranked cards with match strength
3. **Pathway Detail** — expand any card for full info

## Quiz (6 Questions)

| # | Question | Options |
|---|---|---|
| Q1 | Who are you? | Migrant / Already in NZ on visa / NZ employer |
| Q2 | Where are you now? | Outside NZ / Student visa / Work visa / Visitor visa / Citizen-resident |
| Q3 | Highest qualification? | PhD / Masters / Bachelors / Diploma / Trade cert / High school / None |
| Q4 | Work experience in field? | 0 / 1-2 / 3-5 / 6-9 / 10+ years |
| Q5 | Job offer from NZ employer? | Yes Green List / Yes other / No but looking / N/A |
| Q6 | Age? | Under 25 / 25-29 / 30-39 / 40-44 / 45-49 / 50-55 / Over 55 |

## Pathway Matching

8 pathways evaluated against quiz answers:

| Pathway | Key Criteria |
|---|---|
| Skilled Migrant Category (SMC) | Degree + experience + age 25-55 |
| Accredited Employer Work Visa (AEWV) | Job offer OR employer |
| Green List Tier 1 (Straight to Residence) | Job offer on Green List Tier 1 |
| Green List Tier 2 (Work to Residence) | Job offer on Green List Tier 2 |
| Post-Study Work Visa | In NZ on student visa |
| Student Visa | No job offer, studying/planning to study |
| Partner Visa | Has NZ citizen/resident partner |
| Parent Visa | Age 50+, NZ citizen/resident child |

Match levels: Strong (green) / Possible (amber) / Unlikely (grey)

## Pathway Detail (Expandable Sections)

### 1. Requirements
Bullet list with ✓/✗/? based on quiz answers.

### 2. Points Calculator (SMC only)
| Category | Points |
|---|---|
| Age 25-29 | 30 |
| Age 30-39 | 25 |
| Age 40-44 | 20 |
| Age 45-49 | 10 |
| Age 50-55 | 5 |
| PhD | 70 |
| Masters | 50 |
| Bachelors | 40 |
| Diploma/Trade | 30 |
| 3-5 years experience | 10 |
| 6-9 years | 15 |
| 10+ years | 20 |
| Job offer | 50 |
| Green List job | +10 bonus |
| Partner qualifications | 20 |
| NZ qualification bonus | 10 |

Threshold: 6 points minimum per criterion. Total score displayed.

### 3. Green List Search
~100 occupations searchable by title or ANZSCO code. Shows Tier 1 or Tier 2 result.

### 4. Document Checklist
Per visa type. Common: passport, police cert, medical, photos, English test. Specific: employment contract (AEWV), qualification assessment (SMC), relationship evidence (Partner).

### 5. Fees & Processing Times
| Visa | Fee (NZD) | Levy | Processing |
|---|---|---|---|
| SMC EOI | $680 | $580 | 6-12 months |
| AEWV | $750 | $580 | 2-4 weeks (median) |
| Student | $375 | - | 4-6 weeks |
| Post-Study Work | $700 | $580 | 2-4 weeks |
| Partner | $760 | $580 | 6-12 months |
| Parent | $680 | $580 | 12-24 months |

## File Structure

| File | Responsibility |
|---|---|
| `tools/visa-pathway/types.ts` | Types for quiz, pathways, points, Green List |
| `tools/visa-pathway/quiz-data.ts` | Questions and options |
| `tools/visa-pathway/pathway-matcher.ts` | Match logic, points calc, requirements check |
| `tools/visa-pathway/green-list.ts` | ~100 Green List occupations (Tier 1 + 2) |
| `tools/visa-pathway/document-checklists.ts` | Per-visa document lists |
| `tools/visa-pathway/fees-data.ts` | Fees and processing times |
| `tools/visa-pathway/visa-pathway.tsx` | Main component (quiz + results + details) |
| `tools/visa-pathway/pathway-card.tsx` | Expandable pathway card |
| `tools/visa-pathway/points-calculator.tsx` | SMC points display |
| `tools/visa-pathway/green-list-search.tsx` | Searchable Green List |
| `app/tools/visa-pathway/page.tsx` | Route page |

## No Database

Free tool, no persistence. All client-side.

## Styling

Dark theme. ToolFrame utility blue. Quiz as single-page form. Result cards with match-colored left borders. Expandable detail accordions.

## Disclaimer

Every page: "This tool provides general information only. It is not immigration advice. For advice specific to your situation, consult a licensed immigration adviser. Check immigration.govt.nz for the most current requirements."

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Free | Sign-in; credits | Max SEO |
| 2 | Single-page wizard | Multi-tab | Fast, all visible |
| 3 | Rule-based | AI | Deterministic |
| 4 | 6 questions | More | Quick |
| 5 | Green List searchable | External API | No API available |
| 6 | No database | Save | Free, no auth |
| 7 | Always disclaim | None | Regulated advice |
| 8 | Adapts to user type | Separate tools | One tool for all |
