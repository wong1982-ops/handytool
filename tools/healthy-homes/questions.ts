// ─── Healthy Homes Questions & Evaluation ────────────────────────────────────

import type { StandardId, ChecklistQuestion, ChecklistAnswers } from './types'

// ─── Standard Labels ──────────────────────────────────────────────────────────

export const STANDARD_LABELS: Record<StandardId, string> = {
  heating: 'Heating',
  insulation: 'Insulation',
  ventilation: 'Ventilation',
  moisture: 'Moisture Ingress & Drainage',
  draught: 'Draught Stopping',
}

// ─── Questions ────────────────────────────────────────────────────────────────

export const QUESTIONS: ChecklistQuestion[] = [
  // ── Heating ────────────────────────────────────────────────────────────────
  {
    id: 'h1',
    standard: 'heating',
    question: 'Does the property have a fixed heater in the main living area?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    hint: 'Fixed heaters include heat pumps, flued gas heaters, pellet burners, and wood burners.',
  },
  {
    id: 'h2',
    standard: 'heating',
    question: 'What type of heater is installed in the main living area?',
    type: 'select',
    options: [
      { value: 'heat-pump', label: 'Heat pump' },
      { value: 'flued-gas', label: 'Flued gas heater' },
      { value: 'pellet-burner', label: 'Pellet burner' },
      { value: 'wood-burner', label: 'Wood burner / log fire' },
      { value: 'electric-panel', label: 'Fixed electric panel heater' },
      { value: 'none', label: 'No fixed heater' },
    ],
  },
  {
    id: 'h3_length',
    standard: 'heating',
    question: 'What is the length of the main living area?',
    type: 'number',
    unit: 'm',
    hint: 'Used to calculate the required heater capacity.',
  },
  {
    id: 'h3_width',
    standard: 'heating',
    question: 'What is the width of the main living area?',
    type: 'number',
    unit: 'm',
  },
  {
    id: 'h3_height',
    standard: 'heating',
    question: 'What is the ceiling height of the main living area?',
    type: 'number',
    unit: 'm',
    hint: 'Standard ceiling height is 2.4 m.',
  },

  // ── Insulation ─────────────────────────────────────────────────────────────
  {
    id: 'i1',
    standard: 'insulation',
    question: 'Does the property have ceiling insulation?',
    type: 'radio',
    options: [
      { value: 'yes-compliant', label: 'Yes — meets 2008 Building Code (R-value ≥ 2.9)' },
      { value: 'yes-non-compliant', label: 'Yes — does not meet 2008 Building Code' },
      { value: 'no', label: 'No ceiling insulation' },
    ],
  },
  {
    id: 'i2',
    standard: 'insulation',
    question: 'Does the property have underfloor insulation (if applicable)?',
    type: 'radio',
    options: [
      { value: 'yes-compliant', label: 'Yes — meets 2008 Building Code (R-value ≥ 1.3)' },
      { value: 'yes-non-compliant', label: 'Yes — does not meet 2008 Building Code' },
      { value: 'no', label: 'No underfloor insulation' },
      { value: 'na', label: 'Not applicable (e.g. slab foundation)' },
    ],
  },

  // ── Ventilation ────────────────────────────────────────────────────────────
  {
    id: 'v1',
    standard: 'ventilation',
    question: 'Is there an extractor fan in the kitchen?',
    type: 'radio',
    options: [
      { value: 'yes-outside', label: 'Yes — vents to outside' },
      { value: 'yes-recirculating', label: 'Yes — recirculating (does not vent outside)' },
      { value: 'no', label: 'No extractor fan' },
    ],
    hint: 'The fan must vent to outside to comply with the standard.',
  },
  {
    id: 'v2',
    standard: 'ventilation',
    question: 'Is there an extractor fan in the bathroom?',
    type: 'radio',
    options: [
      { value: 'yes-outside', label: 'Yes — vents to outside' },
      { value: 'yes-recirculating', label: 'Yes — recirculating (does not vent outside)' },
      { value: 'no', label: 'No extractor fan' },
    ],
    hint: 'The fan must vent to outside to comply with the standard.',
  },
  {
    id: 'v3',
    standard: 'ventilation',
    question: 'Do habitable rooms have openable windows or skylights?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes — all habitable rooms' },
      { value: 'partial', label: 'Partial — some rooms do not' },
      { value: 'no', label: 'No' },
    ],
  },

  // ── Moisture ───────────────────────────────────────────────────────────────
  {
    id: 'm1',
    standard: 'moisture',
    question: 'Does the property have effective drainage and no moisture issues?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes — no moisture problems observed' },
      { value: 'no', label: 'No — moisture, dampness, or drainage issues present' },
    ],
  },
  {
    id: 'm2',
    standard: 'moisture',
    question: 'Are gutters and downpipes in good working order?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes — gutters and downpipes clear and functional' },
      { value: 'no', label: 'No — blocked, leaking, or missing' },
    ],
  },
  {
    id: 'm3',
    standard: 'moisture',
    question:
      'If the property has a suspended floor, is there a ground moisture barrier installed?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes — ground moisture barrier in place' },
      { value: 'no', label: 'No — barrier missing or damaged' },
      { value: 'na', label: 'Not applicable (slab or other foundation)' },
    ],
  },

  // ── Draught Stopping ───────────────────────────────────────────────────────
  {
    id: 'd1',
    standard: 'draught',
    question: 'Are all unused chimneys and fireplaces blocked?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes — all blocked' },
      { value: 'no', label: 'No — one or more open or unblocked' },
      { value: 'na', label: 'Not applicable — no unused chimneys or fireplaces' },
    ],
    hint: 'Unused chimneys must be blocked to prevent heat loss.',
  },
  {
    id: 'd2',
    standard: 'draught',
    question: 'Are gaps and holes in walls, ceilings, and floors sealed?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes — all gaps sealed' },
      { value: 'partial', label: 'Partial — some gaps remain' },
      { value: 'no', label: 'No — significant gaps present' },
    ],
  },
]

