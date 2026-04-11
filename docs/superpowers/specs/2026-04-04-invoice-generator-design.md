# Invoice Generator — Design Specification

**Date:** 2026-04-04
**Status:** APPROVED (brainstorming complete)
**Tool route:** `app/tools/invoice-generator/page.tsx`
**Components:** `tools/invoice-generator/`

---

## Understanding Summary

- **What:** A free invoice generator tool with advanced visual customization, reusable template saving, and invoice history
- **Why:** Give users a fast, no-signup-required invoice tool that becomes more powerful when logged in — drives account creation organically
- **Who:** Freelancers, small business owners, contractors who need professional invoices quickly
- **Key constraints:** Client-side PDF for anonymous users, server-side for logged-in; localStorage caching for all users + Supabase persistence for logged-in; unlimited saved templates
- **Key features:** Multi-currency line items, multiple tax lines, discounts, fully customizable labels, 3 visual layout templates, logo upload, color/font theming, invoice history for logged-in users
- **Non-goals:** Not a full accounting system — no payment tracking, no recurring invoice scheduling, no client management CRM
- **Reference:** https://wise.com/us/invoice-generator/ (simpler version of what we're building)

---

## Architecture: Studio Layout

Single-page studio with a **left panel for editing** (45%) and a **right panel for live preview** (55%). Follows the same architecture as the resume builder (`tools/resume/`).

### Desktop Layout

```
+--------------------------------------------------+
|  ToolBreadcrumb: Home > Tools > Invoice Generator |
+------------------------+-------------------------+
|   EDIT PANEL (45%)     |   PREVIEW PANEL (55%)   |
|                        |                         |
|  +----------------+    |   +------------------+  |
|  | Tabs:          |    |   |                  |  |
|  | Details        |    |   |  Live invoice    |  |
|  | Line Items     |    |   |  preview         |  |
|  | Styling        |    |   |  (A4 aspect)     |  |
|  | Settings       |    |   |                  |  |
|  +----------------+    |   |                  |  |
|                        |   +------------------+  |
|  [form fields for      |                         |
|   active tab]          |   Zoom: 50% 75% 100%    |
|                        |                         |
+------------------------+-------------------------+
|  [Save Template] [Save Invoice] [Download PDF]   |
+--------------------------------------------------+
```

### Mobile Layout

- Stacked: Edit panel on top, preview collapsed behind a "Preview" toggle button
- Sticky bottom bar with action buttons
- Tabs become a horizontal scrollable strip

---

## Tab Breakdown

### Details Tab

**Sender Info:**
- Logo upload (drag-and-drop or click, JPG/PNG, max 500KB, stored as base64)
- Business name, email, phone
- Address (line 1, line 2, city, state, zip, country dropdown)
- Tax ID / ABN

**Client Info:**
- Same fields as sender (minus logo)

**Invoice Info:**
- Invoice number (auto-increments for logged-in users, editable)
- Issue date (defaults to today)
- Due date (auto-calculated from payment terms)
- Payment terms dropdown: Net 7 / 14 / 30 / 60 / 90 / Custom
- Reference / PO number

### Line Items Tab

Each line item row:
- Description (text)
- Quantity (number)
- Rate (number)
- Currency (ISO 4217 dropdown, defaults to defaultCurrency)
- Tax (dropdown from presets in Settings, or "Custom %" inline)
- Discount (none / percent / fixed amount)
- Subtotal (calculated)
- Remove button

Features:
- Drag handle for reordering
- [+ Add Line Item] button
- Summary section: subtotals grouped by currency, tax breakdowns per currency, discount totals, grand totals per currency
- Single-currency invoices show one clean total (no grouping headers)

Mobile: Each line item renders as a stacked card.

### Styling Tab

**Template Picker:**
- 3 built-in layouts: Classic, Modern, Minimal
- Thumbnail previews with current colors applied

**Logo:**
- Upload zone (shared with Details tab — same logo)
- Position: Top-left / Top-right / Top-center

