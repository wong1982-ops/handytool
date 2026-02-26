'use client'

import { useState, useCallback, useMemo } from 'react'

interface TreeViewProps {
  data: unknown
  onNodeClick?: (path: string) => void
}

const MAX_DEPTH = 20
const VIRTUALIZE_THRESHOLD = 1000

export function TreeView({ data, onNodeClick }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['$']))

  const toggleNode = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const allPaths = useMemo(() => {
    const paths: string[] = []
    const collect = (value: unknown, path: string, depth: number) => {
      if (depth > MAX_DEPTH) return
      if (typeof value === 'object' && value !== null) {
        paths.push(path)
        const entries = Array.isArray(value)
          ? value.map((v, i) => [`[${i}]`, v] as const)
          : Object.entries(value)
        for (const [key, val] of entries) {
          collect(val, `${path}.${key}`, depth + 1)
        }
      }
    }
    collect(data, '$', 0)
    return paths
  }, [data])

  const expandAll = useCallback(() => {
    setExpanded(new Set(allPaths))
  }, [allPaths])

  const collapseAll = useCallback(() => {
    setExpanded(new Set())
  }, [])

  if (data === undefined || data === null) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm p-8">
        No data to display. Paste valid JSON, YAML, or XML in the input panel.
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          onClick={expandAll}
          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          Collapse All
        </button>
        {allPaths.length > VIRTUALIZE_THRESHOLD && (
          <span className="text-[10px] text-slate-400 ml-auto">
            {allPaths.length} nodes
          </span>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed">
        <TreeNode
          keyName="root"
          value={data}
          path="$"
          depth={0}
          expanded={expanded}
          onToggle={toggleNode}
          onNodeClick={onNodeClick}
          isLast
        />
      </div>
    </div>
  )
}

interface TreeNodeProps {
  keyName: string
  value: unknown
  path: string
  depth: number
  expanded: Set<string>
  onToggle: (path: string) => void
  onNodeClick?: (path: string) => void
  isLast: boolean
}

function TreeNode({ keyName, value, path, depth, expanded, onToggle, onNodeClick, isLast }: TreeNodeProps) {
  if (depth > MAX_DEPTH) {
    return (
      <div className="flex items-center" style={{ paddingLeft: depth * 20 }}>
        <span className="text-slate-400 italic">... max depth reached</span>
      </div>
    )
  }

  const isObject = typeof value === 'object' && value !== null
  const isArray = Array.isArray(value)
  const isExpanded = expanded.has(path)

  if (!isObject) {
    return (
      <div
        className="flex items-start gap-1.5 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-1 -mx-1 cursor-default group"
        style={{ paddingLeft: depth * 20 }}
        onClick={() => onNodeClick?.(path)}
        role="treeitem"
        aria-selected={false}
      >
        <span className="w-4 shrink-0" />
        <span className="text-violet-600 dark:text-violet-400">{keyName}</span>
        <span className="text-slate-400">:</span>
        <ValueDisplay value={value} />
        {!isLast && <span className="text-slate-400">,</span>}
      </div>
    )
  }

  const entries = isArray
    ? value.map((v, i) => [`[${i}]`, v] as const)
    : Object.entries(value)
  const count = entries.length
  const openBracket = isArray ? '[' : '{'
  const closeBracket = isArray ? ']' : '}'
  const preview = getCollapsedPreview(value, isArray)

  return (
    <div role="treeitem" aria-expanded={isExpanded}>
      {/* Header line */}
      <div
        className="flex items-start gap-1.5 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-1 -mx-1 cursor-pointer select-none group"
        style={{ paddingLeft: depth * 20 }}
        onClick={() => onToggle(path)}
      >
        <span className="w-4 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-center leading-none pt-[3px]">
          {isExpanded ? '\u25BC' : '\u25B6'}
        </span>
        {depth > 0 && (
          <>
            <span className="text-violet-600 dark:text-violet-400">{keyName}</span>
            <span className="text-slate-400">:</span>
          </>
        )}
        {isExpanded ? (
          <span className="text-slate-500 dark:text-slate-400">{openBracket}</span>
        ) : (
          <>
            <span className="text-slate-500 dark:text-slate-400">{openBracket}</span>
            <span className="text-slate-400 dark:text-slate-500 truncate max-w-[300px]">{preview}</span>
            <span className="text-slate-500 dark:text-slate-400">{closeBracket}</span>
            {!isLast && <span className="text-slate-400">,</span>}
          </>
        )}
      </div>

      {/* Children */}
      {isExpanded && (
        <>
          {entries.map(([key, val], index) => (
            <TreeNode
              key={`${path}.${key}`}
              keyName={String(key)}
              value={val}
              path={`${path}.${key}`}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
              isLast={index === count - 1}
            />
          ))}
          {/* Closing bracket */}
          <div
            className="py-0.5 px-1 -mx-1"
            style={{ paddingLeft: depth * 20 }}
          >
            <span className="text-slate-500 dark:text-slate-400 ml-4">{closeBracket}</span>
            {!isLast && <span className="text-slate-400">,</span>}
          </div>
        </>
      )}
    </div>
  )
}

function ValueDisplay({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-slate-400 dark:text-slate-500 italic">null</span>
  }
  if (value === undefined) {
    return <span className="text-slate-400 dark:text-slate-500 italic">undefined</span>
  }
  if (typeof value === 'string') {
    const display = value.length > 100 ? `${value.slice(0, 100)}...` : value
    return <span className="text-emerald-600 dark:text-emerald-400">&quot;{display}&quot;</span>
  }
  if (typeof value === 'number') {
    return <span className="text-blue-600 dark:text-blue-400">{String(value)}</span>
  }
  if (typeof value === 'boolean') {
    return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>
  }
  return <span className="text-slate-600 dark:text-slate-300">{String(value)}</span>
}

function getCollapsedPreview(value: unknown, isArray: boolean): string {
  if (isArray) {
    const arr = value as unknown[]
    return `${arr.length} item${arr.length !== 1 ? 's' : ''}`
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj)
  if (keys.length === 0) return ''
  const first = keys.slice(0, 3)
  const previews = first.map((k) => {
    const v = obj[k]
    if (typeof v === 'string') return `${k}: "${v.length > 15 ? v.slice(0, 15) + '...' : v}"`
    if (typeof v === 'number' || typeof v === 'boolean') return `${k}: ${v}`
    if (v === null) return `${k}: null`
    if (Array.isArray(v)) return `${k}: [${v.length}]`
    if (typeof v === 'object') return `${k}: {...}`
    return `${k}: ${String(v)}`
  })
  const suffix = keys.length > 3 ? ', ...' : ''
  return `${previews.join(', ')}${suffix}`
}
