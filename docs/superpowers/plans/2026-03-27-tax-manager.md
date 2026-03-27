# NZ Tax Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an NZ tax management tool: upload bank statements + invoices, AI categorises transactions, calculates GST/income tax, generates pre-filled IRD forms (GST101A, IR3, IR4) as PDFs.

**Architecture:** Dashboard layout with 4 sections (summary, documents, transactions, forms). Bank CSV parsed client-side (5 NZ banks). Invoices extracted via Gemini OCR. Transactions categorised by Gemini with user-correction learning. GST/tax calculated client-side. Forms generated via jspdf. Data stored in Supabase with R2 for documents.

**Tech Stack:** Next.js 16, React 19, TypeScript, Gemini API, jspdf, Supabase, Cloudflare R2, Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/tax-manager/types.ts` | Types, categories, tax rates, bank formats, constants |
| `tools/tax-manager/bank-parsers.ts` | CSV parsers for 5 NZ banks |
| `tools/tax-manager/gst-calculator.ts` | GST calculation logic |
| `tools/tax-manager/tax-calculator.ts` | Income tax brackets + company rate |
| `tools/tax-manager/category-rules.ts` | User correction pattern → category rules |
| `tools/tax-manager/tax-dashboard.tsx` | Main dashboard orchestrator |
| `tools/tax-manager/settings-panel.tsx` | Entity setup: IRD number, GST settings |
| `tools/tax-manager/period-summary.tsx` | Summary cards (income, expenses, GST) |
| `tools/tax-manager/document-upload.tsx` | Bank statement + invoice upload |
| `tools/tax-manager/transaction-table.tsx` | Editable transaction list with categories |
| `tools/tax-manager/gst-summary.tsx` | GST calculation preview + form trigger |
| `tools/tax-manager/income-tax-summary.tsx` | IR3/IR4 preview + manual fields |
| `tools/tax-manager/form-generator.tsx` | PDF generation for all forms |
| `lib/tax-manager/extract-invoice.ts` | Gemini invoice OCR extraction |
| `lib/tax-manager/categorise.ts` | Gemini batch transaction categorisation |
| `app/tools/tax-manager/page.tsx` | Page route |
| `app/api/v1/tax-manager/extract/route.ts` | Invoice extraction via Gemini |
| `app/api/v1/tax-manager/categorise/route.ts` | Batch AI categorisation |
| `app/api/v1/tax-manager/transactions/route.ts` | CRUD transactions |
| `app/api/v1/tax-manager/documents/route.ts` | Upload/list documents |
| `app/api/v1/tax-manager/entities/route.ts` | Entity settings CRUD |
| `supabase/migrations/032_tax_manager.sql` | DB tables + RLS |

---

### Task 1: Types, Constants & Calculators

**Files:**
- Create: `tools/tax-manager/types.ts`
- Create: `tools/tax-manager/bank-parsers.ts`
- Create: `tools/tax-manager/gst-calculator.ts`
- Create: `tools/tax-manager/tax-calculator.ts`
- Create: `tools/tax-manager/category-rules.ts`

- [ ] **Step 1: Create types and constants**

Core types: `EntityType`, `GstBasis`, `GstPeriod`, `TaxCategory`, `TransactionCategory`, `CategoryConfidence`, `TaxYear`.

Interfaces: `TaxEntity`, `TaxDocument`, `TaxTransaction`, `CategoryRule`, `GstSummary`, `IncomeTaxSummary`.

Constants: `TAX_CATEGORIES` (15 categories with GST/deductible flags), `NZ_TAX_BRACKETS` (individual rates), `COMPANY_TAX_RATE` (28%), `GST_RATE` (15%), `ENTERTAINMENT_DEDUCTION` (50%), `NZ_BANKS` (5 bank format configs).

- [ ] **Step 2: Create bank CSV parsers**

`bank-parsers.ts` exports:
- `detectBank(headers: string[]): string | null` — matches column headers to ANZ/ASB/BNZ/Westpac/Kiwibank
- `parseBankCsv(csv: string, bank?: string): ParsedTransaction[]` — parses CSV text into standard `{ date, description, amount, balance }` format
- Each bank has a parser function mapping its specific columns
- Handles date format differences (DD/MM/YYYY vs YYYY-MM-DD)
- Handles debit/credit split columns (Kiwibank) vs single amount column

- [ ] **Step 3: Create GST calculator**

`gst-calculator.ts` exports:
- `calculateGst(transactions, basis, periodStart, periodEnd): GstSummary`
- GST collected: for income transactions, extract GST = amount × 3/23
- GST on expenses: sum GST from claimable categories
- Entertainment adjustment: 50% of entertainment GST
- Handles invoice vs payments basis (filter by date accordingly)
- Returns all GST101A box values

- [ ] **Step 4: Create income tax calculator**

`tax-calculator.ts` exports:
- `calculateIndividualTax(income): { tax, effectiveRate, brackets }` — NZ progressive brackets
- `calculateCompanyTax(profit): { tax, rate }` — 28% flat
- `calculateAccLevy(income): number` — approximate ACC earners' levy
- `buildIncomeSummary(transactions, entityType, taxYear): IncomeTaxSummary` — total income, expenses by category, net profit, estimated tax

- [ ] **Step 5: Create category rules helper**

`category-rules.ts` exports:
- `applyRules(description: string, rules: CategoryRule[]): string | null` — match transaction description against saved patterns
- `addRule(pattern: string, category: string, rules: CategoryRule[]): CategoryRule[]`
- Pattern matching: case-insensitive substring match

- [ ] **Step 6: Commit**

```bash
git add tools/tax-manager/types.ts tools/tax-manager/bank-parsers.ts tools/tax-manager/gst-calculator.ts tools/tax-manager/tax-calculator.ts tools/tax-manager/category-rules.ts
git commit -m "feat(tax-manager): add types, bank parsers, GST/tax calculators"
```

---

### Task 2: Database Migration & API Routes

**Files:**
- Create: `supabase/migrations/032_tax_manager.sql`
- Create: `app/api/v1/tax-manager/entities/route.ts`
- Create: `app/api/v1/tax-manager/documents/route.ts`
- Create: `app/api/v1/tax-manager/transactions/route.ts`
- Create: `app/api/v1/tax-manager/extract/route.ts`
- Create: `app/api/v1/tax-manager/categorise/route.ts`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/032_tax_manager.sql

CREATE TABLE IF NOT EXISTS public.tax_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  ird_number TEXT,
  gst_registered BOOLEAN DEFAULT false,
  gst_basis TEXT DEFAULT 'invoice',
  gst_period TEXT DEFAULT '2-monthly',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES tax_entities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  bank_name TEXT,
  extracted_data JSONB,
  tax_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES tax_entities(id) ON DELETE CASCADE,
  document_id UUID REFERENCES tax_documents(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  gst_amount DECIMAL,
  category TEXT,
  category_confidence TEXT DEFAULT 'low',
  approved BOOLEAN DEFAULT false,
  tax_year TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_category_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID REFERENCES tax_entities(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_entities_user ON tax_entities (user_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_entity ON tax_documents (entity_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_entity ON tax_transactions (entity_id, tax_year, date);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_approval ON tax_transactions (entity_id, tax_year, approved);
CREATE INDEX IF NOT EXISTS idx_tax_rules_entity ON tax_category_rules (user_id, entity_id);

-- RLS
ALTER TABLE tax_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own entities" ON tax_entities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own documents" ON tax_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own transactions" ON tax_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own rules" ON tax_category_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT ALL ON tax_entities TO authenticated;
GRANT ALL ON tax_documents TO authenticated;
GRANT ALL ON tax_transactions TO authenticated;
GRANT ALL ON tax_category_rules TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

- [ ] **Step 3: Create entities API route**

`entities/route.ts` — GET: list user's entities. POST: create entity (name, type, ird_number, gst settings). PATCH: update entity. Auth required.

- [ ] **Step 4: Create documents API route**

`documents/route.ts` — GET: list documents by entity_id + tax_year. POST: multipart upload to R2 `tax-manager/{userId}/{taxYear}/{filename}`, create DB row. DELETE: remove document + associated transactions. Auth required.

- [ ] **Step 5: Create transactions API route**

`transactions/route.ts` — GET: list by entity_id + tax_year, with optional category/approved filters. POST: bulk insert (from bank statement parse). PATCH: update single transaction (category, approved, notes). DELETE: remove transaction. Auth required.

- [ ] **Step 6: Create extract API route**

`extract/route.ts` — POST: auth + 1 credit. Accepts `{ fileUrl, type }`. For invoices: sends image/PDF to Gemini with extraction prompt, returns structured invoice data. For PDF bank statements: sends to Gemini for transaction extraction.

- [ ] **Step 7: Create categorise API route**

`categorise/route.ts` — POST: auth, free. Accepts `{ transactions: [{ description, amount }], entityId }`. Loads user's category rules first (apply before AI). For unmatched: sends batch to Gemini with category list + NZ tax context. Returns `{ categories: [{ category, confidence }] }`.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/032_tax_manager.sql app/api/v1/tax-manager/
git commit -m "feat(tax-manager): add database migration and all API routes"
```

