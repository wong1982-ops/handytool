'use client'

import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { TabNavigation } from '@/tools/story-studio/tab-navigation'
import { BookSelector } from '@/tools/story-studio/book-selector'
import { BookProvider, useBookContext } from '@/tools/story-studio/use-book-context'
import Link from 'next/link'

function ShellInner({ children }: { children: React.ReactNode }) {
  const { activeBook } = useBookContext()

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Fantasy header */}
      <div className="relative" style={{ background: '#090f16' }}>
        {/* Starfield background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 25% 60%, #93aaff, transparent),
              radial-gradient(1px 1px at 40% 15%, #fff, transparent),
              radial-gradient(2px 2px at 55% 45%, #fbbf24, transparent),
              radial-gradient(1px 1px at 70% 75%, #93aaff, transparent),
              radial-gradient(1.5px 1.5px at 85% 30%, #fff, transparent),
              radial-gradient(1px 1px at 95% 80%, #fbbf24, transparent),
              radial-gradient(2px 2px at 15% 85%, #3D6AF2, transparent),
              radial-gradient(1px 1px at 50% 90%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 75% 10%, #fbbf24, transparent)
            `,
            animation: 'starfield-drift 12s ease-in-out infinite alternate',
          }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 5% 50%, #fff, transparent),
              radial-gradient(2px 2px at 30% 35%, #3D6AF2, transparent),
              radial-gradient(1px 1px at 60% 65%, #fbbf24, transparent),
              radial-gradient(1.5px 1.5px at 80% 50%, #93aaff, transparent),
              radial-gradient(1px 1px at 45% 25%, #fff, transparent)
            `,
            animation: 'starfield-drift 16s ease-in-out 3s infinite alternate-reverse',
          }} />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-24 bg-gradient-to-t from-amber-500/10 via-[#3D6AF2]/5 to-transparent blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-5 md:pb-5">
          {/* Top row: breadcrumb */}
          <div className="hidden md:block">
            <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />
          </div>

          {/* Header row: title + book selector */}
          <div className="mt-2 md:mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile: home link */}
              <Link
                href="/"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-[#a6abb5] hover:text-white transition-colors"
                aria-label="Home"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </Link>

              <div className="relative">
                <svg className="w-8 h-8 md:w-9 md:h-9 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              </div>
              <h1
                className="text-xl md:text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
              >
                Story Studio
              </h1>
            </div>

            {/* Book selector */}
            <BookSelector />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-0 z-20">
        <TabNavigation />
      </div>

      {/* Tab content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <BookProvider>
      <ShellInner>{children}</ShellInner>
    </BookProvider>
  )
}
