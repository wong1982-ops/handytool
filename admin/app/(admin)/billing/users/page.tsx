import { requireAdmin } from '@/lib/auth-guard'
import { UserManagement } from './user-management'

export default async function BillingUsersPage() {
  await requireAdmin()

  return <UserManagement />
}
