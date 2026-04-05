export type WidgetSize = 'small' | 'medium' | 'large'

export interface DashboardWidget {
  id: string
  toolSlug: string
  size: WidgetSize
  order: number
}

export interface ToolActivity {
  toolSlug: string
  lastUsed: string | null
  usageCount: number
}

export const MAX_WIDGETS = 12
