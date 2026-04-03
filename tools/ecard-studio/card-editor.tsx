'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ECardData, TemplateId } from '@/tools/ecard-studio/types'
import { useHistory } from '@/tools/ecard-studio/use-history'
import { ALL_TEMPLATES, BLANK_DEFAULTS } from '@/tools/ecard-studio/templates'
import { TemplateStrip } from '@/tools/ecard-studio/template-strip'
import { CardCanvas } from '@/tools/ecard-studio/card-canvas'
import { CustomizationPanel } from '@/tools/ecard-studio/customization-panel'
import { PreviewModal } from '@/tools/ecard-studio/preview-modal'
import { exportCardAsPng } from '@/tools/ecard-studio/export'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { BackButton } from '@/components/ui/back-button'

function getInitialCardData(templateId: TemplateId): ECardData {
  if (templateId === 'blank') return { ...BLANK_DEFAULTS }
  const template = ALL_TEMPLATES.find((t) => t.id === templateId)
  return template ? { ...template.defaults } : { ...BLANK_DEFAULTS }
}

export function CardEditor({ initialTemplate }: { initialTemplate?: TemplateId }) {
  const { state: cardData, set: setCardData, update: updateCardData, undo, redo, canUndo, canRedo } = useHistory<ECardData>(getInitialCardData(initialTemplate ?? 'executive'))
  const [zoom, setZoom] = useState(100)
  const [showPreview, setShowPreview] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [showMobileTemplates, setShowMobileTemplates] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleCardChange = useCallback((updates: Partial<ECardData>) => {
    updateCardData(updates)
  }, [updateCardData])

  const handleLogoMove = useCallback((logoX: number, logoY: number) => {
    updateCardData({ logoX, logoY })
  }, [updateCardData])

  const handleTemplateSelect = useCallback((templateId: TemplateId) => {
    const template = ALL_TEMPLATES.find((t) => t.id === templateId)
    if (template) setCardData({ ...template.defaults })
    else if (templateId === 'blank') setCardData({ ...BLANK_DEFAULTS })
  }, [setCardData])

  const handleLoadCardData = useCallback((data: ECardData) => {
    setCardData({ ...data })
  }, [setCardData])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    await exportCardAsPng(cardRef.current, cardData.template)
  }, [cardData.template])

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-950 overflow-hidden lg:max-h-[calc(100vh-4rem)]">
      {/* Fullscreen lock: editor needs body overflow hidden + no footer */}
      <style dangerouslySetInnerHTML={{ __html: 'html, body { height: 100dvh !important; min-height: 100dvh !important; overflow: hidden !important; } body > footer { display: none !important; }' }} />
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 flex-shrink-0 overflow-x-auto">
        {/* Left: Back / Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 shrink-0">
          <BackButton />
          <ol className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
            <li><a href="/tools" className="hover:text-white transition-colors">Tools</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white font-medium">ECard Studio</li>
          </ol>
          <FavoriteButton slug="ecard-studio" name="ECard Studio" />
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile: Templates toggle */}
          <button
            type="button"
            onClick={() => setShowMobileTemplates((v) => !v)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm border rounded-md transition-colors ${
              showMobileTemplates
                ? 'text-blue-400 border-blue-500/50 bg-blue-500/10'
                : 'text-slate-300 hover:text-white border-slate-700 hover:border-slate-500'
            }`}
            aria-label="Toggle template gallery"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          {/* Mobile: Edit panel toggle */}
          <button
            type="button"
            onClick={() => setShowMobilePanel(true)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-md transition-colors"
            aria-label="Open editor panel"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
              <path
                d="M10 2V5M10 15V18M2 10H5M15 10H18M4.22 4.22L6.34 6.34M13.66 13.66L15.78 15.78M15.78 4.22L13.66 6.34M6.34 13.66L4.22 15.78"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 8h8a3 3 0 0 1 0 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 5L4 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M14 8H6a3 3 0 0 0 0 6h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-2.5 py-2 min-h-[44px] text-sm border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="sm:hidden shrink-0" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-2 min-h-[44px] text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 1V9M7 9L4 6M7 9L10 6M2 11H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Template Strip — hidden on mobile, toggled via Templates button */}
      <div className={`${showMobileTemplates ? 'block' : 'hidden'} lg:block`}>
        <TemplateStrip
          activeTemplate={cardData.template}
          onSelectTemplate={(id) => {
            handleTemplateSelect(id)
            setShowMobileTemplates(false)
          }}
          onLoadCardData={(data) => {
            handleLoadCardData(data)
            setShowMobileTemplates(false)
          }}
        />
      </div>

      {/* 2-Column Layout: Canvas + Edit Panel */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Left: Card Canvas */}
        <div className="flex-1 min-w-0 min-h-[40vh] lg:min-h-0">
          <CardCanvas
            cardData={cardData}
            cardRef={cardRef}
            zoom={zoom}
            onZoomChange={setZoom}
            onLogoMove={handleLogoMove}
            onSelectTemplate={handleTemplateSelect}
          />
        </div>

        {/* Right: Edit Panel — desktop */}
        <div className="w-[320px] flex-shrink-0 border-l border-slate-800 overflow-y-auto hidden lg:block min-h-0">
          <CustomizationPanel
            cardData={cardData}
            onChange={handleCardChange}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* Mobile Edit Panel Drawer */}
      {showMobilePanel && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setShowMobilePanel(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMobilePanel(false)
            }}
            role="button"
            tabIndex={0}
            aria-label="Close editor panel"
          />
          <div className="fixed inset-y-0 right-0 w-[320px] max-w-[85vw] bg-slate-950 z-50 overflow-y-auto lg:hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-sm font-medium text-white">Editor</span>
              <button
                type="button"
                onClick={() => setShowMobilePanel(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Close editor panel"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
              onDownload={handleDownload}
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
