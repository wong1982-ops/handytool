'use client'

import { useCallback, useRef, useState } from 'react'
import type { ECardData, TemplateId } from '@/tools/ecard-studio/types'
import { TEMPLATES, BLANK_DEFAULTS } from '@/tools/ecard-studio/templates'
import { DesignLibrary } from '@/tools/ecard-studio/design-library'
import { CardCanvas } from '@/tools/ecard-studio/card-canvas'
import { CustomizationPanel } from '@/tools/ecard-studio/customization-panel'
import { PreviewModal } from '@/tools/ecard-studio/preview-modal'
import { exportCardAsPng } from '@/tools/ecard-studio/export'

interface CardEditorProps {
  initialTemplate: TemplateId
  onBack: () => void
}

function getInitialCardData(templateId: TemplateId): ECardData {
  if (templateId === 'blank') return { ...BLANK_DEFAULTS }
  const template = TEMPLATES.find((t) => t.id === templateId)
  return template ? { ...template.defaults } : { ...BLANK_DEFAULTS }
}

export function CardEditor({ initialTemplate, onBack }: CardEditorProps) {
  const [cardData, setCardData] = useState<ECardData>(() =>
    getInitialCardData(initialTemplate)
  )
  const [zoom, setZoom] = useState(100)
  const [showPreview, setShowPreview] = useState(false)
  const [projectName, setProjectName] = useState('Corporate Thank You - C...')
  const [showMobileLibrary, setShowMobileLibrary] = useState(false)
  const [showMobileCustomization, setShowMobileCustomization] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleCardChange = useCallback((updates: Partial<ECardData>) => {
    setCardData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleTemplateSelect = useCallback((templateId: TemplateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (template) setCardData({ ...template.defaults })
  }, [])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    await exportCardAsPng(cardRef.current, cardData.template)
  }, [cardData.template])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        {/* Left: Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-sm whitespace-nowrap"
          aria-label="Back to Templates"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">Back to Templates</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Mobile: Library toggle */}
        <button
          type="button"
          onClick={() => setShowMobileLibrary(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Open design library"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 5H17M3 10H17M3 15H17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Center: Brand + project name */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="hidden md:block whitespace-nowrap">
            <span className="font-semibold text-white text-sm">
              ECard Studio
            </span>
            <span className="text-xs text-slate-400 ml-2">
              Professional Design Suite
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              Project:
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-b border-slate-600 text-white text-sm px-1 py-0.5 w-48 min-w-0 outline-none focus:border-blue-500 transition-colors"
              aria-label="Project name"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-md transition-colors"
          >
            Preview
          </button>
          <button
            type="button"
            disabled
            className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 rounded-md opacity-50 cursor-not-allowed hidden sm:inline-flex"
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 1V9M7 9L4 6M7 9L10 6M2 11H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download
          </button>
        </div>

        {/* Mobile: Customization toggle */}
        <button
          type="button"
          onClick={() => setShowMobileCustomization(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Open customization panel"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
            <path
              d="M10 2V5M10 15V18M2 10H5M15 10H18M4.22 4.22L6.34 6.34M13.66 13.66L15.78 15.78M15.78 4.22L13.66 6.34M6.34 13.66L4.22 15.78"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Design Library — desktop */}
        <div className="w-[250px] flex-shrink-0 border-r border-slate-800 overflow-y-auto hidden lg:block">
          <DesignLibrary
            activeTemplate={cardData.template}
            onSelectTemplate={handleTemplateSelect}
          />
        </div>

        {/* Center: Card Canvas */}
        <div className="flex-1 min-w-0">
          <CardCanvas
            cardData={cardData}
            cardRef={cardRef}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        </div>

        {/* Right: Customization Panel — desktop */}
        <div className="w-[300px] flex-shrink-0 border-l border-slate-800 overflow-y-auto hidden lg:block">
          <CustomizationPanel
            cardData={cardData}
            onChange={handleCardChange}
          />
        </div>
      </div>

      {/* Mobile Library Drawer */}
      {showMobileLibrary && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setShowMobileLibrary(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMobileLibrary(false)
            }}
            role="button"
            tabIndex={0}
            aria-label="Close design library"
          />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-slate-950 z-50 overflow-y-auto lg:hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-sm font-medium text-white">
                Design Library
              </span>
              <button
                type="button"
                onClick={() => setShowMobileLibrary(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close design library"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 5L13 13M13 5L5 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <DesignLibrary
              activeTemplate={cardData.template}
              onSelectTemplate={(id) => {
                handleTemplateSelect(id)
                setShowMobileLibrary(false)
              }}
            />
          </div>
        </>
      )}

      {/* Mobile Customization Drawer */}
      {showMobileCustomization && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setShowMobileCustomization(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMobileCustomization(false)
            }}
            role="button"
            tabIndex={0}
            aria-label="Close customization panel"
          />
          <div className="fixed inset-y-0 right-0 w-[300px] bg-slate-950 z-50 overflow-y-auto lg:hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-sm font-medium text-white">
                Customization
              </span>
              <button
                type="button"
                onClick={() => setShowMobileCustomization(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close customization panel"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 5L13 13M13 5L5 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <CustomizationPanel
              cardData={cardData}
              onChange={handleCardChange}
            />
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          cardData={cardData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
