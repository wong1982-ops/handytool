// ─── NZ Tax Manager — Types & Constants ─────────────────────────────

// ─── Enums / Union Types ────────────────────────────────────────────

export type EntityType = 'sole-trader' | 'company'
export type GstBasis = 'invoice' | 'payments'
export type GstPeriod = '1-monthly' | '2-monthly' | '6-monthly'
export type CategoryConfidence = 'high' | 'medium' | 'low' | 'manual'

// ─── Tax Category ───────────────────────────────────────────────────

export interface TaxCategory {
  id: string
  label: string
  gstClaimable: boolean | '50%'
  taxDeductible: boolean | '50%'
}

export const TAX_CATEGORIES: TaxCategory[] = [
  { id: 'sales-income', label: 'Sales / Income', gstClaimable: false, taxDeductible: false },
  { id: 'cost-of-goods', label: 'Cost of Goods Sold', gstClaimable: true, taxDeductible: true },
  { id: 'contractor', label: 'Contractor / Subcontractor', gstClaimable: true, taxDeductible: true },
  { id: 'software', label: 'Software / SaaS', gstClaimable: true, taxDeductible: true },
  { id: 'office', label: 'Office Supplies', gstClaimable: true, taxDeductible: true },
  { id: 'travel', label: 'Travel', gstClaimable: true, taxDeductible: true },
  { id: 'phone', label: 'Phone / Internet', gstClaimable: true, taxDeductible: true },
  { id: 'rent', label: 'Rent / Premises', gstClaimable: true, taxDeductible: true },
  { id: 'insurance', label: 'Insurance', gstClaimable: true, taxDeductible: true },
  { id: 'bank-fees', label: 'Bank Fees', gstClaimable: false, taxDeductible: true },
  { id: 'professional', label: 'Professional Services', gstClaimable: true, taxDeductible: true },
  { id: 'marketing', label: 'Marketing / Advertising', gstClaimable: true, taxDeductible: true },
  { id: 'entertainment', label: 'Entertainment', gstClaimable: '50%', taxDeductible: '50%' },
  { id: 'personal', label: 'Personal / Non-deductible', gstClaimable: false, taxDeductible: false },
  { id: 'transfer', label: 'Transfer / Ignore', gstClaimable: false, taxDeductible: false },
]

// ─── DB Schema Interfaces ───────────────────────────────────────────

export interface TaxEntity {
  id: string
  user_id: string
  name: string
  type: EntityType
  ird_number: string | null
  gst_registered: boolean
  gst_basis: GstBasis
  gst_period: GstPeriod
  created_at: string
}

export interface TaxDocument {
  id: string
  user_id: string
  entity_id: string
  type: 'bank-statement' | 'invoice' | 'receipt'
  file_url: string
  file_name: string
  bank_name: string | null
  extracted_data: unknown
  tax_year: string
  created_at: string
}

export interface TaxTransaction {
  id: string
  user_id: string
  entity_id: string
  document_id: string | null
  date: string
  description: string
  amount: number
  gst_amount: number | null
  category: string | null
  category_confidence: CategoryConfidence
  approved: boolean
  tax_year: string
  notes: string | null
  created_at: string
}

export interface CategoryRule {
  id: string
  user_id: string
  entity_id: string | null
  pattern: string
  category: string
  created_at: string
}

// ─── Calculation Result Interfaces ──────────────────────────────────

export interface GstSummary {
  totalSalesIncGst: number
  gstOnSales: number
  totalPurchasesIncGst: number
  gstOnPurchases: number
  entertainmentAdj: number
  gstToPay: number
  periodStart: string
  periodEnd: string
}

export interface IncomeTaxSummary {
  totalIncome: number
  expensesByCategory: Record<string, number>
  totalExpenses: number
  netProfit: number
  estimatedTax: number
  effectiveRate: number
  entityType: EntityType
}

// ─── Parsed Data Interfaces ─────────────────────────────────────────

export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  balance?: number
}

