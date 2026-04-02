import type { Metadata } from 'next'
import { ToolFrame } from '@/components/layout/tool-frame'
import MoodBoardStudio from '@/tools/mood-board/mood-board-studio'

export const metadata: Metadata = {
  title: 'Mood Board Studio — AI Visual Brainstorming | Toolk1t',
  description: 'Create AI-powered mood boards. Generate images, color palettes, and typography from a theme.',
}

export default function MoodBoardPage() {
  return (
    <ToolFrame toolName="Mood Board" toolSlug="mood-board" icon={<span>🎨</span>}>
      <MoodBoardStudio />
    </ToolFrame>
  )
}
