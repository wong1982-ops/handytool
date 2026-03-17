/**
 * Loading skeleton for the book reader page.
 * Matches the real layout: sticky header + 16:9 book card with side-by-side cover/text.
 */
export default function BookLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Sticky header skeleton */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="h-9 w-16 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-10 w-44 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Book card skeleton — 16:9 with side-by-side layout */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          {/* Desktop: side-by-side */}
          <div className="hidden md:flex aspect-[16/9]">
            {/* Cover image (60%) */}
            <div className="w-[60%] shrink-0 bg-slate-100 dark:bg-slate-800/50 animate-pulse flex items-center justify-center">
              <svg className="w-16 h-16 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>

            {/* Text area (40%) */}
            <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center space-y-4">
              {/* Decorative flourish placeholder */}
              <div className="h-3 w-10 rounded bg-amber-200/40 dark:bg-amber-800/20 animate-pulse" />
              {/* Title */}
              <div className="h-10 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-10 w-3/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              {/* Author */}
              <div className="h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              {/* Tags */}
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
              {/* Description lines */}
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                <div className="h-4 w-4/6 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Mobile: stacked */}
          <div className="md:hidden">
            {/* Cover image */}
            <div className="aspect-square bg-slate-100 dark:bg-slate-800/50 animate-pulse flex items-center justify-center">
              <svg className="w-16 h-16 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            {/* Text area */}
            <div className="p-6 space-y-3">
              <div className="h-3 w-10 rounded bg-amber-200/40 dark:bg-amber-800/20 animate-pulse" />
              <div className="h-7 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Page navigation skeleton */}
        <div className="mt-6 flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
