'use client'

import { useState } from 'react'
import { useInvoice } from './invoice-provider'
import { ClassicInvoice } from './themes/classic-invoice'
import { ModernInvoice } from './themes/modern-invoice'
import { MinimalInvoice } from './themes/minimal-invoice'
import type { InvoiceTemplateId } from './invoice-types'

const THEME_LAYOUTS = {
  classic: ClassicInvoice,
  modern: ModernInvoice,
  minimal: MinimalInvoice,
} as const satisfies Record<InvoiceTemplateId, React.ComponentType<{ invoice: ReturnType<typeof useInvoice>['state']['invoice'] }>>

const ZOOM_OPTIONS = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
]

// A4 dimensions: 210mm x 297mm. At 96dpi: ~794 x 1123 px
const A4_WIDTH_PX = 794
const A4_MIN_HEIGHT_PX = 1123

export function InvoicePreview() {
  const { state } = useInvoice()
  const { invoice } = state
  const [zoom, setZoom] = useState(0.75)

  const Layout = THEME_LAYOUTS[invoice.theme.templateId]

  const fontFamily =
    invoice.theme.fontFamily === 'serif'
      ? 'Georgia, "Times New Roman", serif'
      : invoice.theme.fontFamily === 'mono'
        ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
        : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

  const baseFontSize =
    invoice.theme.fontSize === 'sm' ? 12 : invoice.theme.fontSize === 'lg' ? 16 : 14

  return (
    <div className="flex flex-col h-full bg-[#090f16]">
      {/* Zoom bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2631] shrink-0">
        <span className="text-xs text-[#70767f]">Preview</span>
        <div className="flex items-center gap-1">
          {ZOOM_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setZoom(opt.value)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                zoom === opt.value
                  ? 'text-white bg-[#3D6AF2]/20'
                  : 'text-[#70767f] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* A4 preview area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            // Reserve space so the scaled element doesn't overlap siblings
            width: A4_WIDTH_PX * zoom,
            height: A4_MIN_HEIGHT_PX * zoom,
          }}
        >
          <div
            id="invoice-preview-container"
            style={{
              width: A4_WIDTH_PX,
              minHeight: A4_MIN_HEIGHT_PX,
              background: invoice.theme.backgroundColor,
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              padding: 32,
              fontFamily,
              fontSize: baseFontSize,
              lineHeight: 1.4,
              color: invoice.theme.textColor,
              boxSizing: 'border-box',
            }}
          >
            <Layout invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  )
}
