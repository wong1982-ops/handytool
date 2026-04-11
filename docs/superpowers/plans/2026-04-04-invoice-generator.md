# Invoice Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free invoice generator tool with studio layout (edit + live preview), multi-currency line items, template saving, invoice history, and client/server PDF export.

**Architecture:** Studio layout (left edit panel 45% + right live preview 55%) following the resume builder pattern (`tools/resume/`). Context + useReducer for state management, localStorage for all users, Supabase for logged-in users. Three visual invoice templates (classic, modern, minimal) with full color/font/label customization.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, html2canvas + jsPDF (client PDF), Supabase (persistence), shadcn/ui components.

**Design spec:** `docs/superpowers/specs/2026-04-04-invoice-generator-design.md`
**HTML mockup:** `designs/invoice-generator/code.html`

---

## File Map

```
app/tools/invoice-generator/
  layout.tsx                      # Metadata, JSON-LD, SEO
  page.tsx                        # Route entry, InvoiceProvider wrapper, studio layout

tools/invoice-generator/
  invoice-types.ts                # All TypeScript interfaces and type unions
  invoice-defaults.ts             # Default labels, empty state factory, currency list
  invoice-reducer.ts              # useReducer actions and reducer function
  invoice-provider.tsx            # React context, localStorage load/save, cloud sync
  invoice-editor.tsx              # Left panel: tab bar + active tab content
  invoice-preview.tsx             # Right panel: A4 frame, zoom controls, theme dispatch

  editors/
    contact-form.tsx              # Reusable contact info form (shared by sender + client)
    sender-editor.tsx             # Sender section with logo upload
    client-editor.tsx             # Client section
    invoice-info-editor.tsx       # Invoice number, dates, payment terms, reference
    line-items-editor.tsx         # Line item cards, add/remove/reorder, summary
    styling-editor.tsx            # Template picker, colors, fonts, logo position, labels
    settings-editor.tsx           # Defaults, tax presets, notes

  themes/
    classic-invoice.tsx           # Clean traditional layout
    modern-invoice.tsx            # Bold headers, accent sidebar
    minimal-invoice.tsx           # Whitespace-forward, light lines

  panels/
    template-panel.tsx            # Save/load/delete templates (inside settings tab)
    history-panel.tsx             # Invoice history list (inside settings tab)

  shared/
    currency-select.tsx           # ISO 4217 currency dropdown
    tax-preset-select.tsx         # Tax dropdown with "Custom %" option
    discount-input.tsx            # Percent/fixed toggle + value input
    pdf-export.ts                 # Client-side PDF generation (html2canvas + jsPDF)
    invoice-calculations.ts       # Line item subtotals, tax, discount, grouped totals
```

---

### Task 1: Types, Defaults & Calculation Utils

**Files:**
- Create: `tools/invoice-generator/invoice-types.ts`
- Create: `tools/invoice-generator/invoice-defaults.ts`
- Create: `tools/invoice-generator/shared/invoice-calculations.ts`

- [ ] **Step 1: Create invoice-types.ts**

```typescript
// tools/invoice-generator/invoice-types.ts

export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  currency: string
  taxPresetId: string | null
  discountType: 'none' | 'percent' | 'fixed'
  discountValue: number
}

export interface TaxPreset {
  id: string
  name: string
  rate: number // 0.15 = 15%
}

export type InvoiceTemplateId = 'classic' | 'modern' | 'minimal'
export type FontFamily = 'system' | 'serif' | 'mono'
export type FontSize = 'sm' | 'md' | 'lg'
export type LogoPosition = 'top-left' | 'top-right' | 'top-center'
export type PaymentTerms = 'net7' | 'net14' | 'net30' | 'net60' | 'net90' | 'custom'

export interface InvoiceTheme {
  templateId: InvoiceTemplateId
  primaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  fontFamily: FontFamily
  fontSize: FontSize
  logoPosition: LogoPosition
}

export interface InvoiceLabels {
  invoice: string
  billTo: string
  from: string
  date: string
  dueDate: string
  description: string
  qty: string
  rate: string
  amount: string
  subtotal: string
  tax: string
  discount: string
  total: string
  notes: string
}

export interface ContactInfo {
  name: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  taxId: string
}

export interface InvoiceState {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  paymentTerms: PaymentTerms
  reference: string
  sender: ContactInfo
  client: ContactInfo
  logo: string
  lineItems: LineItem[]
  taxPresets: TaxPreset[]
  defaultCurrency: string
  notes: string
  theme: InvoiceTheme
  labels: InvoiceLabels
  createdAt: string
  updatedAt: string
}

export interface InvoiceTemplate {
  id: string
  name: string
  sender: ContactInfo
  logo: string
  taxPresets: TaxPreset[]
  defaultCurrency: string
  notes: string
  theme: InvoiceTheme
  labels: InvoiceLabels
  invoicePrefix: string
  createdAt: string
  updatedAt: string
}

// UI state
export type TabId = 'details' | 'items' | 'styling' | 'settings'

export interface EditorState {
  invoice: InvoiceState
  activeTab: TabId
  isDirty: boolean
  templates: InvoiceTemplate[]
}

// Calculation results
export interface CurrencyTotal {
  currency: string
  subtotal: number
  taxBreakdown: { name: string; amount: number }[]
  totalTax: number
  totalDiscount: number
  grandTotal: number
}
```

- [ ] **Step 2: Create invoice-defaults.ts**