---

### Task 3: Gemini Extract & Categorise

**Files:**
- Create: `lib/tax-manager/extract-invoice.ts`
- Create: `lib/tax-manager/categorise.ts`

- [ ] **Step 1: Create invoice extraction**

`extract-invoice.ts` exports `extractInvoice(fileUrl: string): Promise<ExtractedInvoice>`

Gemini prompt:
```
Extract invoice/receipt data from this image. Return ONLY valid JSON:
{
  "vendor": "company name",
  "date": "YYYY-MM-DD",
  "totalIncGst": 0.00,
  "gstAmount": 0.00,
  "totalExGst": 0.00,
  "description": "brief description of goods/services",
  "invoiceNumber": "INV-XXX"
}
If GST amount is not shown, calculate it as totalIncGst × 3/23 (NZ 15% GST).
If a field cannot be determined, use null.
```

Sends image as inline data to `gemini-2.5-flash`. Parses JSON response. Returns typed object.

Also exports `extractBankStatementPdf(fileUrl: string): Promise<ParsedTransaction[]>` — similar Gemini call but for PDF bank statements, returns transaction array.

- [ ] **Step 2: Create batch categoriser**

`categorise.ts` exports `categoriseTransactions(descriptions: { description: string; amount: number }[], rules: CategoryRule[]): Promise<{ category: string; confidence: string }[]>`

