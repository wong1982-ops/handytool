'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import type { SavedComponent, Framework } from './types'
import { FRAMEWORKS } from './types'

interface ComponentViewerProps {
  component: SavedComponent
}

function buildPreviewDoc(html: string): string {
  const hasHtmlTag = /<html[\s>]/i.test(html)
  if (hasHtmlTag) {
    return html.replace(
      /<\/head>/i,
      `  <script src="https://cdn.tailwindcss.com"><\/script>\n</head>`,
    )
  }

  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  const bodyContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .trim()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; background: #ffffff; }
    body { padding: 16px; }
    ${styleMatch?.[1] ?? ''}
  </style>
</head>
<body>
  ${bodyContent}
  <script>
    try { ${scriptMatch?.[1] ?? ''} } catch(e) { console.error(e); }
  </script>
</body>
</html>`
}

function getCodeForFramework(component: SavedComponent, fw: Framework): string {
  switch (fw) {
    case 'react':
      return component.codeReact
    case 'vue':
      return component.codeVue
    case 'svelte':
      return component.codeSvelte
    case 'html':
      return component.codeHtml
  }
}

export default function ComponentViewer({ component }: ComponentViewerProps) {
  const [activeTab, setActiveTab] = useState<Framework>('react')
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const previewSrcDoc = useMemo(
    () => buildPreviewDoc(component.codeHtml || component.codeReact || ''),
    [component.codeHtml, component.codeReact],
  )

  const currentCode = useMemo(
    () => getCodeForFramework(component, activeTab),
    [component, activeTab],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)

      // Increment copy count (fire and forget)
      fetch(`/api/v1/component-lab/${component.slug}`, { method: 'POST' }).catch(() => {})
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [currentCode, component.slug])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{component.name}</h1>
          {component.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {component.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#1e2631] text-[#a6abb5]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[#70767f]">
              {new Date(component.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#70767f]">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m0 0a2.625 2.625 0 0 1 5.25 0" />
              </svg>
              {component.copyCount} copies
            </span>
          </div>
        </div>

        <a
          href={`/tools/component-lab?fork=${component.slug}`}
          className="inline-flex items-center justify-center gap-2 px-5 min-h-[44px] rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold text-sm cursor-pointer shrink-0"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Open in Editor
        </a>
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-[#1e2631] overflow-hidden">
        <div className="px-3 py-2 border-b border-[#1e2631] bg-[#131a23]">
          <span className="text-xs font-medium text-[#a6abb5]">Live Preview</span>
        </div>
        <div className="bg-white">
          <iframe
            srcDoc={previewSrcDoc}
            sandbox="allow-scripts"
            title={`Preview of ${component.name}`}
            className="w-full border-0"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {/* Code tabs */}
      <div className="rounded-xl border border-[#1e2631] overflow-hidden bg-[#131a23]">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2631]">
          <div className="flex items-center gap-1">
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                type="button"
                onClick={() => setActiveTab(fw.id)}
                className={`px-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === fw.id
                    ? 'bg-[#3D6AF2] text-white'
                    : 'text-[#a6abb5] hover:text-white hover:bg-[#1e2631]'
                }`}
                aria-pressed={activeTab === fw.id}
              >
                {fw.label}
              </button>
            ))}
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-sm font-medium text-[#a6abb5] hover:text-white hover:bg-[#1e2631] transition-colors cursor-pointer"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m0 0a2.625 2.625 0 0 1 5.25 0" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code block */}
        <div className="overflow-auto max-h-[500px]">
          <pre className="p-4 text-sm text-[#a6abb5] font-mono leading-relaxed">
            <code>{currentCode || '// No code available for this framework'}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
