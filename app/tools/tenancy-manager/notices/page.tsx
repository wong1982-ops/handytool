import type { Metadata } from 'next'
import NoticeGenerator from '@/tools/tenancy-manager/notice-generator'

export const metadata: Metadata = {
  title: 'NZ Tenancy Notice Templates | Toolk1t',
  description: 'Generate compliant NZ tenancy notices — 90-day, 42-day, 14-day arrears, and more.',
}

export default function NoticesPage() {
  return <NoticeGenerator />
}
