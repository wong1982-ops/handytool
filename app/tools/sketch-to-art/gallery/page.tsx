import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { GalleryEntry } from '@/tools/sketch-to-art/types'

export const revalidate = 300

export const metadata = {
  title: 'Community Gallery | Sketch to Art',
  description: 'See what others have created with Sketch to Art',
}

export default async function SketchGalleryPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sketch_gallery')
    .select('id, title, original_sketch_url, result_image_url, style, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(30)

  const entries: GalleryEntry[] = data || []

  return (
    <main className="flex-1 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/tools/sketch-to-art" className="hover:text-[var(--tk-color-primary-500)] transition-colors">
                Sketch to Art
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-900 dark:text-white font-medium">Gallery</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Community Gallery</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">See what others have created</p>
          </div>
          <Link
            href="/tools/sketch-to-art"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-color-primary-500)] hover:text-[var(--tk-color-primary-600)] transition-colors"
          >
            Create your own
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Gallery grid */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">
              No art shared yet. Be the first!
            </p>
            <Link
              href="/tools/sketch-to-art"
              className="inline-flex min-h-[44px] items-center px-6 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Start creating
            </Link>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="group relative rounded-2xl overflow-hidden break-inside-avoid mb-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
              >
                {/* Result image */}
                <div className="relative aspect-auto overflow-hidden">
                  <Image
                    src={entry.result_image_url}
                    alt={entry.title}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />

                  {/* Hover overlay — "View Original" */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm">
                      View Original
                    </span>
                  </div>
                </div>

                {/* Card info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {entry.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 font-medium capitalize">
                      {entry.style}
                    </span>
                    <time
                      dateTime={entry.created_at}
                      className="text-[11px] text-slate-400 dark:text-slate-500"
                    >
                      {new Date(entry.created_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
