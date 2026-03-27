# NZ Tax Manager — Design Specification

## Overview

NZ tax management tool for sole traders and companies. Upload bank statements (CSV/PDF) and invoices (PDF/image), AI categorises transactions, calculates GST and income tax, generates pre-filled IRD forms (GST101A, IR3, IR4) as downloadable PDFs.

## User Flow

1. Set up entity (sole trader / company) with IRD number + GST settings
2. Upload bank statements and invoices/receipts
3. AI categorises transactions, user reviews and approves
4. View GST summary and income tax summary
5. Generate pre-filled IRD forms as PDFs
6. Download, review, submit to myIR manually

## Dashboard Layout

Single page with 4 sections:

```
┌─────────────────────────────────────────────────────┐
│  NZ Tax Manager        Entity: [Sole ▾] [2025-26 ▾] │
├─────────────────────────────────────────────────────┤
│  📊 Period Summary                                    │
│  Income · Expenses · GST Collected · GST Paid         │
│  GST Owing · Net Profit                               │
├─────────────────────────────────────────────────────┤
│  📄 Documents      [+ Bank Statement] [+ Invoice]    │
│  List of uploaded files with extraction status         │
├─────────────────────────────────────────────────────┤
│  📋 Transactions                    [Filter] [Sort]   │
│  Editable table: date, description, amount, GST,      │
│  category (dropdown), approved (checkbox)             │
├─────────────────────────────────────────────────────┤
│  📥 Generate Returns                                  │
│  [GST Return] [IR3 Individual] [IR4 Company]          │
└─────────────────────────────────────────────────────┘
```

Entity selector toggles between sole trader and company. Tax year selector filters by April-March financial year.

## Document Upload & Extraction

### Bank Statement CSV (instant, client-side)

Auto-detect bank by column headers:

| Bank | Key Columns |
|------|------------|
| ANZ | Date, Details, Amount, Balance |
| ASB | Date, Unique Id, Tran Type, Cheque Number, Payee, Memo, Amount |
| BNZ | Date, Amount, Payee, Particulars, Code, Reference, Balance |
| Westpac | Date, Other Party, Description, Amount, Balance |
| Kiwibank | Date, Description, Debit, Credit, Balance |

Maps to standard format: `{ date, description, amount, balance }`. Preview table shown before import.

### PDF Bank Statement (Gemini, 5-15s, 1 credit)

Upload to R2, Gemini extracts transactions as JSON array. Same preview + confirm flow.

### Invoice/Receipt (Gemini OCR, 1 credit)

Upload PDF/PNG/JPG/HEIC. Gemini extracts:
```json
{
  "vendor": "AWS",
  "date": "2026-03-15",
  "totalIncGst": 103.50,
  "gstAmount": 13.50,
  "totalExGst": 90.00,
  "description": "Cloud hosting",
  "invoiceNumber": "INV-2026-0342"
}
```

Flagged fields shown for manual review if low confidence.

## AI Transaction Categorisation

### Categories

| Category | GST Claimable | Tax Deductible |
|----------|:---:|:---:|
| Sales / Income | Collect GST | Taxable |
| Cost of Goods | ✅ | ✅ |
| Contractor / Subcontractor | ✅ | ✅ |
| Software & Subscriptions | ✅ | ✅ |
| Office & Supplies | ✅ | ✅ |
| Travel & Vehicle | ✅ | ✅ |
| Phone & Internet | ✅ | ✅ (% use) |
| Rent & Premises | ✅ | ✅ |
| Insurance | Some | ✅ |
| Bank Fees & Interest | ❌ | ✅ |
| Professional Services | ✅ | ✅ |
| Marketing & Advertising | ✅ | ✅ |
| Entertainment & Meals | 50% | 50% |
| Personal / Not Deductible | ❌ | ❌ |
| Transfer | ❌ | ❌ |

### How It Works

1. Batch of up to 50 transaction descriptions sent to Gemini
2. Returns category + confidence (high/medium/low) per transaction
3. High confidence: auto-applied ✅
4. Medium/low: flagged ⚠️ for user review
5. User can change any category via dropdown
6. "Approve All" button for batch confirmation

### Learning Rules

User corrections saved as pattern → category rules. Future matching transactions auto-categorised without AI. Stored in `tax_category_rules` table.

## GST Calculation

- GST Collected: 3/23 of income transactions (GST-inclusive extraction)
- GST on Expenses: sum of GST from claimable categories
- Entertainment: 50% of GST (NZ rule)
- GST to Pay/Refund: collected minus claimable

### Filing Basis

- **Invoice basis**: GST by invoice date
- **Payments basis**: GST by bank statement date (payment date)

### GST101A Form Generation

- Client-side via jspdf
- Pre-fills all standard boxes
- Includes entity name, IRD number, period
- Disclaimer footer

## Income Tax

### Sole Trader (IR3)

- Total business income
- Expenses by category
- Net profit
- Tax estimate using NZ brackets (10.5% → 39%)
- ACC levy estimate

### Company (IR4)

- Total income and expenses
- Net profit at 28% flat rate
- Manual entry fields for: shareholder salary, prior losses, RWT credits

### PDF Generation

- Pre-fills calculated sections
- Marks manual-entry fields clearly
- Includes expense schedule attachment

## File Structure

