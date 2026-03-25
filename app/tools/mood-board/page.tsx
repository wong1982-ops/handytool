import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import MoodBoardStudio from '@/tools/mood-board/mood-board-studio'

export const metadata: Metadata = {
  title: 'Mood Board Studio — AI Visual Brainstorming | Toolk1t',
  description:
    'Create AI-powered mood boards with freeform canvas. Generate images, color palettes, and typography from a theme. Drag, arrange, and share your vision.',
}

export default function MoodBoardPage() {
  return (
    <main
      className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="px-4 pt-4">
        <ToolBreadcrumb toolName="Mood Board" toolSlug="mood-board" />
      </div>
      <div className="flex-1 flex flex-col">
        <MoodBoardStudio />
      </div>
    </main>
  )
}
