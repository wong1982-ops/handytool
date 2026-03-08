'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

interface BookItem {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  audience: string
  style: string
  pageCount: number
  isPublic: boolean
  createdAt: string
}

export default function BookshelfPage() {
  const { user, loading: authLoading } = useAuth()
  const [books, setBooks] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/story/books')
      if (!res.ok) return
      const { data } = await res.json()
      setBooks(data || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchBooks()
    else if (!authLoading) setLoading(false)
  }, [user, authLoading, fetchBooks])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/story/books/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBooks(prev => prev.filter(b => b.id !== id))
      }
    } catch {
      // silently fail
    }
    setDeleteConfirm(null)
  }

  const handleShare = async (book: BookItem) => {
    try {
      const res = await fetch('/api/v1/story/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, isPublic: !book.isPublic }),
      })
      if (res.ok) {
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isPublic: !b.isPublic } : b))
        if (!book.isPublic) {
          const url = `${window.location.origin}/tools/story-studio/book/${book.slug}`
          await navigator.clipboard.writeText(url)
        }
      }
    } catch {
      // silently fail
    }
  }

  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && !authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in Required</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center">Sign in to view your bookshelf.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />

        <div className="mt-4 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              My Bookshelf
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Journey through your created worlds and characters.
            </p>
          </div>
          <Link
            href="/tools/story-studio"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Story
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <svg className="w-9 h-9 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No books yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Create your first AI-illustrated story book!</p>
            <Link
              href="/tools/story-studio"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Create a Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {books.map((book) => (
              <div
                key={book.id}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Cover image — taller aspect ratio like design */}
                <Link href={`/tools/story-studio/book/${book.slug}`} className="block relative">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <svg className="w-12 h-12 text-purple-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                  )}
                  {/* Genre badge overlay */}
                  {book.style && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded">
                      {book.style}
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <Link href={`/tools/story-studio/book/${book.slug}`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {new Date(book.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {book.pageCount} pages
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-3 pb-3 flex gap-1.5">
                  <button
                    onClick={() => handleShare(book)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    style={{ minHeight: '36px' }}
                  >
                    {book.isPublic ? 'Unshare' : 'Share'}
                  </button>
                  {deleteConfirm === book.id ? (
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                      style={{ minHeight: '36px' }}
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(book.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      style={{ minHeight: '36px' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* "Create New" card — dashed border like design */}
            <Link
              href="/tools/story-studio"
              className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-3 aspect-[3/5] hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create New</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Start a fresh tale</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
