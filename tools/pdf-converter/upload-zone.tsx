'use client'

import { useRef, useCallback, useState } from 'react'

interface UploadZoneProps {
  accept: string
  fromLabel: string
  toLabel: string
  multiple: boolean
  onFilesSelect: (files: File[]) => void
}

function getColorClasses(label: string) {
  switch (label) {
    case 'PDF': return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900/30', text: 'text-red-500' }
    case 'PNG':
    case 'IMG': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/30', text: 'text-emerald-500' }
    case 'DOCX': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30', text: 'text-blue-500' }
    case 'XLSX': return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900/30', text: 'text-green-500' }
    default: return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30', text: 'text-blue-500' }
  }
}

export function UploadZone({ accept, fromLabel, toLabel, multiple, onFilesSelect }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files))
    }
  }, [onFilesSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files))
      e.target.value = ''
    }
  }, [onFilesSelect])

  const from = getColorClasses(fromLabel)
  const to = getColorClasses(toLabel)

  return (
    <div className="relative group">
      <div className={`absolute -inset-1 bg-gradient-to-r from-[var(--tk-color-secondary-500)] to-cyan-400 rounded-2xl blur transition duration-500 ${isDragging ? 'opacity-30' : 'opacity-10 group-hover:opacity-20'}`} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative bg-white dark:bg-slate-900 border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging
            ? 'border-[var(--tk-color-secondary-500)] bg-[var(--tk-color-secondary-500)]/5'
            : 'border-slate-300 dark:border-slate-700 hover:border-[var(--tk-color-secondary-500)]'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
      >
        {/* File type icons */}
        <div className="flex gap-4 mb-6">
          <div className={`w-16 h-20 ${from.bg} ${from.border} rounded-lg flex flex-col items-center justify-center border`}>
            <svg className={`w-8 h-8 ${from.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className={`text-[10px] font-bold ${from.text} mt-1`}>{fromLabel}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div className={`w-16 h-20 ${to.bg} ${to.border} rounded-lg flex flex-col items-center justify-center border`}>
            <svg className={`w-8 h-8 ${to.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`text-[10px] font-bold ${to.text} mt-1`}>{toLabel}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          {multiple
            ? 'Select one or more files to get started.'
            : 'Select a file to get started.'}
        </p>
        <span className="bg-[var(--tk-color-secondary-500)] text-slate-900 px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Select Files
        </span>
        <p className="mt-6 text-xs text-slate-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Files are processed in your browser — nothing uploaded to servers
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
