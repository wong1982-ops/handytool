interface MetricCardsProps {
  download: { speed: number; maxSpeed: number }
  upload: { speed: number; maxSpeed: number }
  latency: { ping: number; jitter: number }
}

export function MetricCards({ download, upload, latency }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Download */}
      <div className="bg-white dark:bg-[#16222a] p-6 md:p-5 rounded-xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[var(--tk-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Download</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{download.speed.toFixed(1)}</span>
          <span className="text-lg text-slate-400">Mbps</span>
        </div>
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--tk-color-secondary-500)] rounded-full transition-all duration-700"
            style={{
              width: `${Math.min((download.speed / download.maxSpeed) * 100, 100)}%`,
              boxShadow: '0 0 8px rgba(37, 209, 244, 0.6)',
            }}
          />
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white dark:bg-[#16222a] p-6 md:p-5 rounded-xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Upload</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{upload.speed.toFixed(1)}</span>
          <span className="text-lg text-slate-400">Mbps</span>
        </div>
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min((upload.speed / upload.maxSpeed) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Latency */}
      <div className="bg-white dark:bg-[#16222a] p-6 md:p-5 rounded-xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2V4h-2v13zm4 0h2v-4h-2v4zm4 0h2v-2h-2v2z" />
          </svg>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Latency</h3>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{latency.ping}</span>
            <span className="text-lg text-slate-400">ms</span>
          </div>
          <div className="text-right pb-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Jitter</p>
            <p className="text-lg font-bold text-amber-400">{latency.jitter} ms</p>
          </div>
        </div>
        <div className="mt-4 flex gap-1 h-1 items-center">
          {[0.3, 0.5, 1, 0].map((opacity, i) => (
            <div
              key={i}
              className={`h-full w-2 rounded-full ${opacity > 0 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-white/10'}`}
              style={opacity > 0 ? { opacity } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
