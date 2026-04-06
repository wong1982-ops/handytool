import type { Metadata } from 'next'
import WorkerEngagement from '@/tools/worksafe-toolkit/worker-engagement'

export const metadata: Metadata = {
  title: 'Worker Engagement — NZ WorkSafe Toolkit | Toolk1t',
  description:
    'Assess your worker engagement practices against the Health and Safety at Work Act 2015. 10-item checklist with scoring and recommendations.',
}

export default function WorkersPage() {
  return <WorkerEngagement />
}