```typescript
// tools/invoice-generator/invoice-defaults.ts

import type {
  InvoiceState,
  InvoiceLabels,
  InvoiceTheme,
  ContactInfo,
  TaxPreset,
  InvoiceTemplate,
} from './invoice-types'

export const DEFAULT_LABELS: InvoiceLabels = {
  invoice: 'Invoice',
  billTo: 'Bill To',
  from: 'From',
  date: 'Date',
  dueDate: 'Due Date',
  description: 'Description',
  qty: 'Qty',
  rate: 'Rate',
  amount: 'Amount',
  subtotal: 'Subtotal',
  tax: 'Tax',
  discount: 'Discount',
  total: 'Total',
  notes: 'Notes',
}

export const DEFAULT_THEME: InvoiceTheme = {
  templateId: 'classic',
  primaryColor: '#3D6AF2',
  accentColor: '#32A9D9',
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  fontFamily: 'system',
  fontSize: 'md',
  logoPosition: 'top-left',
}

export const EMPTY_CONTACT: ContactInfo = {
  name: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  taxId: '',
}

export const DEFAULT_TAX_PRESETS: TaxPreset[] = [
  { id: 'gst-15', name: 'GST', rate: 0.15 },
  { id: 'vat-20', name: 'VAT', rate: 0.20 },
]

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function createDefaultInvoice(): InvoiceState {
  const today = todayISO()
  return {
    id: crypto.randomUUID(),
    invoiceNumber: 'INV-0001',
    issueDate: today,
    dueDate: addDays(today, 14),
    paymentTerms: 'net14',
    reference: '',
    sender: { ...EMPTY_CONTACT },
    client: { ...EMPTY_CONTACT },
    logo: '',
    lineItems: [],
    taxPresets: [...DEFAULT_TAX_PRESETS],
    defaultCurrency: 'USD',
    notes: '',
    theme: { ...DEFAULT_THEME },
    labels: { ...DEFAULT_LABELS },
    createdAt: today,
    updatedAt: today,
  }
}

export function createEmptyLineItem(currency: string): import('./invoice-types').LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    rate: 0,
    currency,
    taxPresetId: null,
    discountType: 'none',
    discountValue: 0,
  }
}

export const PAYMENT_TERMS_DAYS: Record<string, number> = {
  net7: 7,
  net14: 14,
  net30: 30,
  net60: 60,
  net90: 90,
}

// ISO 4217 common currencies
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
] as const

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code
}

export const COLOR_PRESETS = [
  { name: 'Blue', primary: '#3D6AF2', accent: '#32A9D9' },
  { name: 'Teal', primary: '#32A9D9', accent: '#10B981' },
  { name: 'Red', primary: '#EF4444', accent: '#F97316' },
  { name: 'Dark', primary: '#1a1a1a', accent: '#333333' },
  { name: 'Mono', primary: '#6B7280', accent: '#9CA3AF' },
] as const
```

- [ ] **Step 3: Create invoice-calculations.ts**

```typescript
// tools/invoice-generator/shared/invoice-calculations.ts

import type { LineItem, TaxPreset, CurrencyTotal } from '../invoice-types'

export function calcLineItemSubtotal(item: LineItem): number {
  return item.quantity * item.rate
}

export function calcLineItemDiscount(item: LineItem): number {
  const subtotal = calcLineItemSubtotal(item)
  if (item.discountType === 'percent') return subtotal * (item.discountValue / 100)
  if (item.discountType === 'fixed') return item.discountValue
  return 0
}

export function calcLineItemTax(item: LineItem, taxPresets: TaxPreset[]): number {
  if (!item.taxPresetId) return 0
  const preset = taxPresets.find(t => t.id === item.taxPresetId)
  if (!preset) return 0
  const afterDiscount = calcLineItemSubtotal(item) - calcLineItemDiscount(item)
  return afterDiscount * preset.rate
}

export function calcLineItemTotal(item: LineItem, taxPresets: TaxPreset[]): number {
  const subtotal = calcLineItemSubtotal(item)
  const discount = calcLineItemDiscount(item)
  const tax = calcLineItemTax(item, taxPresets)
  return subtotal - discount + tax
}

export function calcGroupedTotals(lineItems: LineItem[], taxPresets: TaxPreset[]): CurrencyTotal[] {
  const groups = new Map<string, {
    subtotal: number
    taxMap: Map<string, { name: string; amount: number }>
    totalDiscount: number
  }>()

  for (const item of lineItems) {
    const currency = item.currency
    if (!groups.has(currency)) {
      groups.set(currency, { subtotal: 0, taxMap: new Map(), totalDiscount: 0 })
    }
    const group = groups.get(currency)!

    const subtotal = calcLineItemSubtotal(item)
    const discount = calcLineItemDiscount(item)
    group.subtotal += subtotal
    group.totalDiscount += discount

    if (item.taxPresetId) {
      const preset = taxPresets.find(t => t.id === item.taxPresetId)
      if (preset) {
        const taxAmount = (subtotal - discount) * preset.rate
        const key = preset.id
        const existing = group.taxMap.get(key)
        if (existing) {
          existing.amount += taxAmount
        } else {
          group.taxMap.set(key, { name: `${preset.name} ${Math.round(preset.rate * 100)}%`, amount: taxAmount })
        }
      }
    }
  }

  const results: CurrencyTotal[] = []
  for (const [currency, group] of groups) {
    const taxBreakdown = Array.from(group.taxMap.values())
    const totalTax = taxBreakdown.reduce((sum, t) => sum + t.amount, 0)
    results.push({
      currency,
      subtotal: group.subtotal,
      taxBreakdown,
      totalTax,
      totalDiscount: group.totalDiscount,
      grandTotal: group.subtotal - group.totalDiscount + totalTax,
    })
  }

  return results
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && npx tsc --noEmit --pretty 2>&1 | grep -E "invoice-|error" | head -20`
Expected: No errors in the invoice-generator files.

- [ ] **Step 5: Commit**

```bash
git add tools/invoice-generator/invoice-types.ts tools/invoice-generator/invoice-defaults.ts tools/invoice-generator/shared/invoice-calculations.ts
git commit -m "feat(invoice-generator): add types, defaults, and calculation utils"
```

---

### Task 2: Reducer & State Management

**Files:**
- Create: `tools/invoice-generator/invoice-reducer.ts`

- [ ] **Step 1: Create invoice-reducer.ts**

