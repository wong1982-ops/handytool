'use client'

import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import type { Framework } from './types'
import { VIEWPORT_PRESETS } from './types'

interface LivePreviewProps {
  code: string
  framework: Framework
  viewportWidth: number
  background: 'white' | 'dark' | 'checker'
  onViewportChange: (width: number) => void
  onBackgroundChange: (bg: 'white' | 'dark' | 'checker') => void
}

function buildSrcDoc(code: string, framework: Framework, background: 'white' | 'dark' | 'checker'): string {
  const bgStyle =
    background === 'white'
      ? 'background: #ffffff;'
      : background === 'dark'
        ? 'background: #0d1117;'
        : `background-color: #e0e0e0; background-image: linear-gradient(45deg, #c0c0c0 25%, transparent 25%), linear-gradient(-45deg, #c0c0c0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #c0c0c0 75%), linear-gradient(-45deg, transparent 75%, #c0c0c0 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px;`

  const errorScript = `
    window.onerror = function(msg, src, lineno, colno, err) {
      document.getElementById('__preview_error').style.display = 'flex';
      document.getElementById('__preview_error_msg').textContent = msg || 'Unknown error';
      return true;
    };
  `

  const errorOverlay = `
    <div id="__preview_error" style="display:none;position:fixed;inset:0;background:rgba(220,38,38,0.12);backdrop-filter:blur(4px);z-index:9999;align-items:center;justify-content:center;flex-direction:column;gap:8px;padding:24px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#f87171" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
      <span style="color:#f87171;font-weight:600;font-family:system-ui,sans-serif;font-size:14px;">Preview error</span>
      <span id="__preview_error_msg" style="color:#fca5a5;font-family:monospace;font-size:12px;text-align:center;max-width:400px;word-break:break-word;"></span>
    </div>
  `

  if (framework === 'react') {
    // Extract the component name for mounting
    const componentNameMatch = code.match(/export\s+default\s+function\s+(\w+)/)
      || code.match(/export\s+default\s+(\w+)/)
      || code.match(/function\s+(\w+)\s*\(/)
      || code.match(/const\s+(\w+)\s*=/)

    const componentName = componentNameMatch?.[1] || 'App'

    // Strip export default so we can reference the component by name
    const strippedCode = code
      .replace(/^export\s+default\s+function\s+(\w+)/, 'function $1')
      .replace(/^export\s+default\s+(\w+)\s*;?\s*$/, '')
      .replace(/export\s+default\s+function\s+(\w+)/, 'function $1')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; ${bgStyle} }
    #root { padding: 16px; }
  </style>
</head>
<body>
  ${errorOverlay}
  <div id="root"></div>
  <script>
    ${errorScript}
  </script>
  <script type="text/babel" data-presets="react">
    ${strippedCode}
    const __Root = typeof ${componentName} !== 'undefined' ? ${componentName} : (() => React.createElement('div', null, 'No component exported'));
    const __container = document.getElementById('root');
    const __reactRoot = ReactDOM.createRoot(__container);
    __reactRoot.render(React.createElement(__Root));
  </script>
</body>
</html>`
  }

  if (framework === 'vue') {
    // Extract the SFC sections
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/)
    const scriptMatch = code.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/)
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)

    const templateContent = templateMatch?.[1]?.trim() || '<div>No template</div>'
    const scriptContent = scriptMatch?.[1]?.trim() || ''
    const styleContent = styleMatch?.[1]?.trim() || ''

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; ${bgStyle} }
    #app { padding: 16px; }
    ${styleContent}
  </style>
</head>
<body>
  ${errorOverlay}
  <div id="app">
    ${templateContent}
  </div>
  <script>
    ${errorScript}
    try {
      const { createApp, ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
      ${scriptContent}
      createApp({
        setup() {
          ${scriptContent}
          return {};
        }
      }).mount('#app');
    } catch(e) {
      document.getElementById('__preview_error').style.display = 'flex';
      document.getElementById('__preview_error_msg').textContent = e.message || 'Vue mount error';
    }
  </script>
</body>
</html>`
  }

  if (framework === 'svelte') {
    // Svelte code from Gemini is expected to be compiled-to-vanilla or plain HTML+JS
    // We render it similarly to HTML but attempt a basic extraction
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    const htmlContent = code
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .trim()

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; ${bgStyle} }
    body { padding: 16px; }
    ${styleMatch?.[1] ?? ''}
  </style>
</head>
<body>
  ${errorOverlay}
  ${htmlContent}
  <script>
    ${errorScript}
    try {
      ${scriptMatch?.[1] ?? ''}
    } catch(e) {
      document.getElementById('__preview_error').style.display = 'flex';
      document.getElementById('__preview_error_msg').textContent = e.message || 'Script error';
    }
  </script>
</body>
</html>`
  }

  // HTML framework — render as-is, but inject Tailwind + error overlay
  const hasHtmlTag = /<html[\s>]/i.test(code)

  if (hasHtmlTag) {
    // Full HTML document — inject Tailwind and error handling before </head>
    return code
      .replace(
        /<\/head>/i,
        `  <script src="https://cdn.tailwindcss.com"></script>\n</head>`,
      )
      .replace(
        /<body([^>]*)>/i,
        `<body$1>\n  ${errorOverlay}\n  <script>${errorScript}<\/script>`,
      )
  }

  // Partial HTML snippet
  const scriptMatch2 = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  const styleMatch2 = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  const bodyContent = code
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .trim()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; ${bgStyle} }
    body { padding: 16px; }
    ${styleMatch2?.[1] ?? ''}
  </style>
</head>
<body>
  ${errorOverlay}
  ${bodyContent}
  <script>
    ${errorScript}
    try {
      ${scriptMatch2?.[1] ?? ''}
    } catch(e) {
      document.getElementById('__preview_error').style.display = 'flex';
      document.getElementById('__preview_error_msg').textContent = e.message || 'Script error';
    }
  </script>
</body>
</html>`
}

