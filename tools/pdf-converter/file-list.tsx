'use client'

import { useRef, useState } from 'react'

export interface StagedFile {
  id: string
  file: File
  name: string
  size: string
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'completed' | 'error'
  progress: number
  statusText: string
  downloadUrl?: string
  downloadFilename?: string
  error?: string
}

interface FileListProps {
  stagedFiles: StagedFile[]
  processing: ProcessingState
  onRemoveFile: (id: string) => void
  onClearFiles: () => void
  onReorder: (files: StagedFile[]) => void
  showReorder: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function createStagedFile(file: File, index: number): StagedFile {
  return {
    id: `${Date.now()}-${index}`,
    file,
    name: file.name,
    size: formatFileSize(file.size),
  }
}

export function FileList({ stagedFiles, processing, onRemoveFile, onClearFiles, onReorder, showReorder }: FileListProps) {
  const dragIndexRef = useRef<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  if (stagedFiles.length === 0 && processing.status === 'idle') return null

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndexRef.current === null || dragIndexRef.current === index) {
      setDropTargetIndex(null)
      return
    }
    setDropTargetIndex(index)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const fromIndex = dragIndexRef.current
    if (fromIndex === null || fromIndex === targetIndex) {
      cleanup()
      return
    }
    const reordered = [...stagedFiles]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    onReorder(reordered)
    cleanup()
  }

  const handleDragEnd = () => {
    cleanup()
  }

  const cleanup = () => {
    dragIndexRef.current = null
    setDropTargetIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Processing indicator */}
      {processing.status === 'processing' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Converting...</span>
            <span className="text-sm font-bold text-[var(--tk-color-secondary-500)]">{processing.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--tk-color-secondary-500)] rounded-full transition-all duration-300"
              style={{ width: `${processing.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {processing.statusText}
          </p>
        </div>
      )}

      {/* Completed result */}
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

      {/* Error state */}
      {processing.status === 'error' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-red-200 dark:border-red-900/50" role="alert">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Conversion failed</p>
              <p className="text-xs text-slate-500">{processing.error || 'An unknown error occurred.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Staged files list */}
      {stagedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} selected
            </h4>
            <button
              onClick={onClearFiles}
              className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {stagedFiles.map((sf, index) => (
              <div key={sf.id}>
                {/* Drop indicator line above this item */}
                {showReorder && dropTargetIndex === index && dragIndexRef.current !== null && dragIndexRef.current > index && (
                  <div className="h-0.5 bg-[var(--tk-color-primary-500)] rounded-full mx-3 mb-1" />
                )}
                <div
                  draggable={showReorder && stagedFiles.length > 1}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex items-center gap-3 ${
                    showReorder && stagedFiles.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                >
                  {/* Drag handle */}
                  {showReorder && stagedFiles.length > 1 && (
                    <div className="text-slate-300 dark:text-slate-600 shrink-0" aria-hidden="true">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5" cy="3" r="1.5" />
                        <circle cx="11" cy="3" r="1.5" />
                        <circle cx="5" cy="8" r="1.5" />
                        <circle cx="11" cy="8" r="1.5" />
                        <circle cx="5" cy="13" r="1.5" />
                        <circle cx="11" cy="13" r="1.5" />
                      </svg>
                    </div>
                  )}
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{sf.name}</p>
                    <p className="text-xs text-slate-400">{sf.size}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFile(sf.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    aria-label={`Remove ${sf.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Drop indicator line below this item */}
                {showReorder && dropTargetIndex === index && dragIndexRef.current !== null && dragIndexRef.current < index && (
                  <div className="h-0.5 bg-[var(--tk-color-primary-500)] rounded-full mx-3 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
