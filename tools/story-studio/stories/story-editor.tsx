'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { PageStrip } from '@/tools/story-studio/stories/page-strip'
import { AIHelpMenu, type AIAction, type AIHelpField } from '@/tools/story-studio/stories/ai-help-menu'
import { ImagePromptViewer } from '@/tools/story-studio/stories/image-prompt-viewer'
import { IllustrationReviewFlow } from '@/tools/story-studio/add-ons/illustration-review-flow'
import { NarrationFlow } from '@/tools/story-studio/add-ons/narration-flow'
import { ImageLightbox } from '@/tools/story-studio/image-lightbox'
import { ART_STYLES } from '@/tools/story-studio/use-characters'

interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

interface PageMedia {
  pageId: string
  sequence: number
  imageUrl?: string
  imageStatus?: 'generating' | 'done' | 'error'
  audioUrl?: string
  audioStatus?: 'generating' | 'done' | 'error'
}

type EditorView = 'editor' | 'illustration-review' | 'narration'

interface StoryEditorProps {
  bookId: string
  title: string
  coverImageUrl?: string | null
  artStyle?: string
  pages: PageData[]
  onSave: (pages: PageData[]) => Promise<void>
  onBack: () => void
}

/* ── Speaker color palette ─────────────────────────────── */
const SPEAKER_COLORS = [
  { dot: 'bg-blue-500', name: 'text-blue-600 dark:text-blue-400', bubble: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  { dot: 'bg-emerald-500', name: 'text-emerald-600 dark:text-emerald-400', bubble: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { dot: 'bg-amber-500', name: 'text-amber-600 dark:text-amber-400', bubble: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { dot: 'bg-rose-500', name: 'text-rose-600 dark:text-rose-400', bubble: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { dot: 'bg-violet-500', name: 'text-violet-600 dark:text-violet-400', bubble: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800' },
  { dot: 'bg-cyan-500', name: 'text-cyan-600 dark:text-cyan-400', bubble: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800' },
]

/* ── Progress Ring SVG ─────────────────────────────────── */
function ProgressRing({ done, total, color, size = 48 }: { done: number; total: number; color: string; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? done / total : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          className={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span className="absolute text-xs font-bold text-slate-600 dark:text-slate-300">
        {total > 0 ? Math.round(pct * 100) : 0}%
      </span>
    </div>
  )
}

/* ── Collapsible Fieldset ──────────────────────────────── */
function CollapsibleFieldset({
  legend, borderClass, legendClass, defaultOpen = true, children,
}: {
  legend: string; borderClass: string; legendClass: string; defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <fieldset className={`mt-4 rounded-xl border ${borderClass} bg-white dark:bg-slate-900/60 overflow-hidden`}>
      <legend className={`px-2 font-semibold uppercase tracking-wider ${legendClass}`}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
          {legend}
        </button>
      </legend>
      {open && <div className="p-4 pt-0">{children}</div>}
    </fieldset>
  )
}

/* ── Progress cards ────────────────────────────────────── */
function getProgressLabel(done: number, total: number, noun: string): { text: string; button: string } {
  if (done === 0) return { text: `0 of ${total} pages ${noun}`, button: noun === 'illustrated' ? 'Add Illustrations' : 'Add Narration' }
  if (done >= total) return { text: `All ${total} pages ${noun}`, button: 'Review' }
  return { text: `${done} of ${total} pages ${noun}`, button: 'Continue' }
}

function ProgressCard({ done, total, noun, color, onOpen }: {
  done: number; total: number; noun: string; color: string; onOpen: () => void
}) {
  const label = getProgressLabel(done, total, noun)
  const borderColor = noun === 'illustrated'
    ? 'border-[#1e2631] dark:border-[#1e2631] text-[#3D6AF2] dark:text-[#93aaff] hover:bg-[#3D6AF2]/10 dark:hover:bg-[#3D6AF2]/15'
    : 'border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
      <ProgressRing done={done} total={total} color={color} />
      <p className="flex-1 text-slate-600 dark:text-slate-400">{label.text}</p>
      <button
        onClick={onOpen}
        className={`shrink-0 px-3 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${borderColor}`}
        style={{ minHeight: '44px' }}
      >
        {label.button}
      </button>
    </div>
  )
}

/* ── Empty state hint ──────────────────────────────────── */
function EmptyHint({ text }: { text: string }) {
  return <p className="py-4 text-center text-slate-400 dark:text-slate-500 italic">{text}</p>
}

/* ── Inline generate bar (compact, lives inside each fieldset) ── */
const GEN_BAR_STYLES = {
  illustration: {
    spinner: 'border-[#3D6AF2]',
    primary: 'bg-[#3D6AF2] hover:bg-[#3560d8] text-white',
    outline: 'border-[#1e2631] dark:border-[#1e2631] text-[#3D6AF2] dark:text-[#93aaff] hover:bg-[#3D6AF2]/10 dark:hover:bg-[#3D6AF2]/15',
  },
  narration: {
    spinner: 'border-purple-500',
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    outline: 'border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
  },
} as const

function GenerateBar({ type, media, generating, error, hasPrompt, onGenerate, onRefine }: {
  type: 'illustration' | 'narration'
  media?: PageMedia
  generating: boolean
  error?: string | null
  hasPrompt: boolean
  onGenerate: () => void
  onRefine: (instruction: string) => void
}) {
  const [refineText, setRefineText] = useState('')
  const isIll = type === 'illustration'
  const hasContent = isIll
    ? media?.imageUrl && media.imageStatus === 'done'
    : media?.audioUrl && media.audioStatus === 'done'
  const isGenerating = generating || (isIll ? media?.imageStatus === 'generating' : media?.audioStatus === 'generating')
  const hasError = error || (isIll ? media?.imageStatus === 'error' : media?.audioStatus === 'error')
  const s = GEN_BAR_STYLES[type]

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      {/* Error */}
      {hasError && !isGenerating && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-red-600 dark:text-red-400 text-sm flex-1">{typeof error === 'string' ? error : 'Generation failed'}</span>
        </div>
      )}

      {/* Generating spinner */}
      {isGenerating && (
        <div className="flex items-center gap-3 py-2">
          <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${s.spinner}`} />
          <span className="text-slate-400 dark:text-slate-500 text-sm">
            {isIll ? 'Generating illustration...' : 'Generating narration...'}
          </span>
        </div>
      )}

      {/* Action row: refine input + buttons */}
      {!isGenerating && (
        <div className="flex items-center gap-2">
          {hasContent ? (
            <>
              <input
                type="text"
                value={refineText}
                onChange={e => setRefineText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && refineText.trim()) { onRefine(refineText.trim()); setRefineText('') } }}
                placeholder={isIll ? 'Describe adjustments, e.g. "make hair curlier"' : 'Describe adjustments, e.g. "speak slower"'}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400"
              />
              <button
                onClick={() => { if (refineText.trim()) { onRefine(refineText.trim()); setRefineText('') } }}
                disabled={!refineText.trim()}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${s.primary}`}
                style={{ minHeight: '38px' }}
              >
                Refine
              </button>
              <button
                onClick={onGenerate}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border ${s.outline}`}
                style={{ minHeight: '38px' }}
                title="Regenerate from scratch"
              >
                Redo
              </button>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm italic text-slate-400 dark:text-slate-500">
                {!hasPrompt
                  ? (isIll ? 'Add an image prompt above first' : 'Add narrative text or dialogue first')
                  : (isIll ? 'Generate an illustration from the prompt above' : 'Generate audio narration for this page')
                }
              </p>
              <button
                onClick={onGenerate}
                disabled={!hasPrompt}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${s.primary}`}
                style={{ minHeight: '38px' }}
              >
                Generate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Cover editor ───────────────────────────────────── */
function CoverEditor({ title, coverUrl, generating, error, artStyle: initialStyle, onGenerate }: {
  title: string
  coverUrl: string | null
  generating: boolean
  error: string | null
  artStyle?: string
  onGenerate: (opts: { prompt?: string; refinement?: string; characterIds?: string[]; artStyle?: string }) => void
}) {
  const [coverPrompt, setCoverPrompt] = useState(
    `Book cover for "${title}". A captivating, eye-catching illustration that captures the story's essence.`
  )
  const [refineText, setRefineText] = useState('')
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null)
  const [characters, setCharacters] = useState<{ id: string; name: string }[]>([])
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState(initialStyle || "children's book illustration")

  // Fetch approved characters
  useEffect(() => {
    async function loadChars() {
      try {
        const res = await fetch('/api/v1/story/characters')
        if (!res.ok) return
        const { data } = await res.json()
        const approved = (data ?? [])
          .filter((c: { status: string }) => c.status === 'approved')
          .map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
        setCharacters(approved)
        // Select all by default
        setSelectedCharIds(approved.map((c: { id: string }) => c.id))
      } catch { /* silent */ }
    }
    loadChars()
  }, [])

  const toggleChar = (id: string) => {
    setSelectedCharIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => {
    onGenerate({
      prompt: coverPrompt,
      characterIds: selectedCharIds.length > 0 ? selectedCharIds : undefined,
      artStyle: selectedStyle,
    })
  }

  const handleRefine = () => {
    if (!refineText.trim()) return
    onGenerate({
      refinement: refineText.trim(),
      characterIds: selectedCharIds.length > 0 ? selectedCharIds : undefined,
      artStyle: selectedStyle,
    })
    setRefineText('')
  }

  return (
    <div className="space-y-4">
      {/* Cover preview */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
        {generating ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/30">
            <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin border-amber-500" />
            <p className="text-slate-400 text-sm mt-3">Generating cover illustration...</p>
          </div>
        ) : coverUrl ? (
          <div className="relative">
            <img
              src={coverUrl}
              alt={`${title} cover`}
              className="w-full object-contain"
              style={{ maxHeight: 500, background: '#0f172a' }}
            />
            <button
              onClick={() => setZoomImage({ src: coverUrl, alt: `${title} cover` })}
              className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Zoom image"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10">
            <svg className="w-16 h-16 text-amber-300/40 dark:text-amber-600/30 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25c0 .828.672 1.5 1.5 1.5z" />
            </svg>
            <p className="text-slate-400 dark:text-slate-500 text-sm">No cover image yet</p>
          </div>
        )}
      </div>

      {/* Character picker */}
      {characters.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-2">
          <label className="font-medium text-slate-700 dark:text-slate-300">Characters on Cover</label>
          <div className="flex flex-wrap gap-2">
            {characters.map(c => (
              <label
                key={c.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${
                  selectedCharIds.includes(c.id)
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCharIds.includes(c.id)}
                  onChange={() => toggleChar(c.id)}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${selectedCharIds.includes(c.id) ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Art style dropdown */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-2">
        <label className="font-medium text-slate-700 dark:text-slate-300">Art Style</label>
        <select
          value={selectedStyle}
          onChange={e => setSelectedStyle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-sm
            focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {ART_STYLES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Cover prompt + generate/refine */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-3">
        {!coverUrl && (
          <>
            <label className="font-medium text-slate-700 dark:text-slate-300">Cover Prompt</label>
            <textarea
              value={coverPrompt}
              onChange={e => setCoverPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 resize-none text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Describe the cover illustration you want..."
            />
          </>
        )}
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        )}

        {/* Refine/Redo when cover exists, Generate when it doesn't */}
        {!generating && (
          <div className="flex items-center gap-2">
            {coverUrl ? (
              <>
                <input
                  type="text"
                  value={refineText}
                  onChange={e => setRefineText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && refineText.trim()) handleRefine() }}
                  placeholder='Describe adjustments, e.g. "make the background more magical"'
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400"
                />
                <button
                  onClick={handleRefine}
                  disabled={!refineText.trim()}
                  className="shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-700 text-white"
                  style={{ minHeight: '38px' }}
                >
                  Refine
                </button>
                <button
                  onClick={handleGenerate}
                  className="shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  style={{ minHeight: '38px' }}
                  title="Regenerate from scratch"
                >
                  Redo
                </button>
              </>
            ) : (
              <>
                <p className="flex-1 text-sm italic text-slate-400 dark:text-slate-500">
                  Generate a cover illustration for your story
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={!coverPrompt.trim()}
                  className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-700 text-white"
                  style={{ minHeight: '38px' }}
                >
                  Generate Cover
                </button>
              </>
            )}
          </div>
        )}

        {generating && (
          <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-amber-500" />
            <span className="text-slate-400 dark:text-slate-500 text-sm">Generating cover...</span>
          </div>
        )}
      </div>

      {zoomImage && <ImageLightbox src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />}
    </div>
  )
}

/* ── Full page preview (combined illustration + audio at bottom) ── */
function FullPagePreview({ media, pageNumber, totalPages, narrativeText, dialogue, generatingIll, generatingNar }: {
  media?: PageMedia
  pageNumber: number
  totalPages: number
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  generatingIll: boolean
  generatingNar: boolean
}) {
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null)
  const hasImage = media?.imageUrl && media.imageStatus === 'done'
  const hasAudio = media?.audioUrl && media.audioStatus === 'done'
  const imageGenerating = generatingIll || media?.imageStatus === 'generating'
  const audioGenerating = generatingNar || media?.audioStatus === 'generating'
  const hasContent = narrativeText.trim().length > 0

  if (!hasImage && !hasAudio && !hasContent && !imageGenerating && !audioGenerating) return null

  const BOOK_FONT = '"Palatino Linotype", Palatino, "Book Antiqua", serif'

  const renderNarrative = (text: string) => {
    if (!text || text.length < 2) return <p className="text-base md:text-lg lg:text-xl text-slate-900 dark:text-slate-100 leading-[1.8] md:leading-[1.9]" style={{ fontFamily: BOOK_FONT }}>{text}</p>
    const firstChar = text[0]
    const rest = text.slice(1)
    return (
      <p className="text-base md:text-lg lg:text-xl text-slate-900 dark:text-slate-100 leading-[1.8] md:leading-[1.9]" style={{ fontFamily: BOOK_FONT }}>
        <span className="float-left font-bold leading-[0.75] mr-3 mt-1.5 bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-300 dark:to-amber-500 bg-clip-text text-transparent" style={{ fontFamily: BOOK_FONT, fontSize: 'clamp(3rem, 5vw, 4.5rem)' }}>{firstChar}</span>
        {rest}
      </p>
    )
  }

  const renderPageNumber = () => (
    <div className="text-center mb-6">
      <svg className="w-8 h-3 mx-auto mb-2 text-amber-400/40 dark:text-amber-500/30" viewBox="0 0 32 12" fill="none">
        <path d="M0 6 C5 0, 9 12, 16 6 C23 0, 27 12, 32 6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600/50 dark:text-amber-400/40">Page {pageNumber}</span>
    </div>
  )

  const renderDialogue = (lines: { speaker: string; line: string }[]) =>
    lines.map((d, i) => (
      <div key={i} className="mt-4 pl-4 border-l-2 border-amber-400/50 dark:border-amber-500/40">
        <p className="text-base md:text-lg lg:text-xl text-slate-800 dark:text-slate-200 italic leading-[1.7]" style={{ fontFamily: BOOK_FONT }}>
          &ldquo;{d.line}&rdquo;
        </p>
        <p className="mt-1 text-xs md:text-sm font-semibold uppercase tracking-wider text-amber-700/70 dark:text-amber-400/70">&mdash; {d.speaker}</p>
      </div>
    ))

  return (
    <div className="mt-6">
      {/* Decorative page divider — matches book viewer */}
      <div className="flex flex-col items-center gap-1.5 py-4">
        <svg className="w-8 h-3 text-amber-400/40 dark:text-amber-500/30" viewBox="0 0 32 12" fill="none">
          <path d="M0 6 C5 0, 9 12, 16 6 C23 0, 27 12, 32 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-600/50 dark:text-amber-400/40">
          Page {pageNumber} of {totalPages}
        </span>
      </div>

      {/* Book-style page card — 16:9 aspect, 60/40 split like the reader */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">

        {/* Main page spread (image left, text right) */}
        {(hasImage || imageGenerating) && hasContent ? (
          /* With illustration — 60:40 side-by-side like the book reader */
          <div className="flex flex-col md:flex-row aspect-auto md:aspect-[16/9]">
            {/* Left: illustration (60%) */}
            <div className="md:w-[60%] shrink-0 relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
              {imageGenerating && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin border-[#3D6AF2]" />
                  <p className="text-slate-400 text-sm mt-2">Generating illustration...</p>
                </div>
              )}
              {hasImage && !imageGenerating && media?.imageUrl && (
                <>
                  <img
                    src={media.imageUrl}
                    alt={`Page ${pageNumber} illustration`}
                    className="w-full h-full object-cover object-center"
                  />
                  <button
                    onClick={() => setZoomImage({ src: media.imageUrl!, alt: `Page ${pageNumber} illustration` })}
                    className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
                    aria-label="Zoom image"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {/* Right: narrative text (40%) */}
            <div className="flex-1 p-5 md:p-8 flex flex-col justify-center overflow-y-auto">
              {renderPageNumber()}
              {renderNarrative(narrativeText)}
              {dialogue.length > 0 && renderDialogue(dialogue)}
            </div>
          </div>
        ) : hasContent ? (
          /* Text-only page — centered with decorative flourish like the book reader */
          <div className="flex items-center justify-center px-6 py-10 md:px-16 lg:px-24 bg-gradient-to-b from-amber-50/30 via-transparent to-amber-50/20 dark:from-amber-950/10 dark:via-transparent dark:to-amber-950/5 min-h-[300px]">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-6">
                <svg className="w-8 h-3 mx-auto mb-2 text-amber-400/40 dark:text-amber-500/30" viewBox="0 0 32 12" fill="none">
                  <path d="M0 6 C5 0, 9 12, 16 6 C23 0, 27 12, 32 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600/50 dark:text-amber-400/40">Page {pageNumber}</span>
              </div>
              {renderNarrative(narrativeText)}
              {dialogue.length > 0 && renderDialogue(dialogue)}
              <div className="mt-8 flex justify-center">
                <svg className="w-10 h-4 text-amber-300/40 dark:text-amber-600/30" viewBox="0 0 40 12" fill="none">
                  <path d="M0 6 C6 0, 10 12, 16 6 C22 0, 26 12, 32 6 C36 2, 38 10, 40 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* Illustration only (no text yet) */
          <>
            {imageGenerating && (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/30">
                <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin border-[#3D6AF2]" />
                <p className="text-slate-400 text-sm mt-2">Generating illustration...</p>
              </div>
            )}
            {hasImage && !imageGenerating && media?.imageUrl && (
              <div className="relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                <img
                  src={media.imageUrl}
                  alt={`Page ${pageNumber} illustration`}
                  className="w-full object-cover object-center"
                />
                <button
                  onClick={() => setZoomImage({ src: media.imageUrl!, alt: `Page ${pageNumber} illustration` })}
                  className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Zoom image"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom bar: status + audio player */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex items-center gap-3">
          {/* Status badges */}
          <div className="flex items-center gap-2">
            {hasImage && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Illustrated
              </span>
            )}
            {hasAudio && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Narrated
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* Audio player (inline) */}
          {audioGenerating && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-purple-500" />
              <span className="text-slate-400 text-xs">Generating...</span>
            </div>
          )}
          {hasAudio && !audioGenerating && media?.audioUrl && (
            <audio controls className="h-8" style={{ maxWidth: '260px' }} src={media.audioUrl}>
              Your browser does not support audio playback.
            </audio>
          )}
        </div>
      </div>

      {/* Image lightbox */}
      {zoomImage && <ImageLightbox src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Main Editor
   ═══════════════════════════════════════════════════════ */

export function StoryEditor({ bookId, title, coverImageUrl: initialCoverUrl, artStyle: initialArtStyle, pages: initialPages, onSave, onBack }: StoryEditorProps) {
  const [pages, setPages] = useState<PageData[]>(initialPages)
  const [activePage, setActivePage] = useState(1)
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl ?? null)
  const [generatingCover, setGeneratingCover] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [view, setView] = useState<EditorView>('editor')
  const [illustrationsDone, setIllustrationsDone] = useState(0)
  const [narratedDone, setNarratedDone] = useState(0)
  const [pageMediaMap, setPageMediaMap] = useState<Record<number, PageMedia>>({})
  const [generatingIll, setGeneratingIll] = useState(false)
  const [generatingNar, setGeneratingNar] = useState(false)
  const [illError, setIllError] = useState<string | null>(null)
  const [narError, setNarError] = useState<string | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragIdx = useRef<number | null>(null)

  // Sync book_pages rows then fetch illustration & narration data
  const refreshMedia = useCallback(async () => {
    try {
      // Ensure book_pages rows exist (upsert from JSONB)
      await fetch(`/api/v1/story/books/${bookId}/pages/sync`, { method: 'POST' })

      const [illRes, narRes] = await Promise.all([
        fetch(`/api/v1/story/books/${bookId}/illustrations`),
        fetch(`/api/v1/story/books/${bookId}/audio`),
      ])

      const mediaMap: Record<number, PageMedia> = {}

      if (illRes.ok) {
        const { data } = await illRes.json()
        let doneCount = 0
        for (const p of data?.pages ?? []) {
          mediaMap[p.sequence] = {
            pageId: p.id,
            sequence: p.sequence,
            imageUrl: p.illustration?.imageUrl,
            imageStatus: p.illustration?.status,
          }
          if (p.illustration?.status === 'done') doneCount++
        }
        setIllustrationsDone(doneCount)
      }

      if (narRes.ok) {
        const { data } = await narRes.json()
        let doneCount = 0
        for (const p of data?.pages ?? []) {
          const existing = mediaMap[p.sequence] || { pageId: p.id, sequence: p.sequence }
          existing.audioUrl = p.audio?.audioUrl
          existing.audioStatus = p.audio?.status
          mediaMap[p.sequence] = existing
          if (p.audio?.status === 'done') doneCount++
        }
        setNarratedDone(doneCount)
      }

      setPageMediaMap(mediaMap)
    } catch { /* silent */ }
  }, [bookId])

  useEffect(() => { refreshMedia() }, [refreshMedia])

  const currentPage = pages.find(p => p.sequence === activePage) ?? pages[0]
  const currentMedia = pageMediaMap[activePage]

  // Extract unique speaker names
  const speakerNames = useMemo(() => {
    const names = new Set<string>()
    const charPattern = /([A-Z][A-Za-z\s'']+?):\s*[a-zA-Z\s]+?\./g
    const attrLabels = ['Hair', 'Eyes', 'Skin', 'Build', 'Outfit', 'Accessories', 'Distinguishing features', 'Fur', 'Feathers', 'Scales']
    const attrLower = attrLabels.map(l => l.toLowerCase())
    for (const page of pages) {
      if (page.imagePrompt) {
        let match: RegExpExecArray | null
        while ((match = charPattern.exec(page.imagePrompt)) !== null) {
          const name = match[1].trim()
          if (!attrLower.includes(name.toLowerCase())) names.add(name)
        }
      }
      for (const d of page.dialogue ?? []) {
        if (d.speaker.trim()) names.add(d.speaker.trim())
      }
    }
    names.add('Narrator')
    return Array.from(names).sort()
  }, [pages])

  // Stable color map for speakers
  const speakerColorMap = useMemo(() => {
    const map: Record<string, typeof SPEAKER_COLORS[0]> = {}
    let idx = 0
    for (const name of speakerNames) {
      if (name === 'Narrator') continue
      map[name] = SPEAKER_COLORS[idx % SPEAKER_COLORS.length]
      idx++
    }
    return map
  }, [speakerNames])

  // Auto-save (debounced 3s)
  useEffect(() => {
    if (!dirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true)
      try { await onSave(pages) } catch { /* silent */ }
      finally { setSaving(false); setDirty(false) }
    }, 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [dirty, pages, onSave])

  const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
    setPages(prev => prev.map(p =>
      p.sequence === activePage ? { ...p, ...updates } : p
    ))
    setDirty(true)
  }, [activePage])

  const addPage = useCallback(() => {
    const newSeq = pages.length + 1
    setPages(prev => [...prev, {
      sequence: newSeq,
      sceneDescription: '',
      narrativeText: '',
      dialogue: [],
      mood: '',
      imagePrompt: '',
    }])
    setActivePage(newSeq)
    setDirty(true)
  }, [pages.length])

  const handleAIAction = useCallback(async (action: AIAction, field: AIHelpField, text: string) => {
    if (!text.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/ai-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text, field, pageSequence: activePage }),
      })
      if (!res.ok) throw new Error('AI action failed')
      const { data } = await res.json()

      if (action === 'suggest_dialogue' && data.dialogue) {
        updateCurrentPage({ dialogue: [...(currentPage.dialogue ?? []), ...data.dialogue] })
      } else if (data.text) {
        const fieldMap: Record<string, string> = {
          sceneDescription: 'sceneDescription',
          narrativeText: 'narrativeText',
          mood: 'mood',
          imagePrompt: 'imagePrompt',
        }
        const key = fieldMap[field]
        if (key) updateCurrentPage({ [key]: data.text })
      }
    } catch { /* show error toast */ }
    finally { setAiLoading(false) }
  }, [bookId, activePage, currentPage, updateCurrentPage])

  const handleManualSave = useCallback(async () => {
    setSaving(true)
    try { await onSave(pages) } catch { /* show error */ }
    finally { setSaving(false); setDirty(false) }
  }, [pages, onSave])

  // Ensure page is saved & synced, return pageId
  const ensurePageId = useCallback(async (): Promise<string | null> => {
    // Save first if there are unsaved changes
    if (dirty) {
      try { await onSave(pages) } catch { return null }
      setDirty(false)
    }
    // Sync to ensure book_pages rows exist
    try {
      const syncRes = await fetch(`/api/v1/story/books/${bookId}/pages/sync`, { method: 'POST' })
      if (syncRes.ok) {
        const { data } = await syncRes.json()
        const match = (data?.pages ?? []).find((p: { sequence: number }) => p.sequence === activePage)
        if (match) return match.pageId
      }
    } catch { /* silent */ }
    // Fallback to existing media map
    return currentMedia?.pageId ?? null
  }, [bookId, activePage, dirty, pages, onSave, currentMedia])

  // Generate illustration for current page (optionally with refinement instruction)
  const generateIllustration = useCallback(async (refinement?: string) => {
    if (!currentPage.imagePrompt.trim()) return
    setGeneratingIll(true)
    setIllError(null)
    try {
      const pageId = await ensurePageId()
      if (!pageId) { setIllError('Could not resolve page ID. Try saving first.'); return }

      const res = await fetch(`/api/v1/story/books/${bookId}/illustrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refinement
          ? { pageId, refinement, qualityMode: 'fast' }
          : { pageId, imagePrompt: currentPage.imagePrompt, qualityMode: 'fast' }
        ),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        setIllError(errBody?.error || `Illustration failed (${res.status})`)
        return
      }
      const { data } = await res.json()
      if (data?.imageUrl) {
        setPageMediaMap(prev => ({
          ...prev,
          [activePage]: {
            ...prev[activePage],
            pageId: data.pageId || prev[activePage]?.pageId || pageId,
            sequence: activePage,
            imageUrl: data.imageUrl,
            imageStatus: 'done' as const,
          },
        }))
      }
      refreshMedia()
    } catch (e) {
      setIllError(e instanceof Error ? e.message : 'Unknown error')
    } finally { setGeneratingIll(false) }
  }, [bookId, activePage, currentPage, ensurePageId, refreshMedia])

  // Generate narration for current page (optionally with refinement instruction)
  const generateNarration = useCallback(async (_refinement?: string) => {
    if (!currentPage.narrativeText.trim() && (currentPage.dialogue ?? []).length === 0) return
    setGeneratingNar(true)
    setNarError(null)
    try {
      const pageId = await ensurePageId()
      if (!pageId) { setNarError('Could not resolve page ID. Try saving first.'); return }
      const res = await fetch(`/api/v1/story/books/${bookId}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          narratorVoice: 'Enceladus',
        }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        setNarError(errBody?.error || `Narration failed (${res.status})`)
        return
      }
      // Immediately update preview from response
      const { data } = await res.json()
      if (data?.audioUrl) {
        setPageMediaMap(prev => ({
          ...prev,
          [activePage]: {
            ...prev[activePage],
            pageId: data.pageId || prev[activePage]?.pageId || pageId,
            sequence: activePage,
            audioUrl: data.audioUrl,
            audioStatus: 'done' as const,
          },
        }))
      }
      refreshMedia()
    } catch (e) {
      setNarError(e instanceof Error ? e.message : 'Unknown error')
    } finally { setGeneratingNar(false) }
  }, [bookId, activePage, ensurePageId, refreshMedia])

  // Generate cover illustration (supports full prompt or refinement-only)
  const generateCover = useCallback(async (opts: { prompt?: string; refinement?: string; characterIds?: string[]; artStyle?: string }) => {
    setGeneratingCover(true)
    setCoverError(null)
    try {
      const body: Record<string, unknown> = { qualityMode: 'quality' }
      if (opts.refinement) {
        body.refinement = opts.refinement
      } else if (opts.prompt) {
        body.imagePrompt = opts.prompt
      }
      if (opts.characterIds?.length) body.characterIds = opts.characterIds
      if (opts.artStyle) body.artStyle = opts.artStyle

      const res = await fetch(`/api/v1/story/books/${bookId}/illustrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        setCoverError(errBody?.error || `Cover generation failed (${res.status})`)
        return
      }
      const { data } = await res.json()
      if (data?.imageUrl) setCoverUrl(data.imageUrl)
    } catch (e) {
      setCoverError(e instanceof Error ? e.message : 'Unknown error')
    } finally { setGeneratingCover(false) }
  }, [bookId])

  // Dialogue helpers
  const addDialogueLine = useCallback(() => {
    updateCurrentPage({
      dialogue: [...(currentPage?.dialogue ?? []), { speaker: '', line: '' }],
    })
  }, [currentPage, updateCurrentPage])

  const updateDialogueLine = useCallback((index: number, field: 'speaker' | 'line', value: string) => {
    const newDialogue = [...(currentPage?.dialogue ?? [])]
    newDialogue[index] = { ...newDialogue[index], [field]: value }
    updateCurrentPage({ dialogue: newDialogue })
  }, [currentPage, updateCurrentPage])

  const removeDialogueLine = useCallback((index: number) => {
    updateCurrentPage({
      dialogue: (currentPage?.dialogue ?? []).filter((_, i) => i !== index),
    })
  }, [currentPage, updateCurrentPage])

  // Drag-to-reorder dialogue
  const handleDragStart = useCallback((i: number) => { dragIdx.current = i }, [])
  const handleDragOver = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === targetIdx) return
    const dialogue = [...(currentPage?.dialogue ?? [])]
    const [moved] = dialogue.splice(dragIdx.current, 1)
    dialogue.splice(targetIdx, 0, moved)
    dragIdx.current = targetIdx
    updateCurrentPage({ dialogue })
  }, [currentPage, updateCurrentPage])
  const handleDragEnd = useCallback(() => { dragIdx.current = null }, [])

  if (!currentPage) return null

  // Full-page views
  if (view === 'illustration-review') {
    return (
      <IllustrationReviewFlow
        bookId={bookId}
        onBack={() => { setView('editor'); refreshMedia() }}
        onNarration={() => { setView('narration'); refreshMedia() }}
      />
    )
  }

  if (view === 'narration') {
    return (
      <NarrationFlow
        bookId={bookId}
        onBack={() => { setView('editor'); refreshMedia() }}
      />
    )
  }

  return (
    <div className="ipv-responsive-text">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-xs text-slate-400">
              {saving ? 'Saving...' : 'Unsaved changes'}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={!dirty || saving}
            className="px-3 py-1.5 text-sm font-medium text-white bg-[#3D6AF2] hover:bg-[#3560d8]
              disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '36px' }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Page strip */}
      <PageStrip
        totalPages={pages.length}
        activePage={activePage}
        onSelectPage={setActivePage}
        onAddPage={addPage}
        showCover
      />

      {/* ── Cover editor (page 0) ─────────────────────── */}
      {activePage === 0 ? (
        <CoverEditor
          title={title}
          coverUrl={coverUrl}
          generating={generatingCover}
          error={coverError}
          artStyle={initialArtStyle}
          onGenerate={generateCover}
        />
      ) : (
      <>
      {/* ── Story fieldset ─────────────────────────────── */}
      <CollapsibleFieldset
        legend="Story"
        borderClass="border-slate-200 dark:border-slate-700"
        legendClass="text-slate-600 dark:text-slate-400"
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-medium text-slate-700 dark:text-slate-300">Scene Description</label>
            <AIHelpMenu
              field="sceneDescription"
              onAction={a => handleAIAction(a, 'sceneDescription', currentPage.sceneDescription)}
              loading={aiLoading}
            />
          </div>
          {!currentPage.sceneDescription && (
            <EmptyHint text="Set the stage — describe what happens in this scene" />
          )}
          <textarea
            value={currentPage.sceneDescription}
            onChange={e => updateCurrentPage({ sceneDescription: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 resize-none
              focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
            placeholder="Describe what happens in this scene..."
          />
        </div>
      </CollapsibleFieldset>

      {/* ── Illustrations fieldset ─────────────────────── */}
      <CollapsibleFieldset
        legend="Illustrations"
        borderClass="border-[#1e2631] dark:border-[#1e2631]/50"
        legendClass="text-[#3D6AF2] dark:text-[#93aaff]"
      >
        <div className="space-y-4">
          <ImagePromptViewer
            value={currentPage.imagePrompt}
            onChange={v => updateCurrentPage({ imagePrompt: v })}
            bookId={bookId}
            aiLoading={aiLoading}
          />

          {/* Illustration generate / refine bar */}
          <GenerateBar
            type="illustration"
            media={currentMedia}
            generating={generatingIll}
            error={illError}
            hasPrompt={!!currentPage.imagePrompt.trim()}
            onGenerate={() => generateIllustration()}
            onRefine={(instruction) => generateIllustration(instruction)}
          />

          {/* Overall progress */}
          {pages.length > 0 && (
            <ProgressCard
              done={illustrationsDone}
              total={pages.length}
              noun="illustrated"
              color="stroke-indigo-500"
              onOpen={() => setView('illustration-review')}
            />
          )}
        </div>
      </CollapsibleFieldset>

      {/* ── Narration fieldset ─────────────────────────── */}
      <CollapsibleFieldset
        legend="Narration"
        borderClass="border-purple-200 dark:border-purple-800/50"
        legendClass="text-purple-600 dark:text-purple-400"
      >
        <div className="space-y-4">
          {/* Narrative text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">Narrative Text</label>
              <AIHelpMenu
                field="narrativeText"
                onAction={a => handleAIAction(a, 'narrativeText', currentPage.narrativeText)}
                loading={aiLoading}
              />
            </div>
            {!currentPage.narrativeText && (
              <EmptyHint text="Write the story text that will be narrated aloud" />
            )}
            <textarea
              value={currentPage.narrativeText}
              onChange={e => updateCurrentPage({ narrativeText: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 resize-y
                focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              placeholder="Write the story text for this page..."
            />
          </div>

          {/* Dialogue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-slate-700 dark:text-slate-300">Dialogue</label>
              <button
                onClick={addDialogueLine}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400
                  font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
              >
                + Add line
              </button>
            </div>
            {(currentPage.dialogue ?? []).length === 0 && (
              <EmptyHint text="Add dialogue lines to bring your characters to life" />
            )}
            <div className="space-y-1">
              {(currentPage.dialogue ?? []).map((d, i) => {
                const isNarrator = d.speaker === 'Narrator'
                const speakerIdx = speakerNames.indexOf(d.speaker)
                const isRight = !isNarrator && speakerIdx % 2 === 1
                const color = speakerColorMap[d.speaker]

                return (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`group flex flex-col ${isNarrator ? 'items-center' : isRight ? 'items-end' : 'items-start'}`}
                  >
                    {/* Speaker name + actions (actions visible on hover) */}
                    <div className={`flex items-center gap-1.5 mb-0.5 ${isRight ? 'flex-row-reverse' : ''}`}>
                      {/* Drag handle — visible on hover */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 select-none" title="Drag to reorder">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="7" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                          <circle cx="9" cy="17" r="1.5" /><circle cx="15" cy="17" r="1.5" />
                        </svg>
                      </span>
                      {/* Color dot */}
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isNarrator ? 'bg-slate-400' : color?.dot ?? 'bg-slate-300'
                      }`} />
                      {/* Speaker select */}
                      <select
                        value={speakerNames.includes(d.speaker) ? d.speaker : '__other__'}
                        onChange={e => {
                          if (e.target.value === '__other__') {
                            updateDialogueLine(i, 'speaker', '')
                          } else {
                            updateDialogueLine(i, 'speaker', e.target.value)
                          }
                        }}
                        className={`bg-transparent border-none font-semibold text-sm cursor-pointer
                          focus:outline-none focus:ring-0 p-0
                          ${isNarrator ? 'text-slate-500 dark:text-slate-400' : color?.name ?? 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {speakerNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="__other__">Other...</option>
                      </select>
                      {!speakerNames.includes(d.speaker) && (
                        <input
                          type="text"
                          value={d.speaker}
                          onChange={e => updateDialogueLine(i, 'speaker', e.target.value)}
                          placeholder="Name"
                          className="bg-transparent border-b border-slate-300 dark:border-slate-600 text-sm font-semibold
                            focus:outline-none focus:border-[#3D6AF2] p-0"
                          style={{ width: `${Math.max(4, (d.speaker.length || 5) + 1)}ch` }}
                        />
                      )}
                      {/* Actions — visible on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <AIHelpMenu
                          field="dialogue"
                          onAction={a => handleAIAction(a, 'dialogue', `${d.speaker}: "${d.line}"`)}
                          loading={aiLoading}
                        />
                        <button
                          onClick={() => removeDialogueLine(i)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Chat bubble */}
                    <div className={`border rounded-2xl px-4 py-3 ${
                      isNarrator
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 italic text-slate-600 dark:text-slate-400'
                        : color
                          ? `${color.bubble} text-slate-800 dark:text-slate-200`
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    } ${isNarrator ? 'rounded-2xl' : isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                      style={{ minWidth: '280px', maxWidth: '85%' }}
                    >
                      <textarea
                        value={d.line}
                        onChange={e => updateDialogueLine(i, 'line', e.target.value)}
                        placeholder={isNarrator ? 'Narration...' : 'What they say...'}
                        rows={2}
                        className="w-full bg-transparent resize-none border-none
                          focus:outline-none focus:ring-0 p-0 placeholder:text-slate-400"
                        onInput={e => {
                          const el = e.target as HTMLTextAreaElement
                          el.style.height = 'auto'
                          el.style.height = el.scrollHeight + 'px'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mood */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">Mood</label>
              <AIHelpMenu
                field="mood"
                onAction={a => handleAIAction(a, 'mood', currentPage.mood)}
                loading={aiLoading}
              />
            </div>
            <input
              type="text"
              value={currentPage.mood}
              onChange={e => updateCurrentPage({ mood: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800
                focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              placeholder="e.g. cheerful, mysterious, tense"
            />
          </div>

          {/* Narration generate / refine bar */}
          <GenerateBar
            type="narration"
            media={currentMedia}
            generating={generatingNar}
            error={narError}
            hasPrompt={!!(currentPage.narrativeText.trim() || (currentPage.dialogue ?? []).length > 0)}
            onGenerate={() => generateNarration()}
            onRefine={(instruction) => generateNarration(instruction)}
          />

          {/* Overall progress */}
          {pages.length > 0 && (
            <ProgressCard
              done={narratedDone}
              total={pages.length}
              noun="narrated"
              color="stroke-purple-500"
              onOpen={() => setView('narration')}
            />
          )}
        </div>
      </CollapsibleFieldset>

      {/* ── Combined page preview (illustration + audio) ────── */}
      <FullPagePreview
        media={currentMedia}
        pageNumber={activePage}
        totalPages={pages.length}
        narrativeText={currentPage.narrativeText}
        dialogue={currentPage.dialogue}
        generatingIll={generatingIll}
        generatingNar={generatingNar}
      />
      </>
      )}
    </div>
  )
}
