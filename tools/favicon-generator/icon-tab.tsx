'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaviconConfig } from './types'
import { BUNDLED_ICONS, ICON_CATEGORIES, BundledIcon } from './icon-data'
import StyleControls from './style-controls'

interface IconTabProps {
  config: FaviconConfig
  onConfigChange: (updates: Partial<FaviconConfig>) => void
}

interface IconifyResult {
  name: string
  category: string
  svg: string
}

export default function IconTab({ config, onConfigChange }: IconTabProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [iconifyResults, setIconifyResults] = useState<IconifyResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch from Iconify API when debounced search changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setIconifyResults([])
      return
    }

    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsSearching(true)

    fetch(
      `https://api.iconify.design/search?query=${encodeURIComponent(debouncedSearch)}&limit=40`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.icons || !Array.isArray(data.icons)) {
          setIconifyResults([])
          return
        }

        // data.icons is an array of strings like "mdi:home"
        // We need to fetch the actual SVGs
        const iconNames = data.icons.slice(0, 40) as string[]
        return Promise.all(
          iconNames.map(async (iconId: string) => {
            try {
              const [prefix, name] = iconId.split(':')
              const svgRes = await fetch(
                `https://api.iconify.design/${prefix}/${name}.svg?height=24`,
                { signal: controller.signal },
              )
              if (!svgRes.ok) return null
              const svg = await svgRes.text()
              return { name, category: 'Iconify', svg } as IconifyResult
            } catch {
              return null
            }
          }),
        )
      })
      .then((results) => {
        if (results) {
          setIconifyResults(results.filter(Boolean) as IconifyResult[])
        }
      })
      .catch(() => {
        // Network error or aborted — just show bundled icons
        setIconifyResults([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false)
      })

    return () => controller.abort()
  }, [debouncedSearch])

  // Filter bundled icons
  const filteredBundled = useMemo(() => {
    let icons = BUNDLED_ICONS
    if (activeCategory !== 'All') {
      icons = icons.filter((i) => i.category === activeCategory)
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      icons = icons.filter((i) => i.name.toLowerCase().includes(q))
    }
    return icons
  }, [activeCategory, debouncedSearch])

  // Combine: bundled first, then iconify (deduplicated)
  const allIcons = useMemo(() => {
    const bundledNames = new Set(filteredBundled.map((i) => i.name))
    const uniqueIconify = iconifyResults.filter(
      (i) => !bundledNames.has(i.name),
    )
    return [...filteredBundled, ...uniqueIconify]
  }, [filteredBundled, iconifyResults])

  const handleSelect = useCallback(
    (icon: BundledIcon | IconifyResult) => {
      onConfigChange({ mode: 'icon', iconSvg: icon.svg })
    },
    [onConfigChange],
  )

  const isSelected = (icon: BundledIcon | IconifyResult) => {
    return config.iconSvg === icon.svg
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[var(--tk-color-primary-500,#3D6AF2)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500,#3D6AF2)]/20 min-h-[44px]"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--tk-color-primary-500,#3D6AF2)]" />
          </div>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {ICON_CATEGORIES.map((cat) => {
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                active
                  ? 'bg-[var(--tk-color-primary-500,#3D6AF2)] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-pressed={active}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Icon grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {allIcons.map((icon, idx) => {
          const selected = isSelected(icon)
          return (
            <button
              key={`${icon.name}-${idx}`}
              type="button"
              onClick={() => handleSelect(icon)}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors min-h-[60px] ${
                selected
                  ? 'border-2 border-[var(--tk-color-primary-500,#3D6AF2)] bg-[var(--tk-color-primary-500,#3D6AF2)]/5'
                  : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              aria-pressed={selected}
              title={icon.name}
            >
              <span
                className="w-6 h-6 text-gray-700 dark:text-gray-300 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full text-center leading-tight">
                {icon.name}
              </span>
            </button>
          )
        })}
        {allIcons.length === 0 && !isSearching && (
          <div className="col-span-full py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No icons found
          </div>
        )}
      </div>

      {/* Style controls (no font options for icons) */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <StyleControls
          config={config}
          onConfigChange={(updates) =>
            onConfigChange({ mode: 'icon', ...updates })
          }
          showFontOptions={false}
        />
      </div>
    </div>
  )
}
