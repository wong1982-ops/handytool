import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import MusicStudio from '@/tools/music-studio/music-studio'

export const metadata: Metadata = {
  title: 'Music Studio — AI Music Generator | Toolk1t',
  description:
    'Create music, jingles, and sound effects with AI in real-time. Visual launchpad, live controls, record and download your creations.',
}

export default function MusicStudioPage() {
  return (
    <main
      className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="px-4 py-4">
        <ToolBreadcrumb toolName="Music Studio" toolSlug="music-studio" />
      </div>
      <div className="flex-1">
        <MusicStudio />
      </div>
    </main>
  )
}
