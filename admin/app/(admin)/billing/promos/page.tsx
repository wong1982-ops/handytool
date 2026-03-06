import { requireAdmin } from '@/lib/auth-guard'
import { PromoManagement } from './promo-management'

export default async function BillingPromosPage() {
  await requireAdmin()

  return <PromoManagement />
}
