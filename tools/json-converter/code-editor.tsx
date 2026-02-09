'use client'

import { useRef, useEffect, useCallback } from 'react'
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle, foldGutter, bracketMatching, indentOnInput } from '@codemirror/language'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { linter, lintGutter } from '@codemirror/lint'
import { tags } from '@lezer/highlight'

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
}, { dark: true })

// --- Component ---

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  language?: 'json' | 'yaml'
  onLintError?: (message: string | null) => void
}

export function CodeEditor({ value, onChange, readOnly = false, placeholder, language = 'json', onLintError }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const langCompartment = useRef(new Compartment())
  const readOnlyCompartment = useRef(new Compartment())
  const themeCompartment = useRef(new Compartment())
  const highlightCompartment = useRef(new Compartment())
  const onChangeRef = useRef(onChange)
  const onLintErrorRef = useRef(onLintError)

  onChangeRef.current = onChange
  onLintErrorRef.current = onLintError

  const isDark = useCallback(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  }, [])

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return

    const dark = isDark()
    const langExt = language === 'yaml'
      ? yaml()
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
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
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
      ],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
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
    <div ref={containerRef} className="flex-1 overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto" />
  )
}