1. Apply user rules first (exact match returns 'manual' confidence)
2. Remaining uncategorised sent to Gemini in one batch call
3. Gemini prompt includes all 15 categories with descriptions and examples
4. Returns category + confidence per transaction

- [ ] **Step 3: Commit**

```bash
git add lib/tax-manager/extract-invoice.ts lib/tax-manager/categorise.ts
git commit -m "feat(tax-manager): add Gemini invoice extraction and categorisation"
```

---

### Task 4: Settings Panel & Document Upload

**Files:**
- Create: `tools/tax-manager/settings-panel.tsx`
- Create: `tools/tax-manager/document-upload.tsx`

- [ ] **Step 1: Create settings panel**

First-time onboarding + settings editor. Shows when no entity exists.

Form fields:
- Entity name (text input)
- Entity type (Sole Trader / Company radio)
- IRD number (text input, format: XX-XXX-XXX)
- GST registered (yes/no toggle)
- If GST: filing basis (Invoice/Payments radio) + period (1/2/6 monthly select)

Save calls POST `/api/v1/tax-manager/entities`. Edit mode calls PATCH.

Supports multiple entities — entity selector dropdown at top if >1 entity exists.

- [ ] **Step 2: Create document upload**

Two upload zones:
- Bank Statement: accepts .csv + .pdf. CSV parsed client-side via `bank-parsers.ts`. PDF sent to extract API (1 credit). Shows parsed transaction preview before import.
- Invoice/Receipt: accepts .pdf, .png, .jpg, .heic. Sent to extract API (1 credit). Shows extracted data for review before saving.

