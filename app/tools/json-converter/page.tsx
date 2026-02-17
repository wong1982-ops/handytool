'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import yaml from 'js-yaml'
import { ConverterToolbar } from '@/tools/json-converter/converter-sidebar'
import { CodeEditor, type CodeEditorHandle } from '@/tools/json-converter/code-editor'
import { StatusBar } from '@/tools/json-converter/status-bar'
import { ProblemsPanel } from '@/components/ui/problems-panel'
import { useJsonValidator } from '@/tools/json-converter/use-json-validator'

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
  const editorRef = useRef<CodeEditorHandle>(null)
  const [input, setInput] = useState(sampleJson)
  const [output, setOutput] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('input')
  const [activeAction, setActiveAction] = useState<string | undefined>('beautify')
  const [outputFormat, setOutputFormat] = useState('JSON')
  const [copiedPanel, setCopiedPanel] = useState<'input' | 'output' | null>(null)

  // Validation with structured errors
  const { errors, format: detectedFormat, isValid, label: validationLabel } = useJsonValidator(input)

  const handleGoToLine = useCallback((line: number) => {
    setActiveTab('input')
    editorRef.current?.goToLine(line)
  }, [])

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

  // Use hook outputs for validation display
  const validation = useMemo(() => ({
    valid: isValid,
    label: validationLabel,
  }), [isValid, validationLabel])

  // Input language from detected format
  const inputLanguage = useMemo<'json' | 'yaml' | 'csv'>(() => {
    if (detectedFormat === 'json') return 'json'
    if (detectedFormat === 'yaml') return 'yaml'
    if (detectedFormat === 'csv') return 'csv'
    return 'json'
  }, [detectedFormat])

  // Output language for read-only editor highlighting
  const outputLanguage = useMemo<'json' | 'yaml' | 'csv'>(() => {
    if (outputFormat === 'YAML') return 'yaml'
    if (outputFormat === 'CSV') return 'csv'
    return 'json'
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
    let parsed: unknown
    // Try JSON first
    try {
      parsed = JSON.parse(input)
    } catch {
      // Try YAML
      try {
        const yamlParsed = yaml.load(input)
        if (typeof yamlParsed === 'object' && yamlParsed !== null) {
          parsed = yamlParsed
        }
      } catch { /* not yaml */ }
    }
    // Try CSV
    if (parsed === undefined) {
      try {
        const rows = parseCsvToArray(input)
        if (rows.length > 1) {
          const headers = rows[0]
          parsed = rows.slice(1).map((row) => csvRowToObject(headers, row))
        }
      } catch { /* not csv */ }
    }
    if (parsed !== undefined) {
      const result = yaml.dump(parsed, { indent: 2, lineWidth: -1 })
      setOutput(result)
      setOutputFormat('YAML')
      setActiveAction('toYaml')
      setActiveTab('output')
    } else {
      setOutput('Error: Could not parse input as JSON, YAML, or CSV')
    }
  }, [input])

  const handleToJson = useCallback(() => {
    try {
      // Try YAML first (also parses JSON)
      const parsed = yaml.load(input)
      if (typeof parsed === 'object' && parsed !== null) {
        const result = JSON.stringify(parsed, null, 2)
        setOutput(result)
        setOutputFormat('JSON')
        setActiveAction('toJson')
        setActiveTab('output')
        return
      }
    } catch { /* not YAML/JSON */ }
    // Try CSV
    try {
      const rows = parseCsvToArray(input)
      if (rows.length > 1) {
        const headers = rows[0]
        const data = rows.slice(1).map((row) => csvRowToObject(headers, row))
        setOutput(JSON.stringify(data, null, 2))
        setOutputFormat('JSON')
        setActiveAction('toJson')
        setActiveTab('output')
        return
      }
    } catch { /* not CSV either */ }
    setOutput('Error: Invalid YAML or CSV input')
  }, [input])

  const handleToCsv = useCallback(() => {
    try {
      let parsed: unknown
      try {
        parsed = JSON.parse(input)
      } catch {
        parsed = yaml.load(input)
      }
      const array = Array.isArray(parsed) ? parsed : [parsed]
      if (array.length === 0 || typeof array[0] !== 'object' || array[0] === null) {
        setOutput('Error: Input must be a JSON/YAML array of objects')
        return
      }
      const headers = Object.keys(array[0] as Record<string, unknown>)
      const csvRows = [
        headers.map(escapeCsvField).join(','),
        ...array.map((row) => {
          const obj = row as Record<string, unknown>
          return headers.map((h) => {
            const val = obj[h]
            if (val === null || val === undefined) return ''
            if (typeof val === 'object') return escapeCsvField(JSON.stringify(val))
            return escapeCsvField(String(val))
          }).join(',')
        }),
      ]
      setOutput(csvRows.join('\n'))
      setOutputFormat('CSV')
      setActiveAction('toCsv')
      setActiveTab('output')
    } catch {
      setOutput('Error: Invalid JSON/YAML input for CSV conversion')
    }
  }, [input])

  const handleCsvToJson = useCallback(() => {
    try {
      const rows = parseCsvToArray(input)
      if (rows.length < 2) {
        setOutput('Error: CSV must have a header row and at least one data row')
        return
      }
      const headers = rows[0]
      const data = rows.slice(1).map((row) => csvRowToObject(headers, row))
      setOutput(JSON.stringify(data, null, 2))
      setOutputFormat('JSON')
      setActiveAction('csvToJson')
      setActiveTab('output')
    } catch {
      setOutput('Error: Invalid CSV input')
    }
  }, [input])

  const handleCopyInput = useCallback(async () => {
    if (!input.trim()) return
    await navigator.clipboard.writeText(input)
    setCopiedPanel('input')
    setTimeout(() => setCopiedPanel(null), 2000)
  }, [input])

  const handleCopyOutput = useCallback(async () => {
    if (!output.trim()) return
    await navigator.clipboard.writeText(output)
    setCopiedPanel('output')
    setTimeout(() => setCopiedPanel(null), 2000)
  }, [output])

  const handleDownloadInput = useCallback(() => {
    if (!input.trim()) return
    const isYaml = inputLanguage === 'yaml'
    const ext = isYaml ? 'yaml' : 'json'
    const blob = new Blob([input], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `input.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [input, inputLanguage])

  const handleDownloadOutput = useCallback(() => {
    if (!output.trim()) return
    const ext = outputFormat === 'YAML' ? 'yaml' : outputFormat === 'CSV' ? 'csv' : 'json'
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [output, outputFormat])

  const handleSwap = useCallback(() => {
    if (!output.trim()) return
    undoStack.current.push(input)
    redoStack.current = []
    const prevInput = input
    setInput(output)
    setOutput(prevInput)
    // Reset output format after swap
    setOutputFormat('JSON')
    setActiveAction(undefined)
  }, [input, output])

  const handleClearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setActiveTab('input')
    setActiveAction(undefined)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented) return
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault()
        handleFormat()
        return
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'g' || e.key === 'G') {
          e.preventDefault()
          editorRef.current?.openGoToLine()
        } else if (e.key === 'z' && e.shiftKey) {
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
    <div className="flex-1 flex flex-col">
      {/* Top Bar: Breadcrumb + Undo/Redo + Clear */}
      <div className="relative z-0 px-4 md:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-900 dark:text-white font-medium">JSON Converter</li>
          </ol>
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
            </svg>
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Clear All"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <ConverterToolbar
        onBeautify={handleBeautify}
        onMinify={handleMinify}
        onToYaml={handleToYaml}
        onToJson={handleToJson}
        onToCsv={handleToCsv}
        onCsvToJson={handleCsvToJson}
        onFormat={handleFormat}
        activeAction={activeAction}
        detectedFormat={detectedFormat}
      />

      {/* Editor Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Mobile: Tabs */}
        <div className="flex items-center justify-between px-4 py-2 md:hidden">
          <div className="flex items-center gap-1.5">
            <div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'input'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Input
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'output'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {output ? `Result (${outputFormat})` : 'Result'}
              </button>
            </div>
            <button
              onClick={handleSwap}
              disabled={!output.trim()}
              className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 hover:text-[var(--ht-color-secondary-500)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Swap result to input"
              aria-label="Swap result to input"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
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

        {/* Desktop: Side-by-side editors */}
        <div className="hidden md:flex flex-1 gap-0 p-3 overflow-hidden">
          {/* Input Panel */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Input</span>
              <div className="flex items-center gap-1.5">
                {validation.valid !== null && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    validation.valid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${validation.valid ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    {validation.label}
                  </div>
                )}
                <button
                  onClick={handleCopyInput}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Copy input"
                  aria-label="Copy input"
                >
                  {copiedPanel === 'input' ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleDownloadInput}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Download input"
                  aria-label="Download input"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
            <CodeEditor
              ref={editorRef}
              value={input}
              onChange={handleInputChange}
              placeholder='{ "paste": "your JSON or YAML here" }'
              language={inputLanguage}
            />
            <StatusBar
              format={validation.label.includes('YAML') ? 'YAML' : validation.label.includes('CSV') ? 'CSV' : 'JSON'}
              lineCount={inputLineCount}
              charCount={input.length}
              isValid={validation.valid}
              validationLabel={validation.label}
            />
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center w-10 shrink-0">
            <button
              onClick={handleSwap}
              disabled={!output.trim()}
              className="group w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 hover:text-[var(--ht-color-secondary-500)] hover:border-[var(--ht-color-secondary-500)]/50 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:hover:shadow-sm transition-all cursor-pointer"
              title="Swap result to input"
              aria-label="Swap result to input"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {output ? `Result (${outputFormat})` : 'Result'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyOutput}
                  disabled={!output.trim()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Copy result"
                  aria-label="Copy result"
                >
                  {copiedPanel === 'output' ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleDownloadOutput}
                  disabled={!output.trim()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Download result"
                  aria-label="Download result"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
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
        <div className="flex-1 md:hidden mx-3 mb-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
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
            format={activeTab === 'input' ? (validation.label.includes('YAML') ? 'YAML' : validation.label.includes('CSV') ? 'CSV' : 'JSON') : outputFormat}
            lineCount={activeTab === 'input' ? inputLineCount : outputLineCount}
            charCount={activeTab === 'input' ? input.length : output.length}
            isValid={activeTab === 'input' ? validation.valid : null}
            validationLabel={activeTab === 'input' ? validation.label : undefined}
          />

          {/* Floating Convert Button */}
          {activeTab === 'input' && input.trim() && (
            <button
              onClick={handleBeautify}
              className="absolute bottom-14 right-4 bg-[var(--ht-color-secondary-500)] text-slate-900 h-10 pl-3 pr-4 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Convert
            </button>
          )}
        </div>

        {/* Problems Panel — only shown when there are errors, full-width at bottom */}
        {errors.length > 0 && (
          <div className="mx-3 mb-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <ProblemsPanel errors={errors} onGoToLine={handleGoToLine} />
          </div>
        )}
      </main>

      {/* Copied toast */}
      {copiedPanel && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl z-50" role="status">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-xs font-medium">Copied to clipboard</span>
        </div>
      )}
    </div>
  )
}

// --- CSV helpers ---

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCsvToArray(text: string): string[][] {
  const lines = text.trim().split('\n').filter((l) => l.trim())
  return lines.map(parseCsvLine)
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Try to recover typed values from CSV cell strings */
function parseCsvValue(value: string): unknown {
  if (value === '') return ''
  if (value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  // Number (int or float, but not strings like "007")
  if (/^-?\d+(\.\d+)?$/.test(value) && !(value.length > 1 && value.startsWith('0') && !value.startsWith('0.'))) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  // JSON array or object
  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
    try { return JSON.parse(value) } catch { /* keep as string */ }
  }
  return value
}

function csvRowToObject(headers: string[], row: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  headers.forEach((h, i) => { obj[h] = parseCsvValue(row[i] ?? '') })
  return obj
}