// ─── Evaluation ───────────────────────────────────────────────────────────────

export function evaluateStandard(
  standardId: StandardId,
  answers: ChecklistAnswers,
): { status: 'compliant' | 'non-compliant' | 'not-checked'; issues: string[] } {
  const issues: string[] = []

  switch (standardId) {
    case 'heating': {
      if (answers.h1 === undefined) return { status: 'not-checked', issues: [] }
      if (answers.h1 === 'no') {
        issues.push('No fixed heater in the main living area.')
      }
      if (answers.h2 === 'none') {
        issues.push('Heater type is set to none.')
      }
      break
    }

    case 'insulation': {
      if (answers.i1 === undefined) return { status: 'not-checked', issues: [] }
      if (answers.i1 === 'no') {
        issues.push('No ceiling insulation installed.')
      } else if (answers.i1 === 'yes-non-compliant') {
        issues.push('Ceiling insulation does not meet 2008 Building Code requirements.')
      }
      if (answers.i2 !== undefined && answers.i2 !== 'na') {
        if (answers.i2 === 'no') {
          issues.push('No underfloor insulation installed.')
        } else if (answers.i2 === 'yes-non-compliant') {
          issues.push('Underfloor insulation does not meet 2008 Building Code requirements.')
        }
      }
      break
    }

    case 'ventilation': {
      if (answers.v1 === undefined) return { status: 'not-checked', issues: [] }
      if (answers.v1 === 'no') {
        issues.push('No extractor fan in the kitchen.')
      } else if (answers.v1 === 'yes-recirculating') {
        issues.push('Kitchen extractor fan does not vent to outside.')
      }
      if (answers.v2 === 'no') {
        issues.push('No extractor fan in the bathroom.')
      } else if (answers.v2 === 'yes-recirculating') {
        issues.push('Bathroom extractor fan does not vent to outside.')
      }
      if (answers.v3 === 'no') {
        issues.push('No openable windows or skylights in habitable rooms.')
      } else if (answers.v3 === 'partial') {
        issues.push('Some habitable rooms do not have openable windows or skylights.')
      }
      break
    }

    case 'moisture': {
      if (answers.m1 === undefined) return { status: 'not-checked', issues: [] }
      if (answers.m1 === 'no') {
        issues.push('Moisture, dampness, or drainage issues present.')
      }
      if (answers.m2 === 'no') {
        issues.push('Gutters or downpipes are blocked, leaking, or missing.')
      }
      if (answers.m3 !== undefined && answers.m3 !== 'na' && answers.m3 === 'no') {
        issues.push('Ground moisture barrier missing or damaged under suspended floor.')
      }
      break
    }

    case 'draught': {
      if (answers.d1 === undefined) return { status: 'not-checked', issues: [] }
      if (answers.d1 === 'no') {
        issues.push('Unused chimneys or fireplaces are not blocked.')
      }
      if (answers.d2 === 'no') {
        issues.push('Significant gaps in walls, ceilings, or floors are not sealed.')
      } else if (answers.d2 === 'partial') {
        issues.push('Some gaps in walls, ceilings, or floors remain unsealed.')
      }
      break
    }
  }

  return {
    status: issues.length === 0 ? 'compliant' : 'non-compliant',
    issues,
  }
}
