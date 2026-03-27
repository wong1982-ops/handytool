import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import TaxDashboard from '@/tools/tax-manager/tax-dashboard'

export const metadata: Metadata = {
  title: 'NZ Tax Manager — GST & Income Tax | Toolk1t',
  description: 'Manage NZ GST returns and income tax. Upload bank statements, AI categorises transactions, generate IRD forms.',
}

export default function TaxManagerPage() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4 bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}>
      <div className="w-full max-w-5xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="NZ Tax Manager" toolSlug="tax-manager" />
        </div>
        <TaxDashboard />
      </div>
    </main>
  )
}
