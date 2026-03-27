import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

const CREDIT_COST = 1
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-2.5-flash'

const INVOICE_EXTRACTION_PROMPT = `Extract invoice/receipt data from this image. Return ONLY valid JSON:
{
  "vendor": "company name",
  "date": "YYYY-MM-DD",
  "totalIncGst": 0.00,
  "gstAmount": 0.00,
  "totalExGst": 0.00,
  "description": "brief description of goods/services",
  "invoiceNumber": "INV-XXX"
}
If GST amount is not shown, calculate it as totalIncGst × 3/23 (NZ 15% GST).
If a field cannot be determined, use null.`

const BANK_STATEMENT_PROMPT = `Extract all transactions from this bank statement PDF. Return ONLY valid JSON as an array:
[
  {
    "date": "YYYY-MM-DD",
    "description": "transaction description",
    "amount": 0.00,
    "balance": 0.00
  }
]
For debits/payments, use negative amounts. For credits/deposits, use positive amounts.
Extract every transaction visible in the document. If a field cannot be determined, use null.`

async function callGeminiWithUrl(
  fileUrl: string,
  mimeType: string,
  prompt: string,
): Promise<string> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  // Fetch the file and convert to base64
  const fileResponse = await fetch(fileUrl)
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.status}`)
  }
  const arrayBuffer = await fileResponse.arrayBuffer()
  const base64Data = Buffer.from(arrayBuffer).toString('base64')

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: prompt },
          ],
        },
      ],
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
  return text
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { fileUrl: string; type: 'bank-statement' | 'invoice' }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { fileUrl, type } = body

  if (!fileUrl?.trim()) {
    return apiError('fileUrl is required', 'VALIDATION_ERROR', 400)
  }
  if (!type || !['bank-statement', 'invoice'].includes(type)) {
    return apiError('type must be "bank-statement" or "invoice"', 'VALIDATION_ERROR', 400)
  }

  // Deduct 1 credit
  const supabase = await getSupabase()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'tax-manager-extract',
    p_description: `Tax Manager — Extract ${type === 'invoice' ? 'Invoice' : 'Bank Statement'}`,
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: CREDIT_COST })
    }
    console.error('[tax-manager/extract] deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    if (type === 'invoice') {
      // Determine MIME type from URL
      const lowerUrl = fileUrl.toLowerCase()
      let mimeType = 'image/jpeg'
      if (lowerUrl.includes('.pdf')) mimeType = 'application/pdf'
      else if (lowerUrl.includes('.png')) mimeType = 'image/png'
      else if (lowerUrl.includes('.heic')) mimeType = 'image/heic'
      else if (lowerUrl.includes('.webp')) mimeType = 'image/webp'

      const rawJson = await callGeminiWithUrl(fileUrl, mimeType, INVOICE_EXTRACTION_PROMPT)

      let extracted: unknown
      try {
        extracted = JSON.parse(rawJson)
      } catch {
        // Try to extract JSON from text
        const jsonMatch = rawJson.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          extracted = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Could not parse Gemini response as JSON')
        }
      }

      return apiSuccess({ type: 'invoice', extracted })
    } else {
      // bank-statement — treat as PDF
      const rawJson = await callGeminiWithUrl(fileUrl, 'application/pdf', BANK_STATEMENT_PROMPT)

      let transactions: unknown[]
      try {
        const parsed = JSON.parse(rawJson)
        transactions = Array.isArray(parsed) ? parsed : []
      } catch {
        const jsonMatch = rawJson.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          transactions = JSON.parse(jsonMatch[0])
        } else {
          transactions = []
        }
      }

      return apiSuccess({ type: 'bank-statement', transactions })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[tax-manager/extract] error:', msg)
    return apiError(`Extraction failed: ${msg}`, 'EXTRACTION_FAILED', 500)
  }
}
