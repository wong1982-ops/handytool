'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import yaml from 'js-yaml'
import SplitPane from 'react18-split-pane'
import { CodeEditor, type CodeEditorHandle } from '@/tools/json-converter/code-editor'
import { SwaggerToolbar } from '@/tools/swagger-editor/swagger-toolbar'
import { ProblemsPanel } from '@/tools/swagger-editor/problems-panel'
import { SwaggerUIPreview } from '@/tools/swagger-editor/swagger-ui-preview'
import { useOpenApiValidator } from '@/tools/swagger-editor/use-openapi-validator'
import { FavoriteButton } from '@/components/ui/favorite-button'
import '@/tools/swagger-editor/split-pane.scss'

const sampleYaml = `openapi: "3.0.1"
info:
  title: "Petstore API"
  description: |-
    This is a sample server Petstore server.
    You can find out more about Swagger at http://swagger.io
    or on irc.freenode.net, #swagger.
  version: "1.0.0"
servers:
  - url: "http://petstore.swagger.io/v1"
paths:
  /pets:
    get:
      summary: "List all pets"
      operationId: "listPets"
      tags:
        - "pets"
      parameters:
        - name: "limit"
          in: "query"
          description: "How many items to return at one time"
          required: false
          schema:
            type: "integer"
            format: "int32"
      responses:
        "200":
          description: "A list of pets"
          content:
            application/json:
              schema:
                type: "array"
                items:
                  $ref: "#/components/schemas/Pet"
              example:
                - id: 1
                  name: "Fluffy"
                  tag: "dog"
    post:
      summary: "Create a pet"
      operationId: "createPets"
      tags:
        - "pets"
      responses:
        "201":
          description: "Null response"
  /pets/{id}:
    get:
      summary: "Info for a specific pet"
      operationId: "showPetById"
      tags:
        - "pets"
      parameters:
        - name: "id"
          in: "path"
          required: true
          description: "The id of the pet to retrieve"
          schema:
            type: "string"
      responses:
        "200":
          description: "Expected response to a valid request"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
              example:
                id: 1
                name: "Fluffy"
                tag: "dog"
    put:
      summary: "Update a pet"
      operationId: "updatePet"
      tags:
        - "pets"
      parameters:
        - name: "id"
          in: "path"
          required: true
          description: "The id of the pet to update"
          schema:
            type: "string"
      responses:
        "200":
          description: "Updated"
components:
  schemas:
    Pet:
      type: "object"
      required:
        - id
        - name
      properties:
        id:
          type: "integer"
          format: "int64"
        name:
          type: "string"
        tag:
          type: "string"
    Error:
      type: "object"
      required:
        - code
        - message
      properties:
        code:
          type: "integer"
          format: "int32"
        message:
          type: "string"
  securitySchemes:
    BearerAuth:
      type: "http"
      scheme: "bearer"
`

type MobileTab = 'editor' | 'preview' | 'problems'

