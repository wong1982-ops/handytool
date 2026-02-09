'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import yaml from 'js-yaml'
import { ConverterSidebar } from '@/tools/json-converter/converter-sidebar'
import { CodeEditor } from '@/tools/json-converter/code-editor'
import { StatusBar } from '@/tools/json-converter/status-bar'

const sampleJson = `{
  "project": "DevFlow Utility",
  "version": "2.1.0",
  "features": [
    "JSON Formatting",
    "YAML Conversion",
    "Minification",
    "Syntax Highlighting"
  ],
  "active": true,
  "config": {
    "tabSize": 2,
    "theme": "light-plus"
  }
}`

type Tab = 'input' | 'output'

export default function JsonConverterPage() {
  const [input, setInput] = useState(sampleJson)
  const [output, setOutput] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('input')
  const [activeAction, setActiveAction] = useState<string | undefined>('beautify')
  const [outputFormat, setOutputFormat] = useState('JSON')
  const [copied, setCopied] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Undo / Redo history for the input editor
  const undoStack = useRef<string[]>([])
  const redoStack = useRef<string[]>([])
  const isUndoRedo = useRef(false)

  const handleInputChange = useCallback((value: string) => {
    if (!isUndoRedo.current) {
      undoStack.current.push(input)
      redoStack.current = []
    }
    setInput(value)
  }, [input])

  const canUndo = undoStack.current.length > 0
  const canRedo = redoStack.current.length > 0

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const prev = undoStack.current.pop()!
    redoStack.current.push(input)
    isUndoRedo.current = true
    setInput(prev)
    isUndoRedo.current = false
  }, [input])

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const next = redoStack.current.pop()!
    undoStack.current.push(input)
    isUndoRedo.current = true
    setInput(next)
    isUndoRedo.current = false
  }, [input])

  // Validation
  const validation = useMemo(() => {
    if (!input.trim()) return { valid: null as boolean | null, label: '' }
    try {
      JSON.parse(input)
      return { valid: true, label: 'Valid JSON' }
    } catch {
      // Check if it's valid YAML
      try {
        const parsed = yaml.load(input)
        if (typeof parsed === 'object' && parsed !== null) {
          return { valid: true, label: 'Valid YAML' }
        }
      } catch { /* not valid yaml either */ }
      return { valid: false, label: 'Invalid' }
    }
  }, [input])

  // Detect input language for editor highlighting
  const inputLanguage = useMemo<'json' | 'yaml'>(() => {
    const trimmed = input.trim()
    if (!trimmed) return 'json'
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      return 'yaml'
    }
  }, [input])

  // Output language for read-only editor highlighting
  const outputLanguage = useMemo<'json' | 'yaml'>(() => {
    return outputFormat === 'YAML' ? 'yaml' : 'json'
  }, [outputFormat])

  // Line counts for status bar
  const inputLineCount = input ? input.split('\n').length : 1
  const outputLineCount = output ? output.split('\n').length : 1

  // Actions
  const handleBeautify = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const result = JSON.stringify(parsed, null, 2)
      setOutput(result)
      setOutputFormat('JSON')
      setActiveAction('beautify')
      setActiveTab('output')
    } catch {
      setOutput('Error: Invalid JSON input')
    }
  }, [input])

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setInput(formatted)
      setActiveAction('format')
    } catch {
      // Try YAML format
      try {
        const parsed = yaml.load(input)
        if (typeof parsed === 'object' && parsed !== null) {
          const formatted = yaml.dump(parsed, { indent: 2, lineWidth: -1 })
          setInput(formatted)
          setActiveAction('format')
        }
      } catch { /* ignore */ }
    }
  }, [input])

  const handleMinify = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const result = JSON.stringify(parsed)
      setOutput(result)
      setOutputFormat('JSON')
      setActiveAction(undefined)
      setActiveTab('output')
    } catch {
      setOutput('Error: Invalid JSON input')
    }
  }, [input])

  const handleToYaml = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const result = yaml.dump(parsed, { indent: 2, lineWidth: -1 })
      setOutput(result)
      setOutputFormat('YAML')
      setActiveAction('toYaml')
      setActiveTab('output')
    } catch {
      setOutput('Error: Invalid JSON input')
    }
  }, [input])

  const handleToJson = useCallback(() => {
    try {
      const parsed = yaml.load(input)
      const result = JSON.stringify(parsed, null, 2)
      setOutput(result)
      setOutputFormat('JSON')
      setActiveAction('toJson')
      setActiveTab('output')
    } catch {
      setOutput('Error: Invalid YAML input')
    }
  }, [input])

  const handleCopy = useCallback(async () => {
    const text = output || input
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output, input])

  const handleDownload = useCallback(() => {
    const text = output || input
    const ext = outputFormat === 'YAML' ? 'yaml' : 'json'
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [output, input, outputFormat])

  const handleClearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setActiveTab('input')
    setActiveAction(undefined)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Shift+Alt+F — format in place
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault()
        handleFormat()
        return
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else if (e.key === 'z') {
          e.preventDefault()
          handleUndo()
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault()
          handleToYaml()
        } else if (e.key === 'j' || e.key === 'J') {
          e.preventDefault()
          handleToJson()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToYaml, handleToJson, handleUndo, handleRedo, handleFormat])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-900 dark:text-white font-medium">JSON Converter</li>
          </ol>
        </nav>
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
            </svg>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle actions panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={handleClearAll}
            className="bg-[var(--ht-color-secondary-500)] text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - desktop */}
        <ConverterSidebar
          onBeautify={handleBeautify}
          onMinify={handleMinify}
          onToYaml={handleToYaml}
          onToJson={handleToJson}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onFormat={handleFormat}
          activeAction={activeAction}
        />

        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowMobileSidebar(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 z-40 p-6 flex flex-col gap-6 lg:hidden shadow-2xl overflow-y-auto">
              <MobileActions
                actions={[
                  { label: 'Beautify Code', onClick: () => { handleBeautify(); setShowMobileSidebar(false) } },
                  { label: 'Minify Output', onClick: () => { handleMinify(); setShowMobileSidebar(false) } },
                  { label: 'Format (Shift+Alt+F)', onClick: () => { handleFormat(); setShowMobileSidebar(false) } },
                ]}
                title="Core Actions"
              />
              <MobileActions
                actions={[
                  { label: 'To YAML', onClick: () => { handleToYaml(); setShowMobileSidebar(false) } },
                  { label: 'To JSON', onClick: () => { handleToJson(); setShowMobileSidebar(false) } },
                ]}
                title="Conversion"
              />
              <MobileActions
                actions={[
                  { label: 'Copy Result', onClick: () => { handleCopy(); setShowMobileSidebar(false) } },
                  { label: 'Download File', onClick: () => { handleDownload(); setShowMobileSidebar(false) } },
                ]}
                title="Export"
              />
            </div>
          </>
        )}

        {/* Editor Area */}
        <section className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 flex flex-col gap-4 overflow-hidden">
          {/* Mobile: Tabs + Validation */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'input'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Input
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'output'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {output ? `Result (${outputFormat})` : 'Result'}
              </button>
            </div>
            {validation.valid !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                validation.valid
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${validation.valid ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                {validation.label}
              </div>
            )}
          </div>

          {/* Desktop: Side-by-side editors */}
          <div className="hidden md:flex flex-1 gap-4 overflow-hidden">
            {/* Input Panel */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Input</span>
                {validation.valid !== null && (
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
                    validation.valid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${validation.valid ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    {validation.label}
                  </div>
                )}
              </div>
              <CodeEditor
                value={input}
                onChange={handleInputChange}
                placeholder='{ "paste": "your JSON or YAML here" }'
                language={inputLanguage}
              />
              <StatusBar
                format={validation.label.includes('YAML') ? 'YAML' : 'JSON'}
                lineCount={inputLineCount}
                charCount={input.length}
                isValid={validation.valid}
                validationLabel={validation.label}
              />
            </div>

            {/* Output Panel */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {output ? `Result (${outputFormat})` : 'Result'}
                </span>
              </div>
              <CodeEditor
                value={output}
                onChange={() => {}}
                readOnly
                placeholder="Run an action to see results..."
                language={outputLanguage}
              />
              <StatusBar
                format={outputFormat}
                lineCount={outputLineCount}
                charCount={output.length}
                isValid={null}
              />
            </div>
          </div>

          {/* Mobile: Tab-switched single editor */}
          <div className="flex-1 md:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
            {activeTab === 'input' ? (
              <CodeEditor
                value={input}
                onChange={handleInputChange}
                placeholder='{ "paste": "your JSON or YAML here" }'
                language={inputLanguage}
              />
            ) : (
              <CodeEditor
                value={output}
                onChange={() => {}}
                readOnly
                placeholder="Run an action to see results..."
                language={outputLanguage}
              />
            )}

            <StatusBar
              format={activeTab === 'input' ? (validation.label.includes('YAML') ? 'YAML' : 'JSON') : outputFormat}
              lineCount={activeTab === 'input' ? inputLineCount : outputLineCount}
              charCount={activeTab === 'input' ? input.length : output.length}
              isValid={activeTab === 'input' ? validation.valid : null}
              validationLabel={activeTab === 'input' ? validation.label : undefined}
            />

            {/* Floating Convert Button */}
            {activeTab === 'input' && input.trim() && (
              <button
                onClick={handleBeautify}
                className="absolute bottom-16 right-6 bg-[var(--ht-color-secondary-500)] text-slate-900 h-12 pl-4 pr-5 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Convert Now
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Copied toast */}
      {copied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50" role="status">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-sm font-medium">Copied to clipboard</span>
        </div>
      )}
    </div>
  )
}

function MobileActions({ actions, title }: { actions: { label: string; onClick: () => void }[]; title: string }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{title}</h3>
      <div className="flex flex-col gap-1">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
