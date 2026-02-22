import type { Metadata } from 'next'
import { GlassCard } from '@/components/ui/glass-card'

export const metadata: Metadata = {
  title: 'Terms of Service — Toolk1t',
  description: 'Terms of Service for Toolk1t, your free online toolkit.',
}

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GlassCard className="p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Last updated: February 2026
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Agreement to Terms
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          By accessing or using Toolk1t, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our services. These terms
          apply to all visitors, users, and others who access or use the platform.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Description of Service
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Toolk1t provides a collection of free online tools including, but not limited to,
          IP lookup, currency converter, image editor, PDF tools, and other utilities. These
          tools are provided as-is for personal and professional use. We may add, modify, or
          discontinue tools at any time without prior notice.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          User Responsibilities
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          When using Toolk1t, you agree to the following:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed mb-4 space-y-1">
          <li>You will not misuse the service or use it for any unlawful purpose</li>
          <li>You will not engage in automated scraping, crawling, or data extraction</li>
          <li>You will not attempt to reverse engineer, decompile, or disassemble the platform</li>
          <li>You will not interfere with or disrupt the service or its infrastructure</li>
          <li>You will not use the service to engage in any illegal activity</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Intellectual Property
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Toolk1t and its original content, features, and functionality are owned by Toolk1t
          and are protected by international copyright, trademark, and other intellectual
          property laws. Users retain full ownership of any content they upload or process
          through our tools. We do not claim any rights over user-submitted content.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Disclaimer of Warranties
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          All tools and services are provided &quot;as is&quot; and &quot;as available&quot; without warranty
          of any kind, express or implied, including but not limited to the warranties of
          merchantability, fitness for a particular purpose, and non-infringement. We do not
          warrant that the service will be uninterrupted, secure, or error-free.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Limitation of Liability
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          In no event shall Toolk1t, its directors, employees, partners, agents, suppliers,
          or affiliates be liable for any indirect, incidental, special, consequential, or
          punitive damages, including without limitation, loss of profits, data, use,
          goodwill, or other intangible losses, resulting from your access to or use of (or
          inability to access or use) the service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Changes to Terms
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          We reserve the right to modify or replace these terms at any time. If a revision is
          material, we will provide at least 30 days&apos; notice prior to any new terms taking
          effect. Your continued use of the service after any changes constitutes acceptance
          of the new terms.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Contact Information
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          If you have any questions about these Terms of Service, please contact us at{' '}
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
