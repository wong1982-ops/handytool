import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-2.5-flash'

const NZ_CATEGORIES = [
  { id: 'income-sales', label: 'Sales / Revenue', description: 'Income from sales of goods or services', gst: true },
  { id: 'income-other', label: 'Other Income', description: 'Interest, dividends, grants, other income', gst: false },
  { id: 'expense-advertising', label: 'Advertising & Marketing', description: 'Ads, promotions, marketing materials', gst: true },
  { id: 'expense-vehicles', label: 'Motor Vehicles', description: 'Fuel, repairs, registration, vehicle costs', gst: true },
  { id: 'expense-travel', label: 'Travel & Accommodation', description: 'Flights, hotels, transport for business', gst: true },
  { id: 'expense-meals', label: 'Meals & Entertainment', description: 'Client entertainment (50% deductible in NZ)', gst: true },
  { id: 'expense-office', label: 'Office & Stationery', description: 'Office supplies, printer ink, paper', gst: true },
  { id: 'expense-rent', label: 'Rent & Premises', description: 'Office rent, storage, premises costs', gst: true },
  { id: 'expense-utilities', label: 'Utilities & Telecommunications', description: 'Power, phone, internet', gst: true },
  { id: 'expense-professional', label: 'Professional Services', description: 'Accounting, legal, consulting fees', gst: true },
  { id: 'expense-insurance', label: 'Insurance', description: 'Business insurance premiums', gst: true },
  { id: 'expense-wages', label: 'Wages & Salaries', description: 'Employee wages, PAYE, KiwiSaver', gst: false },
  { id: 'expense-equipment', label: 'Equipment & Assets', description: 'Computers, tools, machinery purchases', gst: true },
  { id: 'expense-bank', label: 'Bank Fees & Interest', description: 'Bank charges, loan interest, merchant fees', gst: false },
  { id: 'personal', label: 'Personal / Non-Business', description: 'Personal expenses not deductible for tax', gst: false },
]

function buildCategorizationPrompt(
  transactions: Array<{ description: string; amount: number }>,
): string {
  const categoryList = NZ_CATEGORIES.map(
    (c) => `- ${c.id}: ${c.label} — ${c.description}`,
  ).join('\n')

  const txList = transactions
    .map((t, i) => `${i}: description="${t.description}" amount=${t.amount}`)
    .join('\n')

  return `You are an NZ tax expert. Categorise these business transactions for New Zealand income tax purposes.

Available categories:
${categoryList}

Transactions to categorise (index: description, amount):
${txList}

Return ONLY valid JSON array with one object per transaction (same order as input):
[
  { "category": "category-id", "confidence": "high|medium|low" }
]

Rules:
- Use "high" confidence when the description clearly matches the category
- Use "medium" when it's a reasonable guess
- Use "low" when uncertain
- When in doubt between business expense and personal, prefer the business category but use low confidence
- For NZ-specific: rates/council tax → expense-rent, ACC levy → expense-wages, GST payments → personal`
}

async function callGeminiCategorise(
  transactions: Array<{ description: string; amount: number }>,
): Promise<Array<{ category: string; confidence: string }>> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const prompt = buildCategorizationPrompt(transactions)

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No text in Gemini response')

  let parsed: Array<{ category: string; confidence: string }>
  try {
    parsed = JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Could not parse Gemini response as JSON array')
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response is not an array')
  }

  return parsed
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    transactions: Array<{ description: string; amount: number }>
    entityId: string
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { transactions, entityId } = body

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return apiError('transactions array is required and must not be empty', 'VALIDATION_ERROR', 400)
  }
  if (!entityId?.trim()) {
    return apiError('entityId is required', 'VALIDATION_ERROR', 400)
  }

  // Load user's category rules for this entity
  const supabase = await createClient()
  const { data: rules, error: rulesError } = await supabase
    .from('tax_category_rules')
    .select('pattern, category')
    .eq('user_id', userId)
    .eq('entity_id', entityId)

  if (rulesError) {
    console.error('[tax-manager/categorise] rules fetch error:', rulesError)
  }

  const categoryRules = rules || []

  // Apply rules first: case-insensitive substring match
  const results: Array<{ category: string; confidence: string }> = new Array(transactions.length).fill(null)
  const unmatchedIndices: number[] = []

  for (let i = 0; i < transactions.length; i++) {
    const desc = transactions[i].description.toLowerCase()
    const matched = categoryRules.find((rule: { pattern: string; category: string }) =>
      desc.includes(rule.pattern.toLowerCase()),
    )
    if (matched) {
      results[i] = { category: matched.category, confidence: 'manual' }
    } else {
      unmatchedIndices.push(i)
    }
  }

  // For unmatched transactions, call Gemini
  if (unmatchedIndices.length > 0) {
    const unmatched = unmatchedIndices.map((i) => transactions[i])

    try {
      const aiResults = await callGeminiCategorise(unmatched)

      for (let j = 0; j < unmatchedIndices.length; j++) {
        const originalIdx = unmatchedIndices[j]
        results[originalIdx] = aiResults[j] || { category: 'personal', confidence: 'low' }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[tax-manager/categorise] Gemini error:', msg)
      // Fallback: return low-confidence personal for unmatched
      for (const idx of unmatchedIndices) {
        results[idx] = { category: 'personal', confidence: 'low' }
      }
    }
  }

  return apiSuccess({ categories: results })
}
