'use client'

const OFFLINE_TOOLS = [
  { name: 'Human Benchmark', href: '/tools/human-benchmark', description: '28 cognitive tests' },
  { name: 'JSON Converter', href: '/tools/json-converter', description: 'Convert between JSON formats' },
  { name: 'SVG Converter', href: '/tools/svg-converter', description: 'Convert SVG to other formats' },
  { name: 'Image Editor', href: '/tools/image-editor', description: 'Edit and filter images' },
  { name: 'eCard Studio', href: '/tools/ecard-studio', description: 'Create digital cards' },
  { name: 'PDF Converter', href: '/tools/pdf-converter', description: 'Convert documents to PDF' },
  { name: 'Swagger Editor', href: '/tools/swagger-editor', description: 'Edit OpenAPI specs' },
]

export default function OfflinePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl" aria-hidden="true">&#x1F4E1;</div>
        <h1 className="text-2xl font-bold text-white">You&apos;re Offline</h1>
        <p className="text-gray-400">
          This page requires an internet connection. But these tools work offline:
        </p>
        <div className="space-y-2 text-left">
          {OFFLINE_TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="font-medium text-white">{tool.name}</div>
              <div className="text-sm text-gray-400">{tool.description}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
