'use client'

import { useState, useMemo, useCallback } from 'react'
import { AIHelpMenu, type AIAction } from '@/tools/story-studio/stories/ai-help-menu'

interface ParsedChar {
  name: string
  type: string
  attrs: { label: string; value: string }[]
}

interface ParsedPrompt {
  style: string
  characters: ParsedChar[]
  scene: string
}

const ATTR_LABELS = ['Hair', 'Eyes', 'Skin', 'Build', 'Outfit', 'Accessories', 'Distinguishing features', 'Fur', 'Feathers', 'Scales']

function parseImagePrompt(raw: string): ParsedPrompt {
  if (!raw.trim()) return { style: '', characters: [], scene: '' }

  let remaining = raw.trim()

  // Extract style prefix (e.g., "anime style, ")
  let style = ''
  const styleMatch = remaining.match(/^([a-zA-Z\s]+style),\s*/)
  if (styleMatch) {
    style = styleMatch[1].trim()
    remaining = remaining.slice(styleMatch[0].length)
  }

  const characters: ParsedChar[] = []

  // Find character blocks by looking for "Name: type." patterns followed by attribute keywords
  const charPattern = /([A-Z][A-Za-z\s'']+?):\s*([a-zA-Z\s]+?)\.\s*/g
  const charStarts: { index: number; name: string; type: string; matchLen: number }[] = []

  // Lowercase attribute labels for comparison
  const attrLabelsLower = ATTR_LABELS.map(l => l.toLowerCase())

  let match: RegExpExecArray | null
  while ((match = charPattern.exec(remaining)) !== null) {
    const name = match[1].trim()
    // Skip if the "name" is actually an attribute label (e.g. "Skin", "Eyes", "Accessories")
    if (attrLabelsLower.includes(name.toLowerCase())) continue

    const after = remaining.slice(match.index + match[0].length, match.index + match[0].length + 200)
    const hasAttrs = ATTR_LABELS.some(l => after.startsWith(l + ':') || after.includes('. ' + l + ':'))
    if (hasAttrs) {
      charStarts.push({ index: match.index, name, type: match[2].trim(), matchLen: match[0].length })
    }
  }

  let scene = remaining
  if (charStarts.length > 0) {
    for (let i = 0; i < charStarts.length; i++) {
      const start = charStarts[i].index + charStarts[i].matchLen
      const end = i + 1 < charStarts.length ? charStarts[i + 1].index : remaining.length
      const block = remaining.slice(start, end).trim()

      const attrs: { label: string; value: string }[] = []
      const attrPattern = new RegExp(`(${ATTR_LABELS.join('|')}):\\s*`, 'gi')
      const parts: { label: string; startIdx: number }[] = []
      let attrMatch: RegExpExecArray | null
      while ((attrMatch = attrPattern.exec(block)) !== null) {
        parts.push({ label: attrMatch[1], startIdx: attrMatch.index + attrMatch[0].length })
      }

      for (let j = 0; j < parts.length; j++) {
        const valueEnd = j + 1 < parts.length ? parts[j + 1].startIdx - parts[j + 1].label.length - 2 : block.length
        let value = block.slice(parts[j].startIdx, valueEnd).trim()
        value = value.replace(/\.\s*(anatomically correct|species-accurate).*$/i, '').replace(/\.$/, '').trim()
        if (value) {
          attrs.push({ label: parts[j].label, value })
        }
      }

      characters.push({ name: charStarts[i].name, type: charStarts[i].type, attrs })
    }

    // Scene is everything after the last character block
    const lastChar = charStarts[charStarts.length - 1]
    const lastCharEnd = lastChar.index + lastChar.matchLen
    const lastBlock = remaining.slice(lastCharEnd)
    const boilerplateEnd = lastBlock.search(/(anatomically correct|species-accurate)[^.]*\.\s*/i)
    if (boilerplateEnd !== -1) {
      const afterBoilerplate = lastBlock.slice(boilerplateEnd).replace(/^(anatomically correct|species-accurate)[^.]*\.\s*/i, '')
      scene = afterBoilerplate.trim()
    } else {
      const lastAttrLabel = ATTR_LABELS.map(l => lastBlock.lastIndexOf(l + ':')).filter(i => i !== -1)
      if (lastAttrLabel.length > 0) {
        const maxIdx = Math.max(...lastAttrLabel)
        const afterAttrs = lastBlock.slice(maxIdx)
        const periodAfterValue = afterAttrs.indexOf('. ', afterAttrs.indexOf(':'))
        if (periodAfterValue !== -1) {
          scene = afterAttrs.slice(periodAfterValue + 2).trim()
        } else {
          scene = ''
        }
      } else {
        scene = ''
      }
    }
  }

  return { style, characters, scene }
}

/** Reconstruct the raw prompt string from parsed structure */
function serializePrompt(parsed: ParsedPrompt): string {
  const parts: string[] = []

  if (parsed.style) {
    parts.push(parsed.style + ', ')
  }

  for (const char of parsed.characters) {
    let block = `${char.name}: ${char.type}. `
    const attrParts = char.attrs
      .filter(a => a.value.trim())
      .map(a => `${a.label}: ${a.value.trim()}`)
    block += attrParts.join('. ')
    if (attrParts.length > 0) block += '.'
    parts.push(block)
  }

  if (parsed.scene) {
    parts.push(parsed.scene)
  }

  return parts.join(' ').trim()
}

