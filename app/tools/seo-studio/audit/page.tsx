import type { Metadata } from 'next'
import AdminGate from '@/tools/seo-studio/admin-gate'
import AuditDashboard from '@/tools/seo-studio/audit-dashboard'

export const metadata: Metadata = {
  title: 'SEO Studio — Site Audit | Toolk1t',
  description: 'Audit your tool pages for SEO issues.',
}

export default function AuditPage() {
  return (
    <AdminGate>
      <AuditDashboard />
    </AdminGate>
  )
}
