interface FaqItem {
  question: string
  answer: string
}

export function FaqSection({ faq }: { faq: FaqItem[] }) {
  if (!faq || faq.length === 0) return null

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <section className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faq.map((item, i) => (
          <details
            key={i}
            className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[44px] list-none [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <svg
                className="w-5 h-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-slate-600 dark:text-slate-400 leading-7">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
