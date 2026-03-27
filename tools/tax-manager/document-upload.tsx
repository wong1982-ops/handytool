'use client'

import { useState, useCallback, useRef } from 'react'
import { parseBankCsv } from './bank-parsers'
import type { ParsedTransaction, ExtractedInvoice } from './types'

// ─── Props ─────────────────────────────────────────────────────────

interface DocumentUploadProps {
  entityId: string
  taxYear: string
  onDocumentUploaded: () => void
}

// ─── Constants ─────────────────────────────────────────────────────

const BANK_ACCEPT = '.csv,.pdf'
const INVOICE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.heic'
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

// ─── Helpers ───────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount)
}

// ─── Component ─────────────────────────────────────────────────────

export default function DocumentUpload({
  entityId,
  taxYear,
  onDocumentUploaded,
}: DocumentUploadProps) {
  // ─── Bank Statement State ──────────────────────────────────────
  const [bankFile, setBankFile] = useState<File | null>(null)
  const [bankParsed, setBankParsed] = useState<ParsedTransaction[] | null>(null)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankError, setBankError] = useState<string | null>(null)
  const [bankImporting, setBankImporting] = useState(false)
  const [bankDupWarning, setBankDupWarning] = useState<number>(0)
  const bankInputRef = useRef<HTMLInputElement>(null)

  // ─── Invoice State ─────────────────────────────────────────────
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [invoiceExtracted, setInvoiceExtracted] = useState<ExtractedInvoice | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  const [invoiceSaving, setInvoiceSaving] = useState(false)
  const invoiceInputRef = useRef<HTMLInputElement>(null)

  // ─── Bank Statement Handlers ───────────────────────────────────

  const handleBankFileSelect = useCallback(async (file: File) => {
    setBankError(null)
    setBankParsed(null)
    setBankDupWarning(0)

    if (file.size > MAX_FILE_SIZE) {
      setBankError('File size exceeds 20MB limit')
      return
    }

    setBankFile(file)

    if (file.name.endsWith('.csv')) {
      // Parse CSV client-side
      setBankLoading(true)
      try {
        const text = await file.text()
        const transactions = parseBankCsv(text)

        if (transactions.length === 0) {
          setBankError('No transactions found. Check the CSV format matches a supported NZ bank (ANZ, ASB, BNZ, Westpac, Kiwibank).')
          return
        }

        setBankParsed(transactions)
      } catch {
        setBankError('Failed to parse CSV file')
      } finally {
        setBankLoading(false)
      }
    } else if (file.name.endsWith('.pdf')) {
      // Upload PDF to R2 then extract via API
      setBankLoading(true)
      try {
        // Step 1: Upload to R2
        const formData = new FormData()
        formData.append('file', file)
        formData.append('entity_id', entityId)
        formData.append('tax_year', taxYear)
        formData.append('type', 'bank-statement')

        const uploadRes = await fetch('/api/v1/tax-manager/documents', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => null)
          throw new Error(data?.error ?? 'Failed to upload document')
        }

        const { data: doc } = await uploadRes.json()

        // Step 2: Extract transactions via Gemini
        const extractRes = await fetch('/api/v1/tax-manager/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: doc.file_url, type: 'bank-statement' }),
        })

        if (!extractRes.ok) {
          const data = await extractRes.json().catch(() => null)
          throw new Error(data?.error ?? 'Failed to extract transactions from PDF')
        }

        const { data: extracted } = await extractRes.json()
        setBankParsed(extracted.transactions ?? [])
      } catch (err) {
        setBankError(err instanceof Error ? err.message : 'Failed to process bank statement PDF')
      } finally {
        setBankLoading(false)
      }
    }
  }, [entityId, taxYear])

  const handleBankImport = useCallback(async () => {
    if (!bankParsed || bankParsed.length === 0) return

    setBankImporting(true)
    setBankError(null)

    try {
      const res = await fetch('/api/v1/tax-manager/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          tax_year: taxYear,
          transactions: bankParsed,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to import transactions')
      }

      const { data } = await res.json()

      if (data.duplicates && data.duplicates > 0) {
        setBankDupWarning(data.duplicates)
      }

      // Trigger categorisation
      await fetch('/api/v1/tax-manager/categorise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, tax_year: taxYear }),
      }).catch(() => {
        // Non-blocking — categorisation can be retried
      })

      onDocumentUploaded()
      setBankParsed(null)
      setBankFile(null)
    } catch (err) {
      setBankError(err instanceof Error ? err.message : 'Failed to import transactions')
    } finally {
      setBankImporting(false)
    }
  }, [bankParsed, entityId, taxYear, onDocumentUploaded])

  // ─── Invoice Handlers ──────────────────────────────────────────

  const handleInvoiceFileSelect = useCallback(async (file: File) => {
    setInvoiceError(null)
    setInvoiceExtracted(null)

    if (file.size > MAX_FILE_SIZE) {
      setInvoiceError('File size exceeds 20MB limit')
      return
    }

    setInvoiceFile(file)
    setInvoiceLoading(true)

    try {
      // Step 1: Upload to R2
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entity_id', entityId)
      formData.append('tax_year', taxYear)
      formData.append('type', 'invoice')

      const uploadRes = await fetch('/api/v1/tax-manager/documents', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to upload document')
      }

      const { data: doc } = await uploadRes.json()

      // Step 2: Extract invoice data via Gemini
      const extractRes = await fetch('/api/v1/tax-manager/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: doc.file_url, type: 'invoice' }),
      })

      if (!extractRes.ok) {
        const data = await extractRes.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to extract invoice data')
      }

      const { data: extracted } = await extractRes.json()
      setInvoiceExtracted(extracted as ExtractedInvoice)
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : 'Failed to process invoice')
    } finally {
      setInvoiceLoading(false)
    }
  }, [entityId, taxYear])

  const handleInvoiceSave = useCallback(async () => {
    if (!invoiceExtracted) return

    setInvoiceSaving(true)
    setInvoiceError(null)

    try {
      const res = await fetch('/api/v1/tax-manager/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          tax_year: taxYear,
          transactions: [
            {
              date: invoiceExtracted.date ?? new Date().toISOString().split('T')[0],
              description: `${invoiceExtracted.vendor ?? 'Unknown vendor'} — ${invoiceExtracted.description ?? 'Invoice'}`,
              amount: -(invoiceExtracted.totalIncGst ?? 0),
              gst_amount: invoiceExtracted.gstAmount ?? null,
            },
          ],
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save transaction')
      }

      // Trigger categorisation
      await fetch('/api/v1/tax-manager/categorise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, tax_year: taxYear }),
      }).catch(() => {})

      onDocumentUploaded()
      setInvoiceExtracted(null)
      setInvoiceFile(null)
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : 'Failed to save invoice')
    } finally {
      setInvoiceSaving(false)
    }
  }, [invoiceExtracted, entityId, taxYear, onDocumentUploaded])

  // ─── Drop Zone Handler ─────────────────────────────────────────

  function createDropHandler(
    accept: string,
    handler: (file: File) => void,
  ) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const file = e.dataTransfer.files[0]
        if (!file) return
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!accept.split(',').includes(ext)) return
        handler(file)
      },
    }
  }

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* ── Bank Statement Upload Zone ──────────────────────────── */}
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
        <h3 className="text-sm font-medium text-[#a6abb5] mb-3">Bank Statement</h3>

        {bankError && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {bankError}
          </div>
        )}

        {bankDupWarning > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            {bankDupWarning} duplicate transaction{bankDupWarning > 1 ? 's' : ''} detected and skipped.
          </div>
        )}

        {!bankParsed && !bankLoading && (
          <div
            {...createDropHandler(BANK_ACCEPT, handleBankFileSelect)}
            className="border-2 border-dashed border-[#1e2631] rounded-xl p-6 text-center hover:border-[#3D6AF2]/50 transition-colors cursor-pointer"
            onClick={() => bankInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') bankInputRef.current?.click() }}
          >
            <input
              ref={bankInputRef}
              type="file"
              accept={BANK_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleBankFileSelect(file)
              }}
            />
            <div className="text-2xl mb-2">📄</div>
            <p className="text-sm text-[#a6abb5] mb-1">Drop CSV or PDF bank statement here</p>
            <p className="text-xs text-[#70767f]">
              Supports ANZ, ASB, BNZ, Westpac, Kiwibank
            </p>
            {bankFile && (
              <p className="text-xs text-[#3D6AF2] mt-2">{bankFile.name}</p>
            )}
          </div>
        )}

        {bankLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-[#a6abb5]">
              Parsing bank statement...
            </div>
          </div>
        )}

        {/* Parsed Transaction Preview */}
        {bankParsed && bankParsed.length > 0 && (
          <div>
            <div className="max-h-[300px] overflow-y-auto rounded-lg border border-[#1e2631] mb-3">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#131a23]">
                  <tr className="text-[#70767f] text-left">
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Description</th>
                    <th className="px-2 py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2631]">
                  {bankParsed.slice(0, 50).map((tx, i) => (
                    <tr key={i} className="text-[#a6abb5]">
                      <td className="px-2 py-1.5 whitespace-nowrap">{tx.date}</td>
                      <td className="px-2 py-1.5 truncate max-w-[150px]">{tx.description}</td>
                      <td className={`px-2 py-1.5 text-right whitespace-nowrap font-medium ${
                        tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bankParsed.length > 50 && (
                <p className="text-xs text-[#70767f] text-center py-2">
                  Showing 50 of {bankParsed.length} transactions
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setBankParsed(null)
                  setBankFile(null)
                  setBankDupWarning(0)
                  if (bankInputRef.current) bankInputRef.current.value = ''
                }}
                className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBankImport}
                disabled={bankImporting}
                className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 text-sm transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bankImporting
                  ? 'Importing...'
                  : `Import ${bankParsed.length} transaction${bankParsed.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Invoice / Receipt Upload Zone ───────────────────────── */}
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
        <h3 className="text-sm font-medium text-[#a6abb5] mb-3">
          Invoice / Receipt
          <span className="text-xs font-medium bg-[#7C3AED]/30 text-[#c084fc] px-2 py-0.5 rounded-full ml-2">
            1 credit
          </span>
        </h3>

        {invoiceError && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {invoiceError}
          </div>
        )}

        {!invoiceExtracted && !invoiceLoading && (
          <div
            {...createDropHandler(INVOICE_ACCEPT, handleInvoiceFileSelect)}
            className="border-2 border-dashed border-[#1e2631] rounded-xl p-6 text-center hover:border-[#3D6AF2]/50 transition-colors cursor-pointer"
            onClick={() => invoiceInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') invoiceInputRef.current?.click() }}
          >
            <input
              ref={invoiceInputRef}
              type="file"
              accept={INVOICE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleInvoiceFileSelect(file)
              }}
            />
            <div className="text-2xl mb-2">🧾</div>
            <p className="text-sm text-[#a6abb5] mb-1">Drop invoice or receipt here</p>
            <p className="text-xs text-[#70767f]">
              PDF, PNG, JPG, HEIC
            </p>
            {invoiceFile && (
              <p className="text-xs text-[#3D6AF2] mt-2">{invoiceFile.name}</p>
            )}
          </div>
        )}

        {invoiceLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-[#a6abb5]">
              Extracting invoice data...
            </div>
          </div>
        )}

        {/* Extracted Invoice Preview */}
        {invoiceExtracted && (
          <div>
            <div className="rounded-lg border border-[#1e2631] p-3 mb-3 space-y-2">
              <InvoiceField label="Vendor" value={invoiceExtracted.vendor} />
              <InvoiceField label="Date" value={invoiceExtracted.date} />
              <InvoiceField label="Invoice #" value={invoiceExtracted.invoiceNumber} />
              <InvoiceField label="Description" value={invoiceExtracted.description} />
              <div className="border-t border-[#1e2631] pt-2 mt-2 space-y-1">
                <InvoiceField
                  label="Total (inc GST)"
                  value={invoiceExtracted.totalIncGst != null ? formatCurrency(invoiceExtracted.totalIncGst) : null}
                />
                <InvoiceField
                  label="GST"
                  value={invoiceExtracted.gstAmount != null ? formatCurrency(invoiceExtracted.gstAmount) : null}
                />
                <InvoiceField
                  label="Total (ex GST)"
                  value={invoiceExtracted.totalExGst != null ? formatCurrency(invoiceExtracted.totalExGst) : null}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setInvoiceExtracted(null)
                  setInvoiceFile(null)
                  if (invoiceInputRef.current) invoiceInputRef.current.value = ''
                }}
                className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInvoiceSave}
                disabled={invoiceSaving}
                className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 text-sm transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {invoiceSaving ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Invoice Field Helper ──────────────────────────────────────────

function InvoiceField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-[#70767f] shrink-0 w-28">{label}</span>
      <span className={value ? 'text-white' : 'text-[#4a5060] italic'}>
        {value ?? 'Not detected'}
      </span>
    </div>
  )
}
