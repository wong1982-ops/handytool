import type { NoticeTypeInfo, RightsSection } from './types'

// ─── Chattels ─────────────────────────────────────────────────────────────────

export const CHATTELS: string[] = [
  'Stove / Oven',
  'Refrigerator',
  'Dishwasher',
  'Washing Machine',
  'Dryer',
  'Microwave',
  'Heat Pump',
  'Air Conditioner',
  'Rangehood',
  'Blinds / Curtains',
  'Garage Door Opener',
  'Alarm System',
  'Lawnmower',
  'Garden Hose',
  'Outdoor Furniture',
  'Clothesline',
  'TV Aerial / Satellite Dish',
  'Heat Transfer System',
]

// ─── Property Types ───────────────────────────────────────────────────────────

export const PROPERTY_TYPES: string[] = [
  'House',
  'Apartment',
  'Unit',
  'Townhouse',
  'Flat',
  'Room',
  'Studio',
  'Duplex',
  'Granny Flat',
]

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const PAYMENT_METHODS: string[] = [
  'Bank Transfer',
  'Automatic Payment',
  'Direct Debit',
  'Cash',
  'Cheque',
]

// ─── Payment Days ─────────────────────────────────────────────────────────────

export const PAYMENT_DAYS: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

// ─── Notice Types ─────────────────────────────────────────────────────────────

export const NOTICE_TYPES: Record<string, NoticeTypeInfo> = {
  '90-day': {
    label: '90-Day Notice (Landlord — No Cause)',
    days: 90,
    description:
      'Landlord terminates a periodic tenancy with no specific reason required.',
    actSection: 'Section 51(1)(b)',
  },
  '42-day': {
    label: '42-Day Notice (Landlord — With Reason)',
    days: 42,
    description:
      'Landlord terminates tenancy for a specific reason (e.g. owner moving in, extensive renovations, property sold).',
    actSection: 'Section 51(1)(a)',
  },
  '14-day-rent': {
    label: '14-Day Notice (Rent Arrears)',
    days: 14,
    description:
      'Landlord gives notice due to rent arrears of at least 21 days.',
    actSection: 'Section 55',
  },
  '28-day-tenant': {
    label: '28-Day Notice (Tenant — Periodic)',
    days: 28,
    description: 'Tenant terminates a periodic tenancy with 28 days notice.',
    actSection: 'Section 51(2)',
  },
  '21-day-fixed': {
    label: '21-Day Notice (Tenant — Fixed Term End)',
    days: 21,
    description:
      'Tenant gives notice not to extend a fixed-term tenancy at its end date.',
    actSection: 'Section 50(3)',
  },
}

// ─── Landlord Rights ──────────────────────────────────────────────────────────

