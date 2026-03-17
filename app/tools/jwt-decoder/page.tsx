'use client'

import { JwtDecoderTool } from '@/tools/jwt-decoder/jwt-decoder-tool'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'

export default function JwtDecoderPage() {
  return (
    <main className="min-h-screen bg-[var(--tk-color-bg-primary)] text-[var(--tk-color-text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Mobile back + favorite row */}
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <BackButton label="Tools" />
          <div className="md:hidden">
            <FavoriteButton slug="jwt-decoder" name="JWT Decoder" />
          </div>
        </div>

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">JWT Decoder</h1>
            <p className="mt-1 text-sm text-[var(--tk-color-text-secondary)]">
              Decode, verify, and generate JSON Web Tokens — 100% client-side, your tokens stay in your browser.
            </p>
          </div>
          <div className="hidden md:block">
            <FavoriteButton slug="jwt-decoder" name="JWT Decoder" />
          </div>
        </div>

        <JwtDecoderTool />
      </div>
    </main>
  )
}
