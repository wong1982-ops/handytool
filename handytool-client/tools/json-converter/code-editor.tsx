'use client'

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers, highlightActiveLine, highlightActiveLineGutter, showPanel } from '@codemirror/view'
import { EditorState, Compartment, StateField, StateEffect } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle, foldGutter, bracketMatching, indentOnInput } from '@codemirror/language'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { linter, lintGutter } from '@codemirror/lint'
import { tags } from '@lezer/highlight'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'

// --- Themes ---

const lightHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: '#7c3aed' },       // purple keys
  { tag: tags.string, color: '#059669' },              // green strings
  { tag: tags.number, color: '#2563eb' },              // blue numbers
  { tag: tags.bool, color: '#d97706' },                // orange booleans
  { tag: tags.null, color: '#dc2626' },                // red null
  { tag: tags.keyword, color: '#d97706' },             // orange keywords (YAML)
  { tag: tags.punctuation, color: '#64748b' },         // gray brackets
  { tag: tags.brace, color: '#64748b' },
  { tag: tags.squareBracket, color: '#64748b' },
  { tag: tags.separator, color: '#64748b' },
])

const darkHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: '#a78bfa' },       // purple keys
  { tag: tags.string, color: '#34d399' },              // green strings
  { tag: tags.number, color: '#60a5fa' },              // blue numbers
  { tag: tags.bool, color: '#fbbf24' },                // orange booleans
  { tag: tags.null, color: '#f87171' },                // red null
  { tag: tags.keyword, color: '#fbbf24' },             // orange keywords (YAML)
  { tag: tags.punctuation, color: '#94a3b8' },         // gray brackets
  { tag: tags.brace, color: '#94a3b8' },
  { tag: tags.squareBracket, color: '#94a3b8' },
  { tag: tags.separator, color: '#94a3b8' },
])

const lightTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px' },
  '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', padding: '16px 0' },
  '.cm-line': { padding: '0 16px' },
  '.cm-gutters': { background: '#f8fafc', borderRight: '1px solid #e2e8f0', color: '#cbd5e1' },
  '.cm-activeLineGutter': { background: '#f1f5f9', color: '#94a3b8' },
  '.cm-activeLine': { background: '#f8fafc' },
  '.cm-cursor': { borderLeftColor: '#3b82f6' },
  '.cm-selectionBackground': { background: '#dbeafe !important' },
  '&.cm-focused .cm-selectionBackground': { background: '#bfdbfe !important' },
  '.cm-foldGutter span': { color: '#94a3b8', fontSize: '12px' },
  '.cm-matchingBracket': { background: '#dbeafe', outline: '1px solid #93c5fd' },
  '.cm-lint-marker-error': { content: 'none' },
  '.cm-diagnostic-error': { borderLeft: '3px solid #ef4444' },
  '.cm-tooltip': { background: '#1e293b', color: '#f8fafc', border: 'none', borderRadius: '8px', fontSize: '12px', padding: '4px 8px' },
  '.cm-tooltip-lint': { background: '#1e293b', color: '#f8fafc' },
  '.cm-panels': { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  '.cm-panel input': { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 6px', fontSize: '13px', color: '#1e293b' },
  '.cm-panel button': { background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', cursor: 'pointer', color: '#1e293b' },
  '.cm-panel label': { fontSize: '13px', color: '#475569' },
}, { dark: false })

const darkTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px' },
  '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', padding: '16px 0' },
  '.cm-line': { padding: '0 16px' },
  '.cm-gutters': { background: '#0f172a', borderRight: '1px solid #1e293b', color: '#334155' },
  '.cm-activeLineGutter': { background: '#1e293b', color: '#64748b' },
  '.cm-activeLine': { background: '#1e293b50' },
  '.cm-cursor': { borderLeftColor: '#38bdf8' },
  '.cm-selectionBackground': { background: '#1e3a5f !important' },
  '&.cm-focused .cm-selectionBackground': { background: '#1e3a5f !important' },
  '.cm-foldGutter span': { color: '#475569', fontSize: '12px' },
  '.cm-matchingBracket': { background: '#1e3a5f', outline: '1px solid #3b82f6' },
  '.cm-diagnostic-error': { borderLeft: '3px solid #ef4444' },
  '.cm-tooltip': { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', padding: '4px 8px' },
  '.cm-tooltip-lint': { background: '#1e293b', color: '#f8fafc' },
  '.cm-panels': { background: '#0f172a', borderBottom: '1px solid #1e293b' },
  '.cm-panel input': { background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', padding: '2px 6px', fontSize: '13px', color: '#f8fafc' },
  '.cm-panel button': { background: '#334155', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', cursor: 'pointer', color: '#f8fafc' },
  '.cm-panel label': { fontSize: '13px', color: '#94a3b8' },
}, { dark: true })

// --- GoToLine (singleton + click-outside-to-dismiss) ---

const toggleGotoLine = StateEffect.define<boolean>()
let activeGotoLineView: EditorView | null = null

const gotoLineState = StateField.define<boolean>({
  create() { return false },
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(toggleGotoLine)) value = e.value
    }
    return value
  },
  provide: (f) => showPanel.from(f, (on) => on ? createGotoLinePanel : null),
})

