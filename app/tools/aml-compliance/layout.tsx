'use client'
import { ToolFrame } from '@/components/layout/tool-frame'

const ShieldLockIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
)

export default function AMLComplianceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolFrame
      toolName="AML Compliance"
      toolSlug="aml-compliance"
      category="utility"
      icon={ShieldLockIcon}
      tabs={[
        { label: 'Risk Assessment', href: '/tools/aml-compliance' },
        { label: 'Programme', href: '/tools/aml-compliance/programme' },
        { label: 'CDD', href: '/tools/aml-compliance/cdd' },
        { label: 'SAR Guide', href: '/tools/aml-compliance/sar' },
      ]}
    >
      {children}
    </ToolFrame>
  )
}
