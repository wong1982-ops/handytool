import type { Metadata } from 'next'
import AgreementWizard from '@/tools/tenancy-manager/agreement-wizard'

export const metadata: Metadata = {
  title: 'NZ Tenancy Agreement Generator | Toolk1t',
  description: 'Create a compliant NZ residential tenancy agreement. Free tool for landlords — follows Residential Tenancies Act 2024.',
}

export default function TenancyAgreementPage() {
  return <AgreementWizard />
}
