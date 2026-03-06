'use client'

export function TermsSheetContent() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
        <p className="text-xs text-slate-500 mt-1">Last updated: February 2026</p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Agreement to Terms</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          By accessing or using Toolk1t, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Description of Service</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Toolk1t provides a collection of free online tools including IP lookup, currency converter,
          image editor, PDF tools, and other utilities. These tools are provided as-is for personal
          and professional use. We may add, modify, or discontinue tools at any time.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">User Responsibilities</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Do not misuse the service or use it for unlawful purposes</li>
          <li>Do not engage in automated scraping or data extraction</li>
          <li>Do not attempt to reverse engineer or disassemble the platform</li>
          <li>Do not interfere with or disrupt the service</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Intellectual Property</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Toolk1t and its original content are protected by international copyright and trademark laws.
          Users retain full ownership of any content they upload or process through our tools.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Disclaimer of Warranties</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          All tools and services are provided &quot;as is&quot; and &quot;as available&quot; without warranty
          of any kind. We do not warrant that the service will be uninterrupted, secure, or error-free.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Limitation of Liability</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          In no event shall Toolk1t be liable for any indirect, incidental, special, consequential,
          or punitive damages resulting from your use of the service.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Changes to Terms</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          We reserve the right to modify these terms at any time. Material changes will be communicated
          with at least 30 days&apos; notice. Continued use constitutes acceptance.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Contact</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Questions? Email{' '}
          <a href="mailto:loicwong1982@gmail.com" className="text-[var(--tk-color-primary-500)] hover:underline">
            loicwong1982@gmail.com
          </a>
        </p>
      </section>
    </div>
  )
}
