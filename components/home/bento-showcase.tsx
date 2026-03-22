'use client'

import Link from 'next/link'

const bentoItems = [
  {
    name: 'Image Editor',
    description: 'Edit, adjust & apply filters to images',
    href: '/tools/image-editor',
    gridClass: 'lg:col-span-2 lg:row-span-2',
    glowClass: 'from-amber-500/10',
    preview: (
      <div className="w-full h-full flex flex-col gap-2 p-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-2.5 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-14 text-right">Brightness</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-14 text-right">Contrast</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-14 text-right">Saturation</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Regex Tester',
    description: 'Test, match & replace with 30+ preset patterns',
    href: '/tools/regex-tester',
    gridClass: '',
    glowClass: 'from-lime-500/10',
    preview: (
      <div className="w-full h-full flex flex-col justify-center px-3 gap-1.5">
        <div className="font-mono text-[10px] text-slate-400">
          /\d+<span className="text-lime-400">-</span>\w+/g
        </div>
        <div className="font-mono text-[11px] text-slate-300">
          order<span className="bg-yellow-400/30 rounded px-0.5">123-abc</span>
          {' '}ref<span className="bg-yellow-400/30 rounded px-0.5">456-xyz</span>
        </div>
      </div>
    ),
  },
  {
    name: 'Favicon Generator',
    description: 'Create favicons from text, icons, images, or AI',
    href: '/tools/favicon-generator',
    gridClass: '',
    glowClass: 'from-fuchsia-500/10',
    preview: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-400 to-pink-500" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500" />
        </div>
      </div>
    ),
  },
  {
    name: 'Color Palette',
    description: 'Generate palettes with harmony rules & accessibility',
    href: '/tools/color-palette',
    gridClass: 'lg:col-span-2',
    glowClass: 'from-pink-500/10',
    preview: (
      <div className="w-full h-full flex flex-col justify-center gap-1 px-2">
        <div className="h-3 rounded-full bg-rose-400 w-full" />
        <div className="h-3 rounded-full bg-pink-300 w-full" />
        <div className="h-3 rounded-full bg-fuchsia-400 w-full" />
        <div className="h-3 rounded-full bg-violet-400 w-full" />
        <div className="h-3 rounded-full bg-indigo-400 w-full" />
      </div>
    ),
  },
  {
    name: 'JSON Converter',
    description: 'Format, convert & validate JSON/YAML/CSV',
    href: '/tools/json-converter',
    gridClass: '',
    glowClass: 'from-emerald-500/10',
    preview: (
      <div className="w-full h-full flex flex-col justify-center px-3 gap-1 font-mono text-[10px]">
        <div><span className="text-slate-500">{'{'}</span></div>
        <div className="pl-3"><span className="text-emerald-400">&quot;name&quot;</span><span className="text-slate-500">:</span> <span className="text-amber-300">&quot;toolk1t&quot;</span><span className="text-slate-500">,</span></div>
        <div className="pl-3"><span className="text-emerald-400">&quot;version&quot;</span><span className="text-slate-500">:</span> <span className="text-cyan-300">2.0</span></div>
        <div><span className="text-slate-500">{'}'}</span></div>
      </div>
    ),
  },
  {
    name: 'Speed Test',
    description: 'Test your internet speed',
    href: '/tools/speedtest',
    gridClass: '',
    glowClass: 'from-cyan-500/10',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <svg width="64" height="40" viewBox="0 0 64 40" fill="none">
          <path d="M8 36 A28 28 0 0 1 56 36" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M8 36 A28 28 0 0 1 48 12" stroke="url(#speedGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <line x1="32" y1="34" x2="44" y2="16" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="34" r="2" fill="#22d3ee" />
          <defs>
            <linearGradient id="speedGrad" x1="8" y1="36" x2="48" y2="12">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-[11px] font-bold text-cyan-400 mt-1">85 Mbps</span>
      </div>
    ),
  },
  {
    name: 'Story Studio',
    description: 'Create AI-illustrated picture books',
    href: '/tools/story-studio',
    gridClass: 'lg:col-span-2',
    glowClass: 'from-purple-500/10',
    preview: (
      <div className="w-full h-full flex items-center justify-center gap-3 px-3">
        <div className="w-14 h-[52px] rounded-lg border border-purple-400/30 bg-purple-400/5 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12" />
          </svg>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-2 rounded-full bg-white/10 w-full" />
          <div className="h-2 rounded-full bg-white/10 w-3/4" />
        </div>
      </div>
    ),
  },
  // --- New tools below ---
  {
    name: 'IP Check',
    description: 'Look up any IP address or domain',
    href: '/tools/ipcheck',
    gridClass: '',
    glowClass: 'from-blue-500/10',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
        <svg className="w-5 h-5 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
        </svg>
        <span className="text-[11px] font-mono text-slate-300">192.168.1.1</span>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="text-[10px] text-slate-400">Melbourne, AU</span>
        </div>
      </div>
    ),
  },
  {
    name: 'My IP',
    description: 'Find your public IP address',
    href: '/tools/myip',
    gridClass: '',
    glowClass: 'from-indigo-500/10',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
        <svg className="w-5 h-5 text-indigo-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span className="text-[11px] font-mono text-slate-300">Your IP: 203.x.x.x</span>
        <div className="w-12 h-6 rounded border border-indigo-400/20 bg-indigo-400/5 flex items-center justify-center">
          <div className="w-6 h-3 rounded-sm border border-indigo-400/30" />
        </div>
      </div>
    ),
  },
  {
    name: 'Swagger Editor',
    description: 'Edit & preview OpenAPI specifications',
    href: '/tools/swagger-editor',
    gridClass: '',
    glowClass: 'from-violet-500/10',
    preview: (
      <div className="w-full h-full flex flex-col justify-center px-3 gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">GET</span>
          <span className="text-[10px] text-slate-400 font-mono">/api/users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">POST</span>
          <span className="text-[10px] text-slate-400 font-mono">/api/users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">DEL</span>
          <span className="text-[10px] text-slate-400 font-mono">/api/users/:id</span>
        </div>
      </div>
    ),
  },
  {
    name: 'JWT Decoder',
    description: 'Decode, verify & generate JSON Web Tokens',
    href: '/tools/jwt-decoder',
    gridClass: '',
    glowClass: 'from-orange-500/10',
    preview: (
      <div className="w-full h-full flex flex-col justify-center px-3 gap-1">
        <div className="flex items-center gap-1">
          <div className="h-2.5 flex-1 rounded bg-red-400/40" />
          <span className="text-[9px] text-red-400/60">header</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 flex-[2] rounded bg-purple-400/40" />
          <span className="text-[9px] text-purple-400/60">payload</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 flex-1 rounded bg-cyan-400/40" />
          <span className="text-[9px] text-cyan-400/60">signature</span>
        </div>
      </div>
    ),
  },
  {
    name: 'ID Photo Editor',
    description: 'Create passport & visa photos',
    href: '/tools/id-photo',
    gridClass: '',
    glowClass: 'from-rose-500/10',
    preview: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-14 h-[52px] rounded border-2 border-dashed border-rose-400/30 flex flex-col items-center justify-center gap-0.5">
          <div className="w-4 h-4 rounded-full border border-rose-400/40" />
          <div className="w-6 h-3 rounded-t-full border border-rose-400/40 border-b-0" />
        </div>
      </div>
    ),
  },
  {
    name: 'PDF Converter',
    description: 'Convert PDF to images, merge, split & compress',
    href: '/tools/pdf-converter',
    gridClass: '',
    glowClass: 'from-red-500/10',
    preview: (
      <div className="w-full h-full flex items-center justify-center gap-2">
        <div className="w-8 h-10 rounded border border-red-400/30 bg-red-400/5 flex items-center justify-center">
          <span className="text-[8px] font-bold text-red-400/60">PDF</span>
        </div>
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        <div className="w-8 h-10 rounded border border-orange-400/30 bg-orange-400/5 flex items-center justify-center">
          <span className="text-[8px] font-bold text-orange-400/60">IMG</span>
        </div>
      </div>
    ),
  },
  {
    name: 'SVG Converter',
    description: 'Convert raster images to vector SVG',
    href: '/tools/svg-converter',
    gridClass: '',
    glowClass: 'from-teal-500/10',
    preview: (
      <div className="w-full h-full flex items-center justify-center gap-2">
        <div className="w-8 h-8 bg-teal-400/10 rounded border border-teal-400/20 grid grid-cols-3 grid-rows-3 gap-px p-0.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-teal-400/30 rounded-[1px]" />
          ))}
        </div>
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        <div className="w-8 h-8 rounded border border-teal-400/30 bg-teal-400/5 flex items-center justify-center">
          <svg className="w-5 h-5 text-teal-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    name: 'Currency Exchange',
    description: 'Convert currencies with live exchange rates',
    href: '/tools/currency-exchange',
    gridClass: '',
    glowClass: 'from-green-500/10',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
        <span className="text-[11px] font-mono text-emerald-400">100 USD</span>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-green-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
          </svg>
        </div>
        <span className="text-[11px] font-mono text-green-300">153 AUD</span>
      </div>
    ),
  },
  {
    name: 'ECard Studio',
    description: 'Design professional e-cards for business occasions',
    href: '/tools/ecard-studio',
    gridClass: '',
    glowClass: 'from-yellow-500/10',
    preview: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-12 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-1.5 flex flex-col justify-between">
          <div className="border-b border-yellow-400/20 pb-0.5">
            <div className="h-1 rounded-full bg-yellow-400/30 w-8" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="h-1 rounded-full bg-white/10 w-full" />
            <div className="h-1 rounded-full bg-white/10 w-3/4" />
          </div>
          <div className="border-t border-yellow-400/20 pt-0.5">
            <div className="h-1 rounded-full bg-yellow-400/20 w-6 mx-auto" />
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Human Benchmark',
    description: 'Brain games & cognitive tests',
    href: '/tools/human-benchmark',
    gridClass: '',
    glowClass: 'from-rose-500/10',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
        <svg className="w-5 h-5 text-rose-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-[10px] text-slate-300">Reaction: <span className="text-rose-400 font-mono">215ms</span></span>
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-1.5 h-1 rounded-t bg-rose-400/40" />
          <div className="w-1.5 h-2 rounded-t bg-rose-400/50" />
          <div className="w-1.5 h-3 rounded-t bg-rose-400/60" />
          <div className="w-1.5 h-2 rounded-t bg-purple-400/50" />
          <div className="w-1.5 h-1.5 rounded-t bg-purple-400/40" />
        </div>
      </div>
    ),
  },
  {
    name: 'Job Radar',
    description: 'AU & NZ tech and French language jobs — updated daily',
    href: '/tools/job-radar',
    gridClass: '',
    glowClass: 'from-sky-500/10',
    preview: (
      <div className="w-full h-full flex flex-col justify-center px-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded border border-sky-400/20 bg-sky-400/5 p-1.5 flex flex-col gap-0.5">
            <div className="h-1 rounded-full bg-sky-400/30 w-10" />
            <div className="h-1 rounded-full bg-white/10 w-16" />
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'AI Radar',
    description: 'Latest AI model releases & updates — updated daily',
    href: '/tools/ai-radar',
    gridClass: '',
    glowClass: 'from-violet-500/10',
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
        <svg className="w-5 h-5 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12" />
        </svg>
        <div className="flex gap-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">GPT-5</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300">Claude 4</span>
        </div>
      </div>
    ),
  },
]

export function BentoShowcase() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#101922] to-[#0c1219]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
          Powerful Tools,{' '}
          <span className="bg-gradient-to-r from-[var(--tk-color-primary-400)] to-cyan-400 bg-clip-text text-transparent">
            Zero Cost
          </span>
        </h2>
        <p className="text-center text-slate-400 mb-12 max-w-lg mx-auto">
          All your tools — right in your browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bentoItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden hover:scale-[1.02] hover:border-white/20 transition-all duration-300 cursor-pointer ${item.gridClass}`}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${item.glowClass} to-transparent rounded-2xl`} />

              {/* Mini preview */}
              <div className="relative mb-3 h-24 lg:h-32 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
                {item.preview}
              </div>

              {/* Label */}
              <h3 className="relative font-bold text-white text-sm">{item.name}</h3>
              <p className="relative text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>
              <span className="relative text-xs text-[var(--tk-color-primary-400)] mt-2 inline-block group-hover:translate-x-1 transition-transform">
                Try it →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
