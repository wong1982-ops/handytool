import Link from 'next/link'

export function CtaBanner({ toolName, toolHref }: { toolName: string; toolHref: string }) {
  return (
    <section className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-3">
        Try {toolName} now &mdash; it&apos;s free
      </h2>
      <Link
        href={toolHref}
        className="inline-flex items-center px-6 py-3 min-h-[44px] bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
      >
        Open {toolName}
      </Link>
    </section>
  )
}