```typescript
// tools/invoice-generator/invoice-reducer.ts

import type {
  InvoiceState,
  ContactInfo,
  LineItem,
  TaxPreset,
  InvoiceTheme,
  InvoiceLabels,
  TabId,
  EditorState,
  PaymentTerms,
} from './invoice-types'
import { createDefaultInvoice, PAYMENT_TERMS_DAYS } from './invoice-defaults'

export type InvoiceAction =
  // Tab
  | { type: 'SET_TAB'; payload: TabId }
  // Sender / Client
  | { type: 'SET_SENDER'; payload: Partial<ContactInfo> }
  | { type: 'SET_CLIENT'; payload: Partial<ContactInfo> }
  | { type: 'SET_LOGO'; payload: string }
  // Invoice info
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string }
  | { type: 'SET_PAYMENT_TERMS'; payload: PaymentTerms }
  | { type: 'SET_REFERENCE'; payload: string }
  // Line items
  | { type: 'ADD_LINE_ITEM'; payload: LineItem }
  | { type: 'UPDATE_LINE_ITEM'; payload: { id: string; changes: Partial<LineItem> } }
  | { type: 'REMOVE_LINE_ITEM'; payload: string }
  | { type: 'REORDER_LINE_ITEMS'; payload: LineItem[] }
  // Settings
  | { type: 'SET_DEFAULT_CURRENCY'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_TAX_PRESET'; payload: TaxPreset }
  | { type: 'UPDATE_TAX_PRESET'; payload: { id: string; changes: Partial<TaxPreset> } }
  | { type: 'REMOVE_TAX_PRESET'; payload: string }
  // Styling
  | { type: 'SET_THEME'; payload: Partial<InvoiceTheme> }
  | { type: 'SET_LABELS'; payload: Partial<InvoiceLabels> }
  // Full state
  | { type: 'LOAD_INVOICE'; payload: InvoiceState }
  | { type: 'RESET_INVOICE' }

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function createDefaultEditorState(): EditorState {
  return {
    invoice: createDefaultInvoice(),
    activeTab: 'details',
    isDirty: false,
    templates: [],
  }
}

export function invoiceReducer(state: EditorState, action: InvoiceAction): EditorState {
  const now = new Date().toISOString().split('T')[0]

  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload }

    case 'SET_SENDER':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          sender: { ...state.invoice.sender, ...action.payload },
          updatedAt: now,
        },
      }

    case 'SET_CLIENT':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          client: { ...state.invoice.client, ...action.payload },
          updatedAt: now,
        },
      }

    case 'SET_LOGO':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, logo: action.payload, updatedAt: now },
      }

    case 'SET_INVOICE_NUMBER':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, invoiceNumber: action.payload, updatedAt: now },
      }

    case 'SET_ISSUE_DATE': {
      const issueDate = action.payload
      const terms = state.invoice.paymentTerms
      const days = PAYMENT_TERMS_DAYS[terms]
      const dueDate = days ? addDays(issueDate, days) : state.invoice.dueDate
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, issueDate, dueDate, updatedAt: now },
      }
    }

    case 'SET_DUE_DATE':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, dueDate: action.payload, updatedAt: now },
      }

    case 'SET_PAYMENT_TERMS': {
      const terms = action.payload
      const days = PAYMENT_TERMS_DAYS[terms]
      const dueDate = days ? addDays(state.invoice.issueDate, days) : state.invoice.dueDate
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, paymentTerms: terms, dueDate, updatedAt: now },
      }
    }

    case 'SET_REFERENCE':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, reference: action.payload, updatedAt: now },
      }

    case 'ADD_LINE_ITEM':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          lineItems: [...state.invoice.lineItems, action.payload],
          updatedAt: now,
        },
      }

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          lineItems: state.invoice.lineItems.map(item =>
            item.id === action.payload.id ? { ...item, ...action.payload.changes } : item
          ),
          updatedAt: now,
        },
      }

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          lineItems: state.invoice.lineItems.filter(item => item.id !== action.payload),
          updatedAt: now,
        },
      }

    case 'REORDER_LINE_ITEMS':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, lineItems: action.payload, updatedAt: now },
      }

    case 'SET_DEFAULT_CURRENCY':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, defaultCurrency: action.payload, updatedAt: now },
      }

    case 'SET_NOTES':
      return {
        ...state,
        isDirty: true,
        invoice: { ...state.invoice, notes: action.payload, updatedAt: now },
      }

    case 'ADD_TAX_PRESET':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          taxPresets: [...state.invoice.taxPresets, action.payload],
          updatedAt: now,
        },
      }

    case 'UPDATE_TAX_PRESET':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          taxPresets: state.invoice.taxPresets.map(p =>
            p.id === action.payload.id ? { ...p, ...action.payload.changes } : p
          ),
          updatedAt: now,
        },
      }

    case 'REMOVE_TAX_PRESET':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          taxPresets: state.invoice.taxPresets.filter(p => p.id !== action.payload),
          // Also clear taxPresetId from line items referencing this preset
          lineItems: state.invoice.lineItems.map(item =>
            item.taxPresetId === action.payload ? { ...item, taxPresetId: null } : item
          ),
          updatedAt: now,
        },
      }

    case 'SET_THEME':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          theme: { ...state.invoice.theme, ...action.payload },
          updatedAt: now,
        },
      }

    case 'SET_LABELS':
      return {
        ...state,
        isDirty: true,
        invoice: {
          ...state.invoice,
          labels: { ...state.invoice.labels, ...action.payload },
          updatedAt: now,
        },
      }

    case 'LOAD_INVOICE':
      return {
        ...state,
        invoice: action.payload,
        isDirty: false,
      }

    case 'RESET_INVOICE':
      return createDefaultEditorState()

    default:
      return state
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && npx tsc --noEmit --pretty 2>&1 | grep -E "invoice-|error" | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/invoice-reducer.ts
git commit -m "feat(invoice-generator): add reducer with all state actions"
```

---

### Task 3: Context Provider with localStorage Persistence

**Files:**
- Create: `tools/invoice-generator/invoice-provider.tsx`

- [ ] **Step 1: Create invoice-provider.tsx**