// Background toggle button icons
function BgIcon({ type }: { type: 'white' | 'dark' | 'checker' }) {
  if (type === 'white') {
    return (
      <span
        className="block w-4 h-4 rounded border border-[#2a3444]"
        style={{ background: '#ffffff' }}
        aria-hidden="true"
      />
    )
  }
  if (type === 'dark') {
    return (
      <span
        className="block w-4 h-4 rounded border border-[#2a3444]"
        style={{ background: '#0d1117' }}
        aria-hidden="true"
      />
    )
  }
  // checker
  return (
    <span
      className="block w-4 h-4 rounded border border-[#2a3444]"
      style={{
        backgroundImage:
          'linear-gradient(45deg, #aaa 25%, transparent 25%), linear-gradient(-45deg, #aaa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #aaa 75%), linear-gradient(-45deg, transparent 75%, #aaa 75%)',
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        backgroundColor: '#e0e0e0',
      }}
      aria-hidden="true"
    />
  )
}

export default function LivePreview({
  code,
  framework,
  viewportWidth,
  background,
  onViewportChange,
  onBackgroundChange,
}: LivePreviewProps) {
  const [debouncedCode, setDebouncedCode] = useState(code)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce code changes by 500ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedCode(code)
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [code])

  const srcDoc = useMemo(
    () => buildSrcDoc(debouncedCode, framework, background),
    [debouncedCode, framework, background],
  )

  const handleViewportPreset = useCallback(
    (width: number) => {
      onViewportChange(width)
    },
    [onViewportChange],
  )

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2631] shrink-0">
        {/* Viewport preset buttons */}
        <div className="flex items-center gap-1">
          {VIEWPORT_PRESETS.map((preset) => (
            <button
              key={preset.width}
              type="button"
              onClick={() => handleViewportPreset(preset.width)}
              className={[
                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors min-h-[32px]',
                viewportWidth === preset.width
                  ? 'bg-[#1e2631] text-white'
                  : 'text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#161d27]',
              ].join(' ')}
              aria-label={`${preset.label} viewport (${preset.width}px)`}
              aria-pressed={viewportWidth === preset.width}
            >
              <span className="hidden sm:inline">{preset.label}</span>
              <span className="text-[10px] text-[#4b5563]">{preset.width}</span>
            </button>
          ))}
          <span className="ml-2 text-[#4b5563] text-xs tabular-nums" aria-live="polite">
            {viewportWidth}px
          </span>
        </div>

        {/* Background toggle buttons */}
        <div className="flex items-center gap-1" role="group" aria-label="Preview background">
          {(['white', 'dark', 'checker'] as const).map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => onBackgroundChange(bg)}
              className={[
                'flex items-center justify-center w-8 h-8 rounded transition-colors min-h-[32px]',
                background === bg
                  ? 'bg-[#1e2631] ring-1 ring-[#3d6af2]'
                  : 'hover:bg-[#161d27]',
              ].join(' ')}
              aria-label={`${bg} background`}
              aria-pressed={background === bg}
            >
              <BgIcon type={bg} />
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <div
          className="relative h-full transition-all duration-200"
          style={{
            width: '100%',
            maxWidth: viewportWidth,
            minHeight: '200px',
          }}
        >
          {code.trim() === '' ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-[#4b5563]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                />
              </svg>
              <span className="text-sm font-medium">Preview will appear here</span>
              <span className="text-xs text-[#374151]">Generate or write a component to see it rendered</span>
            </div>
          ) : (
            <iframe
              key={`${framework}-${background}`}
              srcDoc={srcDoc}
              sandbox="allow-scripts"
              title={`Live preview — ${framework}`}
              className="w-full border-0 rounded-lg"
              style={{ height: '100%', minHeight: '400px' }}
              aria-label={`Rendered ${framework} component preview`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
