'use client'

import { useRef } from 'react'
import Image from 'next/image'
import type { Page } from '../types'

const SERIF_FONT = '"Palatino Linotype", Palatino, "Book Antiqua", serif'
const LONG_PRESS_DELAY = 500

export interface MobilePageCardProps {
  page: Page
  isCover?: boolean
  title?: string
  authors?: string[]
  premise?: string
  onImageTap?: () => void
  onTextLongPress?: () => void
}

export default function MobilePageCard({
  page,
  isCover = false,
  title,
  authors,
  premise,
  onImageTap,
  onTextLongPress,
}: MobilePageCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onTextLongPress?.()
    }, LONG_PRESS_DELAY)
  }

  const cancelLongPress = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  if (isCover) {
    return <CoverPage page={page} title={title} authors={authors} premise={premise} />
  }

  return (
    <ContentPage
      page={page}
      onImageTap={onImageTap}
      onTouchStart={handleTouchStart}
      onCancelLongPress={cancelLongPress}
    />
  )
}

// ---------------------------------------------------------------------------
// Cover Page
// ---------------------------------------------------------------------------

interface CoverPageProps {
  page: Page
  title?: string
  authors?: string[]
  premise?: string
}

function CoverPage({ page, title, authors, premise }: CoverPageProps) {
  const hasImage = Boolean(page.imageUrl)

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Image area — fills available space */}
      <div className="relative min-h-0 flex-1">
        {hasImage ? (
          <>
            <Image
              src={page.imageUrl!}
              alt={title ?? 'Story cover'}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
            {/* Title / authors overlaid on gradient */}
            {(title || (authors && authors.length > 0)) && (
              <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
                {title && (
                  <h1
                    className="text-2xl font-bold leading-tight text-white drop-shadow-md"
                    style={{ fontFamily: SERIF_FONT }}
                  >
                    {title}
                  </h1>
                )}
                {authors && authors.length > 0 && (
                  <p className="mt-1 text-sm text-white/80">
                    {authors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          /* No image: plain backdrop with centred title */
          <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800 px-6">
            {title && (
              <h1
                className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100"
                style={{ fontFamily: SERIF_FONT }}
              >
                {title}
              </h1>
            )}
          </div>
        )}
      </div>

      {/* Premise text — white card below image */}
      {premise && (
        <div className="shrink-0 bg-white px-6 py-5 dark:bg-slate-900">
          <p
            className="text-base leading-relaxed text-slate-600 dark:text-slate-300"
            style={{ fontFamily: SERIF_FONT }}
          >
            {premise}
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Content Page
// ---------------------------------------------------------------------------

interface ContentPageProps {
  page: Page
  onImageTap?: () => void
  onTouchStart: () => void
  onCancelLongPress: () => void
}

function ContentPage({
  page,
  onImageTap,
  onTouchStart,
  onCancelLongPress,
}: ContentPageProps) {
  const hasImage = Boolean(page.imageUrl)

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Image area */}
      {hasImage ? (
        <button
          type="button"
          aria-label="View image"
          onClick={onImageTap}
          className="relative h-[60%] w-full shrink-0 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
        >
          <Image
            src={page.imageUrl!}
            alt={page.sceneDescription}
            fill
            className="object-cover"
          />
        </button>
      ) : (
        /* Smaller spacer when no image */
        <div className="h-[20%] shrink-0 bg-slate-100 dark:bg-slate-800" />
      )}

      {/* Text area — scrollable */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4"
        onTouchStart={onTouchStart}
        onTouchEnd={onCancelLongPress}
        onTouchCancel={onCancelLongPress}
      >
        {/* Narrative text */}
        {page.narrativeText && (
          <p
            className="text-base leading-relaxed text-slate-900 dark:text-slate-100"
            style={{ fontFamily: SERIF_FONT }}
          >
            {page.narrativeText}
          </p>
        )}

        {/* Dialogue */}
        {page.dialogue && page.dialogue.length > 0 && (
          <div className="mt-4 space-y-3">
            {page.dialogue.map((d, i) => (
              <DialogueLine key={i} speaker={d.speaker} line={d.line} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dialogue Line
// ---------------------------------------------------------------------------

interface DialogueLineProps {
  speaker: string
  line: string
}

function DialogueLine({ speaker, line }: DialogueLineProps) {
  return (
    <div className="border-l-4 border-amber-400 pl-4 dark:border-amber-500">
      {speaker && (
        <span
          className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
          style={{ fontFamily: SERIF_FONT, fontVariant: 'small-caps' }}
        >
          {speaker}
        </span>
      )}
      <p
        className="mt-0.5 italic text-slate-900 dark:text-slate-100"
        style={{ fontFamily: SERIF_FONT }}
      >
        {line}
      </p>
    </div>
  )
}
