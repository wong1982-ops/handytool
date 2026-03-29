import type { Metadata } from 'next'
import { AiUsageDashboard } from './ai-usage-dashboard'

export const metadata: Metadata = {
  title: 'AI Usage | Toolk1t Admin',
}

export default function AiUsagePage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">AI Usage</h1>
      <AiUsageDashboard />
    </>
  )
}
