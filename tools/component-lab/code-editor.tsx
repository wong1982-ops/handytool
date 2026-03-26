'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { GeneratedCode, Framework } from './types'
import { FRAMEWORKS } from './types'

interface CodeEditorProps {
  code: GeneratedCode
  activeFramework: Framework
  onFrameworkChange: (fw: Framework) => void
  onCodeChange: (framework: Framework, code: string) => void
  onCopy: () => void
  onReset: () => void
}

// --- Dark theme definition (defined outside component, no DOM needed) ---

const DARK_THEME_SPEC = {
  '&': {
    height: '100%',
    fontSize: '13px',
    background: '#131a23',
  },
  '.cm-content': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    padding: '12px 0',
    caretColor: '#e6edf3',
    color: '#e6edf3',
  },
  '.cm-line': { padding: '0 16px' },
  '.cm-gutters': {
    background: '#0d1117',
    borderRight: '1px solid #1e2631',
    color: '#4b5563',
  },
  '.cm-activeLineGutter': {
    background: '#131a23',
    color: '#70767f',
  },
  '.cm-activeLine': { background: '#1a2333' },
  '.cm-cursor': { borderLeftColor: '#3D6AF2' },
  '.cm-selectionBackground': { background: '#1e3a5f !important' },
  '&.cm-focused .cm-selectionBackground': { background: '#1e3a5f !important' },
  '.cm-matchingBracket': {
    background: '#1e3a5f',
    outline: '1px solid #3D6AF2',
  },
  '.cm-tooltip': {
    background: '#1e2631',
    color: '#e6edf3',
    border: '1px solid #2d3748',
    borderRadius: '6px',
    fontSize: '12px',
    padding: '4px 8px',
  },
}

const HIGHLIGHT_SPEC = [
  { color: '#79c0ff' },   // keyword
  { color: '#ff7b72' },   // name
  { color: '#ffa657' },   // definition name
  { color: '#79c0ff' },   // type name
  { color: '#cae8ff' },   // class name
  { color: '#d2a8ff' },   // property name
  { color: '#ff7b72' },   // special property name
  { color: '#a5d6ff' },   // string
  { color: '#a5d6ff' },   // special string
  { color: '#6e7681' },   // comment
  { color: '#79c0ff' },   // number
  { color: '#56d364' },   // bool
  { color: '#6e7681' },   // null
  { color: '#70767f' },   // punctuation
  { color: '#ffa657' },   // link
  { color: '#79c0ff' },   // heading
  { color: '#79c0ff' },   // emphasis
  { color: '#79c0ff' },   // strong
  { color: '#a5d6ff' },   // atom
  { color: '#e6edf3' },   // meta
  { color: '#e6edf3' },   // tag name
  { color: '#79c0ff' },   // attribute name
  { color: '#a5d6ff' },   // attribute value
  { color: '#ff7b72' },   // operator
  { color: '#79c0ff' },   // bracket
]

