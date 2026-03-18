import { AiRadarPage } from '@/tools/ai-radar/ai-radar-page'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

export const metadata = {
  title: 'AI Radar — Latest AI Model Releases & Updates | Toolk1t',
  description: 'Track new AI model releases, major updates, and capabilities. Coverage of LLMs, image/video generation, audio, code models, and more — updated daily.',
}

export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="AI Radar" toolSlug="ai-radar" />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            AI Radar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New AI model releases and major updates — updated daily
          </p>
        </div>

        <AiRadarPage />
      </div>
    </main>
  )
}
