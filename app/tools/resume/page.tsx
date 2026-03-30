'use client'

import { ResumeProvider } from '@/tools/resume/resume-provider'
import { ResumeSidebar } from '@/tools/resume/resume-sidebar'
import { ResumeEditor } from '@/tools/resume/resume-editor'
import { ResumePreview } from '@/tools/resume/resume-preview'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { useState } from 'react'

export default function ResumePage() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <ResumeProvider>
      <div className="flex flex-col h-[100dvh]">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Resume Builder
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={showPreview ? 'Show editor' : 'Show preview'}
            >
              {showPreview ? '✏️ Edit' : '👁 Preview'}
            </button>
            <FavoriteButton slug="resume" name="Resume Builder" />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — always visible */}
          <ResumeSidebar />

          {/* Editor — hidden on mobile when preview is shown */}
          <div className={`flex-1 flex flex-col overflow-hidden ${showPreview ? 'max-lg:hidden' : ''}`}>
            <ResumeEditor />
          </div>

          {/* Preview — hidden on mobile by default, shown on desktop always */}
          <div className={`flex-1 overflow-hidden border-l border-gray-200 dark:border-gray-700 ${showPreview ? '' : 'max-lg:hidden'}`}>
            <ResumePreview />
          </div>
        </div>
      </div>
    </ResumeProvider>
  )
}
