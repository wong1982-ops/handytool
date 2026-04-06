import type { Metadata } from 'next'
import ExportCsv from '@/tools/tradie-tax/export-csv'

export const metadata: Metadata = {
  title: 'Export Expenses as CSV — Tradie Tax | Toolk1t',
  description:
    'Download your income and expense entries as a CSV file to send to your accountant.',
}

export default function ExportPage() {
  return <ExportCsv />
}
