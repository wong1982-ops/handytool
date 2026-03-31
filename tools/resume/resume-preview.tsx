'use client'

import { useResume } from './resume-provider'
import { ClassicLayout } from './themes/classic-layout'
import { BlueMinimalLayout } from './themes/blue-minimal-layout'
import { YellowMinimalLayout } from './themes/yellow-minimal-layout'

const THEME_LAYOUTS = {
  classic: ClassicLayout,
  'blue-minimal': BlueMinimalLayout,
  'yellow-minimal': YellowMinimalLayout,
} as const

export function ResumePreview() {
  const { state, t } = useResume()
  const { resume } = state
  const { theme } = resume

  const Layout = THEME_LAYOUTS[theme.templateId]

  const hasContent = resume.baseInfo.name || resume.baseInfo.email || resume.baseInfo.phone

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-y-auto p-4 flex flex-col items-center print:p-0 print:bg-white">
      <div
        id="resume-print-target"
        className="bg-white shadow-lg rounded-sm w-full max-w-[595px] min-h-[842px] relative print:shadow-none print:rounded-none print:max-w-none"
        style={{
          fontFamily:
            theme.fontFamily === 'serif'
              ? 'Georgia, "Times New Roman", serif'
              : theme.fontFamily === 'mono'
                ? 'ui-monospace, SFMono-Regular, monospace'
                : 'system-ui, -apple-system, sans-serif',
          fontSize: theme.fontSize === 'sm' ? '12px' : theme.fontSize === 'lg' ? '16px' : '14px',
        }}
      >
        {hasContent ? (
          <Layout resume={resume} t={t} />
        ) : (
          <div className="flex items-center justify-center min-h-[842px] text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-4" aria-hidden="true">📄</p>
              <p className="text-sm">{t.preview.noContent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
