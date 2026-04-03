'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type DrawerSection = 'ai' | 'upload' | 'text' | 'swatch' | 'links'

interface SideDrawerProps {
  open: boolean
  activeSection: DrawerSection | null
  onToggle: (section: DrawerSection | null) => void
  onClose: () => void
  // Actions
  onAddMore: (prompt: string) => Promise<void>
  addingMore: boolean
  onUploadImage: (file: File) => void
  onAddTextNote: () => void
  onAddSwatch: (color: string) => void
  paletteColors: string[] // for cross-tool link to color palette
  elementCount: number
  maxElements: number
}

// --- Icon components ---

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// --- Section labels ---

const SECTION_LABELS: Record<DrawerSection, string> = {
  ai: 'AI Add More',
  upload: 'Upload Image',
  text: 'Add Text Note',
  swatch: 'Add Color',
  links: 'Open in Other Tools',
}

const SECTIONS: { id: DrawerSection; label: string; Icon: React.FC }[] = [
  { id: 'ai', label: 'AI Add More', Icon: SparkleIcon },
  { id: 'upload', label: 'Upload Image', Icon: ImageIcon },
  { id: 'text', label: 'Add Text', Icon: TextIcon },
  { id: 'swatch', label: 'Add Swatch', Icon: PaletteIcon },
  { id: 'links', label: 'Cross-tools', Icon: LinkIcon },
]

// --- Section Content ---

function AISection({
  onAddMore,
  addingMore,
  elementCount,
  maxElements,
}: {
  onAddMore: (prompt: string) => Promise<void>
  addingMore: boolean
  elementCount: number
  maxElements: number
}) {
  const [prompt, setPrompt] = useState('')

  const handleAdd = async () => {
    if (!prompt.trim() || addingMore) return
    await onAddMore(prompt.trim())
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-white">Add More Elements</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What should I add? e.g. 'More summer photos'"
        rows={3}
        className="w-full rounded-[10px] bg-[#131a23] border border-[#1e2631] text-white placeholder-[#70767f] text-[13px] px-3 py-3 resize-none outline-none focus:border-[#3D6AF2] transition-colors"
        aria-label="Prompt for AI to add elements"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#70767f]">{elementCount}/{maxElements} elements</span>
        <span className="text-xs text-[#7C3AED]">1 credit</span>
      </div>
      <button
        onClick={handleAdd}
        disabled={addingMore || !prompt.trim()}
        className="min-h-[44px] w-full rounded-[10px] bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        aria-label="Add elements using AI"
      >
        {addingMore ? (
          <>
            <LoadingSpinner />
            Adding…
          </>
        ) : (
          'Add'
        )}
      </button>
    </div>
  )
}

