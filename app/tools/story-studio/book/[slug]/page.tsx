import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookReaderClient } from './book-reader-client'
import { BookReaderFallback } from './book-reader-fallback'
import { BackButton } from './back-button'

interface BookPageProps {
  params: Promise<{ slug: string }>
}

async function getBook(slug: string) {
  const supabase = await createClient()

  // Get current user (if any) to allow viewing own books
  let currentUserId: string | undefined
  try {
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id
  } catch { /* no auth session */ }

  // Dev mode: use DEV_USER_ID
  if (!currentUserId && process.env.NODE_ENV === 'development') {
    currentUserId = process.env.DEV_USER_ID
  }

  // Single RPC: fetches by slug, returns if public OR owned by user (bypasses RLS)
  const { data, error } = await supabase.rpc('get_book_by_slug', {
    p_slug: slug,
    p_user_id: currentUserId ?? null,
  })

  if (error) {
    console.error('[book] get_book_by_slug failed:', error.message)
    return { book: null, currentUserId, dbError: true }
  }

  // RPC returns array (RETURNS TABLE), take first row
  const book = Array.isArray(data) ? data[0] : data
  return { book: book ?? null, currentUserId, dbError: false }
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const { book } = await getBook(slug)

  if (!book) {
    return { title: 'Story Studio' }
  }

  const bookData = book.data as Record<string, unknown>
  const concept = bookData.concept as Record<string, unknown> | undefined
  const sections = concept?.sections as Record<string, unknown> | undefined
  const pages = bookData.pages as { imageUrl?: string }[] | undefined
  const title = (bookData.title as string) || 'Untitled'
  const description = (sections?.premise as string) || 'An AI-generated story book'
  const coverImage = (bookData.coverImageUrl as string) || pages?.[0]?.imageUrl || undefined

  return {
    title: `${title} | Story Studio`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(coverImage ? { images: [{ url: coverImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: coverImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
  }
}

function BookPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Sticky CTA header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3 mb-4">
          <BackButton />
          <Link
            href="/tools/story-studio"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--tk-color-primary-500,#3D6AF2)] text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap ml-auto"
            style={{ minHeight: '40px' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Your Own Story
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const { book, currentUserId, dbError } = await getBook(slug)

  // DB timed out — fall back to client-side loading from localStorage / API retry
  if (!book && dbError) {
    return (
      <BookPageShell>
        <BookReaderFallback slug={slug} />
      </BookPageShell>
    )
  }

  // Genuinely not found (DB worked but no matching book)
  if (!book) {
    return (
      <BookPageShell>
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Book Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">This story may have been removed or the link is incorrect.</p>
          <Link
            href="/tools/story-studio"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Story Studio
          </Link>
        </div>
      </BookPageShell>
    )
  }

  const bookData = book.data as Record<string, unknown>
  const concept = bookData.concept as Record<string, unknown> | undefined
  const sections = concept?.sections as Record<string, unknown> | undefined
  const pages = bookData.pages as { imageUrl?: string }[] | undefined
  const title = (bookData.title as string) || 'Untitled'
  const authors = (bookData.authors as string[]) || []
  const premise = (sections?.premise as string) || ''
  const coverImage = (bookData.coverImageUrl as string) || pages?.[0]?.imageUrl || null

  const isOwner = !!(currentUserId && book.user_id === currentUserId)
  const bookId = book.id as string

  return (
    <BookPageShell>
      {/* SEO-only static preview (hidden visually, visible to crawlers) */}
      <div className="sr-only">
        <h1>{title}</h1>
        {authors.length > 0 && <p>Written by {authors.join(' & ')}</p>}
        {premise && <p>{premise}</p>}
        {coverImage && <img src={coverImage} alt={title} />}
      </div>

      {/* Interactive reader (client component) */}
      <BookReaderClient bookData={bookData} bookId={bookId} isOwner={isOwner} />
    </BookPageShell>
  )
}
