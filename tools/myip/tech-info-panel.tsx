interface TechInfoData {
  isp: string
  country: string
  countryCode: string
  city: string
  region: string
  coordinates: { lat: number; lng: number }
  proxy: boolean
  vpn: boolean
  tor: boolean
  timezone: string
}

interface TechInfoPanelProps {
  data: TechInfoData
}

export function TechInfoPanel({ data }: TechInfoPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold">Technical Information</h2>
        <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>

      {/* 2x2 Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ISP Provider */}
        <InfoCard
          icon={
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          }
          label="ISP Provider"
          value={data.isp}
        />

        {/* Country */}
        <InfoCard
          icon={
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V3h1l8 5v13H3zm10-13l8-5v18h-8V8z" />
            </svg>
          }
          label="Country"
          value={data.country}
          badge={data.countryCode}
        />

        {/* City & Region */}
        <InfoCard
          icon={
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="City & Region"
          value={`${data.city}, ${data.region}`}
        />

        {/* Coordinates */}
        <InfoCard
          icon={
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
          }
          label="Coordinates"
          value={`${data.coordinates.lat}, ${data.coordinates.lng}`}
        />
      </div>

      {/* Flags Row */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
        <FlagItem label="Proxy" value={data.proxy ? 'Yes' : 'No'} variant={data.proxy ? 'danger' : 'danger'} />
        <FlagItem label="VPN" value={data.vpn ? 'Yes' : 'No'} variant={data.vpn ? 'success' : 'default'} />
        <FlagItem label="Tor" value={data.tor ? 'Yes' : 'No'} variant={data.tor ? 'danger' : 'default'} />
        <FlagItem label="Timezone" value={data.timezone} variant="default" />
      </div>
    </div>
  )
}

/* --- Sub-components --- */

interface InfoCardProps {
  icon: React.ReactNode
  label: string
  value: string
  badge?: string
}

function InfoCard({ icon, label, value, badge }: InfoCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
      <div className="size-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-slate-900 dark:text-white font-bold truncate">{value}</p>
          {badge && (
            <span className="text-xs text-slate-400 shrink-0">{badge}</span>
          )}
        </div>
      </div>
    </div>
  )
}

interface FlagItemProps {
  label: string
  value: string
  variant: 'success' | 'danger' | 'default'
}

function FlagItem({ label, value, variant }: FlagItemProps) {
  const colorMap = {
    success: 'text-emerald-500',
    danger: 'text-red-500',
    default: 'text-slate-900 dark:text-white',
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-slate-400 uppercase font-bold">{label}</span>
      <span className={`text-sm font-semibold ${colorMap[variant]}`}>{value}</span>
    </div>
  )
}
