import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import LogoWizard from '@/tools/logo-generator/logo-wizard'

export const metadata: Metadata = {
  title: 'Logo Generator — Create Professional Logos with AI | Toolk1t',
  description:
    'Design a professional logo for your business in minutes. Enter your brand details, choose a style, and let AI generate stunning logo concepts you can customise and download.',
}

export default function LogoGeneratorPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Logo Generator" toolSlug="logo-generator" />
        </div>
        <LogoWizard />
      </div>
    </main>
  )
}
