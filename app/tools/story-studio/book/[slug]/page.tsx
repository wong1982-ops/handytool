import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookReaderClient } from './book-reader-client'

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

  // Try via RPC to bypass RLS (supports dev mode without auth session)
  if (currentUserId) {
    const { data: userBooks } = await supabase.rpc('get_user_books', {
      p_user_id: currentUserId,
    })
    const match = (userBooks || []).find((b: Record<string, unknown>) => b.slug === slug)
    if (match) return match
  }

  // Fallback: public books (works for shared links)
  const { data, error } = await supabase
    .from('books')
    .select('id, slug, data, is_public, created_at')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    return { title: 'Book Not Found | Story Studio' }
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

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) notFound()

  const bookData = book.data as Record<string, unknown>
  const concept = bookData.concept as Record<string, unknown> | undefined
  const sections = concept?.sections as Record<string, unknown> | undefined
  const pages = bookData.pages as { imageUrl?: string }[] | undefined
  const title = (bookData.title as string) || 'Untitled'
  const authors = (bookData.authors as string[]) || []
  const premise = (sections?.premise as string) || ''
  const coverImage = (bookData.coverImageUrl as string) || pages?.[0]?.imageUrl || null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* SEO-only static preview (hidden visually, visible to crawlers) */}
        <div className="sr-only">
          <h1>{title}</h1>
          {authors.length > 0 && <p>Written by {authors.join(' & ')}</p>}
          {premise && <p>{premise}</p>}
          {coverImage && <img src={coverImage} alt={title} />}
        </div>

        {/* Interactive reader (client component) */}
        <BookReaderClient bookData={bookData} />

        {/* CTA */}
        <div className="text-center mt-8 pb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Want to create your own AI story book?
          </p>
          <Link
            href="/tools/story-studio"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[var(--tk-color-primary-500,#3D6AF2)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ minHeight: '44px' }}
          >
            Create Your Own Story
          </Link>
        </div>
      </div>
    </div>
  )
}
