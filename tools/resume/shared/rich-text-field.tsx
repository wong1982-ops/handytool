'use client'

import { EditorContent } from '@tiptap/react'
import { useResumeEditor } from './use-resume-editor'
import { EditorToolbar } from './editor-toolbar'
import { AIActionBar } from './ai-action-bar'
import type { JSONContent } from '@tiptap/core'

interface RichTextFieldProps {
  content: JSONContent | null
  placeholder?: string
  module: string
  onUpdate: (content: JSONContent) => void
  label?: string
}

export function RichTextField({ content, placeholder, module, onUpdate, label }: RichTextFieldProps) {
  const editor = useResumeEditor({ content, placeholder, onUpdate })

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
        <AIActionBar editor={editor} module={module} />
      </div>
    </div>
  )
}
