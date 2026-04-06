import type { Metadata } from 'next'
import SARGuide from '@/tools/aml-compliance/sar-guide'

export const metadata: Metadata = {
  title: 'AML/CFT Suspicious Activity Reporting Guide | Toolk1t',
  description:
    'NZ AML/CFT SAR guide — suspicious activity indicators, reporting steps, and timeline requirements. Learn how to file a SAR with the NZ Police FIU.',
}

export default function SARPage() {
  return <SARGuide />
}
