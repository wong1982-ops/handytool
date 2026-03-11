'use client'

import { useParams } from 'next/navigation'
import { JobDetailView } from '@/tools/story-studio/job-detail'

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()

  return <JobDetailView jobId={params.id} />
}
