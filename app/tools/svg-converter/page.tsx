'use client'

import { useState, useCallback } from 'react'
import { UploadScreen } from '@/tools/svg-converter/upload-screen'
import { ComparisonCanvas } from '@/tools/svg-converter/comparison-canvas'
import { CropResizeEditor } from '@/tools/svg-converter/crop-resize-editor'
import { VectorizationSettingsPanel } from '@/tools/svg-converter/vectorization-settings'
import { ExportActions } from '@/tools/svg-converter/export-actions'
import { ZoomControls } from '@/tools/svg-converter/zoom-controls'
import { StatusBar } from '@/tools/svg-converter/status-bar'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { BackButton } from '@/components/ui/back-button'
import { BatchPanel } from '@/tools/svg-converter/batch-panel'
import { useSvgTracer } from '@/tools/svg-converter/use-svg-tracer'
import { svgToEps } from '@/tools/svg-converter/exporters/svg-to-eps'
import { svgToPdf } from '@/tools/svg-converter/exporters/svg-to-pdf'
import { svgToPng } from '@/tools/svg-converter/exporters/svg-to-png'
import { DEFAULT_SETTINGS } from '@/tools/svg-converter/types'
import type { ImageMeta, VectorizationSettings } from '@/tools/svg-converter/types'
import type { EditorPhase } from '@/tools/svg-converter/types'

