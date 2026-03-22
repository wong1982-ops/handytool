export function CtaBanner() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center rounded-2xl bg-gradient-to-r from-[var(--tk-color-primary-600)] to-purple-600 p-10 lg:p-14 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <h2 className="relative text-2xl lg:text-3xl font-bold text-white mb-3">
          Start using Toolk1t
        </h2>
        <p className="relative text-white/70 mb-6 max-w-lg mx-auto">
          No sign-up required. Open any tool and start working instantly. AI-powered features use credits.
        </p>
        <a
          href="#all-tools"
          className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Explore Tools
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </section>
  )
}