function UploadSection({ onUploadImage }: { onUploadImage: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUploadImage(file)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onUploadImage(file)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-white">Upload Image</h3>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-[10px] p-8 text-center transition-colors cursor-pointer flex flex-col items-center gap-2.5 w-full ${
          dragging ? 'border-[#3D6AF2] bg-[#3D6AF2]/5' : 'border-[#1e2631] hover:border-[#3D6AF2]'
        }`}
        aria-label="Upload image: click to browse or drag and drop"
      >
        <span className="text-[#70767f]">
          <UploadIcon />
        </span>
        <span className="text-sm text-[#a6abb5]">Click to browse</span>
        <span className="text-xs text-[#70767f]">or drag &amp; drop an image</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}

function TextSection({ onAddTextNote }: { onAddTextNote: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-white">Add Text Note</h3>
      <p className="text-sm text-[#a6abb5]">Add a sticky note to your board</p>
      <button
        onClick={onAddTextNote}
        className="min-h-[44px] w-full rounded-[10px] bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-[13px] font-medium hover:bg-[#1e2631] hover:text-white transition-colors"
        aria-label="Add a text note to the board"
      >
        Add Note
      </button>
    </div>
  )
}

function SwatchSection({ onAddSwatch }: { onAddSwatch: (color: string) => void }) {
  const [color, setColor] = useState('#3D6AF2')

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-white">Add Color</h3>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-11 h-11 rounded-[10px] border border-[#1e2631] cursor-pointer bg-transparent p-0.5"
          aria-label="Pick a color"
        />
        <span className="text-[13px] text-[#a6abb5] font-mono">{color.toUpperCase()}</span>
      </div>
      <button
        onClick={() => onAddSwatch(color)}
        className="min-h-[44px] w-full rounded-[10px] bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-[13px] font-medium hover:bg-[#1e2631] hover:text-white transition-colors"
        aria-label={`Add color swatch ${color} to the board`}
      >
        Add to Board
      </button>
    </div>
  )
}

function LinksSection({ paletteColors }: { paletteColors: string[] }) {
  const colorHash = paletteColors.length > 0 ? `#${paletteColors.join('-')}` : ''

  const links = [
    {
      label: 'Color Palette',
      href: paletteColors.length > 0 ? `/tools/color-palette${colorHash}` : '/tools/color-palette',
      description: 'Open your palette in the color tool',
    },
    {
      label: 'Font Generator',
      href: '/tools/font-generator',
      description: 'Explore fonts for your design',
    },
    {
      label: 'Logo Generator',
      href: '/tools/logo-generator',
      description: 'Create a logo from your mood',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-white">Open in Other Tools</h3>
      <ul className="flex flex-col gap-2" role="list">
        {links.map(({ label, href, description }) => (
          <li key={label}>
            <Link
              href={href}
              className="rounded-[10px] bg-[#131a23] border border-[#1e2631] px-3.5 py-3 hover:bg-[#1e2631] cursor-pointer block transition-colors group"
            >
              <span className="text-[13px] font-medium text-white group-hover:text-[#3D9DF2] transition-colors">{label}</span>
              <span className="block text-[11px] text-[#70767f] mt-0.5">{description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- Main Component ---

export function SideDrawer({
  open,
  activeSection,
  onToggle,
  onClose,
  onAddMore,
  addingMore,
  onUploadImage,
  onAddTextNote,
  onAddSwatch,
  paletteColors,
  elementCount,
  maxElements,
}: SideDrawerProps) {
  const sectionTitle = activeSection ? SECTION_LABELS[activeSection] : ''

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'ai':
        return (
          <AISection
            onAddMore={onAddMore}
            addingMore={addingMore}
            elementCount={elementCount}
            maxElements={maxElements}
          />
        )
      case 'upload':
        return <UploadSection onUploadImage={onUploadImage} />
      case 'text':
        return <TextSection onAddTextNote={onAddTextNote} />
      case 'swatch':
        return <SwatchSection onAddSwatch={onAddSwatch} />
      case 'links':
        return <LinksSection paletteColors={paletteColors} />
      default:
        return null
    }
  }

  return (
    <>
      {/* ---- Collapsed icon strip (desktop only, hidden when open) ---- */}
      {!open && (
        <div
          className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 flex-col bg-[#131a23] border border-[#1e2631] border-r-0 rounded-l-xl overflow-hidden"
          role="toolbar"
          aria-label="Board tools"
        >
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className="w-12 min-h-[44px] flex items-center justify-center text-[#70767f] hover:bg-[#1e2631] hover:text-white transition-colors group relative bg-transparent border-none cursor-pointer"
              aria-label={label}
              title={label}
            >
              <Icon />
              {/* Tooltip */}
              <span className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#131a23] border border-[#1e2631] px-2.5 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                {label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---- Backdrop ---- */}
      {open && (
        <div
          className="fixed inset-0 z-[35] bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ---- Desktop expanded panel ---- */}
      {open && (
        <aside
          className={`hidden md:flex fixed right-0 top-0 bottom-0 z-40 w-72 flex-col bg-[#0d1117] border-l border-[#1e2631] shadow-2xl transition-transform duration-200`}
          aria-label={sectionTitle}
          role="complementary"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2631] shrink-0">
            {/* Section tabs */}
            <div className="flex items-center gap-1">
              {SECTIONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => onToggle(id)}
                  className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                    activeSection === id
                      ? 'bg-[#3D6AF2]/20 text-[#3D9DF2]'
                      : 'text-[#a6abb5] hover:bg-[#1e2631] hover:text-white'
                  }`}
                  aria-label={SECTION_LABELS[id]}
                  title={SECTION_LABELS[id]}
                  aria-pressed={activeSection === id}
                >
                  <Icon />
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#a6abb5] hover:bg-[#1e2631] hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Close tools panel"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Section title */}
          {sectionTitle && (
            <div className="px-4 pt-3 pb-1 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#70767f]">{sectionTitle}</p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {renderSectionContent()}
          </div>
        </aside>
      )}

      {/* ---- Mobile: bottom sheet (visible only on small screens when open) ---- */}
      {open && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#0d1117] rounded-t-2xl max-h-[60vh] overflow-y-auto border-t border-[#1e2631] shadow-2xl"
          role="complementary"
          aria-label={sectionTitle}
        >
          {/* Drag handle */}
          <div className="pt-3 pb-0">
            <div className="w-10 h-1 rounded-full bg-[#1e2631] mx-auto" aria-hidden="true" />
          </div>

          {/* Section tabs */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#1e2631]">
            <div className="flex items-center gap-1">
              {SECTIONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => onToggle(id)}
                  className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    activeSection === id
                      ? 'bg-[#3D6AF2]/20 text-[#3D9DF2]'
                      : 'text-[#a6abb5] hover:bg-[#1e2631] hover:text-white'
                  }`}
                  aria-label={SECTION_LABELS[id]}
                  title={SECTION_LABELS[id]}
                  aria-pressed={activeSection === id}
                >
                  <Icon />
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#a6abb5] hover:bg-[#1e2631] hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close tools panel"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Section title */}
          {sectionTitle && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#70767f]">{sectionTitle}</p>
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-3 pb-6">
            {renderSectionContent()}
          </div>
        </div>
      )}
    </>
  )
}
