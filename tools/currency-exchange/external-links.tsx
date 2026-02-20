'use client'

interface ExternalLinksProps {
  from: string
  to: string
  amount: string
}

export function ExternalLinks({ from, to, amount }: ExternalLinksProps) {
  const links = [
    { label: 'XE', href: `https://www.xe.com/currencyconverter/convert/?From=${from}&To=${to}&Amount=${parseFloat(amount) || 1}` },
    { label: 'Google Finance', href: `https://www.google.com/finance/quote/${from}-${to}` },
    { label: 'Wise', href: `https://wise.com/gb/currency-converter/${from.toLowerCase()}-to-${to.toLowerCase()}-rate` },
    { label: 'OANDA', href: `https://www.oanda.com/currency-converter/en/?from=${from}&to=${to}&amount=${parseFloat(amount) || 1}` },
  ]

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Check rates on popular platforms</h3>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[var(--tk-color-primary-500)] hover:text-[var(--tk-color-primary-500)] transition-colors"
          >
            {link.label}
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
