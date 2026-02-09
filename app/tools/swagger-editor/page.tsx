'use client'

import { useState, useMemo, useCallback } from 'react'
import yaml from 'js-yaml'
import { EditorNav } from '@/tools/swagger-editor/editor-nav'
import { YamlEditor } from '@/tools/swagger-editor/yaml-editor'
import { LivePreview } from '@/tools/swagger-editor/live-preview'
import { EndpointCard } from '@/tools/swagger-editor/endpoint-card'
import { SchemaCard } from '@/tools/swagger-editor/schema-card'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedSpec = any

export default function SwaggerEditorPage() {
  const [yamlContent, setYamlContent] = useState(sampleYaml)
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>('get-/pets')
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>('get-/pets')
  const [searchQuery, setSearchQuery] = useState('')
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol] = useState(1)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  // Parse YAML
  const { spec, isValid, validationLabel } = useMemo(() => {
    if (!yamlContent.trim()) {
      return { spec: null, isValid: null as boolean | null, validationLabel: '' }
    }
    try {
      const parsed = yaml.load(yamlContent) as ParsedSpec
      if (typeof parsed === 'object' && parsed !== null && (parsed.openapi || parsed.swagger)) {
        return { spec: parsed, isValid: true, validationLabel: 'Valid OpenAPI' }
      }
      return { spec: parsed, isValid: false, validationLabel: 'Missing openapi field' }
    } catch {
      return { spec: null, isValid: false, validationLabel: 'Invalid YAML' }
    }
  }, [yamlContent])

  const lineCount = yamlContent ? yamlContent.split('\n').length : 1

  const handleEditorChange = useCallback((value: string) => {
    setYamlContent(value)
    // Track cursor position from content
    const lines = value.split('\n')
    setCursorLine(lines.length)
    setCursorCol(1)
  }, [])

  const handleExport = useCallback(() => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'openapi.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }, [yamlContent])

  const handleToggleEndpoint = useCallback((id: string) => {
    setExpandedEndpoint(prev => prev === id ? null : id)
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb + Toolbar */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101f22] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile nav toggle */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-900 dark:text-white font-medium">Swagger Editor</li>
            </ol>
          </nav>

          {/* Menu items (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <button className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1">
              File
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1">
              Edit
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer">Generate Client</button>
            <button className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer">Generate Server</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search methods..."
              className="bg-slate-100 dark:bg-white/5 border-none focus:ring-1 focus:ring-[var(--ht-color-secondary-500)] rounded-lg pl-10 py-1.5 text-sm w-48 lg:w-64 placeholder:text-slate-500 outline-none"
              aria-label="Search API methods"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Mobile preview toggle */}
          <button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="xl:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Test API button */}
          <button className="flex items-center gap-2 bg-[var(--ht-color-secondary-500)] text-slate-900 px-4 py-1.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="hidden sm:inline">Test API</span>
          </button>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-200 dark:bg-white/5 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Navigation sidebar */}
        <EditorNav
          spec={spec}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={(id) => {
            setSelectedEndpoint(id)
            setExpandedEndpoint(id)
          }}
        />

        {/* Mobile nav overlay */}
        {showMobileNav && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowMobileNav(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0d1a1d] z-40 lg:hidden shadow-2xl overflow-y-auto flex flex-col">
              <MobileNav
                spec={spec}
                selectedEndpoint={selectedEndpoint}
                onSelectEndpoint={(id) => {
                  setSelectedEndpoint(id)
                  setExpandedEndpoint(id)
                  setShowMobileNav(false)
                }}
              />
            </div>
          </>
        )}

        {/* YAML Editor */}
        <YamlEditor
          value={yamlContent}
          onChange={handleEditorChange}
          isValid={isValid}
          validationLabel={validationLabel}
          lineCount={lineCount}
          cursorLine={cursorLine}
          cursorCol={cursorCol}
        />

        {/* Live Preview */}
        <LivePreview
          spec={spec}
          expandedEndpoint={expandedEndpoint}
          onToggleEndpoint={handleToggleEndpoint}
        />

        {/* Mobile preview overlay */}
        {showMobilePreview && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 xl:hidden" onClick={() => setShowMobilePreview(false)} />
            <div className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-[500px] bg-white dark:bg-[#101f22] z-40 xl:hidden shadow-2xl overflow-y-auto">
              <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50 dark:bg-white/5 shrink-0 sticky top-0">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
                <button onClick={() => setShowMobilePreview(false)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer" aria-label="Close preview">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MobilePreviewContent spec={spec} expandedEndpoint={expandedEndpoint} />
            </div>
          </>
        )}

        {/* Floating action buttons */}
        <div className="absolute bottom-12 right-6 flex flex-col gap-2 z-20 xl:hidden">
          <button
            onClick={() => setShowMobilePreview(true)}
            className="w-12 h-12 rounded-full bg-[var(--ht-color-secondary-500)] text-slate-900 shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer xl:hidden"
            aria-label="Show preview"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  )
}

