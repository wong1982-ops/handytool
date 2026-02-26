import { useState, useRef, useEffect } from 'react'
import type { DetectedFormat } from './use-json-validator'

export type IndentSize = 2 | 4 | 'tab'

interface ConverterToolbarProps {
  onBeautify: () => void
  onMinify: () => void
  onToYaml: () => void
  onToJson: () => void
  onToCsv: () => void
  onCsvToJson: () => void
  onToXml: () => void
  onXmlToJson: () => void
  onXmlToYaml: () => void
  onXmlToCsv: () => void
  onFormat: () => void
  activeAction?: string
  detectedFormat?: DetectedFormat
  indentSize?: IndentSize
  onIndentSizeChange?: (size: IndentSize) => void
  sortKeys?: boolean
  onSortKeysChange?: (sort: boolean) => void
}

export function ConverterToolbar({
  onBeautify,
  onMinify,
  onToYaml,
  onToJson,
  onToCsv,
  onCsvToJson,
  onToXml,
  onXmlToJson,
  onXmlToYaml,
  onXmlToCsv,
  onFormat,
  activeAction,
  detectedFormat = 'unknown',
  indentSize = 2,
  onIndentSizeChange,
  sortKeys = false,
  onSortKeysChange,
}: ConverterToolbarProps) {
  const isJson = detectedFormat === 'json'
  const isYaml = detectedFormat === 'yaml'
  const isCsv = detectedFormat === 'csv'
  const isXml = detectedFormat === 'xml'
  const hasInput = detectedFormat !== 'unknown'

  return (
    <div className="relative z-10 flex flex-wrap items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Format (always available) */}
      <ToolbarGroup>
        <ToolbarButton
          icon={<FormatIcon />}
          label="Format"
          description="Auto-format in place"
          kbd="Shift+Alt+F"
          onClick={onFormat}
          active={activeAction === 'format'}
          disabled={!hasInput || isCsv || isXml}
        />
        {(isJson || !hasInput) && (
          <>
            <ToolbarButton
              icon={<SparkleIcon />}
              label="Beautify"
              description="Pretty-print JSON with indentation"
              onClick={onBeautify}
              active={activeAction === 'beautify'}
              disabled={!isJson}
            />
            <ToolbarButton
              icon={<MinifyIcon />}
              label="Minify"
              description="Remove whitespace and newlines"
              onClick={onMinify}
              disabled={!isJson}
            />
          </>
        )}
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Conversions — context-sensitive */}
      <ToolbarGroup>
        {/* JSON → YAML */}
        {(isJson || !hasInput) && (
          <ToolbarButton
            icon={<ConvertIcon />}
            label="To YAML"
            description="Convert JSON to YAML"
            kbd="Ctrl+Y"
            onClick={onToYaml}
            active={activeAction === 'toYaml'}
            disabled={!isJson}
          />
        )}

        {/* JSON → CSV */}
        {(isJson || !hasInput) && (
          <ToolbarButton
            icon={<CsvIcon />}
            label="To CSV"
            description="Convert JSON array to CSV"
            onClick={onToCsv}
            active={activeAction === 'toCsv'}
            disabled={!isJson}
          />
        )}

        {/* JSON → XML */}
        {(isJson || !hasInput) && (
          <ToolbarButton
            icon={<XmlIcon />}
            label="To XML"
            description="Convert JSON to XML"
            onClick={onToXml}
            active={activeAction === 'toXml'}
            disabled={!isJson}
          />
        )}

        {/* YAML → JSON */}
        {(isYaml || !hasInput) && (
          <ToolbarButton
            icon={<CodeIcon />}
            label="To JSON"
            description="Convert YAML to JSON"
            kbd="Ctrl+J"
            onClick={onToJson}
            active={activeAction === 'toJson'}
            disabled={!isYaml}
          />
        )}

        {/* YAML → CSV */}
        {isYaml && (
          <ToolbarButton
            icon={<CsvIcon />}
            label="To CSV"
            description="Convert YAML array to CSV"
            onClick={onToCsv}
            active={activeAction === 'toCsv'}
          />
        )}

        {/* YAML → XML */}
        {isYaml && (
          <ToolbarButton
            icon={<XmlIcon />}
            label="To XML"
            description="Convert YAML to XML"
            onClick={onToXml}
            active={activeAction === 'toXml'}
          />
        )}

        {/* CSV → JSON */}
        {(isCsv || !hasInput) && (
          <ToolbarButton
            icon={<CsvToJsonIcon />}
            label="To JSON"
            description="Convert CSV to JSON array"
            onClick={onCsvToJson}
            active={activeAction === 'csvToJson'}
            disabled={!isCsv}
          />
        )}

        {/* CSV → YAML */}
        {isCsv && (
          <ToolbarButton
            icon={<ConvertIcon />}
            label="To YAML"
            description="Convert CSV to YAML"
            onClick={onToYaml}
            active={activeAction === 'toYaml'}
          />
        )}

        {/* CSV → XML */}
        {isCsv && (
          <ToolbarButton
            icon={<XmlIcon />}
            label="To XML"
            description="Convert CSV to XML"
            onClick={onToXml}
            active={activeAction === 'toXml'}
          />
        )}

        {/* XML → JSON */}
        {(isXml || !hasInput) && (
          <ToolbarButton
            icon={<CodeIcon />}
            label="To JSON"
            description="Convert XML to JSON"
            onClick={onXmlToJson}
            active={activeAction === 'xmlToJson'}
            disabled={!isXml}
          />
        )}

        {/* XML → YAML */}
        {isXml && (
          <ToolbarButton
            icon={<ConvertIcon />}
            label="To YAML"
            description="Convert XML to YAML"
            onClick={onXmlToYaml}
            active={activeAction === 'xmlToYaml'}
          />
        )}

        {/* XML → CSV */}
        {isXml && (
          <ToolbarButton
            icon={<CsvIcon />}
            label="To CSV"
            description="Convert XML to CSV"
            onClick={onXmlToCsv}
            active={activeAction === 'xmlToCsv'}
          />
        )}
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Options */}
      <OptionsPopover
        indentSize={indentSize}
        onIndentSizeChange={onIndentSizeChange}
        sortKeys={sortKeys}
        onSortKeysChange={onSortKeysChange}
      />
    </div>
  )
}

