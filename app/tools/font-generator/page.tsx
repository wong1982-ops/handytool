import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import FontWizard from '@/tools/font-generator/font-wizard'

export const metadata: Metadata = {
  title: 'Font Generator — Create Custom Fonts with AI | Toolk1t',
  description:
    'Design unique custom fonts and alphabets with AI. Choose a style, preview sample letters, generate a full A-Z character set, and download as PNG or SVG.',
}

export default function FontGeneratorPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Font Generator" toolSlug="font-generator" />
        </div>
        <FontWizard />
      </div>
    </main>
  )
}
