import type { Metadata } from 'next'
import AdminGate from '@/tools/seo-studio/admin-gate'
import PageGenerator from '@/tools/seo-studio/page-generator'

export const metadata: Metadata = {
  title: 'SEO Studio — Landing Pages | Toolk1t',
  description: 'Generate SEO landing pages for your tools.',
}

export default function PagesPage() {
  return (
    <AdminGate>
      <PageGenerator />
    </AdminGate>
  )
}
