import { jsPDF } from 'jspdf'
import type { IncidentData } from './types'

const PRIMARY = [61, 106, 242] as const

function labelValue(doc: jsPDF, label: string, value: string, y: number, marginX: number, contentWidth: number): number {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text(`${label}:`, marginX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  const lines = doc.splitTextToSize(value || '—', contentWidth - 45)
  doc.text(lines, marginX + 45, y)
  return y + lines.length * 5.5 + 2
}

function fieldBlock(doc: jsPDF, label: string, value: string, y: number, marginX: number, contentWidth: number): number {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text(label, marginX, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  const lines = doc.splitTextToSize(value || 'Not provided', contentWidth)
  doc.text(lines, marginX, y)
  return y + lines.length * 5.5 + 4
}

function checkPageBreak(doc: jsPDF, y: number, needed = 12): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed > pageHeight - 18) {
    doc.addPage()
    return 20
  }
  return y
}

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  'near-miss': 'Near Miss',
  minor: 'Minor Injury / Illness',
  serious: 'Serious Harm',
  notifiable: 'Notifiable Event',
}

export function generateIncidentPdf(data: IncidentData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 20
  const contentWidth = pageWidth - marginX * 2
  let y = 20

  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })
  const isNotifiable = data.type === 'notifiable'

  // ── Header ───────────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Incident Report', marginX, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Prepared: ${today}  •  Type: ${INCIDENT_TYPE_LABELS[data.type] ?? data.type}`, marginX, 32)

  y = 52

  // ── Notifiable Warning ───────────────────────────────────────────────────────
  if (isNotifiable) {
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(220, 38, 38)
    doc.roundedRect(marginX, y - 4, contentWidth, 20, 2, 2, 'FD')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(185, 28, 28)
    doc.text('⚠  NOTIFIABLE EVENT', marginX + 4, y + 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Serious injuries, deaths, and dangerous incidents MUST be reported to WorkSafe NZ.', marginX + 4, y + 9)
    doc.text('Call 0800 030 040 immediately. Do not disturb the scene unless necessary to prevent further harm.', marginX + 4, y + 14)
    y += 26
  }

  // ── Incident Details ─────────────────────────────────────────────────────────
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('1. Incident Details', marginX, y)
  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(marginX, y, marginX + contentWidth, y)
  y += 7

  y = labelValue(doc, 'Date', data.date, y, marginX, contentWidth)
  y = labelValue(doc, 'Time', data.time, y, marginX, contentWidth)
  y = labelValue(doc, 'Location', data.location, y, marginX, contentWidth)
  y = labelValue(doc, 'Incident Type', INCIDENT_TYPE_LABELS[data.type] ?? data.type, y, marginX, contentWidth)
  y += 3

  // ── Description ──────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('2. Description', marginX, y)
  y += 5
  doc.line(marginX, y, marginX + contentWidth, y)
  y += 7

  y = fieldBlock(doc, 'What happened:', data.description, y, marginX, contentWidth)
  y = fieldBlock(doc, 'People involved:', data.people, y, marginX, contentWidth)
  y = fieldBlock(doc, 'Injuries or illness sustained:', data.injuries, y, marginX, contentWidth)

  // ── Immediate Response ───────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('3. Immediate Response', marginX, y)
  y += 5
  doc.line(marginX, y, marginX + contentWidth, y)
  y += 7

  y = fieldBlock(doc, 'Immediate actions taken:', data.immediateActions, y, marginX, contentWidth)

  // ── Investigation ────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('4. Investigation', marginX, y)
  y += 5
  doc.line(marginX, y, marginX + contentWidth, y)
  y += 7

  y = fieldBlock(doc, 'Root cause identified:', data.rootCause, y, marginX, contentWidth)
  y = fieldBlock(doc, 'Corrective actions planned:', data.correctiveActions, y, marginX, contentWidth)

  // ── Signoff ──────────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('5. Report Signoff', marginX, y)
  y += 5
  doc.line(marginX, y, marginX + contentWidth, y)
  y += 7

  y = labelValue(doc, 'Reported by', data.reportedBy, y, marginX, contentWidth)
  y += 10

  // Signature line
  doc.setDrawColor(150, 150, 150)
  doc.line(marginX, y, marginX + 70, y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('Signature', marginX, y + 5)

  doc.line(marginX + 90, y, marginX + 160, y)
  doc.text('Date signed', marginX + 90, y + 5)

  // ── Footer ───────────────────────────────────────────────────────────────────
  const totalPages = (doc.internal as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text('Generated by Toolk1t WorkSafe Toolkit — toolk1t.com', marginX, pageHeight - 10)
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX - 20, pageHeight - 10)
  }

  const dateSlug = data.date.replace(/\//g, '-') || 'undated'
  doc.save(`incident-report-${dateSlug}.pdf`)
}
