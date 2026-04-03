'use client'

import { useState, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import type { FaviconConfig, CreationMode } from '@/tools/favicon-generator/types'
import { DEFAULT_CONFIG } from '@/tools/favicon-generator/types'
import TextTab from '@/tools/favicon-generator/text-tab'
import UploadTab from '@/tools/favicon-generator/upload-tab'
import IconTab from '@/tools/favicon-generator/icon-tab'
import AiTab from '@/tools/favicon-generator/ai-tab'
import PreviewPanel from '@/tools/favicon-generator/preview-panel'
import ExportPanel from '@/tools/favicon-generator/export-panel'

const TABS: { value: CreationMode; label: string; icon: React.ReactNode }[] = [
  {
    value: 'upload',
    label: 'Upload',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    value: 'text',
    label: 'Text',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    value: 'icon',
    label: 'Icons',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    value: 'ai',
    label: 'AI',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
]

export default function FaviconGeneratorPage() {
  const [config, setConfig] = useState<FaviconConfig>(DEFAULT_CONFIG)
  const [activeTab, setActiveTab] = useState<CreationMode>('text')

  const handleConfigChange = useCallback((updates: Partial<FaviconConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates }
      return next
    })
    // Auto-switch tab if mode changes
    if (updates.mode && updates.mode !== activeTab) {
      setActiveTab(updates.mode)
    }
  }, [activeTab])

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="Favicon Generator" toolSlug="favicon-generator" />

        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-white leading-tight">
            Favicon Generator
          </h1>
          <p className="text-sm text-[#a6abb5]">
            Create favicons from text, icons, images, or AI &mdash; download a complete package
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Creation area */}
          <div className="flex-1 min-w-0">
            {/* Tab buttons */}
            <div
              role="tablist"
              aria-label="Favicon creation mode"
              className="flex gap-1 p-1 rounded-xl bg-[#1e2631] mb-4"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  role="tab"
                  type="button"
                  aria-selected={activeTab === tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                    activeTab === tab.value
                      ? 'bg-[#131a23] text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]'
                      : 'text-[#70767f] hover:text-[#a6abb5]'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Active tab content */}
            {activeTab === 'text' && (
              <TextTab config={config} onConfigChange={handleConfigChange} />
            )}
            {activeTab === 'upload' && (
              <UploadTab config={config} onConfigChange={handleConfigChange} />
            )}
            {activeTab === 'icon' && (
              <IconTab config={config} onConfigChange={handleConfigChange} />
            )}
            {activeTab === 'ai' && (
              <AiTab config={config} onConfigChange={handleConfigChange} />
            )}
          </div>

          {/* Right: Preview + Export */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
            <PreviewPanel config={config} />
            <ExportPanel config={config} />
          </div>
        </div>
      </div>
    </main>
  )
}
