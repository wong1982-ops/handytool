interface SwaggerToolbarProps {
  onValidate: () => void
  onFormat: () => void
  onExport: () => void
  onCopy: () => void
  isValidating: boolean
}

export function SwaggerToolbar({ onValidate, onFormat, onExport, onCopy, isValidating }: SwaggerToolbarProps) {
  return (
    <div className="shrink-0 relative flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <ToolbarGroup>
        <ToolbarButton
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label={isValidating ? 'Validating...' : 'Validate'}
          description="Check OpenAPI spec validity"
          onClick={onValidate}
          disabled={isValidating}
        />
        <ToolbarButton
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
            </svg>
          }
          label="Format"
          description="Auto-format YAML in place"
          onClick={onFormat}
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          label="Export"
          description="Download as YAML file"
          onClick={onExport}
        />
        <ToolbarButton
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          label="Copy"
          description="Copy YAML to clipboard"
          onClick={onCopy}
        />
      </ToolbarGroup>
    </div>
  )
}

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
  onClick: () => void
  disabled?: boolean
}

function ToolbarButton({ icon, label, description, onClick, disabled }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="hidden sm:inline">{label}</span>

      {/* Tooltip — above button, left-aligned to avoid viewport overflow */}
      <span
        className="pointer-events-none absolute left-0 bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg"
        aria-hidden="true"
      >
        {description}
        {/* Arrow pointing down */}
        <span className="absolute top-full left-4 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
      </span>
    </button>
  )
}