export const LANDLORD_RIGHTS: RightsSection[] = [
  {
    title: 'Healthy Homes Standards Compliance',
    content:
      'Landlords must ensure rental properties comply with the Healthy Homes Standards (effective from 1 July 2021 for new or renewed tenancies).\n\nThe five standards are:\n1. Heating — A fixed heater capable of heating the main living room to at least 18°C.\n2. Insulation — Ceiling and underfloor insulation meeting minimum R-values.\n3. Ventilation — Extractor fans in kitchens and bathrooms; opening windows in each habitable room.\n4. Moisture and drainage — Efficient drainage and guttering; ground moisture barriers where required.\n5. Draught stopping — Gaps and holes in walls, ceilings, floors and around doors/windows must be stopped.\n\nLandlords must provide a Healthy Homes compliance statement with all new tenancy agreements from 1 December 2020.',
    link: 'https://www.tenancy.govt.nz/maintenance-and-inspections/healthy-homes-standards/',
  },
  {
    title: 'Rent Increases',
    content:
      "Landlords may increase rent subject to the following rules under the Residential Tenancies Act 1986:\n\n1. Frequency — Rent can only be increased once every 12 months (previously 180 days; changed by the Residential Tenancies Amendment Act 2020).\n2. Notice — At least 60 days' written notice must be given before a rent increase takes effect.\n3. Fixed-term tenancies — Rent cannot be increased during a fixed term unless the agreement expressly provides for it.\n4. Market rent — Tenants may apply to the Tenancy Tribunal if they believe the rent is above market rent.\n\nLandlords cannot charge key money, bond exceeding 4 weeks' rent, or any form of premium.",
    link: 'https://www.tenancy.govt.nz/rent/increasing-rent/',
  },
  {
    title: 'Property Inspections',
    content:
      "Landlords have the right to inspect the property, subject to strict notice requirements:\n\n1. Frequency — No more than 4 inspections per year (once every 13 weeks).\n2. Notice — At least 48 hours' written notice must be given; not more than 14 days in advance.\n3. Time — Inspections must occur between 8am and 7pm.\n4. Tenant present — Tenants have the right to be present during an inspection.\n5. Entry for specific reasons — Different rules apply for urgent repairs, suspected abandonment, showing to prospective tenants/buyers (24 hours notice required).\n\nLandlords must not use their right of entry to harass or intimidate tenants.",
    link: 'https://www.tenancy.govt.nz/maintenance-and-inspections/entry-to-the-property/',
  },
  {
    title: 'Maintenance Obligations',
    content:
      "Landlords must maintain the property in a reasonable state of repair:\n\n1. Structural soundness — The property must be weathertight and structurally sound.\n2. Facilities — Landlords must maintain all facilities provided at the start of the tenancy in reasonable working order (hot water, heating, stove, etc.).\n3. Urgent repairs — Landlords must address urgent repairs promptly. Tenants may arrange urgent repairs (up to $280) if the landlord is uncontactable and can recover the cost.\n4. Smoke alarms — Landlords must install working smoke alarms at the start of each tenancy. Long-life photoelectric alarms required in bedrooms and within 3m of bedroom doors.\n5. Meth contamination — Properties must not be rented if contaminated above 1.5 µg/100cm² (updated guidelines 2026).",
    link: 'https://www.tenancy.govt.nz/maintenance-and-inspections/landlord-responsibilities/',
  },
  {
    title: 'Tenancy Tribunal',
    content:
      'Landlords may apply to the Tenancy Tribunal to resolve disputes:\n\n1. Filing fee — $20.44 per application (as of 2024).\n2. Jurisdiction — The Tribunal can hear claims up to $100,000.\n3. Orders available — Rent arrears recovery, termination of tenancy, compensation for damage, compliance orders.\n4. Process — Applications filed online via the Ministry of Justice website; hearing usually within 3–6 weeks.\n5. Enforcement — Tribunal orders are enforceable as court orders.\n\nBefore applying, landlords are encouraged to attempt resolution through Tenancy Services mediation (free service).',
    link: 'https://www.tenancy.govt.nz/disputes/tribunal/',
  },
  {
    title: 'Anti-Retaliation Protections (2024 Amendment)',
    content:
      'Under the Residential Tenancies Amendment Act 2024, landlords are prohibited from retaliating against tenants who exercise their legal rights:\n\n1. Protected actions — Contacting Tenancy Services, requesting repairs, raising Healthy Homes compliance issues, or applying to the Tenancy Tribunal.\n2. Presumed retaliation — A notice to terminate given within 90 days of a protected act is presumed to be retaliatory unless the landlord can prove otherwise.\n3. Penalties — Landlords found to have retaliated may face exemplary damages of up to $6,500.\n4. No-cause terminations — While landlords retain the right to issue 90-day no-cause notices, these cannot be issued in retaliation for a protected act.',
    link: 'https://www.tenancy.govt.nz/ending-a-tenancy/ending-tenancy-overview/',
  },
]

// ─── Tenant Rights ────────────────────────────────────────────────────────────

