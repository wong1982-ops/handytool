import type { Metadata } from 'next'
import { fetchDashboardSummary, fetchTopTools, fetchDailyTraffic } from '@/lib/analytics'
import { DashboardOverview } from './dashboard-overview'

export const metadata: Metadata = {
  title: 'Dashboard | Toolk1t Admin',
}

export default async function DashboardPage() {
  const [summary, topTools, traffic7d] = await Promise.all([
    fetchDashboardSummary(),
    fetchTopTools(30, 5),
    fetchDailyTraffic(7),
  ])

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <DashboardOverview summary={summary} topTools={topTools} traffic7d={traffic7d} />
    </>
  )
}
