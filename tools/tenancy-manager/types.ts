// ─── Tenancy Manager Types ────────────────────────────────────────────────────

export interface AgreementData {
  // Landlord
  landlordName: string
  landlordAddress: string
  landlordPhone: string
  landlordEmail: string

  // Tenants
  tenantNames: string[]

  // Property
  propertyAddress: string
  propertyType: string
  bedrooms: number
  hasParking: boolean
  isInsured: boolean

  // Tenancy
  tenancyType: 'fixed' | 'periodic'
  startDate: string
  endDate?: string
  weeklyRent: number
  paymentMethod: string
  paymentDay: string

  // Bond
  bondAmount: number
  petBond: number

  // Chattels
  chattels: string[]

  // Additional terms
  smokingAllowed: boolean
  maxOccupants: number
  additionalConditions: string
}

export type NoticeType =
  | '90-day'
  | '42-day'
  | '14-day-rent'
  | '28-day-tenant'
  | '21-day-fixed'

export interface NoticeData {
  type: NoticeType
  fromName: string
  fromAddress: string
  toName: string
  toAddress: string
  propertyAddress: string
  noticeDate: string
  // 42-day specific
  reason?: string
  // 14-day rent arrears specific
  amountOwed?: number
  arrearsPeriod?: string
}

export interface NoticeTypeInfo {
  label: string
  days: number
  description: string
  actSection: string
}

export interface RightsSection {
  title: string
  content: string
  link: string
}

export interface AgreementStep {
  id: number
  title: string
  description: string
}
