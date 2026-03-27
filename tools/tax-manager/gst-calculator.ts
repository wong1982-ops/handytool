import {
  GST_FRACTION,
  ENTERTAINMENT_DEDUCTION,
  TAX_CATEGORIES,
  type GstBasis,
  type GstSummary,
  type TaxTransaction,
} from './types'

// ─── Helpers ────────────────────────────────────────────────────────

function getCategoryById(id: string) {
  return TAX_CATEGORIES.find((c) => c.id === id)
}

function isInPeriod(dateStr: string, start: string, end: string): boolean {
  const d = dateStr.slice(0, 10) // YYYY-MM-DD
  return d >= start && d <= end
}

// ─── GST Calculator ─────────────────────────────────────────────────

/**
 * Calculates GST summary for a period matching GST101A boxes.
 *
 * - `basis` controls which date is used ('invoice' = transaction date,
 *   'payments' = transaction date — both use the date field currently).
 * - Only approved transactions are included.
 * - Income (amount > 0): GST collected = amount x 3/23
 * - Expenses: GST claimable depends on the category's gstClaimable flag.
 *   '50%' (entertainment) claims half.
 */
export function calculateGst(
  transactions: TaxTransaction[],
  _basis: GstBasis,
  periodStart: string,
  periodEnd: string,
): GstSummary {
  let totalSalesIncGst = 0
  let gstOnSales = 0
  let totalPurchasesIncGst = 0
  let gstOnPurchases = 0
  let entertainmentAdj = 0

  for (const tx of transactions) {
    // Only approved transactions
    if (!tx.approved) continue

    // Filter by period
    if (!isInPeriod(tx.date, periodStart, periodEnd)) continue

    if (tx.amount > 0) {
      // Income — GST collected
      totalSalesIncGst += tx.amount
      gstOnSales += tx.amount * GST_FRACTION
    } else {
      // Expense
      const absAmount = Math.abs(tx.amount)
      totalPurchasesIncGst += absAmount

      const category = tx.category ? getCategoryById(tx.category) : null
      if (!category) continue

      if (category.gstClaimable === true) {
        gstOnPurchases += absAmount * GST_FRACTION
      } else if (category.gstClaimable === '50%') {
        const fullGst = absAmount * GST_FRACTION
        const claimable = fullGst * ENTERTAINMENT_DEDUCTION
        gstOnPurchases += claimable
        entertainmentAdj += fullGst - claimable
      }
      // false → no GST claim
    }
  }

  const gstToPay = gstOnSales - gstOnPurchases

  return {
    totalSalesIncGst: round2(totalSalesIncGst),
    gstOnSales: round2(gstOnSales),
    totalPurchasesIncGst: round2(totalPurchasesIncGst),
    gstOnPurchases: round2(gstOnPurchases),
    entertainmentAdj: round2(entertainmentAdj),
    gstToPay: round2(gstToPay),
    periodStart,
    periodEnd,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
