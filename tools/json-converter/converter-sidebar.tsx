interface ConverterSidebarProps {
  onBeautify: () => void
  onMinify: () => void
  onToYaml: () => void
  onToJson: () => void
  onCopy: () => void
  onDownload: () => void
  onFormat: () => void
  activeAction?: string
}

export function ConverterSidebar({
  onBeautify,
  onMinify,
  onToYaml,
  onToJson,
  onCopy,
  onDownload,
  onFormat,
  activeAction,
}: ConverterSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex-col gap-8 hidden lg:flex">
      {/* Core Actions */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Core Actions</h3>
        <div className="flex flex-col gap-2">
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            label="Beautify Code"
            onClick={onBeautify}
            active={activeAction === 'beautify'}
          />
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            }
            label="Minify Output"
            onClick={onMinify}
          />
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
              </svg>
            }
            label="Format"
            kbd="Shift+Alt+F"
            onClick={onFormat}
            active={activeAction === 'format'}
          />
        </div>
      </div>

      {/* Conversion */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Conversion</h3>
        <div className="flex flex-col gap-2">
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
            label="To YAML"
            kbd="Ctrl+Y"
            onClick={onToYaml}
            active={activeAction === 'toYaml'}
          />
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
            label="To JSON"
            kbd="Ctrl+J"
            onClick={onToJson}
            active={activeAction === 'toJson'}
          />
        </div>
      </div>

      {/* Export */}
      <div className="mt-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Export</h3>
        <div className="flex flex-col gap-2">
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            label="Copy Result"
            onClick={onCopy}
          />
          <SidebarButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            label="Download File"
            onClick={onDownload}
          />
        </div>
      </div>
    </aside>
  )
}

interface SidebarButtonProps {
  icon: React.ReactNode
  label: string
  kbd?: string
  onClick: () => void
  active?: boolean
}

function SidebarButton({ icon, label, kbd, onClick, active }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)] font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {kbd && (
        <kbd className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-400">
          {kbd}
        </kbd>
      )}
    </button>
  )
}
