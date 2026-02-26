import Link from 'next/link'

interface LandingPageProps {
  h1: string
  description: string
  toolHref: string
  toolName: string
  howToTitle: string
  steps: { step: number; text: string }[]
  features: string[]
  relatedTools: { name: string; href: string }[]
}

export function LandingPageTemplate({
  h1, description, toolHref, toolName, howToTitle, steps, features, relatedTools,
}: LandingPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 flex-1">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{h1}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">{description}</p>

      <Link href={toolHref} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors mb-12">
        Try {toolName} now <span aria-hidden="true">&rarr;</span>
      </Link>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{howToTitle}</h2>
        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.step} className="flex gap-3 text-slate-700 dark:text-slate-300">
              <span className="shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">{s.step}</span>
              <span className="pt-0.5">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why use this tool?</h2>
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
              <span className="text-green-500 shrink-0">&#10003;</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {relatedTools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Related tools</h2>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((t) => (
              <Link key={t.href} href={t.href} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
