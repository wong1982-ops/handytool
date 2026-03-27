'use client'

import { useMemo, useState } from 'react'
import {
  buildIncomeSummary,
  calculateIndividualTax,
  calculateCompanyTax,
} from './tax-calculator'
import { TAX_CATEGORIES, COMPANY_TAX_RATE } from './types'
import type { IncomeTaxSummary, TaxEntity, TaxTransaction } from './types'

interface IncomeTaxSummaryPanelProps {
  transactions: TaxTransaction[]
  entity: TaxEntity
  taxYear: string
  onGenerateForm: (summary: IncomeTaxSummary) => void
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getCategoryLabel(id: string): string {
  return TAX_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

/** Approximate ACC earners' levy (~1.60% up to cap). */
function estimateAccLevy(income: number): number {
  const ACC_RATE = 0.016
  const ACC_CAP = 142_283 // approximate cap for 2025-26
  return Math.round(Math.min(income, ACC_CAP) * ACC_RATE * 100) / 100
}

export default function IncomeTaxSummaryPanel({
  transactions,
  entity,
  taxYear,
  onGenerateForm,
}: IncomeTaxSummaryPanelProps) {
  const [expanded, setExpanded] = useState(false)

  // Manual adjustment fields
  const [otherIncome, setOtherIncome] = useState('')
  const [priorLosses, setPriorLosses] = useState('')
  const [rwtCredits, setRwtCredits] = useState('')
  const [provisionalTaxPaid, setProvisionalTaxPaid] = useState('')

  const baseSummary = useMemo(
    () => buildIncomeSummary(transactions, entity.type, taxYear),
    [transactions, entity.type, taxYear],
  )

  // Income categories for the table
  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    const approved = transactions.filter((tx) => tx.tax_year === taxYear && tx.approved && tx.amount > 0)
    for (const tx of approved) {
      const cat = tx.category ?? 'sales-income'
      map[cat] = (map[cat] ?? 0) + tx.amount
    }
    return map
  }, [transactions, taxYear])

  // Adjusted calculations
  const adjusted = useMemo(() => {
    const otherInc = parseFloat(otherIncome) || 0
    const losses = parseFloat(priorLosses) || 0
    const rwt = parseFloat(rwtCredits) || 0
    const prov = parseFloat(provisionalTaxPaid) || 0

    const adjustedIncome = baseSummary.totalIncome + otherInc
    const adjustedNetProfit = adjustedIncome - baseSummary.totalExpenses - losses

    let estimatedTax: number
    let effectiveRate: number

    if (entity.type === 'company') {
      const result = calculateCompanyTax(adjustedNetProfit)
      estimatedTax = result.tax
      effectiveRate = adjustedNetProfit > 0 ? result.rate : 0
    } else {
      const result = calculateIndividualTax(adjustedNetProfit)
      estimatedTax = result.tax
      effectiveRate = result.effectiveRate
    }

    const taxAfterCredits = Math.max(0, estimatedTax - rwt - prov)

    return {
      adjustedIncome,
      adjustedNetProfit,
      estimatedTax,
      effectiveRate,
      taxAfterCredits,
      rwt,
      prov,
    }
  }, [baseSummary, entity.type, otherIncome, priorLosses, rwtCredits, provisionalTaxPaid])

  // Bracket breakdown for sole trader
  const bracketBreakdown = useMemo(() => {
    if (entity.type !== 'sole-trader') return null
    return calculateIndividualTax(adjusted.adjustedNetProfit)
  }, [entity.type, adjusted.adjustedNetProfit])

  const accLevy = useMemo(() => {
    if (entity.type !== 'sole-trader') return 0
    return estimateAccLevy(adjusted.adjustedNetProfit)
  }, [entity.type, adjusted.adjustedNetProfit])

  const handleGenerate = () => {
    const summary: IncomeTaxSummary = {
      totalIncome: adjusted.adjustedIncome,
      expensesByCategory: baseSummary.expensesByCategory,
      totalExpenses: baseSummary.totalExpenses,
      netProfit: adjusted.adjustedNetProfit,
      estimatedTax: adjusted.estimatedTax,
      effectiveRate: adjusted.effectiveRate,
      entityType: entity.type,
    }
    onGenerateForm(summary)
  }

  const formType = entity.type === 'company' ? 'IR4' : 'IR3'

