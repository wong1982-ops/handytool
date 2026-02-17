interface ServerInfoBarProps {
  ispName: string
  ispIp: string
}

export function ServerInfoBar({ ispName, ispIp }: ServerInfoBarProps) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      {/* Test Server */}
      <div className="flex flex-1 items-center gap-4 bg-white dark:bg-[#16222a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-white/5">
        <div className="bg-[var(--ht-color-secondary-500)]/10 p-3 rounded-lg shrink-0">
          <svg className="w-6 h-6 text-[var(--ht-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Test Server</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
            HandyTool Server
          </p>
        </div>
      </div>

      {/* ISP */}
      <div className="flex flex-1 items-center gap-4 bg-white dark:bg-[#16222a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-white/5">
        <div className="bg-[var(--ht-color-secondary-500)]/10 p-3 rounded-lg shrink-0">
          <svg className="w-6 h-6 text-[var(--ht-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Internet Service Provider</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {ispName} {ispIp && <span className="text-slate-400 font-medium text-sm ml-2">{ispIp}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
