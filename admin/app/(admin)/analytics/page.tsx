import type { Metadata } from 'next'
import { fetchToolPopularity, fetchDailyTraffic, fetchDeviceBreakdown, fetchTopReferrers } from '@/lib/analytics'
import { AnalyticsDashboard } from './analytics-dashboard'

export const metadata: Metadata = {
  title: 'Analytics | Toolk1t Admin',
}

interface Props {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams
  const days = parseInt(params.period || '30', 10)
  const validDays = [7, 14, 30, 90].includes(days) ? days : 30

  const [popularity, traffic, devices, referrers] = await Promise.all([
    fetchToolPopularity(validDays),
    fetchDailyTraffic(validDays),
    fetchDeviceBreakdown(validDays),
    fetchTopReferrers(validDays),
  ])

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>
      <AnalyticsDashboard
        popularity={popularity}
        traffic={traffic}
        devices={devices}
        referrers={referrers}
        period={validDays}
      />
    </>
  )
}
