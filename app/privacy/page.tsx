import type { Metadata } from 'next'
import { GlassCard } from '@/components/ui/glass-card'

export const metadata: Metadata = {
  title: 'Privacy Policy — Toolk1t',
  description: 'Privacy Policy for Toolk1t. Learn how we handle your data.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Toolk1t',
    description: 'Privacy Policy for Toolk1t. Learn how we handle your data.',
    url: '/privacy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GlassCard className="p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Last updated: February 2026
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Information We Collect
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          We collect the following types of information when you use Toolk1t:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed mb-4 space-y-1">
          <li>Usage data such as pages visited and time spent on the platform</li>
          <li>Form submissions, including data you provide through our contact form</li>
          <li>Authentication data (name and email) when you sign in via Supabase OAuth</li>
        </ul>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          We do not collect any data that you do not explicitly provide or that is not
          generated through your normal use of the service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          How We Use Information
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          The information we collect is used to:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed mb-4 space-y-1">
          <li>Improve our tools and overall user experience</li>
          <li>Respond to support inquiries and feedback</li>
          <li>Analyze usage patterns to understand how our tools are used</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Cookies &amp; Tracking
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Toolk1t uses authentication session cookies managed by Supabase to keep you
          signed in. We also use basic analytics to understand site usage. We do not use
          any third-party advertising trackers or sell your data to advertisers.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Third-Party Services
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Toolk1t relies on the following third-party services, each of which processes
          data in accordance with their own privacy policies:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed mb-4 space-y-1">
          <li>Supabase — authentication and database</li>
          <li>Vercel — hosting and CDN</li>
          <li>frankfurter.app — currency exchange rates</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Data Retention
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          We retain your personal data for as long as your account is active or as needed
          to provide you with our services. You may request deletion of your data at any
          time. Anonymized analytics data may be retained indefinitely to help us improve
          the platform.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Your Rights
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          You have the right to:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed mb-4 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request corrections to any inaccurate information</li>
          <li>Request deletion of your personal data</li>
        </ul>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          To exercise any of these rights, please contact us at{' '}
          <a
            href="mailto:loicwong1982@gmail.com"
            className="text-[var(--tk-color-primary-500)] hover:underline"
          >
            loicwong1982@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Children&apos;s Privacy
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Toolk1t is not directed at children under the age of 13. We do not knowingly
          collect personal information from children. If you believe a child has provided
          us with personal data, please contact us so we can take appropriate action.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Changes to This Policy
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          We may update this Privacy Policy from time to time. Any changes will be posted
          on this page with an updated revision date. Your continued use of Toolk1t after
          any changes constitutes acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Contact Information
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a
            href="mailto:loicwong1982@gmail.com"
            className="text-[var(--tk-color-primary-500)] hover:underline"
          >
            loicwong1982@gmail.com
          </a>
          .
        </p>
      </GlassCard>
    </main>
  )
}