Upload flow:
1. User selects file → validate type/size
2. CSV: parse immediately, show preview table
3. PDF/image: upload to R2 via documents API, then call extract API
4. User reviews extracted data, clicks "Import"
5. Transactions bulk-inserted via transactions API
6. Trigger categorisation API for new transactions

Duplicate detection: if date + amount + description matches existing transaction, show warning.

- [ ] **Step 3: Commit**

```bash
git add tools/tax-manager/settings-panel.tsx tools/tax-manager/document-upload.tsx
git commit -m "feat(tax-manager): add settings panel and document upload"
```

---

### Task 5: Transaction Table

**Files:**
- Create: `tools/tax-manager/transaction-table.tsx`

- [ ] **Step 1: Create editable transaction table**

Full-width table of all transactions for the selected entity + tax year.

Columns: Date, Description, Amount (positive green, negative red), GST, Category (dropdown), Approved (checkbox), Actions (delete).

Features:
- Sort by any column (click header)
- Filter by category, approved/pending, income/expense
- Category dropdown: 15 categories from `TAX_CATEGORIES`
- Confidence indicator: ✅ high/manual, ⚠️ medium, ❓ low
- Click category to change → saves via PATCH API → if changed from AI suggestion, creates a category rule
- "Approve All" button: bulk-approve all displayed transactions
- "Re-categorise" button: re-runs AI categorisation on pending transactions
- Inline edit for notes field (click to expand)
- Row highlighting: unapproved rows have subtle amber background

Responsive: on mobile, card layout instead of table. Each transaction as a card with category pill.

- [ ] **Step 2: Commit**

```bash
git add tools/tax-manager/transaction-table.tsx
git commit -m "feat(tax-manager): add editable transaction table with categories"
```

---

### Task 6: Summary Cards, GST & Tax Panels

**Files:**
- Create: `tools/tax-manager/period-summary.tsx`
- Create: `tools/tax-manager/gst-summary.tsx`
- Create: `tools/tax-manager/income-tax-summary.tsx`

- [ ] **Step 1: Create period summary**

4 stat cards at the top of the dashboard:
- Total Income (green)
- Total Expenses (red)
- GST Collected
- GST Paid

Plus: "GST Owing: $X" and "Net Profit: $X" below the cards.

All calculated from approved transactions using `gst-calculator.ts` and `tax-calculator.ts`. Updates reactively when transactions change.

- [ ] **Step 2: Create GST summary panel**

Expandable section showing full GST breakdown matching GST101A boxes:
- Box 5: Total sales including GST
- Box 6: Zero-rated supplies
- Box 7: Total GST collected
- Box 8: Adjustments
- Box 9: Total purchases including GST
- Box 11: Total GST on purchases
- Box 12: GST to pay/refund

Period selector: dropdown for the specific GST period within the tax year.
"Generate GST101A" button.

- [ ] **Step 3: Create income tax summary panel**

Full-year income tax view:
- Income summary by category
- Expense summary by category (table with totals)
- Net profit
- For sole trader: tax estimate with bracket breakdown, ACC levy
- For company: 28% flat tax
- Manual entry fields: other income, prior losses, RWT credits, provisional tax paid
- "Generate IR3" or "Generate IR4" button (based on entity type)

- [ ] **Step 4: Commit**

```bash
git add tools/tax-manager/period-summary.tsx tools/tax-manager/gst-summary.tsx tools/tax-manager/income-tax-summary.tsx
git commit -m "feat(tax-manager): add summary cards, GST panel, and income tax panel"
```

