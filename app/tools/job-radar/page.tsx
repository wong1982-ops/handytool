import type { Metadata } from 'next'
import { JobRadarPage } from '@/tools/job-radar/job-radar-page'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

export const metadata: Metadata = {
  title: 'Job Radar — AU & NZ Tech & French Jobs | Toolk1t',
  description: 'Browse IT, software engineering, and French language jobs across Australia and New Zealand. Aggregated daily from Seek, Indeed, LinkedIn, and Trade Me.',
}

export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="Job Radar" toolSlug="job-radar" />

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Job Radar
          </h1>
          <p className="text-sm text-[#a6abb5]">
            IT & French language jobs across Australia and New Zealand — updated daily
          </p>
        </div>

        <JobRadarPage />
      </div>
    </main>
  )
}
