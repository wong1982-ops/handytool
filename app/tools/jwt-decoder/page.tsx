'use client'

import { JwtDecoderTool } from '@/tools/jwt-decoder/jwt-decoder-tool'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

export default function JwtDecoderPage() {
  return (
    <>
      {/* Themed header */}
      <header
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0c1424 0%, #111b2e 50%, #0c1424 100%)',
        }}
      >
        {/* Glow blob */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #3D6AF2 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[860px] px-4 py-10">
          <ToolBreadcrumb toolName="JWT Decoder" toolSlug="jwt-decoder" />

          {/* Tool identity */}
          <div className="flex items-start gap-4 mt-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#3D6AF2]/30 bg-[#3D6AF2]/15">
              <svg className="w-6 h-6 text-[#3D6AF2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 1.5a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2A.75.75 0 0112 1.5zm4.243 2.757a.75.75 0 011.06 0l1.415 1.414a.75.75 0 11-1.06 1.061L16.243 5.318a.75.75 0 010-1.06zM20.25 12a.75.75 0 01.75-.75h2a.75.75 0 010 1.5h-2a.75.75 0 01-.75-.75zm-2.757 4.243a.75.75 0 010 1.06l1.414 1.415a.75.75 0 11-1.061-1.06l1.414-1.415a.75.75 0 011.06 0zM12 18.75a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2a.75.75 0 01.75-.75zm-4.243-2.757a.75.75 0 010 1.06l-1.414 1.415a.75.75 0 01-1.061-1.06l1.414-1.415a.75.75 0 011.06 0zM1 12a.75.75 0 01.75-.75h2a.75.75 0 010 1.5h-2A.75.75 0 011 12zm2.757-4.243a.75.75 0 010-1.06L2.343 5.282a.75.75 0 011.06-1.06L4.818 5.636a.75.75 0 010 1.06zM12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                JWT Decoder
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#a6abb5]">
                Decode, verify, and generate JSON Web Tokens — 100% client-side, your tokens stay in your browser.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[860px] px-4 py-8">
        <JwtDecoderTool />
      </main>
    </>
  )
}
