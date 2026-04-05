import type {
  MatchLevel,
  PathwayId,
  PathwayMatch,
  PointsBreakdown,
  QuizAnswers,
  RequirementCheck,
} from './types'
import { FEES } from './fees-data'

// ─── Points Tables ─────────────────────────────────────────────────────────────

const AGE_POINTS: Record<string, number> = {
  'under-25': 0,
  '25-29': 30,
  '30-39': 25,
  '40-44': 20,
  '45-49': 10,
  '50-55': 5,
  'over-55': 0,
}

const QUALIFICATION_POINTS: Record<string, number> = {
  phd: 70,
  masters: 50,
  bachelors: 40,
  diploma: 30,
  trade: 30,
  'high-school': 0,
  none: 0,
}

const EXPERIENCE_POINTS: Record<string, number> = {
  '0': 0,
  '1-2': 5,
  '3-5': 10,
  '6-9': 15,
  '10+': 20,
}

const JOB_OFFER_POINTS: Record<string, { base: number; bonus: number }> = {
  'yes-green-list': { base: 50, bonus: 10 },
  'yes-other': { base: 50, bonus: 0 },
  no: { base: 0, bonus: 0 },
  na: { base: 0, bonus: 0 },
}

// ─── Helper Predicates ─────────────────────────────────────────────────────────

function hasDegree(answers: QuizAnswers): boolean {
  return ['phd', 'masters', 'bachelors'].includes(answers.qualification ?? '')
}

function hasDiplomaOrAbove(answers: QuizAnswers): boolean {
  return ['phd', 'masters', 'bachelors', 'diploma', 'trade'].includes(
    answers.qualification ?? ''
  )
}

function hasSubstantialExperience(answers: QuizAnswers): boolean {
  return ['3-5', '6-9', '10+'].includes(answers.experience ?? '')
}

function hasSomeExperience(answers: QuizAnswers): boolean {
  return ['1-2', '3-5', '6-9', '10+'].includes(answers.experience ?? '')
}

function isWorkingAge(answers: QuizAnswers): boolean {
  return ['25-29', '30-39', '40-44', '45-49', '50-55'].includes(answers.age ?? '')
}

function hasGreenListOffer(answers: QuizAnswers): boolean {
  return answers.jobOffer === 'yes-green-list'
}

function hasAnyJobOffer(answers: QuizAnswers): boolean {
  return ['yes-green-list', 'yes-other'].includes(answers.jobOffer ?? '')
}

function isOnStudentVisa(answers: QuizAnswers): boolean {
  return answers.location === 'student-visa'
}

function isAlreadyInNZOnWork(answers: QuizAnswers): boolean {
  return answers.location === 'work-visa'
}

function isAlreadyResident(answers: QuizAnswers): boolean {
  return answers.location === 'citizen'
}

function isOlderApplicant(answers: QuizAnswers): boolean {
  return ['50-55', 'over-55'].includes(answers.age ?? '')
}

function isEmployer(answers: QuizAnswers): boolean {
  return answers.who === 'employer'
}

// ─── calculatePoints ──────────────────────────────────────────────────────────

/**
 * Calculate the SMC points breakdown based on quiz answers.
 * Partner bonus (20) and NZ study bonus (10) are not asked in the quiz —
 * they are left at 0 and labeled as unknown.
 */
export function calculatePoints(answers: QuizAnswers): PointsBreakdown {
  const age = AGE_POINTS[answers.age ?? ''] ?? 0
  const qualifications = QUALIFICATION_POINTS[answers.qualification ?? ''] ?? 0
  const experience = EXPERIENCE_POINTS[answers.experience ?? ''] ?? 0
  const offerInfo = JOB_OFFER_POINTS[answers.jobOffer ?? ''] ?? { base: 0, bonus: 0 }
  const jobOffer = offerInfo.base
  const greenListBonus = offerInfo.bonus
  const partnerBonus = 0   // not asked in quiz
  const nzStudyBonus = 0   // not asked in quiz

  const total = age + qualifications + experience + jobOffer + greenListBonus + partnerBonus + nzStudyBonus

  return {
    age,
    qualifications,
    experience,
    jobOffer,
    greenListBonus,
    partnerBonus,
    nzStudyBonus,
    total,
  }
}

// ─── checkRequirements ────────────────────────────────────────────────────────

