import type { Metadata } from 'next'
import CDDChecklist from '@/tools/aml-compliance/cdd-checklist'

export const metadata: Metadata = {
  title: 'AML/CFT Customer Due Diligence Checklist | Toolk1t',
  description:
    'NZ AML/CFT CDD checklist covering Standard, Enhanced, and Simplified Customer Due Diligence requirements for reporting entities.',
}

export default function CDDPage() {
  return <CDDChecklist />
}
