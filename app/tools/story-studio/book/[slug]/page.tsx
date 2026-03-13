import { createClient } from '@/lib/supabase/server'
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { isLocalDev, LOCAL_DEV_USER_ID } from '@/lib/local-dev'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookReaderClient } from './book-reader-client'
import { BookReaderFallback } from './book-reader-fallback'
import { BackButton } from './back-button'

interface BookPageProps {
  params: Promise<{ slug: string }>
}

async function getCurrentUserId() {
  if (isLocalDev) return LOCAL_DEV_USER_ID

  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) return user.id
  } catch { /* no auth session */ }

  if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_USER_ID
  }
  return undefined
}

/**
 * Fetch book shell (metadata without pages) — cached via ISR.
 * Public books are served from edge cache instantly.
 * Cache is keyed by slug and revalidated every hour.
 */
/**
 * Try shell RPC (fast, no pages). Falls back to full get_book_by_slug if shell RPC doesn't exist.
 */
async function fetchBookShell(slug: string, userId: string | null) {
  const supabase = await createClient()

  // Try lightweight shell RPC first
  const { data, error } = await supabase.rpc('get_book_shell_by_slug', {
    p_slug: slug,
    p_user_id: userId,
  })

  if (!error && data) {
    const book = Array.isArray(data) ? data[0] : data
    if (book) return { ...book, _mode: 'shell' as const }
  }

  // Fallback: use original full RPC
  console.warn('[book] get_book_shell_by_slug failed, using get_book_by_slug fallback', error?.message)
  const { data: fullData, error: fullErr } = await supabase.rpc('get_book_by_slug', {
    p_slug: slug,
    p_user_id: userId,
  })

  if (fullErr) {
    console.error('[book] get_book_by_slug failed:', fullErr.message)
    return null
  }

  const book = Array.isArray(fullData) ? fullData[0] : fullData
  if (!book) return null

  // Extract page count and mark as full mode (pages already loaded)
  const bookData = book.data as Record<string, unknown>
  const pages = bookData?.pages as unknown[] | undefined
  return { ...book, page_count: pages?.length ?? 0, _mode: 'full' as const }
}

/**
 * Cached version for public books (no user context).
 * Uses a standalone anon client (no cookies) so it's safe inside unstable_cache.
 */
const getCachedBookShell = unstable_cache(
  async (slug: string) => {
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data, error } = await supabase.rpc('get_book_shell_by_slug', {
      p_slug: slug,
      p_user_id: null,
    })

    if (!error && data) {
      const book = Array.isArray(data) ? data[0] : data
      if (book) return { ...book, _mode: 'shell' as const }
    }

    // Fallback
    const { data: fullData, error: fullErr } = await supabase.rpc('get_book_by_slug', {
      p_slug: slug,
      p_user_id: null,
    })

    if (fullErr || !fullData) return null

    const book = Array.isArray(fullData) ? fullData[0] : fullData
    if (!book) return null

    const bookData = book.data as Record<string, unknown>
    const pages = bookData?.pages as unknown[] | undefined
    return { ...book, page_count: pages?.length ?? 0, _mode: 'full' as const }
  },
  ['book-shell'],
  { revalidate: 3600, tags: ['book-shell'] },
)

/** Fetch initial pages (first batch) for SSR */
async function fetchInitialPages(bookId: string, userId: string | null) {
  const supabase = await createClient()
  const { data: pages, error } = await supabase.rpc('get_book_pages', {
    p_book_id: bookId,
    p_user_id: userId,
    p_offset: 0,
    p_limit: 4,
  })

  if (error) {
    console.warn('[book] get_book_pages failed, skipping lazy load:', error.message)
    return null // null = RPC doesn't exist, use full data
  }

  return (pages || []).map((row: { page_data: unknown }) => row.page_data)
}

async function getBook(slug: string) {
  const currentUserId = await getCurrentUserId()

  // Try cached shell first (works for public books)
  let shell = await getCachedBookShell(slug)

  // If no cached result, try with user auth (private book)
  if (!shell && currentUserId) {
    shell = await fetchBookShell(slug, currentUserId)
  }

  if (!shell) {
    return { shell: null, initialPages: null, currentUserId, dbError: false }
  }

  // If full mode (fallback), pages are already in the data — no lazy load needed
  if (shell._mode === 'full') {
    return { shell, initialPages: null, currentUserId, dbError: false }
  }

  // Shell mode: fetch first batch of pages for lazy loading
  const initialPages = await fetchInitialPages(shell.id as string, currentUserId ?? null)

  return { shell, initialPages, currentUserId, dbError: false }
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params

  // Use cached shell for metadata (fast, no pages needed)
  let shell = await getCachedBookShell(slug)
  if (!shell) {
    const currentUserId = await getCurrentUserId()
    if (currentUserId) {
      shell = await fetchBookShell(slug, currentUserId)
    }
  }

  if (!shell) {
    return { title: 'Story Studio' }
  }

  const bookData = shell.data as Record<string, unknown>
  const concept = bookData.concept as Record<string, unknown> | undefined
  const sections = concept?.sections as Record<string, unknown> | undefined
  const title = (bookData.title as string) || 'Untitled'
  const description = (sections?.premise as string) || 'An AI-generated story book'
  const coverImage = (bookData.coverImageUrl as string) || undefined

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
  const { shell, initialPages, currentUserId } = await getBook(slug)

  // No shell found — try full fallback (client-side loading)
  if (!shell) {
    return (
      <BookPageShell>
        <BookReaderFallback slug={slug} />
      </BookPageShell>
    )
  }

  const bookData = shell.data as Record<string, unknown>
  const concept = bookData.concept as Record<string, unknown> | undefined
  const sections = concept?.sections as Record<string, unknown> | undefined
  const title = (bookData.title as string) || 'Untitled'
  const authors = (bookData.authors as string[]) || []
  const premise = (sections?.premise as string) || ''
  const coverImage = (bookData.coverImageUrl as string) || null

  const isOwner = !!(currentUserId && shell.user_id === currentUserId)
  const bookId = shell.id as string
  const pageCount = (shell.page_count as number) || 0

  return (
    <BookPageShell>
      {/* SEO-only static preview (hidden visually, visible to crawlers) */}
      <div className="sr-only">
        <h1>{title}</h1>
        {authors.length > 0 && <p>Written by {authors.join(' & ')}</p>}
        {premise && <p>{premise}</p>}
        {coverImage && <img src={coverImage} alt={title} />}
      </div>

      {/* Interactive reader (client component) — receives shell + initial pages */}
      <BookReaderClient
        bookData={bookData}
        bookId={bookId}
        isOwner={isOwner}
        {...(initialPages !== null ? {
          initialPages: initialPages as Record<string, unknown>[],
          pageCount,
        } : {})}
      />
    </BookPageShell>
  )
}
