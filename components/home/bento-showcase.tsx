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
          Explore our most popular tools — all running right in your browser.
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
