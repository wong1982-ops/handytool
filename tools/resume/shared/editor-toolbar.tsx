'use client'

import type { Editor } from '@tiptap/core'

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const items: {
    label: string
    icon: string
    action: () => void
    isActive?: boolean
  }[] = [
    {
      label: 'Bold',
      icon: 'B',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      label: 'Italic',
      icon: 'I',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      label: 'Underline',
      icon: 'U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      label: 'Strikethrough',
      icon: 'S',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    {
      label: 'Bullet list',
      icon: '•',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      label: 'Ordered list',
      icon: '1.',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      label: 'Highlight',
      icon: '🖍',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
    },
  ]

  return (
    <div className="flex items-center gap-0.5 border-b border-gray-200 dark:border-gray-700 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg" role="toolbar" aria-label="Text formatting">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors
            ${item.isActive
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          title={item.label}
          aria-label={item.label}
          aria-pressed={item.isActive}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
