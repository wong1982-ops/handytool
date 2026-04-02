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

  // ─── Duplicate Modal State ────────────────────────────────────
  const [dupModalOpen, setDupModalOpen] = useState(false)
  const [dupList, setDupList] = useState<Array<{
    index: number
    existingId: string
    date: string
    description: string
    amount: number
    matchedBy: 'source_ref' | 'fallback'
  }>>([])
  const [dupNewCount, setDupNewCount] = useState(0)

  // ─── Invoice State (multi-file) ─────────────────────────────────
  interface InvoiceItem {
    file: File
    status: 'pending' | 'extracting' | 'done' | 'error'
    extracted: ExtractedInvoice | null
    error?: string
  }
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
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

        const { data: bankDoc } = await uploadRes.json()

        // Step 2: Extract transactions via Gemini
        const extractRes = await fetch('/api/v1/tax-manager/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: bankDoc.document.file_url, type: 'bank-statement' }),
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
      // Step 1: Check for duplicates
      const checkRes = await fetch('/api/v1/tax-manager/transactions/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          transactions: bankParsed,
        }),
      })

      if (!checkRes.ok) {
        const data = await checkRes.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to check for duplicates')
      }

      const { data: checkData } = await checkRes.json()

      // Step 2: If duplicates found, show modal and wait for user choice
      if (checkData.duplicate_count > 0) {
        setDupList(checkData.duplicates)
        setDupNewCount(checkData.new_count)
        setDupModalOpen(true)
        setBankImporting(false)
        return
      }

      // No duplicates — import directly
      await doImport('skip')
    } catch (err) {
      setBankError(err instanceof Error ? err.message : 'Failed to import transactions')
      setBankImporting(false)
    }
  }, [bankParsed, entityId, taxYear])

  const doImport = useCallback(async (onDuplicate: 'skip' | 'replace') => {
    if (!bankParsed || bankParsed.length === 0) return

    setBankImporting(true)
    setBankError(null)
    setDupModalOpen(false)

    try {
      const res = await fetch('/api/v1/tax-manager/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          tax_year: taxYear,
          on_duplicate: onDuplicate,
          transactions: bankParsed,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to import transactions')
      }

      const { data } = await res.json()

      if (data.duplicates && data.duplicates > 0 && onDuplicate === 'skip') {
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
      setDupList([])
      setDupNewCount(0)
    } catch (err) {
      setBankError(err instanceof Error ? err.message : 'Failed to import transactions')
    } finally {
      setBankImporting(false)
    }
  }, [bankParsed, entityId, taxYear, onDocumentUploaded])

  // ─── Invoice Handlers (multi-file) ─────────────────────────────

  const extractSingleInvoice = useCallback(async (file: File): Promise<{ extracted: ExtractedInvoice | null; error?: string }> => {
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
        throw new Error(data?.error ?? 'Failed to upload')
      }

      const { data: docData } = await uploadRes.json()

      // Step 2: Extract via Gemini
      const extractRes = await fetch('/api/v1/tax-manager/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: docData.document.file_url, type: 'invoice' }),
      })

      if (!extractRes.ok) {
        const data = await extractRes.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to extract')
      }

      const { data: extracted } = await extractRes.json()
      return { extracted: extracted.extracted as ExtractedInvoice }
    } catch (err) {
      return { extracted: null, error: err instanceof Error ? err.message : 'Failed to process' }
    }
  }, [entityId, taxYear])

  const handleInvoiceFilesSelect = useCallback(async (files: File[]) => {
    setInvoiceError(null)

    const validFiles = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) return false
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return INVOICE_ACCEPT.split(',').includes(ext)
    })

    if (validFiles.length === 0) {
      setInvoiceError('No valid invoice files selected')
      return
    }

    // Create items with pending status
    const items: InvoiceItem[] = validFiles.map((file) => ({
      file,
      status: 'pending',
      extracted: null,
    }))
    setInvoiceItems(items)
    setInvoiceLoading(true)

    // Process 2 at a time to avoid rate limits
    const CONCURRENCY = 2
    const results = [...items]

    for (let i = 0; i < results.length; i += CONCURRENCY) {
      const batch = results.slice(i, i + CONCURRENCY)
      const batchIndices = batch.map((_, j) => i + j)

      // Mark batch as extracting
      setInvoiceItems((prev) =>
        prev.map((item, idx) =>
          batchIndices.includes(idx) ? { ...item, status: 'extracting' } : item,
        ),
      )

      const batchResults = await Promise.all(
        batch.map((item) => extractSingleInvoice(item.file)),
      )

      // Update results
      batchResults.forEach((result, j) => {
        const idx = i + j
        results[idx] = {
          ...results[idx],
          status: result.error ? 'error' : 'done',
          extracted: result.extracted,
          error: result.error,
        }
      })

      setInvoiceItems([...results])
    }

    setInvoiceLoading(false)
  }, [extractSingleInvoice])

  const handleRemoveInvoice = useCallback((index: number) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleInvoiceSaveAll = useCallback(async () => {
    const readyItems = invoiceItems.filter((item) => item.status === 'done' && item.extracted)
    if (readyItems.length === 0) return

    setInvoiceSaving(true)
    setInvoiceError(null)

    try {
      const transactions = readyItems.map((item) => {
        const inv = item.extracted!
        return {
          date: inv.date ?? new Date().toISOString().split('T')[0],
          description: `${inv.vendor ?? 'Unknown vendor'} \u2014 ${inv.description ?? 'Invoice'}`,
          amount: -(inv.totalIncGst ?? 0),
          gst_amount: inv.gstAmount ?? null,
        }
      })

      const res = await fetch('/api/v1/tax-manager/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          tax_year: taxYear,
          transactions,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save transactions')
      }

      // Trigger categorisation
      await fetch('/api/v1/tax-manager/categorise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, tax_year: taxYear }),
      }).catch(() => {})

      onDocumentUploaded()
      setInvoiceItems([])
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : 'Failed to save invoices')
    } finally {
      setInvoiceSaving(false)
    }
  }, [invoiceItems, entityId, taxYear, onDocumentUploaded])

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

  function createMultiDropHandler(
    accept: string,
    handler: (files: File[]) => void,
  ) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const acceptExts = accept.split(',')
        const files = Array.from(e.dataTransfer.files).filter((f) => {
          const ext = '.' + f.name.split('.').pop()?.toLowerCase()
          return acceptExts.includes(ext)
        })
        if (files.length > 0) handler(files)
      },
    }
  }

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* ── Duplicate Preview Modal ────────────────────────────── */}
      {dupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#131a23] border border-[#1e2631] rounded-2xl p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-1">
              {dupList.length} duplicate transaction{dupList.length !== 1 ? 's' : ''} found
            </h3>
            <p className="text-sm text-[#70767f] mb-4">
              These transactions already exist for this entity. Choose how to proceed.
            </p>

            <div className="max-h-[240px] overflow-y-auto rounded-lg border border-[#1e2631] mb-4">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#131a23]">
                  <tr className="text-[#70767f] text-left">
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Description</th>
                    <th className="px-2 py-2 font-medium text-right">Amount</th>
                    <th className="px-2 py-2 font-medium text-right">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2631]">
                  {dupList.map((dup, i) => (
                    <tr key={i} className="text-[#a6abb5]">
                      <td className="px-2 py-1.5 whitespace-nowrap">{dup.date}</td>
                      <td className="px-2 py-1.5 truncate max-w-[150px]">{dup.description}</td>
                      <td className={`px-2 py-1.5 text-right whitespace-nowrap font-medium ${
                        dup.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(dup.amount)}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          dup.matchedBy === 'source_ref'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {dup.matchedBy === 'source_ref' ? 'Exact ID' : 'Similar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDupModalOpen(false)
                  setDupList([])
                  setDupNewCount(0)
                }}
                className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => doImport('skip')}
                disabled={bankImporting || dupNewCount === 0}
                className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 text-sm transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bankImporting ? 'Importing...' : `Skip Duplicates \u2014 Import ${dupNewCount} new`}
              </button>
              <button
                type="button"
                onClick={() => doImport('replace')}
                disabled={bankImporting}
                className="border border-[#3D6AF2]/50 text-[#3D6AF2] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bankImporting ? 'Importing...' : `Replace All`}
              </button>
            </div>
          </div>
        </div>
      )}

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
            1 credit each
          </span>
        </h3>

        {invoiceError && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {invoiceError}
          </div>
        )}

        {invoiceItems.length === 0 && !invoiceLoading && (
          <div
            {...createMultiDropHandler(INVOICE_ACCEPT, handleInvoiceFilesSelect)}
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
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length > 0) handleInvoiceFilesSelect(files)
              }}
            />
            <div className="text-2xl mb-2">🧾</div>
            <p className="text-sm text-[#a6abb5] mb-1">Upload invoice or receipt</p>
            <p className="text-xs text-[#70767f]">
              Take a photo or select files (PDF, PNG, JPG, HEIC)
            </p>
          </div>
        )}

        {/* Extracting Progress */}
        {invoiceLoading && (
          <div className="mb-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            {invoiceItems.length === 1
              ? 'Extracting invoice data...'
              : `Extracting ${invoiceItems.filter((i) => i.status === 'done').length + invoiceItems.filter((i) => i.status === 'extracting').length} of ${invoiceItems.length} invoices...`}
          </div>
        )}

        {/* ── Single Invoice Detail View ──────────────────────────── */}
        {invoiceItems.length === 1 && invoiceItems[0].status === 'done' && invoiceItems[0].extracted && (
          <div>
            <div className="rounded-lg border border-[#1e2631] p-3 mb-3 space-y-2">
              <InvoiceField label="Vendor" value={invoiceItems[0].extracted.vendor} />
              <InvoiceField label="Date" value={invoiceItems[0].extracted.date} />
              <InvoiceField label="Invoice #" value={invoiceItems[0].extracted.invoiceNumber} />
              <InvoiceField label="Description" value={invoiceItems[0].extracted.description} />
              <div className="border-t border-[#1e2631] pt-2 mt-2 space-y-1">
                <InvoiceField
                  label="Total (inc GST)"
                  value={invoiceItems[0].extracted.totalIncGst != null ? formatCurrency(invoiceItems[0].extracted.totalIncGst) : null}
                />
                <InvoiceField
                  label="GST"
                  value={invoiceItems[0].extracted.gstAmount != null ? formatCurrency(invoiceItems[0].extracted.gstAmount) : null}
                />
                <InvoiceField
                  label="Total (ex GST)"
                  value={invoiceItems[0].extracted.totalExGst != null ? formatCurrency(invoiceItems[0].extracted.totalExGst) : null}
                />
              </div>
            </div>

            <p className="text-xs text-[#70767f] mb-3">{invoiceItems[0].file.name}</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setInvoiceItems([])
                  setInvoiceError(null)
                  if (invoiceInputRef.current) invoiceInputRef.current.value = ''
                }}
                className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInvoiceSaveAll}
                disabled={invoiceSaving}
                className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 text-sm transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {invoiceSaving ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        )}

        {/* Single invoice error */}
        {invoiceItems.length === 1 && invoiceItems[0].status === 'error' && (
          <div>
            <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Failed to extract: {invoiceItems[0].error}
            </div>
            <button
              type="button"
              onClick={() => {
                setInvoiceItems([])
                if (invoiceInputRef.current) invoiceInputRef.current.value = ''
              }}
              className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Multi-Invoice Table View ────────────────────────────── */}
        {invoiceItems.length > 1 && (
          <div>
            <div className="max-h-[350px] overflow-y-auto rounded-lg border border-[#1e2631] mb-3">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#131a23]">
                  <tr className="text-[#70767f] text-left">
                    <th className="px-2 py-2 font-medium">File</th>
                    <th className="px-2 py-2 font-medium">Vendor</th>
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium text-right">Total</th>
                    <th className="px-2 py-2 font-medium text-right">GST</th>
                    <th className="px-2 py-2 font-medium text-center">Status</th>
                    <th className="px-2 py-2 font-medium w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2631]">
                  {invoiceItems.map((item, i) => (
                    <tr key={i} className="text-[#a6abb5]">
                      <td className="px-2 py-1.5 truncate max-w-[120px]" title={item.file.name}>
                        {item.file.name}
                      </td>
                      <td className="px-2 py-1.5 truncate max-w-[100px]">
                        {item.extracted?.vendor ?? '\u2014'}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {item.extracted?.date ?? '\u2014'}
                      </td>
                      <td className="px-2 py-1.5 text-right whitespace-nowrap font-medium text-red-400">
                        {item.extracted?.totalIncGst != null ? formatCurrency(item.extracted.totalIncGst) : '\u2014'}
                      </td>
                      <td className="px-2 py-1.5 text-right whitespace-nowrap">
                        {item.extracted?.gstAmount != null ? formatCurrency(item.extracted.gstAmount) : '\u2014'}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {item.status === 'pending' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e2631] text-[#70767f]">Pending</span>
                        )}
                        {item.status === 'extracting' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Extracting</span>
                        )}
                        {item.status === 'done' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Ready</span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400" title={item.error}>
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoice(i)}
                          className="text-[#70767f] hover:text-red-400 transition-colors cursor-pointer text-sm"
                          title="Remove"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(() => {
              const readyCount = invoiceItems.filter((i) => i.status === 'done').length
              const errorCount = invoiceItems.filter((i) => i.status === 'error').length
              return (
                <>
                  {errorCount > 0 && (
                    <p className="text-xs text-red-400 mb-2">
                      {errorCount} invoice{errorCount !== 1 ? 's' : ''} failed to extract
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setInvoiceItems([])
                        setInvoiceError(null)
                        if (invoiceInputRef.current) invoiceInputRef.current.value = ''
                      }}
                      className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleInvoiceSaveAll}
                      disabled={invoiceSaving || invoiceLoading || readyCount === 0}
                      className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 text-sm transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {invoiceSaving
                        ? 'Saving...'
                        : `Import ${readyCount} invoice${readyCount !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </>
              )
            })()}
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