// --- Options Popover ---

function OptionsPopover({
  indentSize,
  onIndentSizeChange,
  sortKeys,
  onSortKeysChange,
}: {
  indentSize: IndentSize
  onIndentSizeChange?: (size: IndentSize) => void
  sortKeys: boolean
  onSortKeysChange?: (sort: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
          open
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        aria-label="Formatting options"
        title="Formatting options"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden sm:inline">Options</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-3 space-y-3">
          {/* Indent Size */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Indent Size</label>
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg">
              {([2, 4, 'tab'] as IndentSize[]).map((size) => (
                <button
                  key={String(size)}
                  onClick={() => onIndentSizeChange?.(size)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    indentSize === size
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {size === 'tab' ? 'Tab' : `${size} sp`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Keys */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => onSortKeysChange?.(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[var(--tk-color-primary-500)] focus:ring-[var(--tk-color-primary-500)] cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Sort object keys
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Sub-components ---

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  description: string
  kbd?: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}

function ToolbarButton({ icon, label, description, kbd, onClick, active, disabled }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={kbd ? `${label} (${kbd})` : label}
      className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : active
            ? 'bg-[var(--tk-color-secondary-500)]/10 text-[var(--tk-color-secondary-500)] font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="hidden sm:inline">{label}</span>

      {/* Tooltip — above button */}
      {!disabled && (
        <span
          className="pointer-events-none absolute left-0 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg"
          aria-hidden="true"
        >
          {description}
          {kbd && <span className="ml-1.5 text-slate-400 text-[10px]">{kbd}</span>}
          {/* Arrow pointing down */}
          <span className="absolute top-full left-4 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </span>
      )}
    </button>
  )
}

// --- Icons (inline SVGs, 16x16) ---

function SparkleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function MinifyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
  )
}

function FormatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
    </svg>
  )
}

function ConvertIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

function CsvIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M8 6v12M16 6v12" />
    </svg>
  )
}

function XmlIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l-4 4 4 4m10-8l4 4-4 4M14 4l-4 16" />
    </svg>
  )
}

function CsvToJsonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10M3 14h10M8 6v12M17 8l4 4-4 4" />
    </svg>
  )
}
