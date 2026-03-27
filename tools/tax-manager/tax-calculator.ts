import {
  NZ_TAX_BRACKETS,
  COMPANY_TAX_RATE,
  TAX_CATEGORIES,
  type EntityType,
  type IncomeTaxSummary,
  type TaxTransaction,
} from './types'

// ─── Individual Tax (Progressive Brackets) ──────────────────────────

export interface BracketResult {
  bracket: string
  amount: number
  tax: number
}

export interface IndividualTaxResult {
  tax: number
  effectiveRate: number
  brackets: BracketResult[]
}

/**
 * Calculates NZ individual income tax using progressive brackets.
 */
export function calculateIndividualTax(
  taxableIncome: number,
): IndividualTaxResult {
  if (taxableIncome <= 0) {
    return { tax: 0, effectiveRate: 0, brackets: [] }
  }

  const brackets: BracketResult[] = []
  let totalTax = 0
  let remaining = taxableIncome

  for (const { min, max, rate } of NZ_TAX_BRACKETS) {
    if (remaining <= 0) break

    const bracketSize = max === Infinity ? remaining : max - min + 1
    const taxableInBracket = Math.min(remaining, bracketSize)
    const tax = taxableInBracket * rate

    brackets.push({
      bracket: max === Infinity ? `$${fmtNum(min)}+` : `$${fmtNum(min)}–$${fmtNum(max)}`,
      amount: round2(taxableInBracket),
      tax: round2(tax),
    })

    totalTax += tax
    remaining -= taxableInBracket
  }

  return {
    tax: round2(totalTax),
    effectiveRate: round2((totalTax / taxableIncome) * 100) / 100,
    brackets,
  }
}

// ─── Company Tax (Flat Rate) ────────────────────────────────────────

export interface CompanyTaxResult {
  tax: number
  rate: number
}

/**
 * Calculates NZ company tax at the flat 28% rate.
 */
export function calculateCompanyTax(netProfit: number): CompanyTaxResult {
  if (netProfit <= 0) return { tax: 0, rate: COMPANY_TAX_RATE }
  return {
    tax: round2(netProfit * COMPANY_TAX_RATE),
    rate: COMPANY_TAX_RATE,
  }
}

// ─── Income Summary Builder ─────────────────────────────────────────

/**
 * Aggregates approved transactions into an income/expense summary for
 * a given tax year and calculates estimated tax.
 */
export function buildIncomeSummary(
  transactions: TaxTransaction[],
  entityType: EntityType,
  taxYear: string,
): IncomeTaxSummary {
  let totalIncome = 0
  let totalExpenses = 0
  const expensesByCategory: Record<string, number> = {}

  // Filter to the specified tax year and approved only
  const filtered = transactions.filter(
    (tx) => tx.tax_year === taxYear && tx.approved,
  )

  for (const tx of filtered) {
    if (tx.amount > 0) {
      totalIncome += tx.amount
    } else {
      const catId = tx.category ?? 'uncategorised'

      // Skip non-deductible categories
      const catDef = TAX_CATEGORIES.find((c) => c.id === catId)
      if (catDef && catDef.taxDeductible === false) continue

      const absAmount = Math.abs(tx.amount)
      // Entertainment: only 50% deductible
      const deductible =
        catDef?.taxDeductible === '50%' ? absAmount * 0.5 : absAmount

      expensesByCategory[catId] = (expensesByCategory[catId] ?? 0) + deductible
      totalExpenses += deductible
    }
  }

  const netProfit = totalIncome - totalExpenses

  let estimatedTax: number
  let effectiveRate: number

  if (entityType === 'company') {
    const result = calculateCompanyTax(netProfit)
    estimatedTax = result.tax
    effectiveRate = netProfit > 0 ? result.rate : 0
  } else {
    const result = calculateIndividualTax(netProfit)
    estimatedTax = result.tax
    effectiveRate = result.effectiveRate
  }

  return {
    totalIncome: round2(totalIncome),
    expensesByCategory,
    totalExpenses: round2(totalExpenses),
    netProfit: round2(netProfit),
    estimatedTax,
    effectiveRate,
    entityType,
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-NZ')
}