/* ---------- Mobile-only inline components ---------- */

function MobileNav({
  spec,
  selectedEndpoint,
  onSelectEndpoint,
}: {
  spec: ParsedSpec | null
  selectedEndpoint: string | null
  onSelectEndpoint: (id: string) => void
}) {
  const endpoints = useMemo(() => {
    if (!spec?.paths) return []
    const result: { id: string; method: string; path: string }[] = []
    for (const [path, methods] of Object.entries(spec.paths as Record<string, Record<string, unknown>>)) {
      for (const method of Object.keys(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          result.push({ id: `${method}-${path}`, method, path })
        }
      }
    }
    return result
  }, [spec])

  const METHOD_COLORS: Record<string, string> = {
    get: 'bg-green-500/20 text-green-400',
    post: 'bg-blue-500/20 text-blue-400',
    put: 'bg-orange-500/20 text-orange-400',
    delete: 'bg-red-500/20 text-red-400',
    patch: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Endpoints</h3>
      {endpoints.map((ep) => (
        <button
          key={ep.id}
          onClick={() => onSelectEndpoint(ep.id)}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
            selectedEndpoint === ep.id
              ? 'bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <span className={`text-[10px] font-bold px-1 rounded ${METHOD_COLORS[ep.method] || ''} w-9 text-center uppercase`}>
            {ep.method}
          </span>
          <span className="text-sm truncate">{ep.path}</span>
        </button>
      ))}
    </div>
  )
}

function MobilePreviewContent({
  spec,
  expandedEndpoint,
}: {
  spec: ParsedSpec | null
  expandedEndpoint: string | null
}) {
  if (!spec) {
    return (
      <div className="flex items-center justify-center p-6 h-64">
        <p className="text-sm text-slate-400">Enter valid OpenAPI YAML to see preview</p>
      </div>
    )
  }

  const apiTitle = spec.info?.title || 'Untitled API'
  const apiVersion = spec.info?.version || ''
  const apiDescription = spec.info?.description || ''

  // Gather endpoints — cast to any since this is dynamically parsed YAML
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endpoints: { id: string; method: string; path: string; summary?: string; parameters?: any; responses?: any }[] = []
  if (spec.paths) {
    for (const [path, methods] of Object.entries(spec.paths as Record<string, Record<string, Record<string, unknown>>>)) {
      for (const [method, details] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          endpoints.push({ id: `${method}-${path}`, method, path, summary: details?.summary as string | undefined, parameters: details?.parameters, responses: details?.responses })
        }
      }
    }
  }

  const schemas = spec.components?.schemas ? Object.entries(spec.components.schemas as Record<string, { properties?: Record<string, unknown>; required?: string[] }>) : []

  return (
    <div className="p-6 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">{apiTitle}</h2>
          {apiVersion && <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-mono">{apiVersion}</span>}
        </div>
        {apiDescription && <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{apiDescription}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Endpoints</h3>
        {endpoints.map((ep) => (
          <EndpointCard
            key={ep.id}
            method={ep.method}
            path={ep.path}
            summary={ep.summary}
            parameters={ep.parameters}
            responses={ep.responses}
            defaultExpanded={expandedEndpoint === ep.id}
          />
        ))}
      </div>

      {schemas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Schemas</h3>
          {schemas.map(([name, schema]) => (
            <SchemaCard key={name} name={name} properties={schema.properties as Record<string, { type?: string; format?: string }>} required={schema.required} />
          ))}
        </div>
      )}
    </div>
  )
}