export default function CodeEditor({
  code,
  activeFramework,
  onFrameworkChange,
  onCodeChange,
  onCopy,
  onReset,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<import('@codemirror/view').EditorView | null>(null)
  const langCompartmentRef = useRef<import('@codemirror/state').Compartment | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeFrameworkRef = useRef(activeFramework)
  const onCodeChangeRef = useRef(onCodeChange)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [editorReady, setEditorReady] = useState(false)

  // Keep refs in sync
  activeFrameworkRef.current = activeFramework
  onCodeChangeRef.current = onCodeChange

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Build language extension
  const buildLangExt = useCallback(
    async (fw: Framework) => {
      if (fw === 'react') {
        const { javascript } = await import('@codemirror/lang-javascript')
        return javascript({ jsx: true, typescript: false })
      } else {
        const { html } = await import('@codemirror/lang-html')
        return html()
      }
    },
    [],
  )

  // Create the editor on mount (desktop only)
  useEffect(() => {
    if (isMobile) return
    if (!containerRef.current) return

    let destroyed = false

    ;(async () => {
      const { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } =
        await import('@codemirror/view')
      const { EditorState, Compartment } = await import('@codemirror/state')
      const { defaultKeymap, history, historyKeymap } = await import('@codemirror/commands')
      const { syntaxHighlighting, HighlightStyle } = await import('@codemirror/language')
      const { tags } = await import('@lezer/highlight')

      if (destroyed || !containerRef.current) return

      const langCompartment = new Compartment()
      langCompartmentRef.current = langCompartment

      const langExt = await buildLangExt(activeFrameworkRef.current)

      // Build highlight style from our spec
      const highlightStyle = HighlightStyle.define([
        { tag: tags.keyword, color: '#79c0ff' },
        { tag: tags.name, color: '#ff7b72' },
        { tag: tags.definition(tags.name), color: '#ffa657' },
        { tag: tags.typeName, color: '#79c0ff' },
        { tag: tags.className, color: '#cae8ff' },
        { tag: tags.propertyName, color: '#d2a8ff' },
        { tag: tags.special(tags.propertyName), color: '#ff7b72' },
        { tag: tags.string, color: '#a5d6ff' },
        { tag: tags.special(tags.string), color: '#a5d6ff' },
        { tag: tags.comment, color: '#6e7681', fontStyle: 'italic' },
        { tag: tags.number, color: '#79c0ff' },
        { tag: tags.bool, color: '#56d364' },
        { tag: tags.null, color: '#6e7681' },
        { tag: tags.punctuation, color: '#70767f' },
        { tag: tags.link, color: '#ffa657' },
        { tag: tags.heading, color: '#79c0ff' },
        { tag: tags.emphasis, color: '#79c0ff', fontStyle: 'italic' },
        { tag: tags.strong, color: '#79c0ff', fontWeight: 'bold' },
        { tag: tags.atom, color: '#a5d6ff' },
        { tag: tags.meta, color: '#e6edf3' },
        { tag: tags.tagName, color: '#7ee787' },
        { tag: tags.attributeName, color: '#79c0ff' },
        { tag: tags.attributeValue, color: '#a5d6ff' },
        { tag: tags.operator, color: '#ff7b72' },
        { tag: tags.bracket, color: '#79c0ff' },
        { tag: tags.angleBracket, color: '#8b949e' },
        { tag: tags.regexp, color: '#a5d6ff' },
        { tag: tags.variableName, color: '#ffa657' },
        { tag: tags.definition(tags.variableName), color: '#ffa657' },
        { tag: tags.function(tags.variableName), color: '#d2a8ff' },
        { tag: tags.function(tags.propertyName), color: '#d2a8ff' },
        { tag: tags.self, color: '#ff7b72' },
        { tag: tags.namespace, color: '#ffa657' },
      ])

      const darkTheme = EditorView.theme(DARK_THEME_SPEC, { dark: true })

      const state = EditorState.create({
        doc: code[activeFrameworkRef.current],
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          langCompartment.of(langExt),
          darkTheme,
          syntaxHighlighting(highlightStyle),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) return
            const newCode = update.state.doc.toString()
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
              onCodeChangeRef.current(activeFrameworkRef.current, newCode)
            }, 300)
          }),
        ],
      })

      if (destroyed || !containerRef.current) return

      const view = new EditorView({ state, parent: containerRef.current })
      viewRef.current = view
      setEditorReady(true)
    })()

    return () => {
      destroyed = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      viewRef.current?.destroy()
      viewRef.current = null
      langCompartmentRef.current = null
      setEditorReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  // Sync content when activeFramework changes
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const newContent = code[activeFramework]
    const current = view.state.doc.toString()
    if (current !== newContent) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: newContent },
      })
    }
  }, [activeFramework, code])

  // Also sync if code prop changes externally (e.g. after AI regeneration)
  // We track the previous value to avoid infinite loops
  const prevCodeRef = useRef(code)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const newContent = code[activeFramework]
    const prevContent = prevCodeRef.current[activeFramework]
    if (prevContent !== newContent) {
      const current = view.state.doc.toString()
      if (current !== newContent) {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: newContent },
        })
      }
    }
    prevCodeRef.current = code
  }, [code, activeFramework])

  // Swap language extension when framework changes
  useEffect(() => {
    const view = viewRef.current
    const langCompartment = langCompartmentRef.current
    if (!view || !langCompartment) return

    ;(async () => {
      const langExt = await buildLangExt(activeFramework)
      view.dispatch({
        effects: langCompartment.reconfigure(langExt),
      })
    })()
  }, [activeFramework, buildLangExt])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code[activeFramework])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy()
    } catch {
      // fallback: parent handler still called
      onCopy()
    }
  }, [code, activeFramework, onCopy])

  const currentCode = code[activeFramework]

  return (
    <div className="flex flex-col h-full bg-[#131a23] overflow-hidden">
      {/* Framework tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1e2631] shrink-0">
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            type="button"
            onClick={() => onFrameworkChange(fw.id)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              'min-h-[32px]',
              activeFramework === fw.id
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] text-[#70767f] hover:text-[#a6abb5] hover:bg-[#1a2333]',
            ].join(' ')}
            aria-pressed={activeFramework === fw.id}
          >
            {fw.label}
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          title="Reset to AI-generated code"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#70767f] hover:text-[#a6abb5] hover:bg-[#1a2333] transition-colors cursor-pointer min-h-[44px]"
          aria-label="Reset code to AI-generated version"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy code'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer min-h-[44px] bg-[#1a2333] text-[#a6abb5] hover:bg-[#1e2d3d] hover:text-[#e6edf3]"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Editor area */}
      {isMobile ? (
        /* Mobile: pre/code block */
        <div className="flex-1 overflow-auto relative">
          <pre className="p-4 text-xs text-[#e6edf3] font-mono leading-relaxed whitespace-pre-wrap break-all min-h-full">
            <code>{currentCode || '// No code generated yet'}</code>
          </pre>
        </div>
      ) : (
        /* Desktop: CodeMirror */
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto [&_.cm-editor]:outline-none"
          aria-label={`${activeFramework} code editor`}
          role="region"
        />
      )}
    </div>
  )
}
