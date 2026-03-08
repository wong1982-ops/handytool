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
  const coverImage = pages?.[0]?.imageUrl || undefined

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
  const tags = concept?.tags as Record<string, unknown> | undefined
  const pages = bookData.pages as { imageUrl?: string; narrativeText?: string; sceneDescription?: string; dialogue?: { speaker: string; line: string }[]; audioUrl?: string }[] | undefined
  const title = (bookData.title as string) || 'Untitled'
  const premise = (sections?.premise as string) || ''
  const coverImage = pages?.[0]?.imageUrl || null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Static preview (visible to crawlers & initial load) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          {coverImage && (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          )}
          <div className="p-6 md:p-10 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h1>
            {tags && (
              <div className="flex justify-center gap-2 mb-4">
                {tags.audience ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {String(tags.audience)}
                  </span>
                ) : null}
                {tags.style ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {String(tags.style)}
                  </span>
                ) : null}
                {pages && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {pages.length} pages
                  </span>
                )}
              </div>
            )}
            {premise && (
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {premise}
              </p>
            )}
          </div>
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
