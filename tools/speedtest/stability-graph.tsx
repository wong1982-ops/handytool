interface StabilityGraphProps {
  downloadPath?: string
  uploadPath?: string
}

const defaultDownloadPath = 'M0 80 Q 100 20, 200 40 T 400 30 T 600 50 T 800 20 T 1000 35'
const defaultUploadPath = 'M0 90 Q 150 85, 300 88 T 500 82 T 750 89 T 1000 85'

export function StabilityGraph({
  downloadPath = defaultDownloadPath,
  uploadPath = defaultUploadPath,
}: StabilityGraphProps) {
  return (
    <div className="w-full bg-white dark:bg-[#16222a] p-6 rounded-xl border border-slate-200 dark:border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">Connection Stability Graph</h3>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-tight">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--ht-color-secondary-500)]" aria-hidden="true" />
            <span className="text-slate-500 dark:text-slate-400">Download</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-slate-500 dark:text-slate-400">Upload</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full relative" role="img" aria-label="Connection stability graph showing download and upload speeds over time">
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          {/* Download fill */}
          <path
            d={`${downloadPath} V 100 H 0 Z`}
            fill="url(#graphGradFill)"
            opacity="0.1"
          />
          {/* Download line */}
          <path
            d={downloadPath}
            fill="none"
            stroke="var(--ht-color-secondary-500, #25d1f4)"
            strokeWidth="2"
          />
          {/* Upload line (dashed) */}
          <path
            d={uploadPath}
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <defs>
            <linearGradient id="graphGradFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ht-color-secondary-500, #25d1f4)" />
              <stop offset="100%" stopColor="var(--ht-color-secondary-500, #25d1f4)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-Axis Labels */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-slate-400 font-bold py-1 pointer-events-none">
          <span>1 Gbps</span>
          <span>500 M</span>
          <span>0 M</span>
        </div>
      </div>
    </div>
  )
}
