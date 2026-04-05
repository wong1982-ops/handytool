import type { Metadata } from 'next'
import KnowYourRights from '@/tools/tenancy-manager/know-your-rights'

export const metadata: Metadata = {
  title: 'NZ Tenancy Rights — Landlord & Tenant Guide | Toolk1t',
  description: 'Know your rights as a NZ landlord or tenant. Covers Healthy Homes, rent, bonds, inspections, and more.',
}

export default function RightsPage() {
  return <KnowYourRights />
}