export default function SvgConverterPage() {
  // Image state
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Editor phase: upload → crop → vectorize
  const [editorPhase, setEditorPhase] = useState<EditorPhase>('upload')

  // The image passed to useSvgTracer (after crop/resize, or raw if skipped)
  const [processedImageMeta, setProcessedImageMeta] = useState<ImageMeta | null>(null)

  // Settings
  const [settings, setSettings] = useState<VectorizationSettings>(DEFAULT_SETTINGS)

  // Canvas state
  const [sliderPosition, setSliderPosition] = useState(50)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  // Batch mode state
  const [batchFiles, setBatchFiles] = useState<File[]>([])
  const [isBatchMode, setIsBatchMode] = useState(false)

  // Mobile state
  const [showMobileSettings, setShowMobileSettings] = useState(false)

  // Conversion engine
  const { conversionState, vectorResult, error, reprocess, reset } = useSvgTracer(processedImageMeta, settings)

  // File handling
  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onload = () => {
        setImageMeta({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
          type: file.type,
          dataUrl,
        })
        setEditorPhase('crop')
        setSliderPosition(50)
        setZoom(100)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [])

  const handleNewFile = useCallback(() => {
    reset()
    setImageMeta(null)
    setProcessedImageMeta(null)
    setSettings(DEFAULT_SETTINGS)
    setEditorPhase('upload')
    setIsBatchMode(false)
    setBatchFiles([])
  }, [reset])

  // Batch mode handlers
  const handleBatchSelect = useCallback((files: File[]) => {
    setBatchFiles(files)
    setIsBatchMode(true)
    setEditorPhase('vectorize')
  }, [])

  const handleBatchRemoveFile = useCallback((index: number) => {
    setBatchFiles((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) {
        setIsBatchMode(false)
        setEditorPhase('upload')
      }
      return next
    })
  }, [])

  const handleBatchClearAll = useCallback(() => {
    setBatchFiles([])
    setIsBatchMode(false)
    setEditorPhase('upload')
  }, [])

  const handleBatchBack = useCallback(() => {
    setBatchFiles([])
    setIsBatchMode(false)
    setEditorPhase('upload')
  }, [])

  const handleCropConfirm = useCallback((processed: ImageMeta) => {
    setProcessedImageMeta(processed)
    setEditorPhase('vectorize')
  }, [])

  const handleCropSkip = useCallback(() => {
    setProcessedImageMeta(imageMeta)
    setEditorPhase('vectorize')
  }, [imageMeta])

  const handleBackToCrop = useCallback(() => {
    reset()
    setProcessedImageMeta(null)
    setEditorPhase('crop')
  }, [reset])

  // Download helper
  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // Derive base filename from original image name
  const baseFilename = useCallback(
    (ext: string) =>
      imageMeta ? imageMeta.name.replace(/\.[^.]+$/, ext) : `converted${ext}`,
    [imageMeta],
  )

  // Export handlers
  const handleDownloadSvg = useCallback(() => {
    if (!vectorResult) return
    const blob = new Blob([vectorResult.svgString], { type: 'image/svg+xml' })
    downloadBlob(blob, baseFilename('.svg'))
  }, [vectorResult, downloadBlob, baseFilename])

  const handleExportEps = useCallback(() => {
    if (!vectorResult) return
    try {
      const blob = svgToEps(vectorResult.svgString)
      downloadBlob(blob, baseFilename('.eps'))
    } catch (err) {
      console.error('EPS export failed:', err)
      alert('EPS export failed. Please try again.')
    }
  }, [vectorResult, downloadBlob, baseFilename])

  const handleExportPdf = useCallback(async () => {
    if (!vectorResult) return
    try {
      const blob = await svgToPdf(vectorResult.svgString)
      downloadBlob(blob, baseFilename('.pdf'))
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    }
  }, [vectorResult, downloadBlob, baseFilename])

  const handleExportPng = useCallback(async (targetWidth: number) => {
    if (!vectorResult) return
    try {
      const blob = await svgToPng(vectorResult.svgString, targetWidth)
      downloadBlob(blob, baseFilename('.png'))
    } catch (err) {
      console.error('PNG export failed:', err)
      alert('PNG export failed. Please try again.')
    }
  }, [vectorResult, downloadBlob, baseFilename])

  // Zoom handlers
  const handleZoomChange = useCallback((z: number) => setZoom(z), [])
  const handleFitScreen = useCallback(() => {
    if (!processedImageMeta) {
      setZoom(100)
      return
    }
    const containerWidth = (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300 // subtract sidebar width
    const containerHeight = (typeof window !== 'undefined' ? window.innerHeight : 800) - 200 // subtract header/footer
    const fitZoom = Math.min(
      containerWidth / processedImageMeta.width,
      containerHeight / processedImageMeta.height,
    ) * 100
    setZoom(Math.max(10, Math.min(400, Math.round(fitZoom))))
  }, [processedImageMeta])
  const handleToggleGrid = useCallback(() => setShowGrid((g) => !g), [])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          setZoom((z) => Math.min(400, z + 25))
          break
        case '-':
          e.preventDefault()
          setZoom((z) => Math.max(25, z - 25))
          break
        case '0':
          e.preventDefault()
          setZoom(100)
          break
        case 'g':
        case 'G':
          e.preventDefault()
          setShowGrid((g) => !g)
          break
        case 'n':
        case 'N':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            handleNewFile()
          }
          break
      }
    },
    [handleNewFile],
  )

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#101622]" onKeyDown={handleKeyDown}>
      {/* Top bar */}
      <header className="h-12 border-b border-slate-700 flex items-center justify-between px-4 shrink-0 bg-[#101622]">
        <div className="flex items-center gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <BackButton />
            <ol className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white font-medium">SVG Converter</li>
            </ol>
            <FavoriteButton slug="svg-converter" name="SVG Converter" />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* New file */}
          {imageMeta && (
            <button
              onClick={handleNewFile}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
              title="New file (N)"
              aria-label="New file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}

          {/* Back to crop */}
          {editorPhase === 'vectorize' && imageMeta && (
            <button
              onClick={handleBackToCrop}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
              title="Back to crop/resize"
              aria-label="Back to crop/resize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </button>
          )}

          {/* Reprocess */}
          {imageMeta && !settings.liveProcessing && (
            <button
              onClick={reprocess}
              disabled={conversionState === 'processing'}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer disabled:opacity-40"
              title="Reprocess"
              aria-label="Reprocess"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}

          {/* Mobile settings toggle */}
          {editorPhase === 'vectorize' && (
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
              aria-label="Toggle settings panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Main editor area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Center canvas */}
        <section className="flex-1 relative flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {editorPhase === 'upload' && (
            <UploadScreen
              onFileSelect={handleFileSelect}
              onBatchSelect={handleBatchSelect}
              isDragging={isDragging}
              onDragStateChange={setIsDragging}
            />
          )}
          {editorPhase === 'crop' && imageMeta && (
            <CropResizeEditor
              imageMeta={imageMeta}
              onConfirm={handleCropConfirm}
              onSkip={handleCropSkip}
            />
          )}
          {editorPhase === 'vectorize' && isBatchMode && (
            <BatchPanel
              files={batchFiles}
              settings={settings}
              onRemoveFile={handleBatchRemoveFile}
              onClearAll={handleBatchClearAll}
              onBack={handleBatchBack}
            />
          )}
          {editorPhase === 'vectorize' && !isBatchMode && (
            <>
              <ComparisonCanvas
                imageMeta={processedImageMeta}
                vectorResult={vectorResult}
                conversionState={conversionState}
                error={error}
                sliderPosition={sliderPosition}
                onSliderChange={setSliderPosition}
                zoom={zoom / 100}
                showGrid={showGrid}
              />
              <ZoomControls
                zoom={zoom}
                showGrid={showGrid}
                onZoomChange={handleZoomChange}
                onFitScreen={handleFitScreen}
                onToggleGrid={handleToggleGrid}
              />
            </>
          )}
        </section>

        {/* Right panel (desktop) */}
        {editorPhase === 'vectorize' && !isBatchMode && (
          <aside className="hidden lg:flex flex-col w-80 border-l border-slate-700 bg-[#1a2333] shrink-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <VectorizationSettingsPanel settings={settings} onChange={setSettings} />
            </div>
            <ExportActions
              vectorResult={vectorResult}
              conversionState={conversionState}
              onDownloadSvg={handleDownloadSvg}
              onExportEps={handleExportEps}
              onExportPdf={handleExportPdf}
              onExportPng={handleExportPng}
            />
          </aside>
        )}
        {editorPhase === 'vectorize' && isBatchMode && (
          <aside className="hidden lg:flex flex-col w-80 border-l border-slate-700 bg-[#1a2333] shrink-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <VectorizationSettingsPanel settings={settings} onChange={setSettings} />
            </div>
          </aside>
        )}

        {/* Mobile settings overlay */}
        {editorPhase === 'vectorize' && showMobileSettings && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setShowMobileSettings(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#1a2333] z-40 lg:hidden shadow-2xl overflow-y-auto flex flex-col">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between shrink-0">
                <span className="font-bold text-sm text-white">Settings</span>
                <button
                  onClick={() => setShowMobileSettings(false)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded cursor-pointer"
                  aria-label="Close settings"
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <VectorizationSettingsPanel settings={settings} onChange={setSettings} />
              </div>
              <ExportActions
                vectorResult={vectorResult}
                conversionState={conversionState}
                onDownloadSvg={handleDownloadSvg}
                onExportEps={handleExportEps}
                onExportPdf={handleExportPdf}
                onExportPng={handleExportPng}
              />
            </div>
          </>
        )}
      </main>

      {/* Bottom status bar */}
      <StatusBar
        conversionState={conversionState}
        imageMeta={editorPhase === 'vectorize' ? processedImageMeta : imageMeta}
        vectorResult={vectorResult}
        editorPhase={editorPhase}
      />
    </div>
  )
}
