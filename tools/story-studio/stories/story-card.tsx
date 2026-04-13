'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { StoryItem } from '@/tools/story-studio/use-stories-list'
import { useLanguage } from '@/tools/story-studio/use-language-context'

interface StoryCardProps {
  story: StoryItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleShare: (id: string, isPublic: boolean) => void
  onMarkComplete?: (id: string) => void
}

export function StoryCard({ story, onEdit, onDelete, onToggleShare, onMarkComplete }: StoryCardProps) {
  const { t, language } = useLanguage()
  const dateStr = new Date(story.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover image */}
      <Link href={`/tools/story-studio/book/${story.slug}`} className="block" prefetch={true}>
        <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {story.coverImageUrl ? (
            <Image
              src={story.coverImageUrl}
              alt={story.title}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}

          {/* Audio / Illustration badges */}
          {(story.hasAudio || story.hasIllustrations) && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {story.hasIllustrations && (
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm"
                  title={language === 'zh' ? '有插画' : 'Has illustrations'}
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </span>
              )}
              {story.hasAudio && (
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm"
                  title={language === 'zh' ? '有配音' : 'Has narration'}
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{story.title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {story.pageCount} {t.storyCard.pages} &middot; {dateStr}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
              story.status === 'complete'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}>
              {story.status === 'complete' ? t.storyCard.complete : t.storyCard.draft}
            </span>
            {story.status !== 'complete' && onMarkComplete && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkComplete(story.id) }}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full cursor-pointer
                  bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                  hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                title={t.storyCard.markCompleteTitle}
              >
                {t.storyCard.markComplete}
              </button>
            )}
          </div>
        </div>

        {story.seriesTitle && (
          <p className="text-[11px] text-[#3D6AF2] dark:text-[#93aaff] mt-1 truncate">{story.seriesTitle}</p>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onEdit(story.id)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium
              text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg
              transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
            {t.storyCard.edit}
          </button>
          <button
            onClick={() => onToggleShare(story.id, !story.isPublic)}
            className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-[#3D6AF2]
              rounded-lg transition-colors cursor-pointer"
            aria-label={story.isPublic ? t.storyCard.makePrivate : t.storyCard.makePublic}
            title={story.isPublic ? t.storyCard.publicTip : t.storyCard.privateTip}
          >
            {story.isPublic ? (
              <svg className="w-3.5 h-3.5 text-[#3D6AF2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onDelete(story.id)}
            className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-500
              rounded-lg transition-colors cursor-pointer"
            aria-label={t.storyCard.delete}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
