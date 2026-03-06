import { requireAdmin } from '@/lib/auth-guard'
import { ToolPricing } from './tool-pricing'

export default async function BillingToolsPage() {
  await requireAdmin()

  return <ToolPricing />
}
