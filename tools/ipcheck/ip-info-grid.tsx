import { InfoCard } from '@/components/ui/info-card'

interface IpInfo {
  proxy: { detected: boolean; status: string }
  isp: { name: string; asn: string }
  dns: { server: string; provider: string }
  userAgent: { browser: string; version: string }
}

interface IpInfoGridProps {
  data: IpInfo
}

export function IpInfoGrid({ data }: IpInfoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <InfoCard
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        }
        label="Proxy / VPN"
        value={data.proxy.detected ? 'Detected' : 'None Detected'}
        status={{
          text: data.proxy.status,
          variant: data.proxy.detected ? 'warning' : 'success',
        }}
      />
      <InfoCard
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8C18.1 5.6 17.1 5 16 5s-2.1.6-3.3 1.7l.8.8C14.3 6.6 15.1 6.2 16 6.2s1.7.4 2.5 1.3l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z" />
          </svg>
        }
        label="Service Provider"
        value={data.isp.name}
        subValue={data.isp.asn}
      />
      <InfoCard
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
        }
        label="DNS Server"
        value={data.dns.server}
        subValue={data.dns.provider}
      />
      <InfoCard
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z" />
          </svg>
        }
        label="User Agent"
        value={data.userAgent.browser}
        subValue={data.userAgent.version}
      />
    </div>
  )
}
