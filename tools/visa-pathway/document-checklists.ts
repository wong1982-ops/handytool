import type { DocumentItem, PathwayId } from './types'

type DocumentChecklist = {
  required: DocumentItem[]
  ifApplicable: DocumentItem[]
}

const COMMON_REQUIRED: DocumentItem[] = [
  {
    name: 'Valid passport',
    note: 'Must be valid for at least 15 months from the date of application',
    required: true,
  },
  {
    name: 'Passport-size photos',
    note: '2 recent colour photos meeting INZ specifications',
    required: true,
  },
  {
    name: 'Police certificate',
    note: 'From every country you have lived in for 12+ months since age 17',
    required: true,
  },
  {
    name: 'Medical certificate',
    note: 'From an Immigration New Zealand panel physician',
    required: true,
  },
  {
    name: 'Chest X-ray certificate',
    note: 'Required if you have lived in a TB risk country',
    required: true,
  },
]

const COMMON_IF_APPLICABLE: DocumentItem[] = [
  {
    name: 'Change of name documentation',
    note: 'If your current name differs from your passport (e.g. marriage certificate)',
    required: false,
  },
  {
    name: 'Children\'s passports and birth certificates',
    note: 'If including dependent children in the application',
    required: false,
  },
]

export const DOCUMENT_CHECKLISTS: Record<PathwayId, DocumentChecklist> = {
  smc: {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Qualification assessment from NZQA',
        note: 'New Zealand Qualifications Authority assessment of your overseas qualification',
        required: true,
      },
      {
        name: 'Evidence of skilled employment',
        note: 'Employment agreement or confirmation letter from NZ employer',
        required: true,
      },
      {
        name: 'English language evidence',
        note: 'IELTS Academic 6.5+ overall (or equivalent) — all bands 6.0+',
        required: true,
      },
      {
        name: 'Evidence of work experience',
        note: 'Reference letters, pay slips, or employer declarations for each role',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'Partner\'s documents',
        note: 'If including partner — relationship evidence, their passport, medical, police',
        required: false,
      },
      {
        name: 'Job offer letter',
        note: 'If claiming points for a job offer — signed employment agreement',
        required: false,
      },
      {
        name: 'NZ study evidence',
        note: 'If claiming NZ study bonus — NZ institution transcripts',
        required: false,
      },
    ],
  },

  aewv: {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Employment agreement',
        note: 'Signed employment agreement from your NZ employer',
        required: true,
      },
      {
        name: 'Employer accreditation number',
        note: 'Your employer must be INZ-accredited — obtain their accreditation number',
        required: true,
      },
      {
        name: 'Evidence of qualifications or experience',
        note: 'Relevant to the role — degree certificates, trade qualifications, or work references',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'English language evidence',
        note: 'May be required depending on role and salary threshold',
        required: false,
      },
      {
        name: 'Job check approval letter',
        note: 'Required for some roles — issued by INZ to confirm role meets requirements',
        required: false,
      },
    ],
  },

  'green-list-1': {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Qualification assessment from NZQA',
        note: 'Or relevant NZ registration body (e.g. MCNZ for doctors, Nursing Council for nurses)',
        required: true,
      },
      {
        name: 'Evidence of registration or licence',
        note: 'Current registration with the relevant NZ professional body',
        required: true,
      },
      {
        name: 'Evidence of employment or job offer',
        note: 'Signed employment agreement in an eligible Green List Tier 1 occupation',
        required: true,
      },
      {
        name: 'English language evidence',
        note: 'IELTS Academic 6.5+ overall, or profession-specific requirement',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'Partner\'s documents',
        note: 'If including partner in application',
        required: false,
      },
    ],
  },

  'green-list-2': {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Employment agreement',
        note: 'Signed employment agreement in an eligible Green List Tier 2 occupation',
        required: true,
      },
      {
        name: 'Employer accreditation number',
        note: 'Your employer must be INZ-accredited',
        required: true,
      },
      {
        name: 'Trade or vocational qualification',
        note: 'Relevant qualification for the Green List Tier 2 occupation',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'Trade qualification assessment',
        note: 'NZQA or Trades Recognition NZ assessment if qualification is from overseas',
        required: false,
      },
      {
        name: 'NZ registration evidence',
        note: 'If the occupation requires NZ registration (e.g. Electrician, Plumber)',
        required: false,
      },
    ],
  },

  'post-study': {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Proof of NZ qualification completion',
        note: 'Official transcript or completion letter from your NZ institution',
        required: true,
      },
      {
        name: 'Evidence of study in New Zealand',
        note: 'Enrolment records and attendance confirming full-time study in NZ',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'Employment evidence',
        note: 'If applying for a specific occupation-based post-study work visa',
        required: false,
      },
    ],
  },

  student: {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Offer of place from a New Zealand institution',
        note: 'Official offer letter from a NZQA-registered provider',
        required: true,
      },
      {
        name: 'Evidence of funds',
        note: 'NZ$15,000+ per year of study, or evidence of scholarship/sponsorship',
        required: true,
      },
      {
        name: 'Academic transcripts',
        note: 'From your current or most recent school or institution',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'English language evidence',
        note: 'IELTS Academic 5.5+ (or equivalent) if English is not your first language',
        required: false,
      },
      {
        name: 'Accommodation evidence',
        note: 'If you are under 18 — guardian or homestay arrangement confirmation',
        required: false,
      },
      {
        name: 'Scholarship letter',
        note: 'If funded by a scholarship — official letter from awarding body',
        required: false,
      },
    ],
  },

  partner: {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Evidence of genuine and stable relationship',
        note: '12+ months of cohabitation evidence — joint bank statements, lease, photos, declarations',
        required: true,
      },
      {
        name: 'Partner\'s NZ visa or citizenship evidence',
        note: 'Copy of partner\'s NZ passport, permanent residence, or current work/student visa',
        required: true,
      },
      {
        name: 'Partner\'s identity documents',
        note: 'Copy of partner\'s passport and any name change documents',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'Marriage certificate or civil union certificate',
        note: 'If legally married or in a civil union',
        required: false,
      },
      {
        name: 'Statutory declarations',
        note: 'Signed declarations from both partners confirming the relationship',
        required: false,
      },
      {
        name: 'Statutory declarations from third parties',
        note: 'From family or friends who can confirm the relationship is genuine',
        required: false,
      },
    ],
  },

  parent: {
    required: [
      ...COMMON_REQUIRED,
      {
        name: 'Evidence of adult NZ citizen or resident child',
        note: 'Your child\'s NZ passport or residency documents',
        required: true,
      },
      {
        name: 'Birth certificate',
        note: 'Your birth certificate showing you are the parent',
        required: true,
      },
      {
        name: 'Evidence of funds',
        note: 'Proof of settlement funds (minimum NZ$500,000 in most categories)',
        required: true,
      },
    ],
    ifApplicable: [
      ...COMMON_IF_APPLICABLE,
      {
        name: 'Expression of Interest (EOI)',
        note: 'Required for Parent Resident Visa — EOI must be submitted first',
        required: false,
      },
      {
        name: 'Evidence of additional children in NZ',
        note: 'If you have more NZ resident/citizen children to support your application',
        required: false,
      },
    ],
  },
}