function createGotoLinePanel(view: EditorView) {
  const dom = document.createElement('div')
  dom.className = 'cm-gotoLine'
  dom.style.display = 'flex'
  dom.style.alignItems = 'center'
  dom.style.gap = '8px'
  dom.style.padding = '4px 8px'

  const label = document.createElement('label')
  label.textContent = 'Go to line:'
  label.style.whiteSpace = 'nowrap'
  dom.appendChild(label)

  const input = document.createElement('input')
  input.type = 'text'
  input.setAttribute('aria-label', 'Go to line')
  input.style.width = '80px'
  input.placeholder = `1–${view.state.doc.lines}`
  dom.appendChild(input)

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = 'Go'
  dom.appendChild(btn)

  const close = () => {
    if (activeGotoLineView === view) activeGotoLineView = null
    view.dispatch({ effects: toggleGotoLine.of(false) })
    view.focus()
  }

  const go = () => {
    const line = parseInt(input.value, 10)
    if (!isNaN(line) && line >= 1) {
      const clamped = Math.min(line, view.state.doc.lines)
      const info = view.state.doc.line(clamped)
      view.dispatch({
        selection: { anchor: info.from },
        effects: [
          EditorView.scrollIntoView(info.from, { y: 'center' }),
          toggleGotoLine.of(false),
        ],
      })
      if (activeGotoLineView === view) activeGotoLineView = null
      view.focus()
    }
  }

  btn.addEventListener('click', go)

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      go()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  })

  // Click-outside to dismiss
  let destroyed = false
  let mouseHandler: ((e: MouseEvent) => void) | null = null

  requestAnimationFrame(() => {
    if (destroyed) return
    mouseHandler = (e: MouseEvent) => {
      if (!dom.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', mouseHandler)
    input.focus()
  })

  return {
    dom,
    top: true,
    destroy() {
      destroyed = true
      if (mouseHandler) {
        document.removeEventListener('mousedown', mouseHandler)
        mouseHandler = null
      }
    },
  }
}

function openGotoLine(view: EditorView): boolean {
  const isOpen = view.state.field(gotoLineState, false)
  if (isOpen) {
    // Already open — refocus
    const input = view.dom.querySelector('.cm-gotoLine input') as HTMLInputElement | null
    input?.focus()
    input?.select()
    return true
  }
  // Close in other editors (singleton across instances)
  if (activeGotoLineView && activeGotoLineView !== view) {
    try {
      if (activeGotoLineView.state.field(gotoLineState, false)) {
        activeGotoLineView.dispatch({ effects: toggleGotoLine.of(false) })
      }
    } catch { /* view might be destroyed */ }
  }
  activeGotoLineView = view
  view.dispatch({ effects: toggleGotoLine.of(true) })
  return true
}

// --- Component ---

export interface CodeEditorHandle {
  goToLine: (line: number) => void
  openGoToLine: () => void
  scrollToPercent: (percent: number) => void
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  language?: 'json' | 'yaml' | 'csv'
  onLintError?: (message: string | null) => void
  onScrollPercent?: (percent: number) => void
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor({ value, onChange, readOnly = false, placeholder, language = 'json', onLintError, onScrollPercent }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const langCompartment = useRef(new Compartment())
  const readOnlyCompartment = useRef(new Compartment())
  const themeCompartment = useRef(new Compartment())
  const highlightCompartment = useRef(new Compartment())
  const onChangeRef = useRef(onChange)
  const onLintErrorRef = useRef(onLintError)
  const onScrollPercentRef = useRef(onScrollPercent)
  const isSyncingScroll = useRef(false)

  onChangeRef.current = onChange
  onLintErrorRef.current = onLintError
  onScrollPercentRef.current = onScrollPercent

  const isDark = useCallback(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  }, [])

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    goToLine(line: number) {
      const view = viewRef.current
      if (!view) return
      const clampedLine = Math.min(Math.max(1, line), view.state.doc.lines)
      const lineInfo = view.state.doc.line(clampedLine)
      view.dispatch({
        selection: { anchor: lineInfo.from },
        effects: EditorView.scrollIntoView(lineInfo.from, { y: 'center' }),
      })
      view.focus()
    },
    openGoToLine() {
      const view = viewRef.current
      if (!view) return
      openGotoLine(view)
    },
    scrollToPercent(percent: number) {
      const view = viewRef.current
      if (!view) return
      const scroller = view.scrollDOM
      const maxScroll = scroller.scrollHeight - scroller.clientHeight
      if (maxScroll <= 0) return
      isSyncingScroll.current = true
      scroller.scrollTop = percent * maxScroll
      requestAnimationFrame(() => { isSyncingScroll.current = false })
    },
  }), [])

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return

    const dark = isDark()
    const langExt = language === 'yaml'
      ? yaml()
      : language === 'csv'
        ? []
        : [json(), linter(jsonParseLinter()), lintGutter()]

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        foldGutter(),
        bracketMatching(),
        indentOnInput(),
        indentationMarkers({
          colors: {
            light: '#e2e8f0',
            dark: '#1e293b',
            activeLight: '#94a3b8',
            activeDark: '#475569',
          },
        }),
        gotoLineState,
        history(),
        keymap.of([{ key: 'Mod-g', run: openGotoLine, preventDefault: true }, ...defaultKeymap, ...historyKeymap]),
        langCompartment.current.of(langExt),
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
        themeCompartment.current.of(dark ? darkTheme : lightTheme),
        highlightCompartment.current.of(syntaxHighlighting(dark ? darkHighlight : lightHighlight)),
        placeholder ? cmPlaceholder(placeholder) : [],
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          scroll(_event, view) {
            if (isSyncingScroll.current) return
            const scroller = view.scrollDOM
            const maxScroll = scroller.scrollHeight - scroller.clientHeight
            if (maxScroll <= 0) return
            onScrollPercentRef.current?.(scroller.scrollTop / maxScroll)
          },
        }),
      ],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      if (activeGotoLineView === view) activeGotoLineView = null
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync value from parent (external changes only)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  // Sync language
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const langExt = language === 'yaml'
      ? yaml()
      : language === 'csv'
        ? []
        : [json(), linter(jsonParseLinter()), lintGutter()]
    view.dispatch({ effects: langCompartment.current.reconfigure(langExt) })
  }, [language])

  // Sync readOnly
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)) })
  }, [readOnly])

  // Sync dark mode via MutationObserver
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const view = viewRef.current
      if (!view) return
      const dark = isDark()
      view.dispatch({
        effects: [
          themeCompartment.current.reconfigure(dark ? darkTheme : lightTheme),
          highlightCompartment.current.reconfigure(syntaxHighlighting(dark ? darkHighlight : lightHighlight)),
        ],
      })
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [isDark])

  return (
    <div ref={containerRef} className="flex-1 min-h-0 [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto" />
  )
})
