'use client'

export function PrivacySheetContent() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
        <p className="text-xs text-slate-500 mt-1">Last updated: February 2026</p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Information We Collect</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Usage data such as pages visited and time spent</li>
          <li>Form submissions including data from the contact form</li>
          <li>Authentication data (name and email) via OAuth sign-in</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">How We Use Information</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Improve our tools and user experience</li>
          <li>Respond to support inquiries and feedback</li>
          <li>Analyze usage patterns</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Cookies &amp; Tracking</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Toolk1t uses authentication session cookies managed by Supabase. We use basic analytics
          to understand site usage. We do not use third-party advertising trackers or sell your data.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Third-Party Services</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Supabase — authentication and database</li>
          <li>Vercel — hosting and CDN</li>
          <li>frankfurter.app — currency exchange rates</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Data Retention</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          We retain your data for as long as your account is active. You may request deletion
          at any time. Anonymized analytics data may be retained indefinitely.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Your Rights</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request corrections to inaccurate information</li>
          <li>Request deletion of your personal data</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Children&apos;s Privacy</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Toolk1t is not directed at children under 13. We do not knowingly collect
          personal information from children.
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
