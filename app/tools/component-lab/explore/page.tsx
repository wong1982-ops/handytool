import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import ExploreGrid from '@/tools/component-lab/explore-grid'

export const metadata: Metadata = {
  title: 'Explore Components — Component Lab | Toolk1t',
  description: 'Discover and copy public UI components built by the community.',
}

export default function ExplorePage() {
  return (
    <main
      className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="px-4 md:px-6 pt-4">
        <ToolBreadcrumb toolName="Component Lab" toolSlug="component-lab" />
      </div>

      <div className="px-4 md:px-6 pb-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Explore{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED]">
              Components
            </span>
          </h1>
          <p className="text-sm text-[#a6abb5] mt-1">
            Discover public components shared by the community
          </p>
        </div>

        <ExploreGrid />
      </div>
    </main>
  )
}
