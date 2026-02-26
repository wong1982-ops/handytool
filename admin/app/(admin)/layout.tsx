import { requireAdmin } from '@/lib/auth-guard'
import { AdminShell } from './admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <AdminShell email={user.email ?? 'Admin'}>
      {children}
    </AdminShell>
  )
}
