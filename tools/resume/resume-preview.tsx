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

const A4_HEIGHT = 842
const PAGE_MARGIN = 40 // top/bottom margin for page 2+

export function ResumePreview() {
  const { state, t } = useResume()
  const { resume } = state
  const { theme } = resume
  const measureRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT)

  const Layout = THEME_LAYOUTS[theme.templateId]
  const hasContent = resume.baseInfo.name || resume.baseInfo.email || resume.baseInfo.phone

  const fontStyle = {
    fontFamily:
      theme.fontFamily === 'serif'
        ? 'Georgia, "Times New Roman", serif'
        : theme.fontFamily === 'mono'
          ? 'ui-monospace, SFMono-Regular, monospace'
          : 'system-ui, -apple-system, sans-serif',
    fontSize: theme.fontSize === 'sm' ? '12px' : theme.fontSize === 'lg' ? '16px' : '14px',
  }

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) {
        const h = measureRef.current.scrollHeight
        if (h > 0) setContentHeight(h)
      }
    }
    const t1 = setTimeout(measure, 100)
    const t2 = setTimeout(measure, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [resume.updatedAt, resume.enabledModules.length, resume.theme.templateId, resume.theme.primaryColor])

  // Page 1 uses full A4 height, page 2+ has margins
  const usablePageHeight = A4_HEIGHT - PAGE_MARGIN * 2
  const remainingAfterPage1 = Math.max(0, contentHeight - A4_HEIGHT)
  const extraPages = remainingAfterPage1 > 0 ? Math.ceil(remainingAfterPage1 / usablePageHeight) : 0
  const pageCount = 1 + extraPages

  // Content offset for each page
  const getPageOffset = (pageIdx: number) => {
    if (pageIdx === 0) return 0
    return A4_HEIGHT + (pageIdx - 1) * usablePageHeight
  }

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-y-auto p-4 flex flex-col items-center print:p-0 print:bg-white">
      {/* Page counter */}
      {hasContent && (
        <div className="w-full max-w-[595px] mb-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 print:hidden">
          <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
          <span>A4 (210 x 297mm)</span>
        </div>
      )}

      {/* Visible paginated preview */}
      <div className="w-full max-w-[595px] flex flex-col gap-4 print:gap-0">
        {hasContent ? (
          Array.from({ length: pageCount }, (_, pageIdx) => (
            <div
              key={pageIdx}
              className="relative bg-white shadow-lg rounded-sm print:shadow-none print:rounded-none"
              style={{ height: A4_HEIGHT, overflow: 'hidden' }}
            >
              {/* Page number */}
              {pageCount > 1 && (
                <div className="absolute top-2 right-2 z-20 text-[10px] px-1.5 py-0.5 rounded bg-black/10 text-gray-500 print:hidden">
                  {pageIdx + 1} / {pageCount}
                </div>
              )}

              {/* Content: page 1 starts at top, page 2+ has top margin */}
              <div
                style={{
                  ...fontStyle,
                  position: 'relative',
                  top: pageIdx === 0
                    ? 0
                    : -getPageOffset(pageIdx) + PAGE_MARGIN,
                  width: '100%',
                }}
              >
                <Layout resume={resume} t={t} />
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

      {/* Hidden measurer for content height + PDF export */}
      <div
        ref={measureRef}
        id="resume-print-target"
        className="w-[595px] bg-white"
        style={{
          ...fontStyle,
          position: 'absolute',
          left: '-9999px',
          top: 0,
          visibility: 'hidden',
        }}
        aria-hidden="true"
      >
        {hasContent && <Layout resume={resume} t={t} />}
      </div>
    </div>
  )
}
