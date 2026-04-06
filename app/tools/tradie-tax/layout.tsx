'use client'
import { ToolFrame } from '@/components/layout/tool-frame'

const ReceiptIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008H15.75v-.008Zm0 2.25h.008v.008H15.75V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
  </svg>
)

export default function TradieTaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolFrame
      toolName="Tradie Tax"
      toolSlug="tradie-tax"
      category="utility"
      icon={ReceiptIcon}
      tabs={[
        { label: 'Income & Expenses', href: '/tools/tradie-tax' },
        { label: 'GST', href: '/tools/tradie-tax/gst' },
        { label: 'Tax Estimator', href: '/tools/tradie-tax/estimator' },
        { label: 'Export', href: '/tools/tradie-tax/export' },
      ]}
    >
      {children}
    </ToolFrame>
  )
}
