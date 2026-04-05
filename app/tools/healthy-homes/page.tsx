import type { Metadata } from 'next'
import ComplianceChecker from '@/tools/healthy-homes/compliance-checker'

export const metadata: Metadata = {
  title: 'NZ Healthy Homes Compliance Checker | Toolk1t',
  description: 'Check your NZ rental property against Healthy Homes Standards — heating, insulation, ventilation, moisture & draught stopping.',
}

export default function HealthyHomesPage() {
  return <ComplianceChecker />
}
