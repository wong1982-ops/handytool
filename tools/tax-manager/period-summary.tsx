'use client'

import { useMemo } from 'react'
import { calculateGst } from './gst-calculator'
import { buildIncomeSummary } from './tax-calculator'
import type { TaxTransaction } from './types'

interface PeriodSummaryProps {
  transactions: TaxTransaction[]
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PeriodSummary({ transactions }: PeriodSummaryProps) {
  const stats = useMemo(() => {
    const approved = transactions.filter((tx) => tx.approved)

    let totalIncome = 0
    let totalExpenses = 0

    for (const tx of approved) {
      if (tx.amount > 0) {
        totalIncome += tx.amount
      } else {
        totalExpenses += Math.abs(tx.amount)
      }
    }

    // GST: calculate across full date range of transactions
    const dates = approved.map((tx) => tx.date).sort()
    const periodStart = dates[0] ?? '2000-01-01'
    const periodEnd = dates[dates.length - 1] ?? '2099-12-31'

    const gst = calculateGst(transactions, 'invoice', periodStart, periodEnd)

    const netProfit = totalIncome - totalExpenses

    return {
      totalIncome,
      totalExpenses,
      gstCollected: gst.gstOnSales,
      gstPaid: gst.gstOnPurchases,
      gstOwing: gst.gstToPay,
      netProfit,
    }
  }, [transactions])

  const cards = [
    { label: 'Total Income', value: stats.totalIncome, color: 'text-emerald-400' },
    { label: 'Total Expenses', value: stats.totalExpenses, color: 'text-red-400' },
    { label: 'GST Collected', value: stats.gstCollected, color: 'text-white' },
    { label: 'GST Paid', value: stats.gstPaid, color: 'text-white' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#131a23] rounded-xl p-4 border border-[#1e2631]"
          >
            <p className="text-xs text-[#70767f] font-medium mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>
              ${formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <div className="bg-[#131a23] rounded-xl p-4 border border-[#1e2631] flex-1">
          <p className="text-sm text-[#a6abb5] mb-1">GST Owing</p>
          <p className={`text-xl font-bold ${stats.gstOwing >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${formatCurrency(Math.abs(stats.gstOwing))}
            {stats.gstOwing < 0 && (
              <span className="text-sm font-normal text-[#a6abb5] ml-2">(refund)</span>
            )}
          </p>
        </div>
        <div className="bg-[#131a23] rounded-xl p-4 border border-[#1e2631] flex-1">
          <p className="text-sm text-[#a6abb5] mb-1">Net Profit</p>
          <p className={`text-xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${formatCurrency(Math.abs(stats.netProfit))}
            {stats.netProfit < 0 && (
              <span className="text-sm font-normal text-[#a6abb5] ml-2">(loss)</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