export function checkRequirements(
  pathwayId: PathwayId,
  answers: QuizAnswers
): RequirementCheck[] {
  switch (pathwayId) {
    case 'smc':
      return [
        {
          label: 'Bachelor\'s degree or higher',
          status: hasDegree(answers) ? 'met' : hasDiplomaOrAbove(answers) ? 'not-met' : 'not-met',
        },
        {
          label: '3+ years of skilled work experience',
          status: hasSubstantialExperience(answers) ? 'met' : hasSomeExperience(answers) ? 'not-met' : 'not-met',
        },
        {
          label: 'Age 25–55 (optimal for points)',
          status: isWorkingAge(answers) ? 'met' : answers.age ? 'not-met' : 'unknown',
        },
        {
          label: 'English language ability (IELTS 6.5+)',
          status: 'unknown',
        },
        {
          label: 'SMC points threshold (minimum 160 points)',
          status: calculatePoints(answers).total >= 160 ? 'met' : calculatePoints(answers).total >= 100 ? 'not-met' : 'not-met',
        },
      ]

    case 'aewv':
      return [
        {
          label: 'Job offer from an INZ-accredited employer',
          status: hasAnyJobOffer(answers) ? 'met' : answers.jobOffer === 'no' ? 'not-met' : 'unknown',
        },
        {
          label: 'Relevant qualifications or experience',
          status: hasDiplomaOrAbove(answers) || hasSomeExperience(answers) ? 'met' : 'unknown',
        },
        {
          label: 'Role meets salary threshold',
          status: 'unknown',
        },
        {
          label: 'Not already a NZ citizen or resident',
          status: isAlreadyResident(answers) ? 'not-met' : 'met',
        },
      ]

    case 'green-list-1':
      return [
        {
          label: 'Job offer in a Tier 1 Green List occupation',
          status: hasGreenListOffer(answers) ? 'met' : answers.jobOffer ? 'not-met' : 'unknown',
        },
        {
          label: 'Relevant qualification or NZ registration',
          status: hasDegree(answers) ? 'met' : hasDiplomaOrAbove(answers) ? 'possible' : 'unknown',
        },
        {
          label: 'English language ability',
          status: 'unknown',
        },
        {
          label: 'Registration with NZ professional body (if required)',
          status: 'unknown',
        },
      ]

    case 'green-list-2':
      return [
        {
          label: 'Job offer in a Tier 2 Green List occupation',
          status: hasGreenListOffer(answers) ? 'met' : answers.jobOffer ? 'not-met' : 'unknown',
        },
        {
          label: 'Relevant trade or vocational qualification',
          status: answers.qualification === 'trade' ? 'met' : hasDiplomaOrAbove(answers) ? 'possible' : 'unknown',
        },
        {
          label: 'Employer holds INZ accreditation',
          status: 'unknown',
        },
        {
          label: '2 years NZ work experience (for residence)',
          status: isAlreadyInNZOnWork(answers) ? 'possible' : 'unknown',
        },
      ]

    case 'post-study':
      return [
        {
          label: 'Currently in NZ on a Student Visa',
          status: isOnStudentVisa(answers) ? 'met' : answers.location ? 'not-met' : 'unknown',
        },
        {
          label: 'Completed an eligible NZ qualification (Level 7+)',
          status: hasDegree(answers) || answers.qualification === 'diploma' ? 'possible' : 'unknown',
        },
        {
          label: 'Studied at a NZ institution for at least 2 years',
          status: 'unknown',
        },
      ]

    case 'student':
      return [
        {
          label: 'Accepted place at a NZ registered education provider',
          status: 'unknown',
        },
        {
          label: 'Sufficient funds (NZ$15,000+ per year)',
          status: 'unknown',
        },
        {
          label: 'Not currently on a work visa in NZ',
          status: isAlreadyInNZOnWork(answers) ? 'not-met' : isAlreadyResident(answers) ? 'not-met' : 'possible',
        },
        {
          label: 'English language ability (IELTS 5.5+)',
          status: 'unknown',
        },
      ]

    case 'partner':
      return [
        {
          label: 'Partner is a NZ citizen, resident, or work visa holder',
          status: 'unknown',
        },
        {
          label: 'Genuine and stable relationship (12+ months)',
          status: 'unknown',
        },
        {
          label: 'Not already a NZ citizen or resident',
          status: isAlreadyResident(answers) ? 'not-met' : 'possible',
        },
      ]

    case 'parent':
      return [
        {
          label: 'Adult child who is a NZ citizen or permanent resident',
          status: 'unknown',
        },
        {
          label: 'Age — typically 55+ for parent categories',
          status: isOlderApplicant(answers) ? 'met' : answers.age ? 'possible' : 'unknown',
        },
        {
          label: 'Sufficient settlement funds',
          status: 'unknown',
        },
        {
          label: 'Expression of Interest (EOI) selected in ballot',
          status: 'unknown',
        },
      ]
  }
}

// ─── Internal match-level calculators ─────────────────────────────────────────

function matchSmc(answers: QuizAnswers): MatchLevel {
  if (isAlreadyResident(answers)) return 'unlikely'
  if (isEmployer(answers)) return 'unlikely'
  const points = calculatePoints(answers)
  if (hasDegree(answers) && hasSubstantialExperience(answers) && isWorkingAge(answers)) {
    return points.total >= 100 ? 'strong' : 'possible'
  }
  if (hasDiplomaOrAbove(answers) && hasSomeExperience(answers)) return 'possible'
  return 'unlikely'
}

