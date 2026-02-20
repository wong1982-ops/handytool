import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-guard'
import { fetchToolPopularity, fetchDailyTraffic, fetchUserStats, fetchDemographics } from '@/lib/analytics'
import { AnalyticsDashboard } from './analytics-dashboard'

export const metadata: Metadata = {
  title: 'Analytics | Toolk1t Admin',
}

export default async function AnalyticsPage() {
  await requireAdmin()

  const [popularity, traffic, userStats, demographics] = await Promise.all([
    fetchToolPopularity(30),
    fetchDailyTraffic(30),
    fetchUserStats(),
    fetchDemographics(),
  ])

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Analytics</h1>
      <AnalyticsDashboard
        popularity={popularity}
        traffic={traffic}
        userStats={userStats}
        demographics={demographics}
      />
    </main>
  )
}
