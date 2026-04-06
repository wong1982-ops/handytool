'use client'

import { useState } from 'react'
import { InvoiceProvider, useInvoice } from '@/tools/invoice-generator/invoice-provider'
import { InvoiceEditor } from '@/tools/invoice-generator/invoice-editor'
import { InvoicePreview } from '@/tools/invoice-generator/invoice-preview'
import { exportInvoicePDF } from '@/tools/invoice-generator/shared/pdf-export'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'

function ActionBar() {
  const { state, dispatch } = useInvoice()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasItems = state.invoice.lineItems.some(
    (item) => item.description.trim() && item.rate > 0
  )

  const handleDownload = async () => {
    if (!hasItems) {
      setError('Add at least one line item with a description and rate.')
      return
    }
    setError(null)
    setDownloading(true)
    try {
      // Switch to a tab that renders the preview area; the preview is always
      // mounted on desktop, but on mobile it may be hidden. The preview
      // container exists once mounted, so just trigger the export.
      await exportInvoicePDF(state.invoice.invoiceNumber)
    } catch (err) {
      console.error('PDF export failed', err)
      setError('Could not generate PDF. Try refreshing the page.')
    } finally {
      setDownloading(false)
    }
  }

  const handleSaveTemplate = () => {
    // Trigger the template panel by switching to settings tab
    dispatch({ type: 'SET_TAB', payload: 'settings' })
  }

  return (
    <footer className="sticky bottom-0 z-50 bg-[#131a23]/95 backdrop-blur-md border-t border-[#1e2631]">
      <div className="px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#70767f] min-w-0">
          {error ? (
            <span className="text-red-400 truncate">{error}</span>
          ) : (
            <span className="hidden sm:inline">Auto-saved locally</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveTemplate}
            className="hidden sm:flex border border-[#1e2631] text-[#a6abb5] hover:text-white hover:border-[#a6abb5] px-4 py-2.5 rounded-lg text-sm font-medium items-center gap-2 min-h-[44px] transition-colors"
          >
            Save Template
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3D6AF2, #3D9DF2)' }}
          >
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </footer>
  )
}

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
            className={`w-full lg:w-[45%] flex flex-col overflow-hidden border-r border-[#1e2631] ${
              showPreview ? 'max-lg:hidden' : ''
            }`}
          >
            <InvoiceEditor />
          </div>
          <div className={`flex-1 min-h-0 ${showPreview ? '' : 'max-lg:hidden'}`}>
            <InvoicePreview />
          </div>
        </div>

        {/* Action bar */}
        <ActionBar />
      </div>
    </InvoiceProvider>
  )
}
