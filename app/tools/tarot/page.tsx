import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import TarotWizard from '@/tools/tarot/tarot-wizard'

export const metadata: Metadata = {
  title: 'Tarot Card Reading — AI-Powered Tarot Readings | Toolk1t',
  description:
    'Get insightful AI-powered tarot card readings. Ask a question, choose a spread, and receive personalised interpretations for love, career, finance, and personal growth.',
}

export default function TarotPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Tarot Card Reading" toolSlug="tarot" />
        </div>
        <TarotWizard />
      </div>
    </main>
  )
}
