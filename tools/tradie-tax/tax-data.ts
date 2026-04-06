import type { TaxBracket, TaxCategory } from './types'

/** NZ income tax brackets 2025/26 */
export const NZ_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 14_000, rate: 0.105, label: '$0 – $14,000' },
  { min: 14_000, max: 48_000, rate: 0.175, label: '$14,001 – $48,000' },
  { min: 48_000, max: 70_000, rate: 0.30, label: '$48,001 – $70,000' },
  { min: 70_000, max: 180_000, rate: 0.33, label: '$70,001 – $180,000' },
  { min: 180_000, max: null, rate: 0.39, label: '$180,001+' },
]

/** ACC earner levy rate (per $1 of liable earnings) */
export const ACC_EARNER_LEVY_RATE = 0.016

/** NZ GST rate */
export const GST_RATE = 0.15

/** Expense category definitions */
export interface CategoryInfo {
  label: string
  icon: string
  color: string
}

export const EXPENSE_CATEGORIES: Record<TaxCategory, CategoryInfo> = {
  income: { label: 'Income', icon: '💰', color: '#22c55e' },
  vehicle: { label: 'Vehicle', icon: '🚗', color: '#3b82f6' },
  tools: { label: 'Tools & Equipment', icon: '🔧', color: '#f59e0b' },
  materials: { label: 'Materials', icon: '📦', color: '#8b5cf6' },
  subcontractors: { label: 'Subcontractors', icon: '👷', color: '#ec4899' },
  insurance: { label: 'Insurance', icon: '🛡️', color: '#06b6d4' },
  'phone-internet': { label: 'Phone & Internet', icon: '📱', color: '#14b8a6' },
  accounting: { label: 'Accounting', icon: '📊', color: '#6366f1' },
  ppe: { label: 'PPE & Safety', icon: '🦺', color: '#ef4444' },
  travel: { label: 'Travel', icon: '✈️', color: '#f97316' },
  'other-deduction': { label: 'Other Deduction', icon: '📝', color: '#64748b' },
}
