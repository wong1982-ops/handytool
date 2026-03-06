import { requireAdmin } from '@/lib/auth-guard'
import { TierManagement } from './tier-management'

export default async function BillingTiersPage() {
  await requireAdmin()

  return <TierManagement />
}
