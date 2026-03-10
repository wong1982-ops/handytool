'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudioLayout } from '@/tools/story-studio/studio-layout'

type Phase = 'upload' | 'processing' | 'review'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_SCAN_IMAGES = 10
const SCANNED_PLOT_KEY = 'toolk1t-story-scanned-plot'

const DEMO_STEPS = [
  {
    icon: (
      <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
      </svg>
    ),
    title: 'Snap or upload photos',
    description: 'Take photos of your handwritten story pages or upload existing images. Supports JPG, PNG, HEIC, WebP.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: 'AI reads & polishes',
    description: 'Our AI reads the handwriting, cleans up the text, deduplicates overlapping pages, and crafts a polished plot summary.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Build your storybook',
    description: 'Review the extracted plot, edit if needed, then generate a fully illustrated digital storybook from it.',
  },
]

export default function ScanPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [plotSummary, setPlotSummary] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem('toolk1t-scan-demo-seen')
  })

  const dismissDemo = useCallback(() => {
    setShowDemo(false)
    try { sessionStorage.setItem('toolk1t-scan-demo-seen', '1') } catch { /* ignore */ }
  }, [])

  // Generate preview URLs
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of Array.from(newFiles)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported format`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: exceeds 10MB`)
        continue
      }
      validFiles.push(file)
    }

    if (errors.length > 0) {
      setError(errors.join('. '))
    }

    setFiles((prev) => {
      const combined = [...prev, ...validFiles]
      return combined.slice(0, MAX_SCAN_IMAGES)
    })

    // Auto-dismiss demo when user adds files
    if (showDemo && validFiles.length > 0) dismissDemo()
  }, [showDemo, dismissDemo])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleExtract = useCallback(async () => {
    if (files.length === 0) return
    setPhase('processing')
    setError(null)

    const formData = new FormData()
    for (const file of files) {
      formData.append('images', file)
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)

      const res = await fetch('/api/v1/story/scan', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const json = await res.json()

      if (!res.ok) {
        if (json.code === 'INSUFFICIENT_CREDITS') {
          setError('Not enough credits. Buy a credit pack to use Story Scanner.')
        } else {
          setError(json.error || 'Extraction failed')
        }
        setPhase('upload')
        return
      }

      setPlotSummary(json.data.plotSummary)
      setPhase('review')
    } catch {
      setError('Request timed out or failed. Please try again.')
      setPhase('upload')
    }
  }, [files])

  const handleBuildStory = useCallback(() => {
    try {
      sessionStorage.setItem(SCANNED_PLOT_KEY, plotSummary)
    } catch { /* ignore */ }
    router.push('/tools/story-studio?fromScan=true')
  }, [plotSummary, router])

  const handleTryAgain = useCallback(() => {
    setPlotSummary('')
    setPhase('upload')
  }, [])

  return (
    <StudioLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Story Scanner
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
            1 credit
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Photograph your handwritten story pages and turn them into an illustrated digital book.
        </p>
      </div>

      {/* How it works — demo walkthrough */}
      {showDemo && phase === 'upload' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-amber-950/20 border border-indigo-200/60 dark:border-indigo-800/40 overflow-hidden">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">How it works</h3>
            <button
              onClick={dismissDemo}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 dark:bg-slate-900/40">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-3 shadow-sm">
                  {step.icon}
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{step.title}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {phase === 'upload' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 md:p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Drop photos here or click to browse
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              JPG, PNG, HEIC, WebP &middot; Max 10MB per image &middot; Up to {MAX_SCAN_IMAGES} pages
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {/* Image previews */}
          {files.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {files.length} / {MAX_SCAN_IMAGES} images
                </p>
                {files.length < MAX_SCAN_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    Add more
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={url}
                      alt={`Page ${i + 1}`}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label={`Remove page ${i + 1}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleExtract}
                disabled={files.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
                style={{ minHeight: '44px' }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Extract Story
                  <span className="text-indigo-200 text-xs font-normal">&middot; 1 credit</span>
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {phase === 'processing' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Extracting text from your pages...
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reading {files.length} {files.length === 1 ? 'image' : 'images'}, merging content, and crafting your plot summary.
          </p>
        </div>
      )}

      {phase === 'review' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Extracted Plot Summary
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Review and edit the extracted story before building your book.
            </p>

            <textarea
              value={plotSummary}
              onChange={(e) => setPlotSummary(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none h-48 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-400 transition-all"
              maxLength={2000}
            />
            <p className="text-xs text-slate-400 mt-1.5">{plotSummary.length}/2000 characters</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Try Again
              </span>
            </button>
            <button
              onClick={handleBuildStory}
              disabled={plotSummary.trim().length < 10}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
              style={{ minHeight: '44px' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Build Story
              </span>
            </button>
          </div>
        </div>
      )}
    </StudioLayout>
  )
}
