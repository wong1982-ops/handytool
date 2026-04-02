import { NZ_BANKS, type BankFormat, type ParsedTransaction } from './types'

// ─── CSV Field Parser ───────────────────────────────────────────────

/**
 * Splits a CSV line into fields, respecting quoted fields that may
 * contain commas.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (ch === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }

  fields.push(current.trim())
  return fields
}

// ─── Date Parsers ───────────────────────────────────────────────────

/**
 * Parses DD/MM/YYYY → YYYY-MM-DD ISO string.
 */
function parseDdMmYyyy(raw: string): string {
  const parts = raw.split('/')
  if (parts.length !== 3) return raw
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Parses YYYY/MM/DD → YYYY-MM-DD ISO string.
 */
function parseYyyySlash(raw: string): string {
  return raw.replace(/\//g, '-')
}

/**
 * Normalises a date string to ISO YYYY-MM-DD based on the bank format.
 */
function normaliseDate(raw: string, format: BankFormat['dateFormat']): string {
  const trimmed = raw.trim()
  if (format === 'YYYY-MM-DD') return trimmed
  if (format === 'YYYY/MM/DD') return parseYyyySlash(trimmed)
  return parseDdMmYyyy(trimmed)
}

// ─── Bank Detection ─────────────────────────────────────────────────

/**
 * Detects which NZ bank the CSV belongs to by matching the header row.
 * Returns the bank id (e.g. 'anz') or null if no match.
 */
export function detectBank(headerRow: string): string | null {
  const fields = splitCsvLine(headerRow).map((f) =>
    f.replace(/^["']|["']$/g, '').trim(),
  )

  for (const bank of NZ_BANKS) {
    // Check if enough detect headers match (allowing some flexibility)
    const matchCount = bank.detectHeaders.filter((h) =>
      fields.some((f) => f.toLowerCase() === h.toLowerCase()),
    ).length

    // Require at least 60% of detect headers to match
    if (matchCount >= Math.ceil(bank.detectHeaders.length * 0.6)) {
      return bank.id
    }
  }

  return null
}

// ─── CSV Parser ─────────────────────────────────────────────────────

/**
 * Parses bank CSV text into standardised ParsedTransaction[].
 * Auto-detects the bank from the header row if bankId is not provided.
 */
export function parseBankCsv(
  csvText: string,
  bankId?: string,
): ParsedTransaction[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) return []

  // Find the header row — may not be the first line (metadata lines above)
  let headerIndex = 0
  let detectedId = bankId ?? null

  if (!detectedId) {
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const detected = detectBank(lines[i])
      if (detected) {
        headerIndex = i
        detectedId = detected
        break
      }
    }
  }

  if (!detectedId) return []

  const bank = NZ_BANKS.find((b) => b.id === detectedId)
  if (!bank) return []

  const { columnMap, dateFormat } = bank
  const transactions: ParsedTransaction[] = []

  // Start from the row after the header
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i])

    // Skip rows that don't have enough columns
    const requiredCols = Math.max(
      columnMap.date,
      columnMap.description,
      columnMap.amount ?? 0,
      columnMap.debit ?? 0,
      columnMap.credit ?? 0,
      columnMap.balance ?? 0,
    )
    if (fields.length <= requiredCols) continue

    const rawDate = fields[columnMap.date]
    if (!rawDate) continue

    const date = normaliseDate(rawDate, dateFormat)
    const description = fields[columnMap.description] ?? ''

    // Parse amount — single column or split debit/credit
    let amount: number
    if (columnMap.amount !== undefined) {
      amount = parseFloat(fields[columnMap.amount]?.replace(/[,$]/g, '') ?? '0')
    } else if (columnMap.debit !== undefined && columnMap.credit !== undefined) {
      const debit = parseFloat(fields[columnMap.debit]?.replace(/[,$]/g, '') || '0')
      const credit = parseFloat(fields[columnMap.credit]?.replace(/[,$]/g, '') || '0')
      amount = credit > 0 ? credit : -debit
    } else {
      continue
    }

    if (isNaN(amount)) continue

    // ASB Visa: amounts are always positive, use Tran Type (DEBIT/CREDIT) to determine sign
    if (detectedId === 'asb-visa') {
      const tranType = (fields[3] ?? '').toUpperCase()
      if (tranType === 'DEBIT' && amount > 0) amount = -amount
    }

    const balance =
      columnMap.balance !== undefined
        ? parseFloat(fields[columnMap.balance]?.replace(/[,$]/g, '') ?? '')
        : undefined

    const sourceRef =
      columnMap.uniqueId !== undefined
        ? fields[columnMap.uniqueId]?.trim() || undefined
        : undefined

    transactions.push({
      date,
      description: description.trim(),
      amount,
      balance: isNaN(balance as number) ? undefined : balance,
      sourceRef,
    })
  }

  return transactions
}