```typescript
// tools/invoice-generator/invoice-provider.tsx
'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  invoiceReducer,
  createDefaultEditorState,
  type InvoiceAction,
} from './invoice-reducer'
import type { EditorState, InvoiceState, InvoiceTemplate } from './invoice-types'

// ── Storage keys ────────────────────────────────────────────────

const DRAFT_KEY = 'invoice_draft'
const TEMPLATES_KEY = 'invoice_templates'

// ── localStorage helpers ────────────────────────────────────────

function loadDraft(): InvoiceState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDraft(invoice: InvoiceState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice))
  } catch {
    // QuotaExceededError — silently fail, user sees "storage full" in UI
  }
}

function loadTemplates(): InvoiceTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTemplates(templates: InvoiceTemplate[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  } catch {
    // QuotaExceededError
  }
}

// ── Context ─────────────────────────────────────────────────────

interface InvoiceContextValue {
  state: EditorState
  dispatch: React.Dispatch<InvoiceAction>
  saveTemplate: (name: string) => void
  loadTemplate: (template: InvoiceTemplate) => void
  deleteTemplate: (id: string) => void
  templates: InvoiceTemplate[]
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null)

export function useInvoice() {
  const ctx = useContext(InvoiceContext)
  if (!ctx) throw new Error('useInvoice must be used within InvoiceProvider')
  return ctx
}

// ── Provider ────────────────────────────────────────────────────

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, null, () => {
    const defaultState = createDefaultEditorState()
    if (typeof window === 'undefined') return defaultState
    const saved = loadDraft()
    if (saved) {
      return { ...defaultState, invoice: saved, isDirty: false, templates: loadTemplates() }
    }
    return { ...defaultState, templates: loadTemplates() }
  })

  // Auto-save draft to localStorage on changes
  useEffect(() => {
    if (state.isDirty) {
      saveDraft(state.invoice)
    }
  }, [state.invoice, state.isDirty])

  // Template management
  const saveTemplate = useCallback((name: string) => {
    const { invoice } = state
    const template: InvoiceTemplate = {
      id: crypto.randomUUID(),
      name,
      sender: { ...invoice.sender },
      logo: invoice.logo,
      taxPresets: [...invoice.taxPresets],
      defaultCurrency: invoice.defaultCurrency,
      notes: invoice.notes,
      theme: { ...invoice.theme },
      labels: { ...invoice.labels },
      invoicePrefix: invoice.invoiceNumber.replace(/\d+$/, ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [...state.templates, template]
    saveTemplates(updated)
    // Force re-render with updated templates by dispatching a no-op load
    dispatch({ type: 'LOAD_INVOICE', payload: { ...state.invoice } })
  }, [state])

  const loadTemplate = useCallback((template: InvoiceTemplate) => {
    dispatch({
      type: 'LOAD_INVOICE',
      payload: {
        ...state.invoice,
        sender: { ...template.sender },
        logo: template.logo,
        taxPresets: [...template.taxPresets],
        defaultCurrency: template.defaultCurrency,
        notes: template.notes,
        theme: { ...template.theme },
        labels: { ...template.labels },
        invoiceNumber: template.invoicePrefix + state.invoice.invoiceNumber.replace(/^[^\d]*/, ''),
      },
    })
  }, [state.invoice, dispatch])

  const deleteTemplate = useCallback((id: string) => {
    const updated = state.templates.filter(t => t.id !== id)
    saveTemplates(updated)
    dispatch({ type: 'LOAD_INVOICE', payload: { ...state.invoice } })
  }, [state])

  // Reload templates from localStorage (they may have been updated)
  const templates = typeof window !== 'undefined' ? loadTemplates() : state.templates

  return (
    <InvoiceContext.Provider value={{ state, dispatch, saveTemplate, loadTemplate, deleteTemplate, templates }}>
      {children}
    </InvoiceContext.Provider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && npx tsc --noEmit --pretty 2>&1 | grep -E "invoice-|error" | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/invoice-provider.tsx
git commit -m "feat(invoice-generator): add context provider with localStorage persistence"
```

---

### Task 4: Route Entry, Layout & SEO

**Files:**
- Create: `app/tools/invoice-generator/layout.tsx`
- Create: `app/tools/invoice-generator/page.tsx`

- [ ] **Step 1: Create layout.tsx with metadata and JSON-LD**

```typescript
// app/tools/invoice-generator/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Invoice Generator - Create Professional Invoices',
  description:
    'Create and download professional invoices for free. Multi-currency support, customizable templates, PDF export. Save templates when signed in.',
  alternates: {
    canonical: '/tools/invoice-generator',
  },
  openGraph: {
    title: 'Invoice Generator | Toolk1t',
    description:
      'Free invoice generator with multi-currency, customizable templates, and PDF export.',
    url: '/tools/invoice-generator',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Invoice Generator',
    description:
      'Create professional invoices with multi-currency support, customizable templates, and PDF export. Free online tool.',
    url: 'https://toolk1t.com/tools/invoice-generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: { '@type': 'WebSite', name: 'Toolk1t', url: 'https://toolk1t.com' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolk1t.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://toolk1t.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Invoice Generator' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
```

- [ ] **Step 2: Create page.tsx with studio layout shell**

```tsx
// app/tools/invoice-generator/page.tsx
'use client'

import { useState } from 'react'
import { InvoiceProvider } from '@/tools/invoice-generator/invoice-provider'
import { InvoiceEditor } from '@/tools/invoice-generator/invoice-editor'
import { InvoicePreview } from '@/tools/invoice-generator/invoice-preview'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'

export default function InvoiceGeneratorPage() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <InvoiceProvider>
      <div className="flex flex-col h-[100dvh]">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-[#1e2631] bg-[#131a23] shrink-0">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-lg font-semibold text-white">Invoice Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium bg-[#1e2631] text-[#a6abb5] hover:text-white transition-colors"
              aria-label={showPreview ? 'Show editor' : 'Show preview'}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <FavoriteButton slug="invoice-generator" name="Invoice Generator" />
          </div>
        </header>

        {/* Main content: editor + preview */}
        <div className="flex flex-1 overflow-hidden">
          <div className={`w-full lg:w-[45%] flex flex-col overflow-hidden border-r border-[#1e2631] ${showPreview ? 'max-lg:hidden' : ''}`}>
            <InvoiceEditor />
          </div>
          <div className={`flex-1 min-h-0 ${showPreview ? '' : 'max-lg:hidden'}`}>
            <InvoicePreview />
          </div>
        </div>
      </div>
    </InvoiceProvider>
  )
}
```

- [ ] **Step 3: Create stub InvoiceEditor and InvoicePreview so the page renders**

Create `tools/invoice-generator/invoice-editor.tsx`:
```tsx
'use client'

export function InvoiceEditor() {
  return (
    <div className="flex-1 flex items-center justify-center text-[#70767f]">
      <p className="text-sm">Editor loading...</p>
    </div>
  )
}
```

Create `tools/invoice-generator/invoice-preview.tsx`:
```tsx
'use client'

export function InvoicePreview() {
  return (
    <div className="flex-1 flex items-center justify-center text-[#70767f] bg-[#090f16]">
      <p className="text-sm">Preview loading...</p>
    </div>
  )
}
```

- [ ] **Step 4: Verify the page loads**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev &` then visit `http://localhost:3000/tools/invoice-generator` in the browser to confirm the shell renders.

