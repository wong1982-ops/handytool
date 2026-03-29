// admin/lib/ai-usage.ts

/* ---------- Tool category mapping ---------- */

export const TOOL_CATEGORIES: Record<string, string> = {
  'component-lab': 'Component Lab',
  'ecard-ai': 'E-Card Generator',
  'favicon': 'Favicon Generator',
  'font-generator': 'Font Generator',
  'id-photo': 'ID Photo',
  'image-editor': 'Image Editor',
  'logo-generator': 'Logo Generator',
  'mood-board': 'Mood Board',
  'music-studio': 'Music Studio',
  'palette': 'Color Palette',
  'sketch-to-art': 'Sketch to Art',
  'story': 'Story Video',
  'tax-manager': 'Tax Manager',
  'vblog': 'VBlog Studio',
}

// Sorted longest-first so "image-editor" matches before "image"
const SORTED_PREFIXES = Object.keys(TOOL_CATEGORIES).sort((a, b) => b.length - a.length)

/** Extract tool category from a tool_id like "image-editor-inpaint" → "image-editor" */
export function getToolCategory(toolId: string): string {
  for (const prefix of SORTED_PREFIXES) {
    if (toolId === prefix || toolId.startsWith(prefix + '-')) {
      return prefix
    }
  }
  return toolId
}

/** Get display name for a tool_id */
export function getToolDisplayName(toolId: string): string {
  const category = getToolCategory(toolId)
  return TOOL_CATEGORIES[category] ?? toolId
}

/** Extract operation name from tool_id: "image-editor-inpaint" → "inpaint" */
export function getOperationName(toolId: string): string {
  const category = getToolCategory(toolId)
  if (toolId === category) return 'default'
  return toolId.slice(category.length + 1) || 'default'
}

/* ---------- Date helpers ---------- */

export function getDateRange(preset: string, from?: string, to?: string): { from: string; to: string } {
  if (from && to) {
    return { from: new Date(from).toISOString(), to: new Date(to + 'T23:59:59.999Z').toISOString() }
  }
  const now = new Date()
  const days = parseInt(preset, 10) || 30
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return { from: start.toISOString(), to: now.toISOString() }
}

export function getPreviousPeriodRange(from: string, to: string): { from: string; to: string } {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const durationMs = toDate.getTime() - fromDate.getTime()
  const prevTo = new Date(fromDate.getTime())
  const prevFrom = new Date(fromDate.getTime() - durationMs)
  return { from: prevFrom.toISOString(), to: prevTo.toISOString() }
}

/* ---------- Shared types ---------- */

export interface UsageSummary {
  total_calls: number
  total_credits: number
  unique_users: number
  avg_credits_per_call: number
}

export interface DailyUsageRow {
  date: string
  call_count: number
  total_credits: number
}

export interface ToolUsageRow {
  tool_id: string
  call_count: number
  total_credits: number
}

export interface TopUserRow {
  user_id: string
  email: string
  display_name: string | null
  call_count: number
  total_credits: number
  most_used_tool: string
  last_active: string
}

export interface UserTransactionRow {
  id: string
  tool_id: string
  amount: number
  description: string | null
  created_at: string
}
