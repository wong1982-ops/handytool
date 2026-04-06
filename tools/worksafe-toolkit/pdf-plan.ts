import { jsPDF } from 'jspdf'
import type { IndustryId, PlanData } from './types'
import { INDUSTRIES, WORKPLACE_QUESTIONS, INDUSTRY_HAZARDS } from './industry-data'

const PRIMARY = [61, 106, 242] as const // #3D6AF2

function sectionTitle(doc: jsPDF, text: string, y: number, marginX: number, contentWidth: number): number {
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text(text, marginX, y)
  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(marginX, y, marginX + contentWidth, y)
  return y + 7
}

function bodyText(doc: jsPDF, text: string, y: number, marginX: number, contentWidth: number, indent = 0): number {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  const lines = doc.splitTextToSize(text, contentWidth - indent)
  doc.text(lines, marginX + indent, y)
  return y + lines.length * 5.5
}

function checkPageBreak(doc: jsPDF, y: number, needed = 12): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed > pageHeight - 18) {
    doc.addPage()
    return 20
  }
  return y
}

export function generatePlanPdf(data: PlanData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 20
  const contentWidth = pageWidth - marginX * 2
  let y = 20

  const industry = INDUSTRIES.find((i) => i.id === data.industry)
  const industryName = industry?.name ?? data.industry
  const businessLabel = data.businessName.trim() || 'Your Business'
  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })

  // ── Cover ────────────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageWidth, 45, 'F')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Health & Safety Management Plan', marginX, 22)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text(businessLabel, marginX, 32)

  doc.setFontSize(10)
  doc.text(`Industry: ${industryName}  •  Generated: ${today}`, marginX, 40)

  y = 58

  // ── Purpose ──────────────────────────────────────────────────────────────────
  y = sectionTitle(doc, '1. Purpose of this Plan', y, marginX, contentWidth)
  y = bodyText(doc, `This Health and Safety Management Plan has been prepared for ${businessLabel} operating in the ${industryName} sector. It outlines our commitment to providing a safe and healthy workplace for all workers, contractors, and visitors, in accordance with the Health and Safety at Work Act 2015 (HSWA).`, y, marginX, contentWidth)
  y += 5

  // ── Scope ────────────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  y = sectionTitle(doc, '2. Scope and Applicability', y, marginX, contentWidth)
  y = bodyText(doc, 'This plan applies to all persons at our workplace including employees, contractors, subcontractors, volunteers, and visitors. It covers all activities undertaken as part of our business operations.', y, marginX, contentWidth)
  y += 5

  // ── Policy Statements ────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  y = sectionTitle(doc, '3. Health & Safety Policy Statements', y, marginX, contentWidth)

  const answeredYes = WORKPLACE_QUESTIONS.filter(
    (q) => q.industries.includes(data.industry as IndustryId) && data.questions[q.id] === true
  )
  const answeredNo = WORKPLACE_QUESTIONS.filter(
    (q) => q.industries.includes(data.industry as IndustryId) && data.questions[q.id] === false
  )

  if (answeredYes.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(34, 139, 34)
    doc.text('Current Strengths:', marginX, y)
    y += 6
    for (const q of answeredYes) {
      y = checkPageBreak(doc, y, 8)
      y = bodyText(doc, `✓  ${q.question}`, y, marginX, contentWidth, 4)
    }
    y += 3
  }

  if (answeredNo.length > 0) {
    y = checkPageBreak(doc, y, 8)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 80, 0)
    doc.text('Priority Actions Required:', marginX, y)
    y += 6
    for (const q of answeredNo) {
      y = checkPageBreak(doc, y, 8)
      y = bodyText(doc, `○  ${q.question}`, y, marginX, contentWidth, 4)
    }
    y += 3
  }

  // ── Key Hazards ──────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  y = sectionTitle(doc, `4. Key Hazards — ${industryName}`, y, marginX, contentWidth)

  const hazards = INDUSTRY_HAZARDS[data.industry as IndustryId] ?? []
  for (const hazard of hazards.slice(0, 5)) {
    y = checkPageBreak(doc, y, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    const riskColors: Record<string, [number, number, number]> = {
      low: [34, 139, 34],
      medium: [217, 119, 6],
      high: [220, 38, 38],
      critical: [109, 0, 109],
    }
    const rc = riskColors[hazard.riskLevel] ?? [100, 100, 100]
    doc.setTextColor(...rc)
    doc.text(`[${hazard.riskLevel.toUpperCase()}]`, marginX, y)
    doc.setTextColor(40, 40, 40)
    const hazardLines = doc.splitTextToSize(hazard.hazard, contentWidth - 22)
    doc.text(hazardLines, marginX + 22, y)
    y += hazardLines.length * 5.5
    y = bodyText(doc, `Controls: ${hazard.controls}`, y, marginX, contentWidth, 4)
    y += 3
  }

  // ── Emergency Procedures ─────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 30)
  y = sectionTitle(doc, '5. Emergency Procedures', y, marginX, contentWidth)
  const emergencyItems = [
    'Raise the alarm immediately using the fire alarm or by calling out loudly.',
    'Call 111 for police, fire, or ambulance as required.',
    'Evacuate all persons from the premises via the nearest safe exit.',
    'Assemble at the designated muster point away from the building.',
    'Do not re-enter the building until authorised by emergency services.',
    'Report all emergencies and near-misses to the H&S person promptly.',
    'For notifiable events (deaths, serious injuries, dangerous incidents): call WorkSafe NZ immediately on 0800 030 040.',
  ]
  for (const item of emergencyItems) {
    y = checkPageBreak(doc, y, 8)
    y = bodyText(doc, `• ${item}`, y, marginX, contentWidth, 4)
  }
  y += 3

  // ── Incident Reporting ───────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 25)
  y = sectionTitle(doc, '6. Incident Reporting', y, marginX, contentWidth)
  y = bodyText(doc, 'All incidents, near misses, and hazards must be reported as soon as practicable using the incident report form. Investigation will occur within 48 hours of notification. Corrective actions will be implemented and tracked to closure.', y, marginX, contentWidth)
  y += 4
  y = bodyText(doc, 'Notifiable events must be reported to WorkSafe NZ immediately by calling 0800 030 040. Do not disturb the scene unless necessary to prevent further harm.', y, marginX, contentWidth)
  y += 3

  // ── Worker Engagement ────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 25)
  y = sectionTitle(doc, '7. Worker Engagement', y, marginX, contentWidth)
  y = bodyText(doc, 'We are committed to actively engaging with workers on H&S matters. This includes regular toolbox talks, the opportunity to elect a Health and Safety Representative (HSR), and a no-blame culture for reporting concerns. All worker H&S concerns will be investigated and responded to within five working days.', y, marginX, contentWidth)
  y += 3

  // ── Review ───────────────────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 20)
  y = sectionTitle(doc, '8. Plan Review', y, marginX, contentWidth)
  y = bodyText(doc, 'This Health and Safety Management Plan will be reviewed at least annually, or following any significant incident, change in operations, or legislative update. The review will be conducted with worker input.', y, marginX, contentWidth)

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

  const safeFilename = businessLabel.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  doc.save(`${safeFilename}-hs-plan.pdf`)
}
