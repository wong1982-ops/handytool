import { jsPDF } from 'jspdf';
import type { AssessmentResult, RoadmapItem } from './types';

export function generatePdf(result: AssessmentResult, items: RoadmapItem[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let y = 20;

  const LINE_HEIGHT = 6;
  const SECTION_GAP = 8;

  function checkPageBreak(needed = 10) {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  }

  function sectionTitle(text: string) {
    checkPageBreak(12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(text, marginX, y);
    y += LINE_HEIGHT;
    doc.setDrawColor(200, 200, 200);
    doc.line(marginX, y, marginX + contentWidth, y);
    y += SECTION_GAP;
  }

  function bodyText(text: string, indent = 0) {
    checkPageBreak(LINE_HEIGHT + 2);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, marginX + indent, y);
    y += lines.length * LINE_HEIGHT;
  }

  function labelValue(label: string, value: string) {
    checkPageBreak(LINE_HEIGHT + 2);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`${label}:`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginX + 40, y);
    y += LINE_HEIGHT;
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('E-commerce Readiness Report', marginX, y);
  y += 10;

  const today = new Date().toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${today}`, marginX, y);
  y += 4;
  doc.text('toolk1t.com', marginX, y);
  y += SECTION_GAP * 2;

  // ── Overall Score ──────────────────────────────────────────────────────────
  sectionTitle('Overall Score');
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(61, 106, 242); // #3D6AF2
  doc.text(`${result.overallScore}/100`, marginX, y);
  y += 12;
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text(result.label, marginX, y);
  y += SECTION_GAP;

  // ── Category Scores ────────────────────────────────────────────────────────
  sectionTitle('Category Scores');
  for (const cat of result.categoryScores) {
    checkPageBreak(LINE_HEIGHT + 2);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`${cat.label}:`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`${cat.score}%`, marginX + 60, y);
    if (cat.score < 50) {
      doc.setTextColor(217, 119, 6); // amber
      doc.text('⚠ Needs attention', marginX + 80, y);
    }
    y += LINE_HEIGHT;
  }
  y += SECTION_GAP;

  // ── Platform Recommendation ────────────────────────────────────────────────
  sectionTitle('Recommended Platform');

  const primary = result.primaryRecommendation;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(primary.name, marginX, y);
  y += 7;

  bodyText(primary.tagline);
  labelValue('Monthly cost', `$${primary.monthlyCost} NZD/month`);
  y += 2;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Why this fits you:', marginX, y);
  y += LINE_HEIGHT;
  bodyText(primary.whyFits, 4);
  y += 2;

  if (primary.pros.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('Pros:', marginX, y);
    y += LINE_HEIGHT;
    for (const pro of primary.pros) {
      bodyText(`• ${pro}`, 4);
    }
  }

  if (primary.cons.length) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('Cons:', marginX, y);
    y += LINE_HEIGHT;
    for (const con of primary.cons) {
      bodyText(`• ${con}`, 4);
    }
  }

  y += 4;
  const secondary = result.secondaryRecommendation;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text(`Also consider: ${secondary.name} — $${secondary.monthlyCost}/mo NZD`, marginX, y);
  y += SECTION_GAP;

  // ── Cost Estimate ──────────────────────────────────────────────────────────
  sectionTitle('Estimated First-Year Cost (NZD)');
  const cost = result.costEstimate;
  labelValue('Platform fee', `$${cost.monthlyFee}/month ($${cost.monthlyFee * 12}/year)`);
  labelValue('Payment processing', cost.processingNote);
  labelValue('Domain name', `$${cost.domainYearly}/year`);
  y += 2;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`First Year Total: $${cost.firstYearTotal} NZD`, marginX, y);
  y += SECTION_GAP;

  // ── Roadmap ────────────────────────────────────────────────────────────────
  if (items.length > 0) {
    sectionTitle('Action Roadmap');

    // Group items by phase
    const phaseMap = new Map<number, { phaseLabel: string; phaseTimeline: string; items: RoadmapItem[] }>();
    for (const item of items) {
      if (!phaseMap.has(item.phase)) {
        phaseMap.set(item.phase, {
          phaseLabel: item.phaseLabel,
          phaseTimeline: item.phaseTimeline,
          items: [],
        });
      }
      phaseMap.get(item.phase)!.items.push(item);
    }

    const phases = Array.from(phaseMap.entries()).sort(([a], [b]) => a - b);

    for (const [phaseNum, phaseData] of phases) {
      checkPageBreak(12);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(
        `Phase ${phaseNum} — ${phaseData.phaseLabel} (${phaseData.phaseTimeline})`,
        marginX,
        y,
      );
      y += LINE_HEIGHT + 2;

      for (const item of phaseData.items) {
        checkPageBreak(LINE_HEIGHT * 3);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const titleLines = doc.splitTextToSize(`☐  ${item.title}`, contentWidth - 4);
        doc.text(titleLines, marginX + 4, y);
        y += titleLines.length * LINE_HEIGHT;

        if (item.cost || item.time) {
          const meta = [item.cost, item.time ? `⏱ ${item.time}` : null]
            .filter(Boolean)
            .join('  |  ');
          doc.setFontSize(9);
          doc.setTextColor(130, 130, 130);
          doc.text(meta, marginX + 8, y);
          y += LINE_HEIGHT;
        }
        y += 2;
      }
      y += 4;
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text(
      'Generated by Toolk1t — toolk1t.com',
      marginX,
      pageHeight - 10,
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - marginX - 20,
      pageHeight - 10,
    );
  }

  doc.save('ecommerce-readiness-report.pdf');
}
