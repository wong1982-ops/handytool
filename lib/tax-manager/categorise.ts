// ─── Gemini Batch Transaction Categorisation ─────────────────────────────────

import type { CategoryRule } from '@/tools/tax-manager/types'
import { TAX_CATEGORIES } from '@/tools/tax-manager/types'
import { applyRules } from '@/tools/tax-manager/category-rules'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

// ─── Category Descriptions for Prompt ───────────────────────────────────────

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'sales-income': 'Revenue from sales, services rendered, client payments, invoices received',
  'cost-of-goods': 'Direct costs to produce goods sold: raw materials, inventory, manufacturing costs',
  'contractor': 'Payments to contractors, subcontractors, freelancers, labour hire',
  'software': 'SaaS subscriptions, software licences, cloud services (AWS, Google, Microsoft, Xero, etc.)',
  'office': 'Stationery, printer cartridges, small equipment, cleaning supplies, office consumables',
  'travel': 'Flights, accommodation, taxis, Uber, parking, fuel for business travel, toll charges',
  'phone': 'Mobile phone plans, broadband/internet, phone hardware',
  'rent': 'Office rent, commercial premises lease, storage unit, coworking space',
  'insurance': 'Business insurance, professional indemnity, public liability, vehicle insurance',
  'bank-fees': 'Bank account fees, merchant fees, transaction charges, overdraft fees (no GST)',
  'professional': 'Accountant, lawyer, consultant, auditor, financial adviser fees',
  'marketing': 'Advertising spend, social media ads, Google Ads, print media, website costs, SEO',
  'entertainment': 'Client meals, staff functions, hospitality — 50% GST and deductible in NZ',
  'personal': 'Personal spending, non-business purchases, drawings — not deductible',
  'transfer': 'Inter-account transfers, loan repayments, owner contributions — ignore for tax',
}

// ─── Build Gemini Categorisation Prompt ─────────────────────────────────────

function buildCategorisationPrompt(
  items: { description: string; amount: number }[],
): string {
  const categoryList = TAX_CATEGORIES.map(
    (c) => `- ${c.id}: ${CATEGORY_DESCRIPTIONS[c.id] ?? c.label}`,
  ).join('\n')

  const transactionList = items
    .map((t, i) => `${i}: "${t.description}" | amount: ${t.amount >= 0 ? '+' : ''}${t.amount.toFixed(2)}`)
    .join('\n')

  return `You are an NZ tax categorisation assistant. Categorise each bank transaction below into exactly one of the 15 NZ tax categories.

NZ Tax Context:
- GST rate is 15%
- Entertainment is 50% deductible and 50% GST claimable
- Positive amounts = money in (income/credits)
- Negative amounts = money out (expenses/payments)

Categories (use the ID exactly):
${categoryList}

Transactions to categorise (index: description | amount):
${transactionList}

Return ONLY a valid JSON array with no markdown, one object per transaction in the same order:
[
  { "category": "<category-id>", "confidence": "<high|medium|low>" }
]

Confidence guide:
- "high": very clear match (e.g. "XERO SUBSCRIPTION" → software, "WOOLWORTHS" → office or personal)
- "medium": reasonable guess but could be argued differently
- "low": description is ambiguous or generic (e.g. "PAYMENT", "TRANSFER 12345")

Return ONLY the JSON array, no explanation.`
}

// ─── Parse JSON Safely ───────────────────────────────────────────────────────

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(cleaned) as T
}

// ─── Gemini API Call ─────────────────────────────────────────────────────────

async function callGeminiText(prompt: string): Promise<string> {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error: ${res.status} — ${errText}`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export interface CategorisationResult {
  category: string
  confidence: string
}

/**
 * Categorises a batch of transactions using saved user rules first,
 * then Gemini AI for any unmatched items.
 *
 * Rule-matched items are returned with confidence = 'manual'.
 * AI-categorised items return 'high', 'medium', or 'low'.
 */
export async function categoriseTransactions(
  items: { description: string; amount: number }[],
  rules: CategoryRule[],
): Promise<CategorisationResult[]> {
  if (items.length === 0) return []

  // ── Step 1: Apply user rules ──────────────────────────────────────────────

  const results: (CategorisationResult | null)[] = items.map((item) => {
    const matched = applyRules(item.description, rules)
    if (matched) {
      return { category: matched, confidence: 'manual' }
    }
    return null
  })

  // ── Step 2: Collect unmatched indices ────────────────────────────────────

  const unmatchedIndices: number[] = []
  const unmatchedItems: { description: string; amount: number }[] = []

  results.forEach((r, i) => {
    if (r === null) {
      unmatchedIndices.push(i)
      unmatchedItems.push(items[i])
    }
  })

  if (unmatchedItems.length === 0) {
    // All matched by rules — safe to cast since no nulls remain
    return results as CategorisationResult[]
  }

  // ── Step 3: Send unmatched batch to Gemini ───────────────────────────────

  const prompt = buildCategorisationPrompt(unmatchedItems)
  const raw = await callGeminiText(prompt)

  type GeminiResult = { category?: string; confidence?: string }
  let aiResults: GeminiResult[] = []

  try {
    aiResults = parseJson<GeminiResult[]>(raw)
  } catch {
    // If Gemini returns unparseable JSON, fall back to 'personal' with 'low' confidence
    aiResults = unmatchedItems.map(() => ({ category: 'personal', confidence: 'low' }))
  }

  // ── Step 4: Merge AI results back into original positions ────────────────

  unmatchedIndices.forEach((originalIndex, aiIndex) => {
    const aiResult = aiResults[aiIndex]
    const category = aiResult?.category ?? 'personal'
    const confidence = aiResult?.confidence ?? 'low'

    // Validate category ID against known categories
    const validCategory = TAX_CATEGORIES.find((c) => c.id === category)
      ? category
      : 'personal'

    results[originalIndex] = {
      category: validCategory,
      confidence: ['high', 'medium', 'low'].includes(confidence) ? confidence : 'low',
    }
  })

  return results as CategorisationResult[]
}
