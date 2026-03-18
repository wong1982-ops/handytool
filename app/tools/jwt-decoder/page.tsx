'use client'

import { JwtDecoderTool } from '@/tools/jwt-decoder/jwt-decoder-tool'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

export default function JwtDecoderPage() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="JWT Decoder" toolSlug="jwt-decoder" />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            JWT Decoder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Decode, verify, and generate JSON Web Tokens — 100% client-side, your tokens stay in your browser.
          </p>
        </div>

        <JwtDecoderTool />
      </div>
    </main>
  )
}
