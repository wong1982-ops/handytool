# Invoice Generator — Stitch Prompts

## Main Prompt

Create a professional invoice generator web tool with a dark theme studio layout. The page has a sticky header with breadcrumbs (Home > Tools > Invoice Generator), a dark mode toggle, and a Sign In button.

The main area is split into two panels:
- **Left panel (45%)**: Edit panel with 4 tabs — Details, Line Items, Styling, Settings
- **Right panel (55%)**: Live A4 invoice preview on a white page with zoom controls (50%, 75%, 100%)

**Color palette:**
- Page background: #090f16
- Card background: #131a23
- Border: #1e2631
- Primary blue: #3D6AF2
- Accent teal: #32A9D9
- Text primary: #ffffff
- Text secondary: #a6abb5
- Text muted: #70767f

**Bottom action bar** (sticky): "Save Template" button (outline), "Save Invoice" button (outline), "Download PDF" button (gradient blue, primary action). Left side shows "Auto-saved locally" status.

Use Google Material Symbols Outlined icons. System font stack. All inputs have dark backgrounds (#090f16), rounded corners, 44px minimum height for touch targets. Cards use #131a23 with rounded-xl corners.

---

## Screen 1: Details Tab

The Details tab has 3 sections in cards:

**From (Your Business):**
- Logo upload zone (dashed border, drag-and-drop, shows icon + "Drop logo here or click to upload" + "JPG, PNG — max 500KB")
- Fields: Business name, Email, Phone, Address line 1, Address line 2, City/State/ZIP (3-column grid), Country dropdown, Tax ID/GST/ABN
- Pre-filled with sample data: "Mercury Digital Ltd", Auckland address

**Bill To (Client):**
- Same fields as sender (no logo)
- Pre-filled: "Acme Corporation", San Francisco address

**Invoice Details:**
- Invoice Number + Reference/PO# (2-column)
- Issue Date + Due Date (2-column, date inputs)
- Payment Terms dropdown (Net 7/14/30/60/90/Custom)

---

## Screen 2: Line Items Tab

Shows line item cards, each with:
- Drag handle icon on the left
- Description input (full width)
- Qty / Rate / Currency row (3-column grid, currency is a dropdown: USD, NZD, EUR, AUD, GBP)
- Tax / Discount row (2-column, Tax dropdown from presets, Discount dropdown)
- Bottom row: red "Remove" link on left, subtotal amount on right

Show 3 sample items:
1. "Website redesign" — 1x $4,500 USD, GST 15%, no discount
2. "SEO audit & optimization" — 8x $150 USD, GST 15%, 10% discount
3. "Hosting — 12 months" — 12x €29.99 EUR, VAT 20%, no discount

Below items: dashed "Add Line Item" button.

**Summary card** at bottom:
- Grouped by currency (USD section, EUR section)
- Each group: Subtotal, Tax lines, Discount lines, bold Total with gradient text
- Currency group headers in teal accent color

---

## Screen 3: Styling Tab

**Template Picker:** 3 thumbnail cards in a row (Classic, Modern, Minimal) with A4 aspect ratio previews. Active one has blue border.

**Logo Position:** 3 toggle buttons (Top Left, Top Center, Top Right)

**Colors card:**
- 4 rows: Primary, Accent, Text, Background — each with color swatch + hex input
- Presets row: 5 gradient swatches (Blue, Teal, Red, Dark, Mono)

**Typography card:**
- Font Family dropdown (System Sans, Serif, Monospace)
- Font Size: 3 toggle buttons (Small, Medium, Large)

**Custom Labels card:**
- 2-column grid of small inputs: Invoice, From, Bill To, Date, Due Date, Description, Qty, Rate, Amount, Total, Subtotal, Notes
- "Reset to English" link in section header

---

## Screen 4: Settings Tab

**Defaults card:**
- Default Currency dropdown
- Invoice # Prefix + Next Number (2-column)
- Auto-increment toggle switch (blue when on)

**Tax Presets card:**
- List of presets: "GST 15%", "VAT 20%" — each row with edit/delete icons
- Dashed "Add tax preset" button

**Default Notes card:**
- Textarea with sample: "Payment via bank transfer..."

**Saved Templates card** (with "Sign in required" badge):
- 3 sample templates: "Freelance — NZD", "Company — USD", "EU Client — EUR"
- Each row: name, "Updated X ago", Load link, delete icon
- "Save Current as Template" gradient button at bottom

**Invoice History card** (with "Sign in required" badge):
- 2 sample entries with invoice number (monospace), client name, date, total
- Action icons: View, Duplicate, Download, Delete

---

## Screen 5: Live Preview (Right Panel)

White A4-ratio page showing the classic invoice template:

**Header:** "INVOICE" in blue (#3D6AF2) bold, with invoice number, dates, and reference below. Logo placeholder top-right.

**From/To section:** 2-column grid with sender and client details in small text.

**Line items table:** Clean table with blue top border, columns: Description, Qty, Rate, Amount. 3 rows of sample data.

**Totals:** Right-aligned, grouped by currency (USD and EUR sections). Each with subtotal, tax, discount, bold total in blue.

**Notes footer:** Separated by light gray border, small text with payment instructions.
