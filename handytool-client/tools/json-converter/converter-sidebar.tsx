import type { DetectedFormat } from './use-json-validator'

interface ConverterToolbarProps {
  onBeautify: () => void
  onMinify: () => void
  onToYaml: () => void
  onToJson: () => void
  onToCsv: () => void
  onCsvToJson: () => void
  onFormat: () => void
  activeAction?: string
  detectedFormat?: DetectedFormat
}

export function ConverterToolbar({
  onBeautify,
  onMinify,
  onToYaml,
  onToJson,
  onToCsv,
  onCsvToJson,
  onFormat,
  activeAction,
  detectedFormat = 'unknown',
}: ConverterToolbarProps) {
  const isJson = detectedFormat === 'json'
  const isYaml = detectedFormat === 'yaml'
  const isCsv = detectedFormat === 'csv'
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
          disabled={!hasInput || isCsv}
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
      </ToolbarGroup>
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
            ? 'bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)] font-semibold'
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

function CsvToJsonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10M3 14h10M8 6v12M17 8l4 4-4 4" />
    </svg>
  )
}
