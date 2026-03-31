'use client'

import { useEffect, useRef, useState } from 'react'
import { useResume } from './resume-provider'
import { ClassicLayout } from './themes/classic-layout'
import { BlueMinimalLayout } from './themes/blue-minimal-layout'
import { YellowMinimalLayout } from './themes/yellow-minimal-layout'

const THEME_LAYOUTS = {
  classic: ClassicLayout,
  'blue-minimal': BlueMinimalLayout,
  'yellow-minimal': YellowMinimalLayout,
} as const

// A4 at 72dpi: 595 x 842 px. Our preview width is max 595px.
const A4_HEIGHT = 842

export function ResumePreview() {
  const { state, t } = useResume()
  const { resume } = state
  const { theme } = resume
  const contentRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  const Layout = THEME_LAYOUTS[theme.templateId]
  const hasContent = resume.baseInfo.name || resume.baseInfo.email || resume.baseInfo.phone

  // Measure content and calculate page count
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        const h = contentRef.current.scrollHeight
        setPageCount(Math.max(1, Math.ceil(h / A4_HEIGHT)))
      }
    }
    measure()
    // Re-measure on any resume change
    const timer = setTimeout(measure, 300)
    return () => clearTimeout(timer)
  }, [resume.updatedAt, resume.enabledModules.length, resume.theme.templateId])

  const fontStyle = {
    fontFamily:
      theme.fontFamily === 'serif'
        ? 'Georgia, "Times New Roman", serif'
        : theme.fontFamily === 'mono'
          ? 'ui-monospace, SFMono-Regular, monospace'
          : 'system-ui, -apple-system, sans-serif',
    fontSize: theme.fontSize === 'sm' ? '12px' : theme.fontSize === 'lg' ? '16px' : '14px',
  }

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-y-auto p-4 flex flex-col items-center print:p-0 print:bg-white">
      {/* Page counter */}
      {hasContent && pageCount > 0 && (
        <div className="w-full max-w-[595px] mb-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 print:hidden">
          <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
          <span>A4 (210 × 297mm)</span>
        </div>
      )}

      {/* Pages container — shows visual page breaks */}
      <div className="w-full max-w-[595px] flex flex-col gap-4 print:gap-0">
        {hasContent ? (
          Array.from({ length: pageCount }, (_, pageIdx) => (
            <div
              key={pageIdx}
              className="relative bg-white shadow-lg rounded-sm overflow-hidden print:shadow-none print:rounded-none"
              style={{ height: A4_HEIGHT }}
            >
              {/* Page number label */}
              {pageCount > 1 && (
                <div className="absolute top-2 right-2 z-10 text-[10px] text-gray-300 print:hidden">
                  {pageIdx + 1} / {pageCount}
                </div>
              )}

              {/* Content window: clips to this page's visible area */}
              <div
                className="absolute inset-0 overflow-hidden"
              >
                <div
                  ref={pageIdx === 0 ? contentRef : undefined}
                  style={{
                    ...fontStyle,
                    transform: `translateY(${-pageIdx * A4_HEIGHT}px)`,
                  }}
                >
                  <Layout resume={resume} t={t} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="bg-white shadow-lg rounded-sm flex items-center justify-center text-gray-400"
            style={{ height: A4_HEIGHT }}
          >
            <div className="text-center">
              <p className="text-4xl mb-4" aria-hidden="true">📄</p>
              <p className="text-sm">{t.preview.noContent}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden full-content render for PDF export (not clipped) */}
      <div
        id="resume-print-target"
        className="absolute -left-[9999px] w-[595px] bg-white"
        style={fontStyle}
        aria-hidden="true"
      >
        {hasContent && <Layout resume={resume} t={t} />}
      </div>
    </div>
  )
}
