'use client'

import type { NewsItem } from './types'
import { SOURCE_LABELS } from './types'

interface NewsCardProps {
  item: NewsItem
  onClick: (item: NewsItem) => void
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

export function NewsCard({ item, onClick }: NewsCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="news-card w-full text-left p-5 rounded-xl border border-[#1e2631] bg-[#131a23] hover:border-[rgba(61,106,242,0.5)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all cursor-pointer group flex gap-4"
      aria-label={`View details: ${item.title}`}
    >
      {/* Thumbnail */}
      {item.image_url && (
        <div className="hidden sm:block w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#1e2631]">
          <img
            src={item.image_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#3D6AF2] transition-colors line-clamp-2 mb-1">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-[#a6abb5] line-clamp-2 mb-2">
          {item.summary}
        </p>

        {/* Footer: model badge + source + date */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.model_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#3D6AF2]/10 text-[#3D6AF2]">
              {item.model_name}
            </span>
          )}
          {item.provider && !item.model_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300">
              {item.provider}
            </span>
          )}
          <span className="text-xs text-[#70767f]">
            {SOURCE_LABELS[item.source]} · {formatRelativeDate(item.posted_at)}
          </span>
        </div>
      </div>
    </button>
  )
}