**Colors:**
- Primary color (default: #3D6AF2)
- Accent color (default: #32A9D9)
- Text color (default: #1a1a1a)
- Background color (default: #ffffff)
- Color picker + hex input for each
- Presets: Blue, Teal, Red, Dark, Mono

**Typography:**
- Font family: System Sans / Serif / Mono
- Font size: Small / Medium / Large

**Custom Labels:**
All field labels editable, defaulting to English:
- Invoice, Bill To, From, Date, Due Date, Description, Qty, Rate, Amount, Subtotal, Tax, Discount, Total, Notes
- [Reset to English defaults] button

### Settings Tab

**Defaults:**
- Default currency (ISO 4217 dropdown)
- Invoice number prefix (e.g., "INV-")
- Next invoice number (e.g., "0001")
- Auto-increment toggle (logged-in only)

**Tax Presets:**
- List of saved presets (name + rate)
- Add / edit / delete
- Referenced by line items via ID

**Notes / Footer:**
- Default notes textarea (appears on every invoice)

**Template Management (logged-in):**
- [Save Current as Template] with name input
- Saves: sender info, logo, styling, labels, tax presets, defaults, notes
- Does NOT save: client info, line items, dates
- Saved templates list with Load / Delete actions
- Anonymous users: localStorage-only with "Sign in to save permanently" banner

**Invoice History (logged-in):**
- List: invoice number, client name, total, date
- Actions: View (read-only in editor), Duplicate (clone + bump number + clear dates), Download (re-generate PDF), Delete

---

## Data Model

### Core Types (invoice-types.ts)

```typescript
interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  currency: string
  taxPresetId: string | null
  discountType: 'none' | 'percent' | 'fixed'
  discountValue: number
}

interface TaxPreset {
  id: string
  name: string
  rate: number              // 0.10 = 10%
}

type InvoiceTemplateId = 'classic' | 'modern' | 'minimal'
type FontFamily = 'system' | 'serif' | 'mono'
type FontSize = 'sm' | 'md' | 'lg'
type LogoPosition = 'top-left' | 'top-right' | 'top-center'

interface InvoiceTheme {
  templateId: InvoiceTemplateId
  primaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  fontFamily: FontFamily
  fontSize: FontSize
  logoPosition: LogoPosition
}

interface InvoiceLabels {
  invoice: string
  billTo: string
  from: string
  date: string
  dueDate: string
  description: string
  qty: string
  rate: string
  amount: string
  subtotal: string
  tax: string
  discount: string
  total: string
  notes: string
}

interface ContactInfo {
  name: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  taxId: string
}

interface InvoiceState {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  paymentTerms: 'net7' | 'net14' | 'net30' | 'net60' | 'net90' | 'custom'
  reference: string
  sender: ContactInfo
  client: ContactInfo
  logo: string
  lineItems: LineItem[]
  taxPresets: TaxPreset[]
  defaultCurrency: string
  notes: string
  theme: InvoiceTheme
  labels: InvoiceLabels
  createdAt: string
  updatedAt: string
}

interface InvoiceTemplate {
  id: string
  name: string
  sender: ContactInfo
  logo: string
  taxPresets: TaxPreset[]
  defaultCurrency: string
  notes: string
  theme: InvoiceTheme
  labels: InvoiceLabels
  invoicePrefix: string
  createdAt: string
  updatedAt: string
}
```

### Storage Strategy

| Data | Anonymous | Logged-in |
|---|---|---|
| Current invoice draft | localStorage `invoice_draft` | localStorage (cache) + Supabase `invoices` table |
| Templates | localStorage `invoice_templates_[]` | localStorage (cache) + Supabase `invoice_templates` table |
| Invoice history | Not available | Supabase `invoices` table (status: 'saved') |
| Logo | base64 in state | base64 in localStorage, Supabase Storage for saved |
| Invoice number sequence | Manual only | Supabase `invoice_sequences` table |

### Supabase Tables

```sql
invoice_templates    (id, user_id, name, data JSONB, created_at, updated_at)
invoices             (id, user_id, invoice_number, client_name, total_summary JSONB, data JSONB, pdf_url, created_at)
invoice_sequences    (user_id PK, prefix TEXT, next_number INT)
```

---

## PDF Generation

| User | Method | Library |
|---|---|---|
| Anonymous | Client-side | `html2canvas` + `jsPDF` — renders preview DOM to canvas, then to PDF |
| Logged-in | Server-side | API route using `puppeteer` or `@react-pdf/renderer` — pixel-perfect A4 |

**Client-side flow:**
1. Capture preview panel DOM at 2x resolution
2. Convert canvas to PDF with A4 dimensions
3. Trigger browser download

**Server-side flow:**
1. POST `/api/v1/invoice/generate-pdf` with `InvoiceState`
2. API renders the invoice theme component in headless browser (or react-pdf)
3. Returns PDF blob, client downloads
4. Optionally stores PDF URL in Supabase Storage for history

---

## Component Architecture

```
app/tools/invoice-generator/
  page.tsx                      # Route entry, metadata, SEO
  layout.tsx                    # Tool layout wrapper

tools/invoice-generator/
  invoice-types.ts              # All interfaces
  invoice-defaults.ts           # Default labels, empty state factory
  invoice-provider.tsx          # Context, useReducer, localStorage, cloud sync
  invoice-reducer.ts            # All actions (UPDATE_SENDER, ADD_LINE_ITEM, etc.)
  invoice-editor.tsx            # Main studio layout (left panel + right preview)
  invoice-preview.tsx           # Preview wrapper (zoom, A4 frame)

  editors/
    sender-editor.tsx           # Sender info form
    client-editor.tsx           # Client info form
    invoice-info-editor.tsx     # Invoice #, dates, payment terms
    line-items-editor.tsx       # Line item rows + summary
    styling-editor.tsx          # Template picker, colors, fonts, labels
    settings-editor.tsx         # Defaults, tax presets, notes

  themes/
    classic-invoice.tsx         # Clean, traditional layout
    modern-invoice.tsx          # Bold headers, accent sidebar
    minimal-invoice.tsx         # Whitespace-forward, light lines

  panels/
    template-panel.tsx          # Save/load/delete templates
    history-panel.tsx           # Invoice history list (logged-in)

  shared/
    contact-form.tsx            # Reusable contact info form (sender & client)
    currency-select.tsx         # Currency dropdown (ISO 4217)
    tax-preset-select.tsx       # Tax dropdown with "Custom %" option
    discount-input.tsx          # Percent/fixed toggle + value
    pdf-export.ts               # Client-side PDF generation helpers
```

---

## Action Bar (Bottom Sticky)

```
[Preview toggle]  [Save Template]  [Save Invoice]  [Download PDF]
  (mobile only)    (logged-in)      (logged-in)     (always)
```

- Anonymous: only "Download PDF" active; others show sign-in tooltip
- Logged-in: all buttons active
- Mobile "Preview" toggle switches between edit and preview panels

---

## Edge Cases & Error Handling

### Input Validation
- Empty invoice: Download disabled until >= 1 line item with description + rate > 0
- Logo too large: Reject > 500KB with inline error
- Invalid tax rate: Clamp 0-100%, warning if > 50%
- Missing dates: Default issue date = today, due date = today + 14
- Long text: Truncate with ellipsis in preview, word-wrap in PDF

### Multi-Currency
- Totals grouped by currency, never mixed
- Single-currency invoices show one clean total
- Empty currency defaults to defaultCurrency

### Storage
- localStorage full: Catch QuotaExceededError, show sign-in banner
- Cloud save failure: Retry once, then "Saved locally, cloud sync failed" + manual retry
- Conflict: Cloud is source of truth on login; localStorage draft preserved as unsaved
- Corrupt localStorage: try/catch all reads, fall back to empty state

### Templates
- Deleted tax preset referenced by line items: fall back to "No tax" + info toast
- Load template over unsaved work: confirm dialog
- Duplicate template names: allowed (distinguished by ID)

### PDF
- Client-side fails: "Try again" button + Print fallback suggestion
- 50+ line items: multi-page with repeated header/footer
- Logo: base64 embeds in both client and server paths

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Studio layout (edit + live preview) | Wizard flow, direct-on-document | Matches resume builder pattern, supports complex fields, live feedback |
| 2 | Full template profiles (styling + sender + defaults + tax + notes) | Style-only, style + sender | Maximum reuse for repeat invoicing |
| 3 | Advanced customization (colors, fonts, 3 layouts, custom labels) | Minimal, moderate | Differentiator vs Wise; multilingual without i18n complexity |
| 4 | Multi-currency per line item, grouped totals | Single currency, currency conversion | Honest totals without exchange rate liability |
| 5 | Client-side PDF anonymous, server-side logged-in | All client, all server | Zero-friction anonymous UX + quality for committed users |
| 6 | Unlimited templates and history | Capped at 3/10 | Free tool philosophy, no artificial limits |
| 7 | localStorage for all + Supabase for logged-in | Supabase only, localStorage only | Speed + offline for everyone, persistence for accounts |
| 8 | Reuse resume builder architecture | From scratch, form library | Proven pattern, consistent DX, faster to implement |
| 9 | Auto-incrementing invoice numbers (logged-in) | Manual only | Key convenience for repeat invoicers |
| 10 | No cross-currency conversion | Auto-convert via rates | Avoids stale rate liability, keeps tool honest |

---

## Assumptions

1. Logo stored as base64 in localStorage / Supabase Storage (not separate CDN)
2. Multi-currency means each line item picks its own currency; totals grouped, never converted
3. Invoice history stores complete data snapshot + PDF reference, not live editable
4. 3 built-in visual templates (classic, modern, minimal); users customize on top
5. No email sending — user downloads PDF and sends manually
6. Custom labels = all field labels are editable text, defaulting to English
7. Anonymous users get full generator features; login gates: template saving, history, server PDF
8. Invoice history: unlimited
9. Auto-incrementing invoice numbers: ticks up on save, not on page load
