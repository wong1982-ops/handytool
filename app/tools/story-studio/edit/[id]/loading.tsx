/**
 * Loading skeleton for the story editor page.
 * Shown by Next.js while the editor loads book data.
 */
export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="ml-auto flex gap-2">
            <div className="w-20 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="w-20 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Page strip skeleton */}
        <div className="flex gap-2 mb-6 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-20 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex-shrink-0"
            />
          ))}
        </div>

        {/* Editor content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: page preview */}
          <div className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />

          {/* Right: text fields */}
          <div className="space-y-4">
            <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-32 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
