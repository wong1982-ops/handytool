'use client'

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import type { JSONContent } from '@tiptap/core'

interface UseResumeEditorOptions {
  content: JSONContent | null
  placeholder?: string
  onUpdate: (content: JSONContent) => void
}

export function useResumeEditor({ content, placeholder, onUpdate }: UseResumeEditorOptions) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start typing...',
      }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3',
      },
    },
  })

  return editor
}
