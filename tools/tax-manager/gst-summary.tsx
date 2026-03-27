'use client'

import { useMemo, useState } from 'react'
import { calculateGst } from './gst-calculator'
import type { GstSummary, TaxEntity, TaxTransaction } from './types'

interface GstSummaryPanelProps {
  transactions: TaxTransaction[]
  entity: TaxEntity
  onGenerateForm: (summary: GstSummary) => void
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Generates GST period options based on entity's filing frequency and tax year.
 * Tax year runs Apr-Mar. Periods are sliced accordingly.
 */
function getGstPeriods(entity: TaxEntity, taxYear: string): { label: string; start: string; end: string }[] {
  const [startYearStr] = taxYear.split('-')
  const startYear = Number(startYearStr)
  const periods: { label: string; start: string; end: string }[] = []

  // Months in the tax year: Apr(3) to Mar(2 next year) — 0-indexed internally
  const monthsPerPeriod = entity.gst_period === '1-monthly' ? 1
    : entity.gst_period === '6-monthly' ? 6
    : 2

  let monthIdx = 0 // 0 = April
  while (monthIdx < 12) {
    const periodMonths = Math.min(monthsPerPeriod, 12 - monthIdx)
    const startMonth = (3 + monthIdx) % 12 // April = month 3 (0-indexed)
    const startCalYear = startMonth < 3 ? startYear + 1 : startYear
    const endMonthIdx = monthIdx + periodMonths - 1
    const endMonth = (3 + endMonthIdx) % 12
    const endCalYear = endMonth < 3 ? startYear + 1 : startYear

    // Last day of end month
    const endDate = new Date(endCalYear, endMonth + 1, 0)

    const startDate = `${startCalYear}-${String(startMonth + 1).padStart(2, '0')}-01`
    const endDateStr = `${endCalYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

    const startLabel = new Date(startCalYear, startMonth, 1).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })
    const endLabel = endDate.toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })

    periods.push({
      label: startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`,
      start: startDate,
      end: endDateStr,
    })

    monthIdx += periodMonths
  }

  return periods
}

export default function GstSummaryPanel({ transactions, entity, onGenerateForm }: GstSummaryPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const taxYear = transactions[0]?.tax_year ?? '2025-26'
  const periods = useMemo(() => getGstPeriods(entity, taxYear), [entity, taxYear])
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0)

  const selectedPeriod = periods[selectedPeriodIdx]

  const summary = useMemo(() => {
    if (!selectedPeriod) return null
    return calculateGst(transactions, entity.gst_basis, selectedPeriod.start, selectedPeriod.end)
  }, [transactions, entity.gst_basis, selectedPeriod])

  const unapprovedCount = useMemo(() => {
    if (!selectedPeriod) return 0
    return transactions.filter(
      (tx) =>
        !tx.approved &&
        tx.date >= selectedPeriod.start &&
        tx.date <= selectedPeriod.end,
    ).length
  }, [transactions, selectedPeriod])

  if (!entity.gst_registered) return null

  const boxes: { label: string; box: string; value: number }[] = summary
    ? [
        { label: 'Total sales including GST', box: 'Box 5', value: summary.totalSalesIncGst },
        { label: 'Zero-rated supplies', box: 'Box 6', value: 0 },
        { label: 'GST on sales (collected)', box: 'Box 7', value: summary.gstOnSales },
        { label: 'Adjustments', box: 'Box 8', value: 0 },
        { label: 'Total purchases including GST', box: 'Box 9', value: summary.totalPurchasesIncGst },
        { label: 'GST on purchases', box: 'Box 11', value: summary.gstOnPurchases },
        { label: 'Entertainment adjustment (50%)', box: '', value: summary.entertainmentAdj },
        { label: 'GST to pay / (refund)', box: 'Box 12', value: summary.gstToPay },
      ]
    : []

  return (
    <div className="bg-[#131a23] rounded-xl border border-[#1e2631] overflow-hidden">
      {/* Header — click to toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer min-h-[44px]"
      >
        <div>
          <h3 className="text-white font-semibold text-sm">GST Summary</h3>
          <p className="text-xs text-[#70767f] mt-0.5">GST101A breakdown for the selected period</p>
        </div>
        <svg
          className={`w-5 h-5 text-[#a6abb5] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#1e2631]">
          {/* Period selector */}
          <div className="pt-4">
            <label htmlFor="gst-period" className="text-xs text-[#70767f] font-medium block mb-1">
              GST Period
            </label>
            <select
              id="gst-period"
              value={selectedPeriodIdx}
              onChange={(e) => setSelectedPeriodIdx(Number(e.target.value))}
              className="w-full sm:w-auto rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
            >
              {periods.map((p, i) => (
                <option key={i} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Warning for unapproved */}
          {unapprovedCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              {unapprovedCount} unapproved transaction{unapprovedCount > 1 ? 's' : ''} in this period.
              Approve them for an accurate GST return.
            </div>
          )}

          {/* GST Boxes */}
          {summary && (
            <div className="space-y-2">
              {boxes.map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    row.box === 'Box 12'
                      ? 'bg-[#1e2631] border border-[#1e2631]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {row.box && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#70767f] w-12 shrink-0">
                        {row.box}
                      </span>
                    )}
                    {!row.box && <span className="w-12 shrink-0" />}
                    <span className="text-sm text-[#a6abb5]">{row.label}</span>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      row.box === 'Box 12'
                        ? row.value >= 0
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                        : 'text-white'
                    }`}
                  >
                    ${formatCurrency(Math.abs(row.value))}
                    {row.box === 'Box 12' && row.value < 0 && ' (refund)'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Generate button */}
          {summary && (
            <button
              type="button"
              onClick={() => onGenerateForm(summary)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold text-sm rounded-xl px-6 min-h-[44px] cursor-pointer hover:opacity-90 transition-opacity"
            >
              Generate GST101A
            </button>
          )}
        </div>
      )}
    </div>
  )
}
