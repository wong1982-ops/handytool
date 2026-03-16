/**
 * Loading skeleton for the book reader page.
 * Shown by Next.js while the server component fetches book data.
 */
export default function BookLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header skeleton */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      {/* Book cover skeleton */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="aspect-[3/4] max-h-[70vh] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center">
          <svg className="w-16 h-16 text-slate-200 dark:text-slate-800" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>

        {/* Title skeleton */}
        <div className="mt-6 space-y-3">
          <div className="h-7 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>

        {/* Page navigation skeleton */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
