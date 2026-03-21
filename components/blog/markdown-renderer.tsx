'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.min.css'
import type { Components } from 'react-markdown'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const components: Components = {
  h1: ({ children, ...props }) => {
    const text = String(children)
    const id = slugify(text)
    return <h1 id={id} className="text-3xl font-bold text-slate-900 dark:text-white mt-10 mb-4 scroll-mt-24" {...props}>{children}</h1>
  },
  h2: ({ children, ...props }) => {
    const text = String(children)
    const id = slugify(text)
    return <h2 id={id} className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 scroll-mt-24" {...props}>{children}</h2>
  },
  h3: ({ children, ...props }) => {
    const text = String(children)
    const id = slugify(text)
    return <h3 id={id} className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2 scroll-mt-24" {...props}>{children}</h3>
  },
  h4: ({ children, ...props }) => {
    const text = String(children)
    const id = slugify(text)
    return <h4 id={id} className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2 scroll-mt-24" {...props}>{children}</h4>
  },
  p: ({ children, ...props }) => (
    <p className="text-slate-700 dark:text-slate-300 leading-7 mb-4" {...props}>{children}</p>
  ),
  a: ({ children, href, ...props }) => (
    <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined} {...props}>{children}</a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 mb-4 pl-2" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 mb-4 pl-2" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7" {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-r-lg" {...props}>{children}</blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className
    if (isInline) {
      return <code className="bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
    }
    return <code className={`${className ?? ''} text-sm`} {...props}>{children}</code>
  },
  pre: ({ children, ...props }) => (
    <pre className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 overflow-x-auto mb-4 text-sm" {...props}>{children}</pre>
  ),
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} className="rounded-xl max-w-full h-auto my-4" loading="lazy" {...props} />
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border-collapse text-sm" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-left font-semibold text-slate-900 dark:text-white" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300" {...props}>{children}</td>
  ),
  hr: () => <hr className="my-8 border-slate-200 dark:border-slate-800" />,
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
