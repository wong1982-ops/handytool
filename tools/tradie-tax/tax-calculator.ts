import { NZ_TAX_BRACKETS, ACC_EARNER_LEVY_RATE, GST_RATE } from './tax-data'
import type { TaxBracketBreakdown, TaxEstimate } from './types'

/**
 * Calculate NZ income tax with bracket breakdown.
 */
export function calculateIncomeTax(taxableIncome: number): {
  breakdown: TaxBracketBreakdown[]
  total: number
} {
  const income = Math.max(0, taxableIncome)
  const breakdown: TaxBracketBreakdown[] = []
  let remaining = income

  for (const bracket of NZ_TAX_BRACKETS) {
    if (remaining <= 0) {
      breakdown.push({ bracket, taxableInBracket: 0, taxInBracket: 0 })
      continue
    }
    const bracketWidth = bracket.max !== null ? bracket.max - bracket.min : Infinity
    const taxableInBracket = Math.min(remaining, bracketWidth)
    const taxInBracket = taxableInBracket * bracket.rate
    breakdown.push({ bracket, taxableInBracket, taxInBracket })
    remaining -= taxableInBracket
  }

  const total = breakdown.reduce((sum, b) => sum + b.taxInBracket, 0)
  return { breakdown, total }
}

/**
 * Calculate provisional tax using the standard uplift method.
 * Standard = prior year tax * 105% / 3 instalments (or total * 105%).
 */
export function calculateProvisionalTax(
  totalTax: number,
  method: 'standard' | 'estimation' | 'ratio' = 'standard',
): number {
  switch (method) {
    case 'standard':
      return totalTax * 1.05
    case 'estimation':
      return totalTax // self-assessed
    case 'ratio':
      return totalTax // ratio uses GST turnover — simplified here
    default:
      return totalTax * 1.05
  }
}

/**
 * Calculate ACC earner levy.
 */
export function calculateAccLevy(earnings: number): number {
  return Math.max(0, earnings) * ACC_EARNER_LEVY_RATE
}

/**
 * Convert GST-inclusive amount to GST-exclusive.
 */
export function gstExclusive(inclusive: number): number {
  return inclusive / (1 + GST_RATE)
}

/**
 * Convert GST-exclusive amount to GST-inclusive.
 */
export function gstInclusive(exclusive: number): number {
  return exclusive * (1 + GST_RATE)
}

/**
 * Get the GST component from a GST-inclusive amount.
 */
export function gstAmount(inclusive: number): number {
  return inclusive - gstExclusive(inclusive)
}

/**
 * Full tax estimate from income and expenses.
 */
export function estimateTax(totalIncome: number, totalExpenses: number): TaxEstimate {
  const taxableIncome = Math.max(0, totalIncome - totalExpenses)
  const { breakdown, total: totalIncomeTax } = calculateIncomeTax(taxableIncome)
  const accLevy = calculateAccLevy(taxableIncome)
  const provisionalTax = calculateProvisionalTax(totalIncomeTax)

  return {
    taxableIncome,
    bracketBreakdown: breakdown,
    totalIncomeTax,
    accLevy,
    provisionalTax,
    totalTaxOwed: totalIncomeTax + accLevy,
  }
}
