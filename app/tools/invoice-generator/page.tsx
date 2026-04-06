'use client'

import { useState } from 'react'
import { InvoiceProvider } from '@/tools/invoice-generator/invoice-provider'
import { InvoiceEditor } from '@/tools/invoice-generator/invoice-editor'
import { InvoicePreview } from '@/tools/invoice-generator/invoice-preview'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'

export default function InvoiceGeneratorPage() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <InvoiceProvider>
      <div className="flex flex-col h-[100dvh] bg-[#090f16]">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-[#1e2631] bg-[#131a23] shrink-0">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-lg font-semibold text-white">Invoice Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium bg-[#1e2631] text-[#a6abb5] hover:text-white transition-colors"
              aria-label={showPreview ? 'Show editor' : 'Show preview'}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <FavoriteButton slug="invoice-generator" name="Invoice Generator" />
          </div>
        </header>

        {/* Main content: editor + preview */}
        <div className="flex flex-1 overflow-hidden">
          <div
            className={`w-full lg:w-[45%] flex flex-col overflow-hidden border-r border-[#1e2631] ${showPreview ? 'max-lg:hidden' : ''}`}
          >
            <InvoiceEditor />
          </div>
          <div className={`flex-1 min-h-0 ${showPreview ? '' : 'max-lg:hidden'}`}>
            <InvoicePreview />
          </div>
        </div>
      </div>
    </InvoiceProvider>
  )
}
