'use client'

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
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
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

export function FileList({ stagedFiles, processing, onRemoveFile, onClearFiles, onMoveUp, onMoveDown, showReorder }: FileListProps) {
  if (stagedFiles.length === 0 && processing.status === 'idle') return null

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
              <div key={sf.id} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{sf.name}</p>
                  <p className="text-xs text-slate-400">{sf.size}</p>
                </div>
                {showReorder && stagedFiles.length > 1 && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => onMoveUp(index)}
                      disabled={index === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onMoveDown(index)}
                      disabled={index === stagedFiles.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
