import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import ComponentLab from '@/tools/component-lab/component-lab'

export const metadata: Metadata = {
  title: 'Component Lab — AI Component Builder | Toolk1t',
  description: 'Build UI components with AI. Describe what you want, get production-ready code for React, Vue, Svelte, and HTML.',
}

export default function ComponentLabPage() {
  return (
    <main className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}>
      <div className="px-4 pt-4">
        <ToolBreadcrumb toolName="Component Lab" toolSlug="component-lab" />
      </div>
      <div className="flex-1 flex flex-col">
        <ComponentLab />
      </div>
    </main>
  )
}
