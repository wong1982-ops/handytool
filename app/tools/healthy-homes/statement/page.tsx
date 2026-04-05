import type { Metadata } from 'next'
import StatementGenerator from '@/tools/healthy-homes/statement-generator'

export const metadata: Metadata = {
  title: 'Healthy Homes Compliance Statement | Toolk1t',
  description: 'Generate a Healthy Homes compliance statement for your NZ tenancy agreement.',
}

export default function HealthyHomesStatementPage() {
  return <StatementGenerator />
}
