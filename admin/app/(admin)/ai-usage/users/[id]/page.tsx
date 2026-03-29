import type { Metadata } from 'next'
import { UserUsageDetail } from './user-usage-detail'

export const metadata: Metadata = {
  title: 'User AI Usage | Toolk1t Admin',
}

export default async function UserUsagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <UserUsageDetail userId={id} />
}