export default function SwaggerEditorPage() {
  const editorRef = useRef<CodeEditorHandle>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const [yamlContent, setYamlContent] = useState(sampleYaml)
  const [activeTab, setActiveTab] = useState<MobileTab>('editor')
  const [copied, setCopied] = useState(false)
  const [verticalSize, setVerticalSize] = useState<string | number>('50%')
  const [horizontalSize, setHorizontalSize] = useState<number>(32)

  const { spec, lastValidSpec, errors, isValid, isValidating } = useOpenApiValidator(yamlContent)

  // Double-click resizers to snap to preset ratios
  useEffect(() => {
    const container = desktopRef.current
    if (!container) return

    const resizers = container.querySelectorAll<HTMLElement>('.Resizer')
    const controllers: AbortController[] = []

    resizers.forEach((resizer) => {
      const ac = new AbortController()
      controllers.push(ac)

      resizer.addEventListener('dblclick', () => {
        if (resizer.classList.contains('horizontal')) {
          setHorizontalSize((prev) => (prev <= 50 ? 250 : 32))
        } else if (resizer.classList.contains('vertical')) {
          setVerticalSize('50%')
        }
      }, { signal: ac.signal })
    })

    return () => controllers.forEach((ac) => ac.abort())
  }, [])

  const handleValidate = useCallback(() => {
    // Trigger re-validation by setting the same content (hook debounce resets)
    setYamlContent((v) => v + '')
  }, [])

  const handleFormat = useCallback(() => {
    try {
      const parsed = yaml.load(yamlContent)
      if (typeof parsed === 'object' && parsed !== null) {
        const formatted = yaml.dump(parsed, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false, quotingType: '"' })
        setYamlContent(formatted)
      }
    } catch {
      // YAML can't be parsed — try a basic line-level indent normalization
      // Convert tabs to spaces and normalize to 2-space indent
      const lines = yamlContent.split('\n')
      const normalized = lines.map((line) => {
        const tabExpanded = line.replace(/\t/g, '  ')
        return tabExpanded
      }).join('\n')
      if (normalized !== yamlContent) {
        setYamlContent(normalized)
      }
    }
  }, [yamlContent])

  const handleExport = useCallback(() => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'openapi.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }, [yamlContent])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(yamlContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [yamlContent])

  const handleGoToLine = useCallback((line: number) => {
    setActiveTab('editor')
    editorRef.current?.goToLine(line)
  }, [])

  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length

  return (
    <div className="swagger-editor fixed inset-0 top-16 z-30 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toolbar section — pinned above scrolling workspace */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {/* Top Bar */}
        <div className="px-4 md:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-900 dark:text-white font-medium">Swagger Editor</li>
            </ol>
            <FavoriteButton slug="swagger-editor" name="Swagger Editor" />
          </nav>
          <div className="flex items-center gap-2">
            {/* Validation badge */}
            {isValid !== null && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
                isValid
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'} ${isValidating ? 'animate-pulse' : ''}`} />
                {isValid ? 'Valid OpenAPI' : `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <SwaggerToolbar
          onValidate={handleValidate}
          onFormat={handleFormat}
          onExport={handleExport}
          onCopy={handleCopy}
          isValidating={isValidating}
        />

        {/* Mobile: Tab bar */}
        <div className="flex items-center px-4 py-2 md:hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full">
          {(['editor', 'preview', 'problems'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {tab}
              {tab === 'problems' && (errorCount + warningCount) > 0 && (
                <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white ${errorCount > 0 ? 'bg-red-500' : 'bg-amber-500'}`}>
                  {errorCount + warningCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Main workspace */}
      <main className="flex-1 min-h-0 flex overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Desktop: Resizable split panes */}
        <div ref={desktopRef} className="hidden md:flex flex-col flex-1 min-h-0 overflow-hidden">
          <SplitPane split="horizontal" primary="second" size={horizontalSize} onChange={setHorizontalSize} minSize={32} maxSize={-100}>
            {/* Row 1: Editor + Preview */}
            <SplitPane split="vertical" size={verticalSize} onChange={(s) => setVerticalSize(s)} minSize={200} maxSize={-200}>
              {/* Editor — R1C1 */}
              <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[var(--tk-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">openapi.yaml</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">YAML</span>
                </div>
                <CodeEditor
                  ref={editorRef}
                  value={yamlContent}
                  onChange={setYamlContent}
                  language="yaml"
                  placeholder="Paste your OpenAPI / Swagger YAML here..."
                />
              </div>

              {/* Swagger UI Preview — R1C2 */}
              <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                <SwaggerUIPreview spec={spec} lastValidSpec={lastValidSpec} />
              </div>
            </SplitPane>

            {/* Row 2: Problems — full width */}
            <div className="w-full overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <ProblemsPanel errors={errors} onGoToLine={handleGoToLine} />
            </div>
          </SplitPane>
        </div>

        {/* Mobile: Tab-switched */}
        <div className="flex-1 md:hidden flex flex-col mx-3 mb-3 overflow-hidden">
          {activeTab === 'editor' && (
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <CodeEditor
                value={yamlContent}
                onChange={setYamlContent}
                language="yaml"
                placeholder="Paste your OpenAPI / Swagger YAML here..."
              />
            </div>
          )}
          {activeTab === 'preview' && (
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <SwaggerUIPreview spec={spec} lastValidSpec={lastValidSpec} />
            </div>
          )}
          {activeTab === 'problems' && (
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <ProblemsPanel errors={errors} onGoToLine={handleGoToLine} />
            </div>
          )}
        </div>
      </main>

      {/* Copied toast */}
      {copied && (
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