export const TENANT_RIGHTS: RightsSection[] = [
  {
    title: 'Right to Quiet Enjoyment',
    content:
      "Tenants have the right to quiet enjoyment of the property for the duration of the tenancy:\n\n1. No harassment — Landlords (or their agents) must not interfere with the tenant's reasonable peace, comfort or privacy.\n2. Unlawful entry — Landlords cannot enter without proper notice (minimum 48 hours for general inspections).\n3. Essential services — Landlords cannot cut off power, water or other essential services to coerce a tenant.\n4. Changing locks — Landlords cannot change the locks without the tenant's consent except in limited circumstances (e.g. after abandonment).\n\nViolations can result in exemplary damages awarded by the Tenancy Tribunal.",
    link: 'https://www.tenancy.govt.nz/tenants-responsibilities-and-rights/tenant-rights/',
  },
  {
    title: 'Bond Refund Process',
    content:
      "Tenants are entitled to a full refund of their bond if no damage beyond fair wear and tear has occurred:\n\n1. Lodgement — Bond must be lodged with Tenancy Services (Bond Centre) within 23 working days of receipt.\n2. Refund application — Either party can apply for refund at the end of the tenancy.\n3. Joint application — Fastest method; both parties sign the bond refund form.\n4. Disputed bond — If parties cannot agree, the matter is referred to the Tenancy Tribunal.\n5. Fair wear and tear — Normal aging and use of the property is the landlord's responsibility, not the tenant's.\n6. Pet bond — A separate pet bond (maximum 2 weeks' rent) may be held and must be refunded if no pet-related damage has occurred.",
    link: 'https://www.tenancy.govt.nz/bond/getting-your-bond-back/',
  },
  {
    title: 'Rent Arrears Rights',
    content:
      "Tenants facing rent arrears have specific rights and protections:\n\n1. Notice requirement — A landlord cannot apply to terminate for rent arrears unless rent is at least 21 days in arrears.\n2. 14-day notice — After serving a 14-day notice, the landlord may apply to the Tribunal. Tenants can pay the arrears in full before the hearing to prevent termination.\n3. Repayment plans — The Tribunal may order a repayment plan rather than termination if the tenant has a good history.\n4. Financial hardship — Tenants may contact Work and Income NZ for emergency housing or accommodation supplements.\n5. Mediation — Tenancy Services offers free mediation to negotiate repayment plans before Tribunal proceedings.",
    link: 'https://www.tenancy.govt.nz/rent/rent-in-arrears/',
  },
  {
    title: 'Flatting vs Boarding Arrangements',
    content:
      'Different rules apply depending on the type of living arrangement:\n\n1. Standard tenancy — Full RTA protections apply when renting a whole property or a self-contained flat.\n2. Boarding house tenancy — A boarding house has 6 or more tenants; a 48-hour notice of termination applies (tenant) or 48 hours to 28 days (landlord, depending on reason).\n3. Flatmates — A head tenant who sub-lets rooms is the landlord of flatmates. The head tenant–flatmate relationship is governed by the RTA.\n4. Excluded arrangements — Tenants sharing facilities with the owner (e.g. homestay) may not be covered by the RTA.\n5. Fixed-term flatmates — Sub-tenants on fixed terms cannot be removed without grounds until the term expires.',
    link: 'https://www.tenancy.govt.nz/starting-a-tenancy/types-of-tenancy/',
  },
  {
    title: 'Meth Contamination Rights (2026)',
    content:
      'Updated methamphetamine contamination guidelines as of 2026 affect both landlord and tenant rights:\n\n1. Testing threshold — The acceptable level is 1.5 µg/100cm² (unchanged from 2017 NZ Standard).\n2. Pre-tenancy disclosure — Landlords must disclose any known contamination history.\n3. Testing during tenancy — Either party can request testing; costs are usually borne by the requesting party.\n4. Remediation — If contamination exceeds the threshold during a tenancy and the cause is unknown, the landlord bears remediation costs.\n5. Tenant caused contamination — If the tenant caused the contamination, they are liable for full remediation costs and the landlord may apply for termination.\n6. Habitable standard — A contaminated property above the threshold is not considered habitable; tenants may terminate without notice and claim compensation.',
    link: 'https://www.tenancy.govt.nz/maintenance-and-inspections/methamphetamine/',
  },
]
