import type { Metadata } from 'next'
import BondCalculator from '@/tools/tenancy-manager/bond-calculator'

export const metadata: Metadata = {
  title: 'NZ Bond Calculator — Tenancy Manager | Toolk1t',
  description: 'Calculate tenancy bond amounts including pet bonds under the 2024 Amendment Act.',
}

export default function BondPage() {
  return <BondCalculator />
}