---

### Task 7: PDF Form Generator

**Files:**
- Create: `tools/tax-manager/form-generator.tsx`

- [ ] **Step 1: Create form generator**

Uses `jspdf` (already installed) to generate pre-filled IRD forms.

Exports 3 functions:
- `generateGst101A(summary, entity, period): Blob` — GST return PDF
- `generateIR3(taxSummary, entity, year): Blob` — Individual income tax return
- `generateIR4(taxSummary, entity, year): Blob` — Company income tax return

Each form:
- A4 page size, portrait
- Header: form name + IRD logo placeholder + "PRE-FILLED — REVIEW BEFORE FILING"
- Entity details: name, IRD number, period
- Calculated values in labeled boxes matching IRD form layout
- For IR3/IR4: manual-entry fields marked "[ENTER MANUALLY]"
- Expense schedule attachment page (category breakdown table)
- Footer disclaimer: "Generated by Toolk1t Tax Manager. Not professional tax advice."

UI component wrapping these: 3 buttons (GST101A, IR3, IR4) with download flow. Shows a preview modal before download with key numbers for review.

- [ ] **Step 2: Commit**

```bash
git add tools/tax-manager/form-generator.tsx
git commit -m "feat(tax-manager): add PDF form generator for GST101A, IR3, IR4"
```

---

### Task 8: Main Dashboard & Page Route

**Files:**
- Create: `tools/tax-manager/tax-dashboard.tsx`
- Create: `app/tools/tax-manager/page.tsx`

- [ ] **Step 1: Create main dashboard**

'use client' default export composing all sections.

State:
- `selectedEntityId: string | null`
- `selectedTaxYear: string` (default current year e.g. '2025-26')
- `entities: TaxEntity[]`
- `transactions: TaxTransaction[]`
- `documents: TaxDocument[]`
- `categoryRules: CategoryRule[]`
- `loading: boolean`

On mount: fetch entities → if none, show settings panel for setup. If entity exists, fetch transactions + documents for selected entity + year.

Layout (per spec dashboard diagram):
```
Entity selector + Tax year selector (top bar)
PeriodSummary (4 cards)
DocumentUpload (upload zones)
TransactionTable (main content)
GstSummary (expandable)
IncomeTaxSummary (expandable)
FormGenerator (3 buttons)
```

Tax year helper: `getCurrentTaxYear()` returns e.g. '2025-26' if current date is between Apr 2025 and Mar 2026.

- [ ] **Step 2: Create page route**

```tsx
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import TaxDashboard from '@/tools/tax-manager/tax-dashboard'

export const metadata: Metadata = {
  title: 'NZ Tax Manager — GST & Income Tax | Toolk1t',
  description: 'Manage NZ GST returns and income tax. Upload bank statements, AI categorises transactions, generate IRD forms.',
}

export default function TaxManagerPage() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4 bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}>
      <div className="w-full max-w-5xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="NZ Tax Manager" toolSlug="tax-manager" />
        </div>
        <TaxDashboard />
      </div>
    </main>
  )
}
```

Note: uses `max-w-5xl` (wider than the standard `4xl`) because the transaction table needs more room.

- [ ] **Step 3: Commit**

```bash
git add tools/tax-manager/tax-dashboard.tsx app/tools/tax-manager/page.tsx
git commit -m "feat(tax-manager): add main dashboard and page route"
```

---

### Task 9: Tool Registration

**Files:**
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`

- [ ] **Step 1: Add to tools list**

```ts
{
  name: 'NZ Tax Manager',
  href: '/tools/tax-manager',
  description: 'Manage GST returns and income tax for NZ businesses',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  ),
  color: 'from-green-600 to-emerald-500',
}
```

- [ ] **Step 2: Add to bento showcase**

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx
git commit -m "feat(tax-manager): register tool in navigation and homepage"
```
