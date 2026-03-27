// ─── Gemini Invoice & Bank Statement Extraction ──────────────────────────────

import type { ExtractedInvoice, ParsedTransaction } from '@/tools/tax-manager/types'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

// ─── MIME Type Detection ─────────────────────────────────────────────────────

function detectMimeType(fileUrl: string): string {
  const lower = fileUrl.toLowerCase().split('?')[0] // strip query params
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic'
  // Default to JPEG for unknown image types
  return 'image/jpeg'
}

// ─── Fetch + Base64 ──────────────────────────────────────────────────────────

async function fetchAsBase64(fileUrl: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(fileUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`)
  }
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = Buffer.from(binary, 'binary').toString('base64')
  const mimeType = detectMimeType(fileUrl)
  return { base64, mimeType }
}

// ─── Gemini API Call ─────────────────────────────────────────────────────────

async function callGemini(prompt: string, base64: string, mimeType: string): Promise<string> {
  const body = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          {
            text: prompt,
          },
        ],
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
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  return text
}

// ─── Parse JSON Safely ───────────────────────────────────────────────────────

function parseJson<T>(raw: string): T {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  return JSON.parse(cleaned) as T
}

// ─── Invoice Extraction ──────────────────────────────────────────────────────

const INVOICE_PROMPT = `Extract invoice/receipt data from this image. Return ONLY valid JSON with no markdown:
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
If a field cannot be determined, use null.
Return ONLY the JSON object, no explanation.`

/**
 * Extracts structured invoice data from an image or PDF file URL using Gemini.
 * If GST is not shown on the document, it is calculated as totalIncGst × 3/23.
 */
export async function extractInvoice(fileUrl: string): Promise<ExtractedInvoice> {
  const { base64, mimeType } = await fetchAsBase64(fileUrl)
  const raw = await callGemini(INVOICE_PROMPT, base64, mimeType)

  type RawInvoice = {
    vendor?: string | null
    date?: string | null
    totalIncGst?: number | null
    gstAmount?: number | null
    totalExGst?: number | null
    description?: string | null
    invoiceNumber?: string | null
  }

  const parsed = parseJson<RawInvoice>(raw)

  const totalIncGst = parsed.totalIncGst ?? null
  let gstAmount = parsed.gstAmount ?? null
  let totalExGst = parsed.totalExGst ?? null

  // Calculate GST if not shown
  if (totalIncGst !== null && gstAmount === null) {
    gstAmount = totalIncGst * (3 / 23)
  }

  // Calculate ex-GST if not shown
  if (totalIncGst !== null && totalExGst === null && gstAmount !== null) {
    totalExGst = totalIncGst - gstAmount
  }

  return {
    vendor: parsed.vendor ?? null,
    date: parsed.date ?? null,
    totalIncGst,
    gstAmount: gstAmount !== null ? Math.round(gstAmount * 100) / 100 : null,
    totalExGst: totalExGst !== null ? Math.round(totalExGst * 100) / 100 : null,
    description: parsed.description ?? null,
    invoiceNumber: parsed.invoiceNumber ?? null,
  }
}

// ─── Bank Statement PDF Extraction ──────────────────────────────────────────

const BANK_STATEMENT_PROMPT = `Extract all transactions from this bank statement PDF. Return ONLY valid JSON with no markdown — an array of transaction objects:
[
  {
    "date": "YYYY-MM-DD",
    "description": "transaction description",
    "amount": 0.00,
    "balance": 0.00
  }
]
Rules:
- Debits (money out) must have negative amount values
- Credits (money in) must have positive amount values
- date must be in YYYY-MM-DD format
- balance is optional — use null if not shown
- If you cannot parse a row, skip it
- Return ONLY the JSON array, no explanation.`

/**
 * Extracts transactions from a PDF bank statement using Gemini.
 * Returns a standardised array of ParsedTransaction objects.
 */
export async function extractBankStatementPdf(fileUrl: string): Promise<ParsedTransaction[]> {
  const { base64, mimeType } = await fetchAsBase64(fileUrl)

  // Override mime type — bank statements must be PDFs
  const effectiveMimeType = mimeType === 'application/pdf' ? 'application/pdf' : mimeType

  const raw = await callGemini(BANK_STATEMENT_PROMPT, base64, effectiveMimeType)

  type RawTransaction = {
    date?: string | null
    description?: string | null
    amount?: number | null
    balance?: number | null
  }

  const parsed = parseJson<RawTransaction[]>(raw)

  return parsed
    .filter(
      (t): t is { date: string; description: string; amount: number; balance?: number | null } =>
        typeof t.date === 'string' &&
        typeof t.description === 'string' &&
        typeof t.amount === 'number',
    )
    .map((t) => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      balance: t.balance ?? undefined,
    }))
}
