'use client'

import { useState, useCallback, useEffect } from 'react'
import { InteractiveCanvas } from '@/tools/id-photo/interactive-canvas'
import { FormatSelector } from '@/tools/id-photo/format-selector'
import { AdjustmentsPanel } from '@/tools/id-photo/adjustments-panel'
import { BackgroundPicker } from '@/tools/id-photo/background-picker'
import { CompliancePanel } from '@/tools/id-photo/compliance-panel'
import { ExportSettings, exportDigitalPhoto, exportPrintSheet, type ExportMode, type PaperSize } from '@/tools/id-photo/export-settings'
import { PrintPreview } from '@/tools/id-photo/print-preview'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { BackButton } from '@/components/ui/back-button'
import { useFaceAnalysis } from '@/tools/id-photo/use-face-analysis'
import {
  PHOTO_FORMATS,
  DEFAULT_TRANSFORM,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_COMPLIANCE,
  type PhotoFormat,
  type Transform,
  type Adjustments,
  type Compliance,
} from '@/tools/id-photo/types'

export default function IdPhotoPage() {
  // --- Core state ---
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [selectedFormatId, setSelectedFormatId] = useState('us-passport')
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM)
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [showGuides, setShowGuides] = useState(true)
  const [compliance, setCompliance] = useState<Compliance>(DEFAULT_COMPLIANCE)

  // Face analysis (real server-side detection)
  const { state: analysisState, result: analysisResult, error: analysisError, analyze: analyzeFace, reset: resetAnalysis } = useFaceAnalysis()
  const faceDetected = analysisState === 'done' && analysisResult !== null

  // --- Export state ---
  const [exportMode, setExportMode] = useState<ExportMode>('digital')
  const [paperSize, setPaperSize] = useState<PaperSize>('4x6')

  // --- UI state ---
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const selectedFormat = PHOTO_FORMATS.find((f) => f.id === selectedFormatId) || PHOTO_FORMATS[0]

  // --- Toast helper ---
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  // --- File upload ---
  const handleFileSelect = useCallback((file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPEG, PNG, etc.)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('File too large. Maximum size is 20 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoUrl(e.target?.result as string)
      setTransform(DEFAULT_TRANSFORM)
      showToast('Analyzing face...')
      analyzeFace(file)
    }
    reader.readAsDataURL(file)
  }, [showToast])

  // --- Map server compliance to component state ---
  useEffect(() => {
    if (!analysisResult) {
      setCompliance(DEFAULT_COMPLIANCE)
      return
    }

    const c = analysisResult.compliance
    setCompliance({
      centered: c.centered.level === 'pass' ? 'pass' : c.centered.level === 'warn' ? 'warn' : 'fail',
      faceSize: c.faceSize.level === 'pass' ? 'pass' : c.faceSize.level === 'warn' ? 'warn' : 'fail',
      headStraight: c.headStraight.level === 'pass' ? 'pass' : c.headStraight.level === 'warn' ? 'warn' : 'fail',
      eyesOpen: c.eyesOpen.level === 'pass' ? 'pass' : c.eyesOpen.level === 'warn' ? 'warn' : 'fail',
      lighting: c.lighting.level === 'pass' ? 'pass' : c.lighting.level === 'warn' ? 'warn' : 'fail',
    })
  }, [analysisResult])

  // --- Show analysis error/success toasts ---
  useEffect(() => {
    if (analysisError) {
      showToast(analysisError)
    }
  }, [analysisError, showToast])

  useEffect(() => {
    if (analysisResult) {
      showToast(`Face detected — compliance score: ${analysisResult.score}/100`)
    }
  }, [analysisResult, showToast])

  // --- Format selection ---
  const handleFormatSelect = useCallback((format: PhotoFormat) => {
    setSelectedFormatId(format.id)
    setShowMobileSidebar(false)
  }, [])

  // --- Reset ---
  const handleReset = useCallback(() => {
    setPhotoUrl(null)
    setTransform(DEFAULT_TRANSFORM)
    setAdjustments(DEFAULT_ADJUSTMENTS)
    resetAnalysis()
    setCompliance(DEFAULT_COMPLIANCE)
  }, [resetAnalysis])

  // --- Download ---
  const handleDownload = useCallback(async () => {
    if (!photoUrl || downloading) return
    setDownloading(true)

    try {
      let blob: Blob
      if (exportMode === 'digital') {
        blob = await exportDigitalPhoto({
          photoUrl,
          transform,
          adjustments,
          format: selectedFormat,
          bgColor,
        })
      } else {
        blob = await exportPrintSheet({
          photoUrl,
          transform,
          adjustments,
          format: selectedFormat,
          bgColor,
          paperSize,
        })
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = exportMode === 'digital'
        ? `id-photo-${selectedFormatId}.jpg`
        : `print-sheet-${paperSize}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Photo downloaded successfully!')
    } catch {
      showToast('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }, [photoUrl, downloading, exportMode, transform, adjustments, selectedFormat, bgColor, paperSize, selectedFormatId, showToast])

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          setTransform((t) => ({ ...t, scale: Math.min(3, t.scale + 0.1) }))
          break
        case '-':
          e.preventDefault()
          setTransform((t) => ({ ...t, scale: Math.max(0.3, t.scale - 0.1) }))
          break
        case 'r':
        case 'R':
          e.preventDefault()
          setTransform(DEFAULT_TRANSFORM)
          break
        case 'g':
        case 'G':
          e.preventDefault()
          setShowGuides((v) => !v)
          break
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) return
          e.preventDefault()
          handleDownload()
          break
        case 'ArrowUp':
          e.preventDefault()
          setTransform((t) => ({ ...t, y: t.y - 5 }))
          break
        case 'ArrowDown':
          e.preventDefault()
          setTransform((t) => ({ ...t, y: t.y + 5 }))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setTransform((t) => ({ ...t, x: t.x - 5 }))
          break
        case 'ArrowRight':
          e.preventDefault()
          setTransform((t) => ({ ...t, x: t.x + 5 }))
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleDownload])

  return (
    <div className="flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 fixed inset-0 top-[80px] md:top-[80px] z-30">
      {/* Top bar with breadcrumb */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle format panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <BackButton />
            <ol className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-900 dark:text-white font-medium">ID Photo Editor</li>
            </ol>
            <FavoriteButton slug="id-photo" name="ID Photo Editor" />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Guides toggle */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              showGuides
                ? 'bg-[var(--tk-color-secondary-500)]/10 text-[var(--tk-color-secondary-500)]'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label={showGuides ? 'Hide guides' : 'Show guides'}
            title="Toggle guides (G)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>

          {/* Mobile settings toggle */}
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className="xl:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle settings panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Format badge */}
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--tk-color-secondary-500)]/10 text-[var(--tk-color-secondary-500)] rounded-lg text-xs font-bold">
            {selectedFormat.name} ({selectedFormat.dimensions.split('(')[0].trim()})
          </span>
        </div>
      </div>

      {/* Main 3-panel workspace */}
      <main className="flex-1 flex overflow-hidden relative min-h-0">
        {/* LEFT: Format Selector — desktop */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <FormatSelector
            selectedFormatId={selectedFormatId}
            onSelect={handleFormatSelect}
          />
        </aside>

        {/* Mobile left sidebar overlay */}
        {showMobileSidebar && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowMobileSidebar(false)} aria-hidden="true" />
            <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-40 lg:hidden shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Select Format</span>
                <button onClick={() => setShowMobileSidebar(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FormatSelector
                selectedFormatId={selectedFormatId}
                onSelect={handleFormatSelect}
              />
            </div>
          </>
        )}

        {/* CENTER: Interactive Canvas */}
        <InteractiveCanvas
          photoUrl={photoUrl}
          transform={transform}
          adjustments={adjustments}
          selectedFormat={selectedFormat}
          showGuides={showGuides}
          bgColor={bgColor}
          faceDetected={faceDetected}
          analysisState={analysisState}
          faceBox={analysisResult?.faceBox ?? null}
          onTransformChange={setTransform}
          onFileSelect={handleFileSelect}
        />

        {/* RIGHT: Settings Panel — desktop */}
        <aside className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-6">
            <BackgroundPicker bgColor={bgColor} onChange={setBgColor} />
            <hr className="border-slate-100 dark:border-slate-800" />
            <AdjustmentsPanel adjustments={adjustments} onChange={setAdjustments} />
            <hr className="border-slate-100 dark:border-slate-800" />
            <CompliancePanel compliance={compliance} />
            <hr className="border-slate-100 dark:border-slate-800" />
            {exportMode === 'print' && (
              <>
                <PrintPreview
                  photoUrl={photoUrl}
                  format={selectedFormat}
                  transform={transform}
                  adjustments={adjustments}
                  bgColor={bgColor}
                  paperSize={paperSize}
                />
                <hr className="border-slate-100 dark:border-slate-800" />
              </>
            )}
            <ExportSettings
              exportMode={exportMode}
              paperSize={paperSize}
              onExportModeChange={setExportMode}
              onPaperSizeChange={setPaperSize}
              onDownload={handleDownload}
              photoUrl={photoUrl}
            />
          </div>
        </aside>

        {/* Mobile right settings overlay */}
        {showMobileSettings && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 xl:hidden" onClick={() => setShowMobileSettings(false)} aria-hidden="true" />
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-40 xl:hidden shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Settings</span>
                <button onClick={() => setShowMobileSettings(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-6">
                <BackgroundPicker bgColor={bgColor} onChange={setBgColor} />
                <hr className="border-slate-100 dark:border-slate-800" />
                <AdjustmentsPanel adjustments={adjustments} onChange={setAdjustments} />
                <hr className="border-slate-100 dark:border-slate-800" />
                <CompliancePanel compliance={compliance} />
                <hr className="border-slate-100 dark:border-slate-800" />
                {exportMode === 'print' && (
                  <>
                    <PrintPreview
                      photoUrl={photoUrl}
                      format={selectedFormat}
                      transform={transform}
                      adjustments={adjustments}
                      bgColor={bgColor}
                      paperSize={paperSize}
                    />
                    <hr className="border-slate-100 dark:border-slate-800" />
                  </>
                )}
                <ExportSettings
                  exportMode={exportMode}
                  paperSize={paperSize}
                  onExportModeChange={setExportMode}
                  onPaperSizeChange={setPaperSize}
                  onDownload={() => { handleDownload(); setShowMobileSettings(false) }}
                  photoUrl={photoUrl}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom action bar */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <>
              {faceDetected && (
                <div className="flex items-center gap-1.5 text-green-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-tight">Face Detected</span>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-medium">
                  Head size: {selectedFormat.widthMm}mm &middot; {Math.round(transform.scale * 100)}% zoom
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Upload a photo to begin &mdash; {selectedFormat.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!photoUrl}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!photoUrl || downloading}
            className="bg-[var(--tk-color-secondary-500)] text-slate-900 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            <span className="hidden sm:inline">Download High-Res</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300" role="status">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}
