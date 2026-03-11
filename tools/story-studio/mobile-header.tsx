'use client'

import { useRouter } from 'next/navigation'

interface StudioMobileHeaderProps {
  title: string
  onMenuToggle: () => void
}

export function StudioMobileHeader({ title, onMenuToggle }: StudioMobileHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-2 h-12 bg-indigo-950/95 backdrop-blur-lg border-b border-indigo-800/50">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center justify-center w-11 h-11 rounded-full text-purple-300 hover:text-white transition-colors cursor-pointer"
        aria-label="Go back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Title */}
      <h1
        className="text-sm font-semibold text-white truncate max-w-[60%] text-center"
        style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
      >
        {title}
      </h1>

      {/* Hamburger menu */}
      <button
        onClick={onMenuToggle}
        className="flex items-center justify-center w-11 h-11 rounded-full text-purple-300 hover:text-white transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </header>
  )
}