interface ImagePromptViewerProps {
  value: string
  onChange: (value: string) => void
  bookId?: string
  aiLoading?: boolean
}

export function ImagePromptViewer({ value, onChange, bookId, aiLoading }: ImagePromptViewerProps) {
  const [rawMode, setRawMode] = useState(false)
  const [localAiLoading, setLocalAiLoading] = useState(false)
  const parsed = useMemo(() => parseImagePrompt(value), [value])
  const hasStructure = parsed.characters.length > 0
  const isLoading = aiLoading || localAiLoading

  const update = useCallback((mutate: (draft: ParsedPrompt) => void) => {
    const draft: ParsedPrompt = JSON.parse(JSON.stringify(parsed))
    mutate(draft)
    onChange(serializePrompt(draft))
  }, [parsed, onChange])

  /** AI help for individual fields within the structured view */
  const handleFieldAI = useCallback(async (
    action: AIAction,
    text: string,
    applyResult: (resultText: string) => void
  ) => {
    if (!bookId || !text.trim()) return
    setLocalAiLoading(true)
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/ai-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text, field: 'imagePromptAttr' }),
      })
      if (!res.ok) throw new Error('AI action failed')
      const { data } = await res.json()
      if (data.text) applyResult(data.text)
    } catch { /* silent */ }
    finally { setLocalAiLoading(false) }
  }, [bookId])

  // Raw textarea mode (or fallback when no structure detected)
  if (rawMode || !hasStructure) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Image Prompt</label>
          {hasStructure && (
            <button
              onClick={() => setRawMode(false)}
              className="text-xs text-[#3D6AF2] hover:text-[#3D6AF2] cursor-pointer"
            >
              Structured view
            </button>
          )}
        </div>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-sm resize-y
            focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
          placeholder="Auto-generated from scene (editable)"
        />
      </div>
    )
  }

  // Editable structured view
  return (
    <div className="ipv-responsive-text">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Image Prompt</label>
        <button
          onClick={() => setRawMode(true)}
          className="text-xs text-[#3D6AF2] hover:text-[#3D6AF2] cursor-pointer"
        >
          Edit raw
        </button>
      </div>
      <div className="space-y-2">
        {/* Style */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Style</span>
            <input
              type="text"
              value={parsed.style}
              onChange={e => update(d => { d.style = e.target.value })}
              className="flex-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700
                bg-transparent text-[#3D6AF2] dark:text-[#93aaff] font-semibold
                focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]"
              placeholder="e.g. anime style"
            />
            {bookId && (
              <AIHelpMenu
                field="imagePromptAttr"
                onAction={a => handleFieldAI(a, parsed.style, text => update(d => { d.style = text }))}
                loading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Characters — one card each */}
        {parsed.characters.map((char, i) => (
          <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2">
            <div className="space-y-1.5 mb-1.5">
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-300 shrink-0">Name:</span>
                <input
                  type="text"
                  value={char.name}
                  onChange={e => update(d => { d.characters[i].name = e.target.value })}
                  className="flex-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700
                    bg-transparent font-semibold text-slate-800 dark:text-slate-200
                    focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]"
                  placeholder="Name"
                />
                {bookId && (
                  <AIHelpMenu
                    field="imagePromptAttr"
                    onAction={a => handleFieldAI(a, char.name, text => update(d => { d.characters[i].name = text }))}
                    loading={isLoading}
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-300 shrink-0">Type:</span>
                <input
                  type="text"
                  value={char.type}
                  onChange={e => update(d => { d.characters[i].type = e.target.value })}
                  className="flex-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700
                    bg-transparent text-slate-400 dark:text-slate-500
                    focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]"
                  placeholder="e.g. human girl"
                />
                {bookId && (
                  <AIHelpMenu
                    field="imagePromptAttr"
                    onAction={a => handleFieldAI(a, char.type, text => update(d => { d.characters[i].type = text }))}
                    loading={isLoading}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {char.attrs.map((attr, j) => (
                <div key={j} className="flex items-start gap-1">
                  <span
                    className="font-medium text-slate-600 dark:text-slate-300 shrink-0 mt-1"
                  >
                    {attr.label}:
                  </span>
                  <textarea
                    value={attr.value}
                    onChange={e => update(d => { d.characters[i].attrs[j].value = e.target.value })}
                    rows={['Outfit', 'Accessories', 'Distinguishing features'].includes(attr.label) ? 3 : 1}
                    className="flex-1 min-w-0 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700
                      bg-transparent text-slate-500 dark:text-slate-400 resize-y
                      focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]"
                  />
                  {bookId && (
                    <AIHelpMenu
                      field="imagePromptAttr"
                      onAction={a => handleFieldAI(a, attr.value, text => update(d => { d.characters[i].attrs[j].value = text }))}
                      loading={isLoading}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Scene card */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Scene</p>
            {bookId && (
              <AIHelpMenu
                field="imagePromptAttr"
                onAction={a => handleFieldAI(a, parsed.scene, text => update(d => { d.scene = text }))}
                loading={isLoading}
              />
            )}
          </div>
          <textarea
            value={parsed.scene}
            onChange={e => update(d => { d.scene = e.target.value })}
            rows={3}
            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700
              bg-transparent text-slate-600 dark:text-slate-400 resize-y
              focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]"
            placeholder="Scene description..."
          />
        </div>
      </div>
    </div>
  )
}
