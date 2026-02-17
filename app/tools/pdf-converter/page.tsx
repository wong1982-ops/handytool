'use client'

import { useState, useCallback, useRef } from 'react'
import { ConverterNav, MODE_DESCRIPTIONS, MODES } from '@/tools/pdf-converter/converter-nav'
import type { ConversionMode } from '@/tools/pdf-converter/converter-nav'
import { UploadZone } from '@/tools/pdf-converter/upload-zone'
import { FileList, createStagedFile } from '@/tools/pdf-converter/file-list'
import type { StagedFile, ProcessingState } from '@/tools/pdf-converter/file-list'
import { ModeOptions } from '@/tools/pdf-converter/mode-options'
import type { CompressionQuality } from '@/tools/pdf-converter/processors/compress-pdf'
import type { ExtractionMode } from '@/tools/pdf-converter/processors/pdf-to-excel'

export default function PdfConverterPage() {
  const [activeMode, setActiveMode] = useState<ConversionMode>('pdf-to-images')
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    statusText: '',
  })
  const [showMobileNav, setShowMobileNav] = useState(false)

  // Mode options state
  const [scale, setScale] = useState(2)
  const [quality, setQuality] = useState<CompressionQuality>('medium')
  const [pageRanges, setPageRanges] = useState('')
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [preserveLayout, setPreserveLayout] = useState(false)
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>('auto')

  const downloadUrlRef = useRef<string | null>(null)

  const modeInfo = MODE_DESCRIPTIONS[activeMode]

  const handleModeChange = useCallback((mode: ConversionMode) => {
    setActiveMode(mode)
    setStagedFiles([])
    setProcessing({ status: 'idle', progress: 0, statusText: '' })
    setPageRanges('')
    setTotalPages(null)
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
  }, [])

  const handleFilesSelect = useCallback((files: File[]) => {
    const newEntries = files.map((file, i) => createStagedFile(file, i))

    if (modeInfo.multiple) {
      setStagedFiles((prev) => [...prev, ...newEntries])
    } else {
      setStagedFiles(newEntries.slice(0, 1))
    }

    // Reset processing state when new files are added
    setProcessing({ status: 'idle', progress: 0, statusText: '' })
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }

    // For split mode, detect total pages
    if (activeMode === 'split-pdf' && files[0]?.type === 'application/pdf') {
      detectTotalPages(files[0])
    }
  }, [modeInfo.multiple, activeMode])

  const detectTotalPages = async (file: File) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
    } catch {
      // Silently fail - totalPages stays null
    }
  }

  const handleRemoveFile = useCallback((id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleClearFiles = useCallback(() => {
    setStagedFiles([])
    setProcessing({ status: 'idle', progress: 0, statusText: '' })
    setPageRanges('')
    setTotalPages(null)
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
  }, [])

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    setStagedFiles((prev) => {
      const arr = [...prev]
      ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      return arr
    })
  }, [])

  const handleMoveDown = useCallback((index: number) => {
    setStagedFiles((prev) => {
      if (index >= prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      return arr
    })
  }, [])

  const onProgress = useCallback((percent: number, message: string) => {
    setProcessing((prev) => ({
      ...prev,
      progress: percent,
      statusText: message,
    }))
  }, [])

  const handleConvert = useCallback(async () => {
    if (stagedFiles.length === 0) return

    // Clean up previous download
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }

    setProcessing({ status: 'processing', progress: 0, statusText: 'Starting...' })

    try {
      let result: { blob: Blob; filename: string }

      switch (activeMode) {
        case 'pdf-to-images': {
          const { pdfToImages } = await import('@/tools/pdf-converter/processors/pdf-to-images')
          result = await pdfToImages(stagedFiles[0].file, { scale }, onProgress)
          break
        }
        case 'images-to-pdf': {
          const { imagesToPdf } = await import('@/tools/pdf-converter/processors/images-to-pdf')
          result = await imagesToPdf(stagedFiles.map((sf) => sf.file), onProgress)
          break
        }
        case 'merge-pdf': {
          const { mergePdf } = await import('@/tools/pdf-converter/processors/merge-pdf')
          result = await mergePdf(stagedFiles.map((sf) => sf.file), onProgress)
          break
        }
        case 'split-pdf': {
          if (!pageRanges.trim()) {
            setProcessing({ status: 'error', progress: 0, statusText: '', error: 'Please enter page ranges (e.g. 1-3, 5, 8-10).' })
            return
          }
          const { splitPdf } = await import('@/tools/pdf-converter/processors/split-pdf')
          result = await splitPdf(stagedFiles[0].file, pageRanges, onProgress)
          break
        }
        case 'compress-pdf': {
          const { compressPdf } = await import('@/tools/pdf-converter/processors/compress-pdf')
          result = await compressPdf(stagedFiles[0].file, quality, onProgress)
          break
        }
        case 'pdf-to-word': {
          const { pdfToWord } = await import('@/tools/pdf-converter/processors/pdf-to-word')
          result = await pdfToWord(stagedFiles[0].file, { preserveLayout }, onProgress)
          break
        }
        case 'word-to-pdf': {
          const { wordToPdf } = await import('@/tools/pdf-converter/processors/word-to-pdf')
          result = await wordToPdf(stagedFiles[0].file, onProgress)
          break
        }
        case 'pdf-to-excel': {
          const { pdfToExcel } = await import('@/tools/pdf-converter/processors/pdf-to-excel')
          result = await pdfToExcel(stagedFiles[0].file, { extractionMode }, onProgress)
          break
        }
      }

      const url = URL.createObjectURL(result.blob)
      downloadUrlRef.current = url
      setProcessing({
        status: 'completed',
        progress: 100,
        statusText: processing.statusText || 'Conversion complete!',
        downloadUrl: url,
        downloadFilename: result.filename,
      })
    } catch (err) {
      setProcessing({
        status: 'error',
        progress: 0,
        statusText: '',
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, stagedFiles, scale, quality, pageRanges, preserveLayout, extractionMode, onProgress])

  const showReorder = activeMode === 'merge-pdf' || activeMode === 'images-to-pdf'
  const canConvert = stagedFiles.length > 0 && processing.status !== 'processing'

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle tools menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-900 dark:text-white font-medium">PDF Converter</li>
            </ol>
          </nav>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar nav */}
        <ConverterNav activeMode={activeMode} onModeChange={handleModeChange} />

        {/* Mobile nav overlay */}
        {showMobileNav && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowMobileNav(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-56 bg-white dark:bg-slate-900 z-40 lg:hidden shadow-2xl">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Tools</span>
                <button onClick={() => setShowMobileNav(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => { handleModeChange(mode.id); setShowMobileNav(false) }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors cursor-pointer ${
                      activeMode === mode.id
                        ? 'bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)] font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode.icon}
                    <span className="text-sm">{mode.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{modeInfo.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">{modeInfo.desc}</p>
            </div>

            {/* Upload zone */}
            <UploadZone
              accept={modeInfo.accept}
              fromLabel={modeInfo.fromLabel}
              toLabel={modeInfo.toLabel}
              multiple={modeInfo.multiple}
              onFilesSelect={handleFilesSelect}
            />

            {/* Mode-specific options */}
            {stagedFiles.length > 0 && (
              <ModeOptions
                mode={activeMode}
                scale={scale}
                onScaleChange={setScale}
                quality={quality}
                onQualityChange={setQuality}
                pageRanges={pageRanges}
                onPageRangesChange={setPageRanges}
                totalPages={totalPages}
                preserveLayout={preserveLayout}
                onPreserveLayoutChange={setPreserveLayout}
                extractionMode={extractionMode}
                onExtractionModeChange={setExtractionMode}
              />
            )}

            {/* File list + processing state */}
            <FileList
              stagedFiles={stagedFiles}
              processing={processing}
              onRemoveFile={handleRemoveFile}
              onClearFiles={handleClearFiles}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              showReorder={showReorder}
            />

            {/* Convert button */}
            {canConvert && (
              <button
                onClick={handleConvert}
                className="w-full bg-[var(--ht-color-primary-500)] hover:bg-[var(--ht-color-primary-600)] text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[var(--ht-color-primary-500)]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Convert Now
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
