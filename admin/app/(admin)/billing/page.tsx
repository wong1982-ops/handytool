import { requireAdmin } from '@/lib/auth-guard'
import { BillingDashboard } from './billing-dashboard'

export default async function BillingPage() {
  await requireAdmin()

  return <BillingDashboard />
}
