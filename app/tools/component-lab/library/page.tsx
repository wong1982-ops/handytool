import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import LibraryGrid from '@/tools/component-lab/library-grid'

export const metadata: Metadata = {
  title: 'My Library — Component Lab | Toolk1t',
  description: 'Browse and manage your saved AI-generated UI components.',
}

export default function LibraryPage() {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              My{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED]">
                Library
              </span>
            </h1>
            <p className="text-sm text-[#a6abb5] mt-1">Your saved components</p>
          </div>

          <a
            href="/tools/component-lab"
            className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-xl border border-[#3D6AF2] text-[#3D6AF2] font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-all cursor-pointer"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Component
          </a>
        </div>

        <LibraryGrid />
      </div>
    </main>
  )
}
