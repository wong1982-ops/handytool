'use client'

import { GradientMesh } from '@/components/home/gradient-mesh'
import { ParticleCanvas } from '@/components/home/particle-canvas'
import { FloatingIcons } from '@/components/home/floating-icons'
import { ToolDemo } from '@/components/home/tool-demo'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#101922]">
      <GradientMesh />
      <ParticleCanvas />
      <FloatingIcons />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          Online Tools,
          <br />
          <span className="bg-gradient-to-r from-[var(--tk-color-primary-400)] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Supercharged.
          </span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
          Developer tools, image editors, converters, and more — right in your browser.
        </p>

        <ToolDemo />

        <a
          href="#all-tools"
          className="inline-flex flex-col items-center gap-1 mt-16 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <span className="text-sm">Explore All Tools</span>
          <svg
            className="w-5 h-5 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  )
}
