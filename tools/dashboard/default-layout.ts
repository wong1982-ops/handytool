import type { DashboardWidget } from './types'

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w-1', toolSlug: 'json-converter', size: 'medium', order: 0 },
  { id: 'w-2', toolSlug: 'image-editor', size: 'medium', order: 1 },
  { id: 'w-3', toolSlug: 'story-studio', size: 'medium', order: 2 },
  { id: 'w-4', toolSlug: 'color-palette', size: 'small', order: 3 },
  { id: 'w-5', toolSlug: 'speedtest', size: 'small', order: 4 },
  { id: 'w-6', toolSlug: 'mood-board', size: 'medium', order: 5 },
]
