'use client'

import { useState, useCallback, useRef } from 'react'
import { ConverterNav, MODE_DESCRIPTIONS, MODES } from '@/tools/pdf-converter/converter-nav'
import type { ConversionMode } from '@/tools/pdf-converter/converter-nav'
import { UploadZone } from '@/tools/pdf-converter/upload-zone'
import { FileList, createStagedFile } from '@/tools/pdf-converter/file-list'
import type { StagedFile, ProcessingState } from '@/tools/pdf-converter/file-list'
import { ModeOptions } from '@/tools/pdf-converter/mode-options'
import type { ImageToPdfOptions } from '@/tools/pdf-converter/mode-options'
import type { CompressionQuality } from '@/tools/pdf-converter/processors/compress-pdf'
import type { ExtractionMode } from '@/tools/pdf-converter/processors/pdf-to-excel'
import type { WatermarkOptions } from '@/tools/pdf-converter/processors/watermark'
import { PageManager } from '@/tools/pdf-converter/page-manager'

// Modes that support batch (single-file modes that produce per-file output)
const BATCH_MODES: ConversionMode[] = ['compress-pdf', 'watermark', 'pdf-to-images', 'split-pdf']

interface BatchResult {
  fileId: string
  fileName: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: { blob: Blob; filename: string }
  error?: string
  downloadUrl?: string
}

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
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    type: 'text',
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.3,
    color: '#808080',
    rotation: 45,
    position: 'diagonal',
  })
  const [imageToPdfOptions, setImageToPdfOptions] = useState<ImageToPdfOptions>({
    pageSize: 'original',
    orientation: 'portrait',
    margin: 'none',
    fit: 'fit',
  })

  // Page manager state
  const [pageManagerFile, setPageManagerFile] = useState<File | null>(null)

  // Batch processing state
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [batchZipUrl, setBatchZipUrl] = useState<string | null>(null)

  const downloadUrlRef = useRef<string | null>(null)

  const modeInfo = MODE_DESCRIPTIONS[activeMode]

  // For batch modes, allow multiple files
  const effectiveMultiple = BATCH_MODES.includes(activeMode) ? true : modeInfo.multiple

  const handleModeChange = useCallback((mode: ConversionMode) => {
    setActiveMode(mode)
    setStagedFiles([])
    setProcessing({ status: 'idle', progress: 0, statusText: '' })
    setPageRanges('')
    setTotalPages(null)
    setPageManagerFile(null)
    setBatchResults([])
    if (batchZipUrl) {
      URL.revokeObjectURL(batchZipUrl)
      setBatchZipUrl(null)
    }
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilesSelect = useCallback((files: File[]) => {
    const newEntries = files.map((file, i) => createStagedFile(file, i))

    if (effectiveMultiple) {
      setStagedFiles((prev) => [...prev, ...newEntries])
    } else {
      setStagedFiles(newEntries.slice(0, 1))
    }

    // Reset processing state when new files are added
    setProcessing({ status: 'idle', progress: 0, statusText: '' })
    setBatchResults([])
    if (batchZipUrl) {
      URL.revokeObjectURL(batchZipUrl)
      setBatchZipUrl(null)
    }
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }

    // For split mode, detect total pages
    if (activeMode === 'split-pdf' && files[0]?.type === 'application/pdf') {
      detectTotalPages(files[0])
    }

    // For page manager, auto-load the first file
    if (activeMode === 'manage-pages' && files[0]?.type === 'application/pdf') {
      setPageManagerFile(files[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveMultiple, activeMode])

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
    setBatchResults([])
    if (batchZipUrl) {
      URL.revokeObjectURL(batchZipUrl)
      setBatchZipUrl(null)
    }
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /** Process a single file for a given mode. Returns the result. */
  const processSingleFile = async (
    file: File,
    mode: ConversionMode,
    progressCb: (percent: number, message: string) => void,
  ): Promise<{ blob: Blob; filename: string }> => {
    switch (mode) {
      case 'pdf-to-images': {
        const { pdfToImages } = await import('@/tools/pdf-converter/processors/pdf-to-images')
        return pdfToImages(file, { scale }, progressCb)
      }
      case 'split-pdf': {
        if (!pageRanges.trim()) throw new Error('Please enter page ranges.')
        const { splitPdf } = await import('@/tools/pdf-converter/processors/split-pdf')
        return splitPdf(file, pageRanges, progressCb)
      }
      case 'compress-pdf': {
        const { compressPdf } = await import('@/tools/pdf-converter/processors/compress-pdf')
        return compressPdf(file, quality, progressCb)
      }
      case 'watermark': {
        const { watermarkPdf } = await import('@/tools/pdf-converter/processors/watermark')
        return watermarkPdf(file, watermarkOptions, progressCb)
      }
      default:
        throw new Error(`Single-file processing not supported for mode: ${mode}`)
    }
  }

  const handleConvert = useCallback(async () => {
    if (stagedFiles.length === 0) return

    // Clean up previous download
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
    if (batchZipUrl) {
      URL.revokeObjectURL(batchZipUrl)
      setBatchZipUrl(null)
    }

    // Check if batch mode (multiple files + batch-capable mode)
    const isBatch = BATCH_MODES.includes(activeMode) && stagedFiles.length > 1

    if (isBatch) {
      // Batch processing
      const results: BatchResult[] = stagedFiles.map((sf) => ({
        fileId: sf.id,
        fileName: sf.name,
        status: 'pending' as const,
        progress: 0,
      }))
      setBatchResults(results)
      setProcessing({ status: 'processing', progress: 0, statusText: `Processing 0 of ${stagedFiles.length} files...` })

      const completedResults: BatchResult[] = [...results]

      for (let i = 0; i < stagedFiles.length; i++) {
        const sf = stagedFiles[i]
        completedResults[i] = { ...completedResults[i], status: 'processing', progress: 0 }
        setBatchResults([...completedResults])
        setProcessing({
          status: 'processing',
          progress: Math.round((i / stagedFiles.length) * 100),
          statusText: `Processing file ${i + 1} of ${stagedFiles.length}: ${sf.name}`,
        })

        try {
          const result = await processSingleFile(sf.file, activeMode, (pct, msg) => {
            completedResults[i] = { ...completedResults[i], progress: pct, status: 'processing' }
            setBatchResults([...completedResults])
          })

          const url = URL.createObjectURL(result.blob)
          completedResults[i] = {
            ...completedResults[i],
            status: 'completed',
            progress: 100,
            result,
            downloadUrl: url,
          }
          setBatchResults([...completedResults])
        } catch (err) {
          completedResults[i] = {
            ...completedResults[i],
            status: 'error',
            progress: 0,
            error: err instanceof Error ? err.message : 'Processing failed.',
          }
          setBatchResults([...completedResults])
        }
      }

      // Generate ZIP of all completed results
      const completedFiles = completedResults.filter((r) => r.status === 'completed' && r.result)
      if (completedFiles.length > 0) {
        setProcessing({ status: 'processing', progress: 95, statusText: 'Creating ZIP of all results...' })
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        for (const cf of completedFiles) {
          if (cf.result) {
            zip.file(cf.result.filename, cf.result.blob)
          }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipUrl = URL.createObjectURL(zipBlob)
        setBatchZipUrl(zipUrl)
      }

      const errorCount = completedResults.filter((r) => r.status === 'error').length
      setProcessing({
        status: 'completed',
        progress: 100,
        statusText: errorCount > 0
          ? `Done! ${completedFiles.length} succeeded, ${errorCount} failed.`
          : `Done! All ${completedFiles.length} files processed.`,
      })
      return
    }

    // Single file / non-batch processing
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
          result = await imagesToPdf(stagedFiles.map((sf) => sf.file), onProgress, imageToPdfOptions)
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
        case 'watermark': {
          const { watermarkPdf } = await import('@/tools/pdf-converter/processors/watermark')
          result = await watermarkPdf(stagedFiles[0].file, watermarkOptions, onProgress)
          break
        }
        case 'manage-pages': {
          // Page manager handles its own export
          return
        }
      }

      const url = URL.createObjectURL(result!.blob)
      downloadUrlRef.current = url
      setProcessing({
        status: 'completed',
        progress: 100,
        statusText: processing.statusText || 'Conversion complete!',
        downloadUrl: url,
        downloadFilename: result!.filename,
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
  }, [activeMode, stagedFiles, scale, quality, pageRanges, preserveLayout, extractionMode, watermarkOptions, imageToPdfOptions, onProgress])

  const handlePageManagerExport = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    downloadUrlRef.current = url
    setProcessing({
      status: 'completed',
      progress: 100,
      statusText: 'PDF saved successfully!',
      downloadUrl: url,
      downloadFilename: filename,
    })
  }, [])

  const showReorder = activeMode === 'merge-pdf' || activeMode === 'images-to-pdf'
  const canConvert = stagedFiles.length > 0 && processing.status !== 'processing' && activeMode !== 'manage-pages'

  // Page manager mode: show PageManager once file is loaded
  const showPageManager = activeMode === 'manage-pages' && pageManagerFile

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
              <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
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
                        ? 'bg-[var(--tk-color-secondary-500)]/10 text-[var(--tk-color-secondary-500)] font-semibold'
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

            {showPageManager ? (
              <>
                <PageManager
                  file={pageManagerFile}
                  onExport={handlePageManagerExport}
                  onBack={() => {
                    setPageManagerFile(null)
                    setStagedFiles([])
                    setProcessing({ status: 'idle', progress: 0, statusText: '' })
                  }}
                />
                {/* Show download after page manager export */}
                {processing.status === 'completed' && processing.downloadUrl && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-green-200 dark:border-green-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{processing.downloadFilename}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">{processing.statusText}</p>
                        </div>
                      </div>
                      <a
                        href={processing.downloadUrl}
                        download={processing.downloadFilename}
                        className="bg-[var(--tk-color-secondary-500)] text-slate-900 px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Upload zone */}
                <UploadZone
                  accept={modeInfo.accept}
                  fromLabel={modeInfo.fromLabel}
                  toLabel={modeInfo.toLabel}
                  multiple={effectiveMultiple}
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
                    watermarkOptions={watermarkOptions}
                    onWatermarkOptionsChange={setWatermarkOptions}
                    imageToPdfOptions={imageToPdfOptions}
                    onImageToPdfOptionsChange={setImageToPdfOptions}
                  />
                )}

                {/* File list + processing state (non-batch) */}
                {batchResults.length === 0 && (
                  <FileList
                    stagedFiles={stagedFiles}
                    processing={processing}
                    onRemoveFile={handleRemoveFile}
                    onClearFiles={handleClearFiles}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    showReorder={showReorder}
                  />
                )}

                {/* Batch results */}
                {batchResults.length > 0 && (
                  <div className="space-y-4">
                    {/* Overall progress */}
                    {processing.status === 'processing' && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">Batch processing...</span>
                          <span className="text-sm font-bold text-[var(--tk-color-secondary-500)]">{processing.progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--tk-color-secondary-500)] rounded-full transition-all duration-300" style={{ width: `${processing.progress}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{processing.statusText}</p>
                      </div>
                    )}

                    {/* Per-file results */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {batchResults.length} file{batchResults.length > 1 ? 's' : ''}
                      </h4>
                      {batchResults.map((br) => (
                        <div key={br.fileId} className={`bg-white dark:bg-slate-900 rounded-lg p-3 border flex items-center gap-3 ${
                          br.status === 'completed' ? 'border-green-200 dark:border-green-900/50' :
                          br.status === 'error' ? 'border-red-200 dark:border-red-900/50' :
                          'border-slate-200 dark:border-slate-800'
                        }`}>
                          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            br.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                            br.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                            br.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {br.status === 'completed' && (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {br.status === 'error' && (
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {br.status === 'processing' && (
                              <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                            {br.status === 'pending' && (
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{br.fileName}</p>
                            {br.status === 'error' && <p className="text-xs text-red-500">{br.error}</p>}
                            {br.status === 'processing' && (
                              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-[var(--tk-color-secondary-500)] rounded-full transition-all duration-300" style={{ width: `${br.progress}%` }} />
                              </div>
                            )}
                          </div>
                          {br.status === 'completed' && br.downloadUrl && br.result && (
                            <a
                              href={br.downloadUrl}
                              download={br.result.filename}
                              className="text-[var(--tk-color-secondary-500)] hover:opacity-80 transition-opacity shrink-0 p-2"
                              aria-label={`Download ${br.result.filename}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Download All ZIP */}
                    {batchZipUrl && processing.status === 'completed' && (
                      <a
                        href={batchZipUrl}
                        download="batch_results.zip"
                        className="w-full bg-[var(--tk-color-secondary-500)] text-slate-900 py-3.5 rounded-xl font-bold text-base transition-opacity hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download All (ZIP)
                      </a>
                    )}

                    {/* Clear / start over */}
                    {processing.status === 'completed' && (
                      <button
                        onClick={handleClearFiles}
                        className="w-full text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer py-2"
                      >
                        Start over
                      </button>
                    )}
                  </div>
                )}

                {/* Convert button */}
                {canConvert && batchResults.length === 0 && (
                  <button
                    onClick={handleConvert}
                    className="w-full bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[var(--tk-color-primary-500)]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {BATCH_MODES.includes(activeMode) && stagedFiles.length > 1
                      ? `Convert ${stagedFiles.length} Files`
                      : 'Convert Now'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
