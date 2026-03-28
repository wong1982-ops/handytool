import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import StoryVideoStudio from '@/tools/story-video/story-video-studio'

export const metadata: Metadata = {
  title: 'Story Video — AI Cartoon Generator | Toolk1t',
  description: 'Turn your storybooks into AI-generated cartoon videos with character voices, sound effects, and music.',
}

export default function StoryVideoPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Story Video" toolSlug="story-video" />
        </div>
        <Suspense fallback={<div className="text-center py-20 text-[#70767f]">Loading...</div>}>
          <StoryVideoStudio />
        </Suspense>
      </div>
    </main>
  )
}