| File | Purpose |
|------|---------|
| `tools/tax-manager/types.ts` | Types, categories, tax rates, bank formats |
| `tools/tax-manager/tax-dashboard.tsx` | Main dashboard orchestrator |
| `tools/tax-manager/period-summary.tsx` | Summary cards |
| `tools/tax-manager/document-upload.tsx` | Bank + invoice upload with extraction |
| `tools/tax-manager/transaction-table.tsx` | Editable transaction list |
| `tools/tax-manager/gst-summary.tsx` | GST calculation + preview |
| `tools/tax-manager/income-tax-summary.tsx` | IR3/IR4 calculation |
| `tools/tax-manager/form-generator.tsx` | PDF generation |
| `tools/tax-manager/settings-panel.tsx` | Entity details, IRD number, GST settings |
| `tools/tax-manager/bank-parsers.ts` | CSV parsers for 5 NZ banks |
| `tools/tax-manager/gst-calculator.ts` | GST calculation logic |
| `tools/tax-manager/tax-calculator.ts` | Income tax brackets + company rate |
| `tools/tax-manager/category-rules.ts` | User correction rules |
| `lib/tax-manager/extract-invoice.ts` | Gemini invoice OCR |
| `lib/tax-manager/categorise.ts` | Gemini batch categorisation |
| `app/tools/tax-manager/page.tsx` | Page route |
| `app/api/v1/tax-manager/extract/route.ts` | Invoice extraction |
| `app/api/v1/tax-manager/categorise/route.ts` | Batch categorisation |
| `app/api/v1/tax-manager/transactions/route.ts` | CRUD transactions |
| `app/api/v1/tax-manager/documents/route.ts` | Upload/list documents |
| `app/api/v1/tax-manager/entities/route.ts` | Entity settings |
| `supabase/migrations/032_tax_manager.sql` | DB tables |

## API Design

### POST /api/v1/tax-manager/extract
- Auth: Required
- Credits: 1
- Input: `{ fileUrl, type: 'bank-statement' | 'invoice' }`
- Output: `{ transactions: [...] }` or `{ invoice: {...} }`

### POST /api/v1/tax-manager/categorise
- Auth: Required
- Credits: Free
- Input: `{ transactions: [{ description, amount }], entityId }`
- Output: `{ categories: [{ category, confidence }] }`

### GET/POST/PATCH/DELETE /api/v1/tax-manager/transactions
- Auth: Required
- CRUD for transactions with entity_id + tax_year filtering

### GET/POST /api/v1/tax-manager/documents
- Auth: Required
- Upload (multipart) and list documents

### GET/POST/PATCH /api/v1/tax-manager/entities
- Auth: Required
- Entity CRUD (name, type, IRD number, GST settings)

## Data Model

### `tax_entities`
```sql
id UUID PK, user_id UUID, name TEXT, type TEXT,
ird_number TEXT, gst_registered BOOLEAN, gst_basis TEXT,
gst_period TEXT, created_at TIMESTAMPTZ
```

### `tax_documents`
```sql
id UUID PK, user_id UUID, entity_id UUID FK,
type TEXT, file_url TEXT, file_name TEXT, bank_name TEXT,
extracted_data JSONB, tax_year TEXT, created_at TIMESTAMPTZ
```

### `tax_transactions`
```sql
id UUID PK, user_id UUID, entity_id UUID FK, document_id UUID FK,
date DATE, description TEXT, amount DECIMAL, gst_amount DECIMAL,
category TEXT, category_confidence TEXT, approved BOOLEAN,
tax_year TEXT, notes TEXT, created_at TIMESTAMPTZ
```

### `tax_category_rules`
```sql
id UUID PK, user_id UUID, entity_id UUID FK,
pattern TEXT, category TEXT, created_at TIMESTAMPTZ
```

All tables: RLS with `auth.uid() = user_id`.

## Credit Model

| Operation | Cost |
|-----------|------|
| Upload bank CSV + parse | Free |
| Upload PDF bank statement (Gemini) | 1 credit |
| Upload invoice/receipt (Gemini OCR) | 1 credit |
| AI categorisation (batch ≤50) | Free |
| Manual edits | Free |
| GST/tax calculation | Free |
| Generate PDF forms | Free |

## Edge Cases

- **Duplicate transactions**: Dedup by date + amount + description, show warning
- **Multi-currency**: Not supported v1 — NZ only, keep bank NZD amount
- **GST on imports**: Manual flag by user
- **Zero-rated supplies**: Category option for exports
- **Private use %**: User sets business-use % in settings, auto-split applied
- **Tax year boundary**: Strict date filtering by selected year
- **First-time setup**: Onboarding asks entity details before dashboard loads

## Non-Goals (v1)

- Double-entry ledger / full accounting
- Invoicing / sending invoices to clients
- Payroll / PAYE
- Direct IRD API filing
- Multi-tenant / bookkeeper mode
- Bank live connection / open banking
- Multi-currency support
- ACC return generation

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Full E2E workflow | Partial | User wants complete solution |
| 2 | Bank CSV + invoice PDF input | Xero, bank API | No existing software |
| 3 | Pre-filled PDF forms | Numbers only, myIR, API | Balanced automation |
| 4 | All GST bases/periods | Fixed | Two entities need flexibility |
| 5 | Cloud storage | Client-only | Enables AI features |
| 6 | Dashboard layout | Wizard, accounting app | Tax is iterative |
| 7 | 5 NZ bank formats | Generic CSV | Major banks covered |
| 8 | Gemini for OCR + categorisation | Manual, local OCR | Best accuracy |
| 9 | Pattern learning rules | No learning | Reduces repeat work |
| 10 | 15 categories | Fewer/more | Covers NZ tax needs |
| 11 | 50% entertainment rule | Manual | NZ-specific, common |
| 12 | Credits for Gemini only | Per-form | Fair pricing |
| 13 | Disclaimer on forms | None | Legal protection |
