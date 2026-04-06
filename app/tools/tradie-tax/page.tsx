import type { Metadata } from 'next'
import IncomeExpenses from '@/tools/tradie-tax/income-expenses'

export const metadata: Metadata = {
  title: 'NZ Tradie Tax & Expense Tracker — Income, Expenses & GST | Toolk1t',
  description:
    'Track income and expenses for NZ sole traders and tradies. GST calculator, tax estimator with NZ brackets, and CSV export for your accountant.',
}

export default function TradieTaxPage() {
  return <IncomeExpenses />
}
