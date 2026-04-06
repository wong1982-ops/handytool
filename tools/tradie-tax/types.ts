export type TaxCategory =
  | 'vehicle'
  | 'tools'
  | 'materials'
  | 'subcontractors'
  | 'insurance'
  | 'phone-internet'
  | 'accounting'
  | 'ppe'
  | 'travel'
  | 'other-deduction'
  | 'income'

export interface ExpenseEntry {
  id: string
  date: string
  description: string
  amount: number // NZD
  category: TaxCategory
  type: 'income' | 'expense'
  gstInclusive: boolean
  created_at?: string
}

export interface TaxBracket {
  min: number
  max: number | null
  rate: number
  label: string
}

export interface TaxBracketBreakdown {
  bracket: TaxBracket
  taxableInBracket: number
  taxInBracket: number
}

export interface TaxEstimate {
  taxableIncome: number
  bracketBreakdown: TaxBracketBreakdown[]
  totalIncomeTax: number
  accLevy: number
  provisionalTax: number
  totalTaxOwed: number
}
