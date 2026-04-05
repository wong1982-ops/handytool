import type { FeeInfo, PathwayId } from './types'

/**
 * Immigration New Zealand fees (NZD).
 * Source: Immigration New Zealand fee schedule.
 * Note: Fees are subject to change. Always verify current fees at immigration.govt.nz.
 *
 * Immigration Levy applies to most residence visa applications.
 * Application fees are per person (primary applicant).
 */
export const FEES: Record<PathwayId, FeeInfo> = {
  /**
   * Skilled Migrant Category (SMC)
   * Residence visa — requires Expression of Interest (EOI) first.
   */
  smc: {
    applicationFee: 680,
    immigrationLevy: 580,
    total: 1260,
    processingTime: '6–12 months (after EOI selection)',
  },

  /**
   * Accredited Employer Work Visa (AEWV)
   * Temporary work visa — 1 to 5 years depending on role.
   */
  aewv: {
    applicationFee: 750,
    immigrationLevy: 580,
    total: 1330,
    processingTime: '3–6 weeks (with online application)',
  },

  /**
   * Green List Tier 1 — Straight to Residence
   * Residence visa — same fee structure as SMC.
   */
  'green-list-1': {
    applicationFee: 680,
    immigrationLevy: 580,
    total: 1260,
    processingTime: '3–6 months',
  },

  /**
   * Green List Tier 2 — Work to Residence
   * Temporary work visa first, then residence after 2 years.
   * Fee shown is for the initial work visa (same as AEWV).
   */
  'green-list-2': {
    applicationFee: 750,
    immigrationLevy: 580,
    total: 1330,
    processingTime: '3–6 weeks (work visa) + 2 years before residence',
  },

  /**
   * Post-Study Work Visa
   * Temporary open work visa — 1 to 3 years depending on qualification.
   */
  'post-study': {
    applicationFee: 700,
    immigrationLevy: 580,
    total: 1280,
    processingTime: '4–8 weeks',
  },

  /**
   * Student Visa
   * No immigration levy applies to student visa applications.
   */
  student: {
    applicationFee: 375,
    immigrationLevy: 0,
    total: 375,
    processingTime: '3–8 weeks (apply well before course start)',
  },

  /**
   * Partner of a New Zealander Visa (Resident or Work Visa)
   */
  partner: {
    applicationFee: 760,
    immigrationLevy: 580,
    total: 1340,
    processingTime: '6–12 months (resident); 4–8 weeks (work visa)',
  },

  /**
   * Parent Resident Visa
   * Requires Expression of Interest (EOI) — ballot-based selection.
   */
  parent: {
    applicationFee: 680,
    immigrationLevy: 580,
    total: 1260,
    processingTime: '12–24 months (after EOI selection from ballot)',
  },
}