function matchAewv(answers: QuizAnswers): MatchLevel {
  if (isAlreadyResident(answers)) return 'unlikely'
  if (isEmployer(answers)) return 'strong'
  if (hasAnyJobOffer(answers)) return 'strong'
  if (answers.jobOffer === 'no') return 'possible'
  return 'unlikely'
}

function matchGreenList1(answers: QuizAnswers): MatchLevel {
  if (isAlreadyResident(answers)) return 'unlikely'
  if (hasGreenListOffer(answers)) return 'strong'
  return 'unlikely'
}

function matchGreenList2(answers: QuizAnswers): MatchLevel {
  if (isAlreadyResident(answers)) return 'unlikely'
  if (hasGreenListOffer(answers)) return 'strong'
  return 'unlikely'
}

function matchPostStudy(answers: QuizAnswers): MatchLevel {
  if (isOnStudentVisa(answers)) return 'strong'
  return 'unlikely'
}

function matchStudent(answers: QuizAnswers): MatchLevel {
  if (isAlreadyResident(answers) || isAlreadyInNZOnWork(answers)) return 'unlikely'
  if (!hasAnyJobOffer(answers) && hasDiplomaOrAbove(answers)) return 'possible'
  if (answers.jobOffer === 'no') return 'possible'
  return 'unlikely'
}

function matchPartner(_answers: QuizAnswers): MatchLevel {
  // We don't ask about the partner in the quiz, so we can't rule it out.
  return 'possible'
}

function matchParent(answers: QuizAnswers): MatchLevel {
  if (isOlderApplicant(answers)) return 'possible'
  return 'unlikely'
}

// ─── Pathway definitions ───────────────────────────────────────────────────────

const PATHWAY_META: Record<PathwayId, { name: string; description: string }> = {
  smc: {
    name: 'Skilled Migrant Category (Resident Visa)',
    description:
      'A points-based residence visa for skilled workers. Requires 160+ points from age, qualifications, experience, and a job offer.',
  },
  aewv: {
    name: 'Accredited Employer Work Visa (AEWV)',
    description:
      'A temporary work visa for people with a job offer from an INZ-accredited NZ employer. Valid for up to 5 years.',
  },
  'green-list-1': {
    name: 'Green List Tier 1 — Straight to Residence',
    description:
      'Fast-track residence for highly sought-after occupations. Eligible workers with a job offer can apply directly for residence.',
  },
  'green-list-2': {
    name: 'Green List Tier 2 — Work to Residence',
    description:
      'Work visa pathway for skilled trades on the Green List. After 2 years working in NZ you can apply for residence.',
  },
  'post-study': {
    name: 'Post-Study Work Visa',
    description:
      'Open work visa for recent NZ graduates. Allows you to work for any employer in NZ for 1–3 years after completing your studies.',
  },
  student: {
    name: 'Student Visa',
    description:
      'Study at a New Zealand institution. Includes the right to work part-time during your studies and opens pathways to post-study work and residence.',
  },
  partner: {
    name: 'Partner of a New Zealander Visa',
    description:
      'For people in a genuine and stable relationship (12+ months) with a NZ citizen, permanent resident, or work visa holder.',
  },
  parent: {
    name: 'Parent Resident Visa',
    description:
      'Residence for parents of NZ citizens and residents. Entry is via an Expression of Interest ballot — places are limited each year.',
  },
}

const MATCH_LEVEL_ORDER: Record<MatchLevel, number> = {
  strong: 0,
  possible: 1,
  unlikely: 2,
}

// ─── matchPathways ─────────────────────────────────────────────────────────────

/**
 * Evaluate all 8 pathways against the quiz answers.
 * Returns PathwayMatch[] sorted by match level: strong → possible → unlikely.
 */
export function matchPathways(answers: QuizAnswers): PathwayMatch[] {
  const pathwayIds: PathwayId[] = [
    'smc',
    'aewv',
    'green-list-1',
    'green-list-2',
    'post-study',
    'student',
    'partner',
    'parent',
  ]

  const matchers: Record<PathwayId, (a: QuizAnswers) => MatchLevel> = {
    smc: matchSmc,
    aewv: matchAewv,
    'green-list-1': matchGreenList1,
    'green-list-2': matchGreenList2,
    'post-study': matchPostStudy,
    student: matchStudent,
    partner: matchPartner,
    parent: matchParent,
  }

  const results: PathwayMatch[] = pathwayIds.map((id) => {
    const matchLevel = matchers[id](answers)
    return {
      id,
      name: PATHWAY_META[id].name,
      description: PATHWAY_META[id].description,
      matchLevel,
      requirements: checkRequirements(id, answers),
      fee: FEES[id],
    }
  })

  return results.sort(
    (a, b) => MATCH_LEVEL_ORDER[a.matchLevel] - MATCH_LEVEL_ORDER[b.matchLevel]
  )
}
