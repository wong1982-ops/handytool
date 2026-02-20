export type ToolType = 'move' | 'hand' | 'crop' | 'brush' | 'eraser' | 'text' | 'select'

interface EditorToolbarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  fgColor: string
  bgColor: string
  onSwapColors: () => void
}

const TOOLS: { id: ToolType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'move',
    label: 'Move Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    id: 'hand',
    label: 'Hand Tool (Pan)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v3c0 3.037 2.462 5.5 5.5 5.5h2.718a3 3 0 002.01-.77l4.244-3.811A1.5 1.5 0 1017.5 13H16m-6-1.5V3.5a1.5 1.5 0 113 0v6m0 0V3a1.5 1.5 0 113 0v8.5" />
      </svg>
    ),
  },
  {
    id: 'crop',
    label: 'Crop Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0h12M7 4L3 4m14 0v12m0 0H9m12 0h-4M7 20v-4" />
      </svg>
    ),
  },
  {
    id: 'brush',
    label: 'Brush Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'eraser',
    label: 'Eraser Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    id: 'text',
    label: 'Text Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m4-14v14m4-14v14" />
      </svg>
    ),
  },
  {
    id: 'select',
    label: 'Selection Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zM4 13a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zM14 5a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1zM14 13a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1zM4 9a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1zM14 9a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
      </svg>
    ),
  },
]

export function EditorToolbar({ activeTool, onToolChange, fgColor, bgColor, onSwapColors }: EditorToolbarProps) {
  return (
    <aside className="w-14 border-r border-slate-700 dark:border-slate-700 bg-[#101622] flex flex-col items-center py-4 gap-3 shrink-0">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          aria-label={tool.label}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === tool.id
              ? 'bg-[var(--tk-color-primary-500)] text-white'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {tool.icon}
        </button>
      ))}

      {/* Foreground / background colors */}
      <button
        type="button"
        className="mt-auto relative w-11 h-11 cursor-pointer bg-transparent border-0 p-0"
        onClick={onSwapColors}
        title="Swap colors"
        aria-label="Swap foreground and background colors"
      >
        <span
          className="absolute top-0 left-0 w-6 h-6 rounded-sm border-2 border-slate-500 z-10 pointer-events-none"
          style={{ backgroundColor: fgColor }}
        />
        <span
          className="absolute bottom-0 right-0 w-6 h-6 rounded-sm border-2 border-slate-500 pointer-events-none"
          style={{ backgroundColor: bgColor }}
        />
        <svg className="absolute top-[1px] right-[1px] w-3 h-3 text-slate-400 z-20 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
    </aside>
  )
}