export interface ExtractedInvoice {
  vendor: string | null
  date: string | null
  totalIncGst: number | null
  gstAmount: number | null
  totalExGst: number | null
  description: string | null
  invoiceNumber: string | null
}

// ─── NZ Tax Constants ───────────────────────────────────────────────

export const GST_RATE = 0.15
export const GST_FRACTION = 3 / 23
export const COMPANY_TAX_RATE = 0.28
export const ENTERTAINMENT_DEDUCTION = 0.5

export interface TaxBracket {
  min: number
  max: number
  rate: number
}

export const NZ_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 14_000, rate: 0.105 },
  { min: 14_001, max: 48_000, rate: 0.175 },
  { min: 48_001, max: 70_000, rate: 0.30 },
  { min: 70_001, max: 180_000, rate: 0.33 },
  { min: 180_001, max: Infinity, rate: 0.39 },
]

// ─── NZ Bank Formats ────────────────────────────────────────────────

export interface BankFormat {
  id: string
  name: string
  detectHeaders: string[]
  columnMap: {
    date: number
    description: number
    amount?: number
    debit?: number
    credit?: number
    balance?: number
  }
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'YYYY/MM/DD'
}

export const NZ_BANKS: BankFormat[] = [
  {
    id: 'anz',
    name: 'ANZ',
    detectHeaders: ['Type', 'Details', 'Particulars', 'Code', 'Reference', 'Amount', 'Date', 'ForeignCurrencyAmount', 'ConversionCharge'],
    columnMap: { date: 6, description: 1, amount: 5, balance: undefined },
    dateFormat: 'DD/MM/YYYY',
  },
  {
    id: 'asb',
    name: 'ASB',
    detectHeaders: ['Date', 'Unique Id', 'Tran Type', 'Cheque Number', 'Payee', 'Memo', 'Amount'],
    columnMap: { date: 0, description: 4, amount: 6, balance: undefined },
    dateFormat: 'YYYY-MM-DD',
  },
  {
    id: 'asb-visa',
    name: 'ASB Visa/Credit Card',
    detectHeaders: ['Date Processed', 'Date of Transaction', 'Unique Id', 'Tran Type', 'Reference', 'Description', 'Amount'],
    columnMap: { date: 1, description: 5, amount: 6, balance: undefined },
    dateFormat: 'YYYY/MM/DD',
  },
  {
    id: 'bnz',
    name: 'BNZ',
    detectHeaders: ['Date', 'Amount', 'Payee', 'Particulars', 'Code', 'Reference', 'Tran Type', 'This Party Account', 'Other Party Account'],
    columnMap: { date: 0, description: 2, amount: 1, balance: undefined },
    dateFormat: 'DD/MM/YYYY',
  },
  {
    id: 'westpac',
    name: 'Westpac',
    detectHeaders: ['Date', 'Amount', 'Other Party', 'Description', 'Reference', 'Particulars', 'Analysis Code'],
    columnMap: { date: 0, description: 2, amount: 1, balance: undefined },
    dateFormat: 'DD/MM/YYYY',
  },
  {
    id: 'kiwibank',
    name: 'Kiwibank',
    detectHeaders: ['Account number', 'Date', 'Memo/Description', 'Source Code(s)', 'TP ref', 'TP part', 'TP code', 'OP ref', 'OP part', 'OP code', 'OP name', 'OP Bank Account Number', 'Debit', 'Credit', 'Balance'],
    columnMap: { date: 1, description: 2, debit: 12, credit: 13, balance: 14 },
    dateFormat: 'DD/MM/YYYY',
  },
]

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Returns the NZ tax year string (Apr-Mar) for the current date.
 * e.g. if today is between 1 Apr 2025 and 31 Mar 2026 → '2025-26'
 */
export function getCurrentTaxYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed, so March = 2

  // If Jan–Mar, the tax year started in the previous calendar year
  if (month < 3) {
    return `${year - 1}-${String(year).slice(2)}`
  }
  return `${year}-${String(year + 1).slice(2)}`
}
