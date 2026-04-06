import type { Metadata } from 'next'
import RiskAssessment from '@/tools/aml-compliance/risk-assessment'

export const metadata: Metadata = {
  title: 'NZ AML/CFT Compliance Tool — Risk Assessment | Toolk1t',
  description:
    'Free NZ AML/CFT compliance tool for reporting entities. Assess your money laundering risk, generate a compliance programme, CDD checklists, and SAR guidance.',
}

export default function AMLCompliancePage() {
  return <RiskAssessment />
}
