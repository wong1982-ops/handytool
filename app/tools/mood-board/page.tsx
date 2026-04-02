import type { Metadata } from 'next'
import MoodBoardStudio from '@/tools/mood-board/mood-board-studio'

export const metadata: Metadata = {
  title: 'Mood Board Studio — AI Visual Brainstorming | Toolk1t',
  description: 'Create AI-powered mood boards. Generate images, color palettes, and typography from a theme.',
}

export default function MoodBoardPage() {
  return (
    <main className="flex-1 flex flex-col bg-[#090f16] min-h-screen">
      <MoodBoardStudio />
    </main>
  )
}
