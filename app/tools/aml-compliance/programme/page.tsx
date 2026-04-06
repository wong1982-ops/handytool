import type { Metadata } from 'next'
import ComplianceProgramme from '@/tools/aml-compliance/compliance-programme'

export const metadata: Metadata = {
  title: 'AML/CFT Compliance Programme Generator | Toolk1t',
  description:
    'Generate a tailored AML/CFT compliance programme document for your NZ business. Download as PDF. Covers CDD procedures, SAR reporting, record keeping, and staff training.',
}

export default function ProgrammePage() {
  return <ComplianceProgramme />
}