  return (
    <div className="bg-[#131a23] rounded-xl border border-[#1e2631] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer min-h-[44px]"
      >
        <div>
          <h3 className="text-white font-semibold text-sm">Income Tax Summary</h3>
          <p className="text-xs text-[#70767f] mt-0.5">
            {formType} estimate for {taxYear} tax year
          </p>
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
        <div className="px-4 pb-4 space-y-6 border-t border-[#1e2631] pt-4">
          {/* Income by category */}
          <div>
            <h4 className="text-sm font-medium text-[#a6abb5] mb-2">Income by Category</h4>
            <div className="space-y-1">
              {Object.entries(incomeByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between py-1.5 px-3">
                  <span className="text-sm text-[#a6abb5]">{getCategoryLabel(cat)}</span>
                  <span className="text-sm text-emerald-400 font-medium tabular-nums">
                    ${formatCurrency(amount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 px-3 border-t border-[#1e2631]">
                <span className="text-sm font-semibold text-white">Total Income</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">
                  ${formatCurrency(baseSummary.totalIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses by category */}
          <div>
            <h4 className="text-sm font-medium text-[#a6abb5] mb-2">Deductible Expenses by Category</h4>
            <div className="space-y-1">
              {Object.entries(baseSummary.expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between py-1.5 px-3">
                  <span className="text-sm text-[#a6abb5]">{getCategoryLabel(cat)}</span>
                  <span className="text-sm text-red-400 font-medium tabular-nums">
                    ${formatCurrency(amount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 px-3 border-t border-[#1e2631]">
                <span className="text-sm font-semibold text-white">Total Expenses</span>
                <span className="text-sm font-bold text-red-400 tabular-nums">
                  ${formatCurrency(baseSummary.totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="flex items-center justify-between py-3 px-3 bg-[#1e2631] rounded-lg">
            <span className="text-sm font-semibold text-white">Net Profit</span>
            <span
              className={`text-base font-bold tabular-nums ${
                baseSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              ${formatCurrency(Math.abs(baseSummary.netProfit))}
              {baseSummary.netProfit < 0 ? ' (loss)' : ''}
            </span>
          </div>

          {/* Manual entry fields */}
          <div>
            <h4 className="text-sm font-medium text-[#a6abb5] mb-3">Manual Adjustments</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="other-income" className="text-xs text-[#70767f] block mb-1">
                  Other Income
                </label>
                <input
                  id="other-income"
                  type="number"
                  step="0.01"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="prior-losses" className="text-xs text-[#70767f] block mb-1">
                  Prior Year Losses
                </label>
                <input
                  id="prior-losses"
                  type="number"
                  step="0.01"
                  value={priorLosses}
                  onChange={(e) => setPriorLosses(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="rwt-credits" className="text-xs text-[#70767f] block mb-1">
                  RWT Credits
                </label>
                <input
                  id="rwt-credits"
                  type="number"
                  step="0.01"
                  value={rwtCredits}
                  onChange={(e) => setRwtCredits(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="provisional-tax" className="text-xs text-[#70767f] block mb-1">
                  Provisional Tax Paid
                </label>
                <input
                  id="provisional-tax"
                  type="number"
                  step="0.01"
                  value={provisionalTaxPaid}
                  onChange={(e) => setProvisionalTaxPaid(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Tax calculation */}
          {entity.type === 'sole-trader' && bracketBreakdown && (
            <div>
              <h4 className="text-sm font-medium text-[#a6abb5] mb-2">Tax Bracket Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#70767f] text-xs">
                      <th className="text-left py-2 px-3 font-medium">Bracket</th>
                      <th className="text-right py-2 px-3 font-medium">Income</th>
                      <th className="text-right py-2 px-3 font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bracketBreakdown.brackets.map((b) => (
                      <tr key={b.bracket} className="border-t border-[#1e2631]">
                        <td className="py-2 px-3 text-[#a6abb5]">{b.bracket}</td>
                        <td className="py-2 px-3 text-right text-white tabular-nums">
                          ${formatCurrency(b.amount)}
                        </td>
                        <td className="py-2 px-3 text-right text-amber-400 tabular-nums">
                          ${formatCurrency(b.tax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between px-3 py-2 bg-[#1e2631] rounded-lg">
                  <span className="text-sm text-white font-semibold">Estimated Income Tax</span>
                  <span className="text-sm font-bold text-amber-400 tabular-nums">
                    ${formatCurrency(adjusted.estimatedTax)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-sm text-[#a6abb5]">ACC Earners&apos; Levy (est.)</span>
                  <span className="text-sm text-white tabular-nums">
                    ${formatCurrency(accLevy)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {entity.type === 'company' && (
            <div>
              <h4 className="text-sm font-medium text-[#a6abb5] mb-2">Company Tax</h4>
              <div className="space-y-2">
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-sm text-[#a6abb5]">
                    Taxable Profit x {(COMPANY_TAX_RATE * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm text-white tabular-nums">
                    ${formatCurrency(adjusted.adjustedNetProfit)} x 28%
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-[#1e2631] rounded-lg">
                  <span className="text-sm text-white font-semibold">Estimated Company Tax</span>
                  <span className="text-sm font-bold text-amber-400 tabular-nums">
                    ${formatCurrency(adjusted.estimatedTax)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Credits / remaining */}
          {(adjusted.rwt > 0 || adjusted.prov > 0) && (
            <div className="space-y-1 px-3">
              {adjusted.rwt > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-[#a6abb5]">Less: RWT Credits</span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -${formatCurrency(adjusted.rwt)}
                  </span>
                </div>
              )}
              {adjusted.prov > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-[#a6abb5]">Less: Provisional Tax Paid</span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -${formatCurrency(adjusted.prov)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-[#1e2631]">
                <span className="text-sm font-semibold text-white">Tax Remaining</span>
                <span className="text-sm font-bold text-amber-400 tabular-nums">
                  ${formatCurrency(adjusted.taxAfterCredits)}
                </span>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full sm:w-auto bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold text-sm rounded-xl px-6 min-h-[44px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            Generate {formType}
          </button>
        </div>
      )}
    </div>
  )
}
