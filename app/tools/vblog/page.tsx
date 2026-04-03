import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import VBlogDashboard from '@/tools/vblog/vblog-dashboard'

export const metadata: Metadata = {
  title: 'VBlog Studio — AI Video Generator | Toolk1t',
  description: 'Generate marketing demo videos for your tools automatically.',
}

export default function VBlogPage() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4 bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}>
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="VBlog Studio" toolSlug="vblog" />
        </div>
        <VBlogDashboard />
      </div>
    </main>
  )
}