- [ ] **Step 5: Commit**

```bash
git add app/tools/invoice-generator/ tools/invoice-generator/invoice-editor.tsx tools/invoice-generator/invoice-preview.tsx
git commit -m "feat(invoice-generator): add route, layout, SEO, and studio shell"
```

---

### Task 5: Shared Form Components

**Files:**
- Create: `tools/invoice-generator/editors/contact-form.tsx`
- Create: `tools/invoice-generator/shared/currency-select.tsx`
- Create: `tools/invoice-generator/shared/tax-preset-select.tsx`
- Create: `tools/invoice-generator/shared/discount-input.tsx`

- [ ] **Step 1: Create contact-form.tsx — reusable for sender and client**

```tsx
// tools/invoice-generator/editors/contact-form.tsx
'use client'

import type { ContactInfo } from '../invoice-types'

interface ContactFormProps {
  value: ContactInfo
  onChange: (changes: Partial<ContactInfo>) => void
}

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors'

export function ContactForm({ value, onChange }: ContactFormProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Business / Client name"
        value={value.name}
        onChange={e => onChange({ name: e.target.value })}
      />
      <input
        type="email"
        className={INPUT_CLASS}
        placeholder="Email"
        value={value.email}
        onChange={e => onChange({ email: e.target.value })}
      />
      <input
        type="tel"
        className={INPUT_CLASS}
        placeholder="Phone"
        value={value.phone}
        onChange={e => onChange({ phone: e.target.value })}
      />
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Address line 1"
        value={value.address1}
        onChange={e => onChange({ address1: e.target.value })}
      />
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Address line 2"
        value={value.address2}
        onChange={e => onChange({ address2: e.target.value })}
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="City"
          value={value.city}
          onChange={e => onChange({ city: e.target.value })}
        />
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="State"
          value={value.state}
          onChange={e => onChange({ state: e.target.value })}
        />
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="ZIP"
          value={value.zip}
          onChange={e => onChange({ zip: e.target.value })}
        />
      </div>
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Country"
        value={value.country}
        onChange={e => onChange({ country: e.target.value })}
      />
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Tax ID / GST / ABN"
        value={value.taxId}
        onChange={e => onChange({ taxId: e.target.value })}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create currency-select.tsx**

```tsx
// tools/invoice-generator/shared/currency-select.tsx
'use client'

import { CURRENCIES } from '../invoice-defaults'

interface CurrencySelectProps {
  value: string
  onChange: (code: string) => void
  className?: string
}

const SELECT_CLASS =
  'min-h-[44px] px-3.5 py-2.5 pr-10 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors bg-[right_12px_center] bg-no-repeat bg-[length:16px]'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

