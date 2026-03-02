'use client'

import { useRef, useCallback, type DragEvent } from 'react'

interface UploadScreenProps {
  onFileSelect: (file: File) => void
  onBatchSelect?: (files: File[]) => void
  isDragging: boolean
  onDragStateChange: (dragging: boolean) => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const ACCEPT_STRING = ACCEPTED_TYPES.join(',')

export function UploadScreen({ onFileSelect, onBatchSelect, isDragging, onDragStateChange }: UploadScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStateChange(true)
    },
    [onDragStateChange],
  )

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStateChange(false)
    },
    [onDragStateChange],
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStateChange(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        ACCEPTED_TYPES.includes(f.type),
      )

      if (droppedFiles.length === 0) return

      if (droppedFiles.length >= 2 && onBatchSelect) {
        onBatchSelect(droppedFiles)
      } else if (droppedFiles[0]) {
        onFileSelect(droppedFiles[0])
      }
    },
    [onFileSelect, onBatchSelect, onDragStateChange],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      const validFiles = Array.from(selectedFiles).filter((f) =>
        ACCEPTED_TYPES.includes(f.type),
      )

      if (validFiles.length >= 2 && onBatchSelect) {
        onBatchSelect(validFiles)
      } else if (validFiles[0]) {
        onFileSelect(validFiles[0])
      }

      // Reset input so the same file can be re-selected
      e.target.value = ''
    },
    [onFileSelect, onBatchSelect],
  )

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image for SVG conversion"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        className={`
          w-full max-w-lg flex flex-col items-center gap-5 p-10 rounded-2xl
          border-2 border-dashed transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? 'border-[var(--tk-color-secondary-500)] bg-[var(--tk-color-secondary-500)]/10 scale-[1.02]'
              : 'border-slate-600 hover:border-[var(--tk-color-secondary-500)]/60 hover:bg-slate-800/30'
          }
        `}
      >
        {/* Upload icon */}
        <div
          className={`
            w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-200
            ${isDragging ? 'bg-[var(--tk-color-secondary-500)]/15' : 'bg-slate-800'}
          `}
        >
          <svg
            className={`w-10 h-10 transition-colors duration-200 ${
              isDragging ? 'text-[var(--tk-color-secondary-500)]' : 'text-slate-500'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-white text-lg font-semibold">
            {isDragging ? 'Drop image to convert' : 'Drag & drop your image'}
          </h2>
          <p className="text-slate-400 text-sm">or click anywhere to browse files</p>
        </div>

        {/* Choose Image button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          className="
            bg-[var(--tk-color-secondary-500)] hover:bg-[var(--tk-color-secondary-500)]/80
            text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-all
            cursor-pointer min-h-[44px]
          "
        >
          Choose Image
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Format indicator */}
        <div className="flex items-center gap-2.5 mt-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">PNG / JPG / WebP / GIF</span>
          </div>

          <svg
            className="w-4 h-4 text-[var(--tk-color-secondary-500)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tk-color-secondary-500)]/10 border border-[var(--tk-color-secondary-500)]/30">
            <svg className="w-3.5 h-3.5 text-[var(--tk-color-secondary-500)]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
            </svg>
            <span className="text-xs font-bold text-[var(--tk-color-secondary-500)]">SVG</span>
          </div>
        </div>

        {/* Processing note */}
        <p className="text-slate-600 text-[11px] flex items-center gap-1.5 mt-1">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Fast server-side vectorization
        </p>
      </div>
    </div>
  )
}
