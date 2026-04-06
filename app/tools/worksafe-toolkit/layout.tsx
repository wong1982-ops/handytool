'use client'
import { ToolFrame } from '@/components/layout/tool-frame'

const ShieldIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
)

export default function WorksafeToolkitLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolFrame
      toolName="WorkSafe Toolkit"
      toolSlug="worksafe-toolkit"
      category="utility"
      icon={ShieldIcon}
      tabs={[
        { label: 'H&S Plan', href: '/tools/worksafe-toolkit' },
        { label: 'Hazards', href: '/tools/worksafe-toolkit/hazards' },
        { label: 'Incidents', href: '/tools/worksafe-toolkit/incidents' },
        { label: 'Workers', href: '/tools/worksafe-toolkit/workers' },
      ]}
    >
      {children}
    </ToolFrame>
  )
}