export function CurrencySelect({ value, onChange, className = '' }: CurrencySelectProps) {
  return (
    <select
      className={`${SELECT_CLASS} ${className}`}
      style={{ backgroundImage: CHEVRON_BG }}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {CURRENCIES.map(c => (
        <option key={c.code} value={c.code}>
          {c.code}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 3: Create tax-preset-select.tsx**

```tsx
// tools/invoice-generator/shared/tax-preset-select.tsx
'use client'

import type { TaxPreset } from '../invoice-types'

interface TaxPresetSelectProps {
  value: string | null
  taxPresets: TaxPreset[]
  onChange: (presetId: string | null) => void
  className?: string
}

const SELECT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 pr-10 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors bg-[right_12px_center] bg-no-repeat bg-[length:16px]'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

export function TaxPresetSelect({ value, taxPresets, onChange, className = '' }: TaxPresetSelectProps) {
  return (
    <select
      className={`${SELECT_CLASS} ${className}`}
      style={{ backgroundImage: CHEVRON_BG }}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
    >
      <option value="">No tax</option>
      {taxPresets.map(p => (
        <option key={p.id} value={p.id}>
          {p.name} {Math.round(p.rate * 100)}%
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 4: Create discount-input.tsx**

```tsx
// tools/invoice-generator/shared/discount-input.tsx
'use client'

interface DiscountInputProps {
  type: 'none' | 'percent' | 'fixed'
  value: number
  onTypeChange: (type: 'none' | 'percent' | 'fixed') => void
  onValueChange: (value: number) => void
}

const SELECT_CLASS =
  'min-h-[44px] px-3 py-2 pr-8 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] outline-none transition-colors bg-[right_8px_center] bg-no-repeat bg-[length:14px]'

const INPUT_CLASS =
  'min-h-[44px] px-3 py-2 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm text-right focus:border-[#3D6AF2] outline-none transition-colors'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

export function DiscountInput({ type, value, onTypeChange, onValueChange }: DiscountInputProps) {
  return (
    <div className="flex gap-2">
      <select
        className={`flex-1 ${SELECT_CLASS}`}
        style={{ backgroundImage: CHEVRON_BG }}
        value={type}
        onChange={e => onTypeChange(e.target.value as 'none' | 'percent' | 'fixed')}
      >
        <option value="none">None</option>
        <option value="percent">%</option>
        <option value="fixed">Fixed</option>
      </select>
      {type !== 'none' && (
        <input
          type="number"
          className={`w-20 ${INPUT_CLASS}`}
          min={0}
          step={type === 'percent' ? 1 : 0.01}
          value={value || ''}
          onChange={e => onValueChange(parseFloat(e.target.value) || 0)}
          placeholder={type === 'percent' ? '%' : '0.00'}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add tools/invoice-generator/editors/contact-form.tsx tools/invoice-generator/shared/currency-select.tsx tools/invoice-generator/shared/tax-preset-select.tsx tools/invoice-generator/shared/discount-input.tsx
git commit -m "feat(invoice-generator): add shared form components"
```

---

### Task 6: Details Tab Editors (Sender, Client, Invoice Info)

**Files:**
- Create: `tools/invoice-generator/editors/sender-editor.tsx`
- Create: `tools/invoice-generator/editors/client-editor.tsx`
- Create: `tools/invoice-generator/editors/invoice-info-editor.tsx`

- [ ] **Step 1: Create sender-editor.tsx with logo upload**

```tsx
// tools/invoice-generator/editors/sender-editor.tsx
'use client'

import { useCallback } from 'react'
import { useInvoice } from '../invoice-provider'
import { ContactForm } from './contact-form'

export function SenderEditor() {
  const { state, dispatch } = useInvoice()
  const { sender, logo } = state.invoice

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      alert('Logo must be under 500KB')
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG files are supported')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      dispatch({ type: 'SET_LOGO', payload: reader.result as string })
    }
    reader.readAsDataURL(file)
  }, [dispatch])

  const handleLogoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.size > 500 * 1024 || !['image/jpeg', 'image/png'].includes(file.type)) return
    const reader = new FileReader()
    reader.onload = () => {
      dispatch({ type: 'SET_LOGO', payload: reader.result as string })
    }
    reader.readAsDataURL(file)
  }, [dispatch])

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
        From (Your Business)
      </div>
      <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
        {/* Logo upload */}
        <label
          className="block border-2 border-dashed border-[#1e2631] rounded-lg p-6 text-center hover:border-[#3D6AF2]/50 transition-colors cursor-pointer"
          onDragOver={e => e.preventDefault()}
          onDrop={handleLogoDrop}
        >
          {logo ? (
            <div className="flex flex-col items-center gap-2">
              <img src={logo} alt="Logo" className="max-h-16 max-w-[200px] object-contain" />
              <span className="text-xs text-[#70767f]">Click or drop to replace</span>
            </div>
          ) : (
            <>
              <span className="text-[#70767f] text-2xl block mb-1">+</span>
              <p className="text-sm text-[#70767f]">Drop logo here or click to upload</p>
              <p className="text-xs text-[#70767f] mt-1">JPG, PNG — max 500KB</p>
            </>
          )}
          <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleLogoUpload} />
        </label>

        <ContactForm
          value={sender}
          onChange={changes => dispatch({ type: 'SET_SENDER', payload: changes })}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create client-editor.tsx**

```tsx
// tools/invoice-generator/editors/client-editor.tsx
'use client'

import { useInvoice } from '../invoice-provider'
import { ContactForm } from './contact-form'

export function ClientEditor() {
  const { state, dispatch } = useInvoice()

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
        Bill To (Client)
      </div>
      <div className="bg-[#131a23] rounded-xl p-4">
        <ContactForm
          value={state.invoice.client}
          onChange={changes => dispatch({ type: 'SET_CLIENT', payload: changes })}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create invoice-info-editor.tsx**

```tsx
// tools/invoice-generator/editors/invoice-info-editor.tsx
'use client'

import { useInvoice } from '../invoice-provider'
import type { PaymentTerms } from '../invoice-types'

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors'

const SELECT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 pr-10 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors bg-[right_12px_center] bg-no-repeat bg-[length:16px]'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

const TERMS_OPTIONS: { value: PaymentTerms; label: string }[] = [
  { value: 'net7', label: 'Net 7' },
  { value: 'net14', label: 'Net 14' },
  { value: 'net30', label: 'Net 30' },
  { value: 'net60', label: 'Net 60' },
  { value: 'net90', label: 'Net 90' },
  { value: 'custom', label: 'Custom' },
]

export function InvoiceInfoEditor() {
  const { state, dispatch } = useInvoice()
  const { invoiceNumber, issueDate, dueDate, paymentTerms, reference } = state.invoice

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
        Invoice Details
      </div>
      <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Invoice Number</label>
            <input
              type="text"
              className={INPUT_CLASS}
              value={invoiceNumber}
              onChange={e => dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Reference / PO #</label>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="Optional"
              value={reference}
              onChange={e => dispatch({ type: 'SET_REFERENCE', payload: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Issue Date</label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={issueDate}
              onChange={e => dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Due Date</label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={dueDate}
              onChange={e => dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })}
              disabled={paymentTerms !== 'custom'}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#70767f] mb-1 block">Payment Terms</label>
          <select
            className={SELECT_CLASS}
            style={{ backgroundImage: CHEVRON_BG }}
            value={paymentTerms}
            onChange={e => dispatch({ type: 'SET_PAYMENT_TERMS', payload: e.target.value as PaymentTerms })}
          >
            {TERMS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add tools/invoice-generator/editors/sender-editor.tsx tools/invoice-generator/editors/client-editor.tsx tools/invoice-generator/editors/invoice-info-editor.tsx
git commit -m "feat(invoice-generator): add details tab editors (sender, client, invoice info)"
```

---

### Task 7: Line Items Editor with Summary

**Files:**
- Create: `tools/invoice-generator/editors/line-items-editor.tsx`

- [ ] **Step 1: Create line-items-editor.tsx**

This is the most complex editor. It renders each line item as a card with all fields (description, qty, rate, currency, tax, discount), a remove button, and an [+ Add] button at the bottom. Below the items, render the grouped currency totals summary.

The component should:
- Use `useInvoice()` to get state and dispatch
- Map over `state.invoice.lineItems` to render each card
- Use `CurrencySelect`, `TaxPresetSelect`, and `DiscountInput` shared components
- Use `calcGroupedTotals` and `formatCurrency` from `invoice-calculations.ts` for the summary
- Dispatch `ADD_LINE_ITEM` with `createEmptyLineItem(state.invoice.defaultCurrency)` on add
- Dispatch `UPDATE_LINE_ITEM` with `{ id, changes }` on field changes
- Dispatch `REMOVE_LINE_ITEM` with item id on remove
- Show `calcLineItemSubtotal` result for each line item's subtotal

Full implementation file is ~200 lines. Build it by composing the shared components created in Task 5, following the HTML mockup layout in `designs/invoice-generator/code.html` (panel-items section).

- [ ] **Step 2: Verify the editor renders with add/remove working**

Run dev server, navigate to `/tools/invoice-generator`, switch to Line Items tab, add 2-3 items, verify totals calculate correctly.

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/editors/line-items-editor.tsx
git commit -m "feat(invoice-generator): add line items editor with multi-currency summary"
```

---

### Task 8: Styling Editor

**Files:**
- Create: `tools/invoice-generator/editors/styling-editor.tsx`

- [ ] **Step 1: Create styling-editor.tsx**

This editor has 5 sections:
1. **Template picker** — 3 clickable cards (classic/modern/minimal) that dispatch `SET_THEME` with `{ templateId }`
2. **Logo position** — 3 toggle buttons dispatching `SET_THEME` with `{ logoPosition }`
3. **Colors** — 4 rows (primary, accent, text, bg) each with a color input + hex text input + color presets row from `COLOR_PRESETS`
4. **Typography** — font family select + font size 3-button toggle
5. **Custom labels** — 2-column grid of inputs for each label in `InvoiceLabels`, with a "Reset to English" button dispatching `SET_LABELS` with `DEFAULT_LABELS`

Use `useInvoice()` for state/dispatch. Follow the Styling tab layout from `designs/invoice-generator/code.html` (panel-styling section). Use the same `INPUT_CLASS` pattern from previous editors.

- [ ] **Step 2: Verify all styling controls update the preview in real-time**

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/editors/styling-editor.tsx
git commit -m "feat(invoice-generator): add styling editor (templates, colors, fonts, labels)"
```

---

### Task 9: Settings Editor with Tax Presets

**Files:**
- Create: `tools/invoice-generator/editors/settings-editor.tsx`

- [ ] **Step 1: Create settings-editor.tsx**

This editor has 5 sections:
1. **Defaults** — default currency (CurrencySelect), invoice prefix input, next number input, auto-increment toggle
2. **Tax presets** — list of presets with edit/delete, "Add tax preset" button. Edit inline: name input + rate (%) input. Add dispatches `ADD_TAX_PRESET` with a new `TaxPreset` (id from `crypto.randomUUID()`). Delete dispatches `REMOVE_TAX_PRESET`.
3. **Notes** — textarea dispatching `SET_NOTES`
4. **Template panel** — import and render `TemplatePanel` (Task 10)
5. **History panel** — import and render `HistoryPanel` (Task 10)

- [ ] **Step 2: Commit**

```bash
git add tools/invoice-generator/editors/settings-editor.tsx
git commit -m "feat(invoice-generator): add settings editor with tax presets and defaults"
```

---

### Task 10: Template & History Panels

**Files:**
- Create: `tools/invoice-generator/panels/template-panel.tsx`
- Create: `tools/invoice-generator/panels/history-panel.tsx`

- [ ] **Step 1: Create template-panel.tsx**

Renders:
- "Save Current as Template" button that prompts for name (use `window.prompt` for now), then calls `saveTemplate(name)` from context
- List of saved templates from `templates` in context, each with "Load" and delete buttons
- "Sign in to save permanently" banner for anonymous users (placeholder — just show the text)

- [ ] **Step 2: Create history-panel.tsx**

Renders a placeholder list for now:
- "Invoice history is available when signed in" message
- Structure the component to accept an `invoices` array prop for future Supabase integration
- Each entry shows: invoice number (monospace), client name, date, total
- Action buttons: View, Duplicate, Download, Delete (all as stubs for now)

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/panels/template-panel.tsx tools/invoice-generator/panels/history-panel.tsx
git commit -m "feat(invoice-generator): add template and history panels"
```

---

### Task 11: Wire Up InvoiceEditor with Tab Switching

**Files:**
- Modify: `tools/invoice-generator/invoice-editor.tsx`

- [ ] **Step 1: Replace the stub with full tabbed editor**

```tsx
// tools/invoice-generator/invoice-editor.tsx
'use client'

import { useInvoice } from './invoice-provider'
import type { TabId } from './invoice-types'
import { SenderEditor } from './editors/sender-editor'
import { ClientEditor } from './editors/client-editor'
import { InvoiceInfoEditor } from './editors/invoice-info-editor'
import { LineItemsEditor } from './editors/line-items-editor'
import { StylingEditor } from './editors/styling-editor'
import { SettingsEditor } from './editors/settings-editor'

const TABS: { id: TabId; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'items', label: 'Line Items' },
  { id: 'styling', label: 'Styling' },
  { id: 'settings', label: 'Settings' },
]

export function InvoiceEditor() {
  const { state, dispatch } = useInvoice()
  const { activeTab } = state

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 p-3 border-b border-[#1e2631] bg-[#131a23]/50 shrink-0 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap min-h-[44px] transition-colors ${
              activeTab === tab.id
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] text-[#70767f] hover:bg-[#1e2631] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'details' && (
          <>
            <SenderEditor />
            <ClientEditor />
            <InvoiceInfoEditor />
          </>
        )}
        {activeTab === 'items' && <LineItemsEditor />}
        {activeTab === 'styling' && <StylingEditor />}
        {activeTab === 'settings' && <SettingsEditor />}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify all 4 tabs render and switch correctly**

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/invoice-editor.tsx
git commit -m "feat(invoice-generator): wire up tabbed editor with all sections"
```

---

### Task 12: Classic Invoice Theme (Preview Template)

**Files:**
- Create: `tools/invoice-generator/themes/classic-invoice.tsx`

- [ ] **Step 1: Create classic-invoice.tsx**

This is a render-only component that receives `InvoiceState` as props and renders a white A4 invoice matching the preview in `designs/invoice-generator/code.html`. It must:

- Render the header with "INVOICE" in `theme.primaryColor`, invoice number, dates, reference
- Render logo (if present) at `theme.logoPosition`
- Render From / Bill To sections in 2-column grid using `labels.from` and `labels.billTo`
- Render line items table with columns using custom labels (description, qty, rate, amount)
- Render grouped totals per currency using `calcGroupedTotals` from `invoice-calculations.ts`
- Render notes section using `labels.notes`
- Apply `theme.fontFamily`, `theme.fontSize`, `theme.textColor`, `theme.backgroundColor`
- Use inline styles for theme-dependent colors (not Tailwind classes) so the preview accurately reflects customization
- All text labels come from `invoice.labels`, not hardcoded English

Structure: `interface ThemeLayoutProps { invoice: InvoiceState }` — same pattern as `tools/resume/themes/classic-layout.tsx`.

- [ ] **Step 2: Commit**

```bash
git add tools/invoice-generator/themes/classic-invoice.tsx
git commit -m "feat(invoice-generator): add classic invoice theme layout"
```

---

### Task 13: Modern & Minimal Invoice Themes

**Files:**
- Create: `tools/invoice-generator/themes/modern-invoice.tsx`
- Create: `tools/invoice-generator/themes/minimal-invoice.tsx`

- [ ] **Step 1: Create modern-invoice.tsx**

Same `ThemeLayoutProps` interface as classic. Visual differences:
- Bold colored header bar across the top with invoice title + number
- Accent-colored left sidebar stripe
- Sender info in the header bar, client info below
- Table with alternating row shading
- Totals in a colored box

- [ ] **Step 2: Create minimal-invoice.tsx**

Same interface. Visual differences:
- No colored elements except primary color on the title text
- Generous whitespace
- Thin light-gray lines separating sections
- Simple left-aligned layout (no 2-column for sender/client — stacked)
- Ultra-clean table with minimal borders

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/themes/modern-invoice.tsx tools/invoice-generator/themes/minimal-invoice.tsx
git commit -m "feat(invoice-generator): add modern and minimal invoice themes"
```

---

### Task 14: Wire Up InvoicePreview with Zoom & Theme Dispatch

**Files:**
- Modify: `tools/invoice-generator/invoice-preview.tsx`

- [ ] **Step 1: Replace stub with full preview component**

```tsx
// tools/invoice-generator/invoice-preview.tsx
'use client'

import { useState } from 'react'
import { useInvoice } from './invoice-provider'
import { ClassicInvoice } from './themes/classic-invoice'
import { ModernInvoice } from './themes/modern-invoice'
import { MinimalInvoice } from './themes/minimal-invoice'

const THEME_LAYOUTS = {
  classic: ClassicInvoice,
  modern: ModernInvoice,
  minimal: MinimalInvoice,
} as const

const ZOOM_OPTIONS = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
]

export function InvoicePreview() {
  const { state } = useInvoice()
  const { invoice } = state
  const [zoom, setZoom] = useState(0.75)

  const Layout = THEME_LAYOUTS[invoice.theme.templateId]

  return (
    <div className="flex flex-col h-full bg-[#090f16]">
      {/* Zoom bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2631] shrink-0">
        <span className="text-xs text-[#70767f]">Preview</span>
        <div className="flex items-center gap-1">
          {ZOOM_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => setZoom(opt.value)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                zoom === opt.value
                  ? 'text-white bg-[#3D6AF2]/20'
                  : 'text-[#70767f] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* A4 preview area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div
          id="invoice-preview-container"
          style={{
            width: `${210 * 2.83}px`, // A4 width in px at 72dpi
            minHeight: `${297 * 2.83}px`, // A4 height
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            background: invoice.theme.backgroundColor,
            borderRadius: '4px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            padding: '32px',
          }}
        >
          <Layout invoice={invoice} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the preview renders and updates live when editing**

- [ ] **Step 3: Commit**

```bash
git add tools/invoice-generator/invoice-preview.tsx
git commit -m "feat(invoice-generator): add live preview with zoom and theme switching"
```

---

### Task 15: Action Bar & Client-Side PDF Export

**Files:**
- Create: `tools/invoice-generator/shared/pdf-export.ts`
- Modify: `app/tools/invoice-generator/page.tsx` — add bottom action bar

- [ ] **Step 1: Install html2canvas and jsPDF**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm add html2canvas jspdf`

- [ ] **Step 2: Create pdf-export.ts**

```typescript
// tools/invoice-generator/shared/pdf-export.ts

export async function exportInvoicePDF(invoiceNumber: string): Promise<void> {
  const container = document.getElementById('invoice-preview-container')
  if (!container) throw new Error('Preview container not found')

  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  // Render at 2x for quality
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const width = imgWidth * ratio
  const height = imgHeight * ratio

  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save(`${invoiceNumber}.pdf`)
}
```

- [ ] **Step 3: Add action bar to page.tsx**

Add a sticky bottom bar inside the InvoiceProvider in `page.tsx`, between the main content div and closing div. It should have:
- Left: "Auto-saved locally" status text
- Right: "Save Template" button (outline), "Save Invoice" button (outline), "Download PDF" button (gradient primary)
- Download PDF calls `exportInvoicePDF(state.invoice.invoiceNumber)` wrapped in try/catch with error alert

Create an `ActionBar` component inside `page.tsx` or as a separate file that uses `useInvoice()`.

- [ ] **Step 4: Verify PDF download works**

Fill in some invoice data, click Download PDF, verify the PDF file downloads with correct content.

- [ ] **Step 5: Commit**

```bash
git add tools/invoice-generator/shared/pdf-export.ts app/tools/invoice-generator/page.tsx package.json pnpm-lock.yaml
git commit -m "feat(invoice-generator): add action bar and client-side PDF export"
```

---

### Task 16: E2E Browser Testing

**Files:**
- Test via Playwright browser automation

- [ ] **Step 1: Start dev server**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

- [ ] **Step 2: Test the full flow via browser**

Using the `webapp-testing` skill / Playwright, run through:

1. Navigate to `/tools/invoice-generator`
2. Verify the studio layout renders (editor left, preview right)
3. **Details tab**: Fill sender name, client name, change invoice number
4. **Line Items tab**: Add 2 line items with different currencies, verify summary shows grouped totals
5. **Styling tab**: Switch template (classic → modern → minimal), change primary color, edit a label
6. **Settings tab**: Change default currency, add a tax preset, type notes
7. **Preview**: Verify live preview updates reflect all changes
8. **Download PDF**: Click download, verify file is generated
9. **Mobile**: Resize to mobile viewport, verify preview toggle works
10. Screenshot each state

- [ ] **Step 3: Fix any runtime errors found**

Address any issues discovered during browser testing — layout bugs, JS errors, broken state updates.

- [ ] **Step 4: Re-test until all flows pass**

Run through the test flow again after fixes.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(invoice-generator): address issues found in e2e testing"
```

---

## Summary

| Task | What it builds | Dependencies |
|------|----------------|-------------|
| 1 | Types, defaults, calculation utils | None |
| 2 | Reducer & state management | Task 1 |
| 3 | Context provider with localStorage | Tasks 1-2 |
| 4 | Route, layout, SEO, studio shell | Task 3 |
| 5 | Shared form components | Task 1 |
| 6 | Details tab editors | Tasks 3-5 |
| 7 | Line items editor with summary | Tasks 3-5 |
| 8 | Styling editor | Tasks 3-5 |
| 9 | Settings editor with tax presets | Tasks 3-5, 10 |
| 10 | Template & history panels | Task 3 |
| 11 | Wire up tabbed editor | Tasks 6-10 |
| 12 | Classic invoice theme | Task 1 |
| 13 | Modern & minimal themes | Task 12 |
| 14 | Wire up preview with zoom | Tasks 12-13 |
| 15 | Action bar & PDF export | Tasks 11, 14 |
| 16 | E2E browser testing | All |
