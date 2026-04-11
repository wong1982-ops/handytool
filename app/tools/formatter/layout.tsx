import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Formatter — Format, Minify, Validate, Convert & Diff 12 Formats | Toolk1t',
  description:
    'Free online formatter for JSON, XML, YAML, SQL, HTML, CSS, JavaScript, TypeScript, Markdown, GraphQL, TOML and INI. Format, minify, validate, convert between formats, and diff side-by-side. Privacy-first — your content is never stored.',
  keywords: [
    'formatter', 'json formatter', 'xml formatter', 'yaml formatter',
    'sql formatter', 'html formatter', 'css formatter', 'javascript formatter',
    'minify', 'validate', 'diff', 'prettier', '格式化',
  ],
  openGraph: {
    title: 'Formatter — All-in-One Code & Data Formatter',
    description: 'Format, minify, validate, convert and diff 12 formats in one tool.',
    type: 'website',
  },
}

export default function FormatterLayout({ children }: { children: React.ReactNode }) {
  return children
}
