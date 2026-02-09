'use client'

import { useState, useCallback, useRef } from 'react'
import { ConverterNav, MODE_DESCRIPTIONS } from '@/tools/pdf-converter/converter-nav'
import type { ConversionMode } from '@/tools/pdf-converter/converter-nav'
import { UploadZone } from '@/tools/pdf-converter/upload-zone'
import { FileList } from '@/tools/pdf-converter/file-list'
import type { FileEntry } from '@/tools/pdf-converter/file-list'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const PROCESSING_MESSAGES = [
  'Analyzing document structure...',
  'Extracting text and images...',
  'Reconstructing layout and fonts...',
  'Optimizing output format...',
  'Finalizing conversion...',
]

export default function PdfConverterPage() {
  const [activeMode, setActiveMode] = useState<ConversionMode>('pdf-to-word')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [showMobileNav, setShowMobileNav] = useState(false)
  const fileMapRef = useRef<Map<string, File>>(new Map())

  const modeInfo = MODE_DESCRIPTIONS[activeMode]

  const simulateConversion = useCallback((entry: FileEntry, originalFile: File) => {
    let progress = 0
    let msgIdx = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5
      if (progress >= 100) progress = 100
      msgIdx = Math.min(Math.floor(progress / 25), PROCESSING_MESSAGES.length - 1)

      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? {
                ...f,
                progress,
                statusText: PROCESSING_MESSAGES[msgIdx],
                status: progress >= 100 ? 'completed' : 'processing',
                downloadUrl: progress >= 100 ? URL.createObjectURL(originalFile) : undefined,
              }
            : f
        )
      )
      if (progress >= 100) clearInterval(interval)
    }, 600)
  }, [])

  const handleFilesSelect = useCallback(
    (fileList: FileList) => {
      const newEntries: FileEntry[] = []
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        const id = `${Date.now()}-${i}`
        const entry: FileEntry = {
          id,
          name: file.name,
          size: formatFileSize(file.size),
          status: 'processing',
          progress: 0,
          statusText: PROCESSING_MESSAGES[0],
        }
        newEntries.push(entry)
        fileMapRef.current.set(id, file)
        // Start simulated conversion
        simulateConversion(entry, file)
      }
      setFiles((prev) => [...newEntries, ...prev])
    },
    [simulateConversion]
  )

  const handleDownload = useCallback((file: FileEntry) => {
    if (!file.downloadUrl) return
    const a = document.createElement('a')
    a.href = file.downloadUrl
    // Change extension based on mode
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const ext = activeMode === 'pdf-to-word' ? '.docx' : '.pdf'
    a.download = baseName + ext
    a.click()
  }, [activeMode])

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    const url = files.find((f) => f.id === id)?.downloadUrl
    if (url) URL.revokeObjectURL(url)
    fileMapRef.current.delete(id)
  }, [files])

  const handleClearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.downloadUrl) URL.revokeObjectURL(f.downloadUrl)
    })
    setFiles([])
    fileMapRef.current.clear()
  }, [files])

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
        <ConverterNav activeMode={activeMode} onModeChange={setActiveMode} />

        {/* Mobile nav overlay */}
        {showMobileNav && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowMobileNav(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-56 bg-white dark:bg-slate-900 z-40 lg:hidden shadow-2xl">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm">Tools</span>
                <button onClick={() => setShowMobileNav(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ConverterNav
                activeMode={activeMode}
                onModeChange={(mode) => { setActiveMode(mode); setShowMobileNav(false) }}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{modeInfo.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">{modeInfo.desc}</p>
            </div>

            {/* Upload zone */}
            <UploadZone
              accept={modeInfo.accept}
              fromIcon={modeInfo.fromIcon}
              toIcon={modeInfo.toIcon}
              onFilesSelect={handleFilesSelect}
            />

            {/* File list */}
            <FileList
              files={files}
              onDownload={handleDownload}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
