'use client'

export interface FileEntry {
  id: string
  name: string
  size: string
  status: 'processing' | 'completed' | 'error'
  progress: number
  statusText?: string
  downloadUrl?: string
}

interface FileListProps {
  files: FileEntry[]
  onDownload: (file: FileEntry) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function FileList({ files, onDownload, onRemove, onClearAll }: FileListProps) {
  if (files.length === 0) return null

  const activeFiles = files.filter((f) => f.status === 'processing')
  const completedFiles = files.filter((f) => f.status !== 'processing')

  return (
    <div className="space-y-6">
      {/* Active processing */}
      {activeFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Active Processing</h4>
            <span className="text-sm font-medium text-[var(--ht-color-secondary-500)]">
              {activeFiles.length} file{activeFiles.length > 1 ? 's' : ''} converting
            </span>
          </div>
          {activeFiles.map((file) => (
            <div key={file.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</span>
                  <span className="text-sm font-bold text-[var(--ht-color-secondary-500)] shrink-0 ml-2">{file.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--ht-color-secondary-500)] rounded-full transition-all duration-500"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {file.statusText || 'Processing...'}
                  </p>
                  <button
                    onClick={() => onRemove(file.id)}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed files */}
      {completedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Conversions
            </h4>
            <button onClick={onClearAll} className="text-sm font-medium text-[var(--ht-color-secondary-500)] hover:underline cursor-pointer">
              Clear history
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">File Name</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Size</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {completedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <svg className={`w-5 h-5 shrink-0 ${file.name.endsWith('.pdf') ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">{file.size}</td>
                    <td className="px-6 py-4">
                      {file.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDownload(file)}
                        disabled={file.status !== 'completed'}
                        className="text-[var(--ht-color-secondary-500)] hover:bg-[var(--ht-color-secondary-500)]/10 p-2 rounded-lg transition-colors disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                        title="Download converted file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
