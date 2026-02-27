export type TemplateId =
  // Existing ecards
  | 'executive'
  | 'midnight-pinstripe'
  | 'tech-blueprint'
  | 'aura-signature'
  | 'black-tie-matte'
  | 'blank'
  // New ecards
  | 'product-launch'
  | 'client-anniversary'
  | 'employee-welcome'
  | 'quarterly-milestone'
  | 'holiday-greetings'
  | 'thank-you-note'
  | 'new-year'
  | 'congratulations'
  | 'partnership-announce'
  | 'team-appreciation'
  | 'grand-opening'
  | 'event-invite'
  | 'spring-fresh'
  | 'summer-vibes'
  | 'winter-frost'
  // Business cards
  | 'biz-classic'
  | 'biz-modern'
  | 'biz-creative'
  | 'biz-tech'
  | 'biz-elegant'
  | 'biz-bold'
  | 'biz-nature'
  | 'biz-gradient'
  | 'biz-dark'
  | 'biz-minimal'

export type BackgroundPattern =
  | 'none'
  | 'diagonal-stripes'
  | 'hexagons'
  | 'plus'
  | 'polka-dots'
  | 'texture'
  | 'flipped-diamonds'
  | 'four-point-stars'
  | 'falling-triangles'
  | 'zig-zag'
  | 'signal'
  | 'overlapping-circles'
  | 'formal-invitation'

export type TemplateCategory =
  | 'classic-marble'
  | 'corporate'
  | 'modernist'
  | 'ethereal'
  | 'noir'
  | 'celebration'
  | 'seasonal'
  | 'business-card'

export type CardLayout = 'centered' | 'left' | 'split' | 'right-banner' | 'minimal'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export type OccasionTag =
  | 'product-launch'
  | 'client-anniversary'
  | 'employee-welcome'
  | 'quarterly-milestone'
  | 'holiday-greetings'
  | 'thank-you'

export type CardType = 'ecard' | 'business-card'

export interface ECardData {
  template: TemplateId
  layout: CardLayout
  cardType: CardType
  heading: string
  subheading: string
  body: string
  companyName: string
  companyTagline: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  textAlign: TextAlign
  bold: boolean
  backgroundColor: string
  accentColor: string
  borderAccents: boolean
  backgroundPattern: BackgroundPattern
  /** Pattern opacity 0–100 (maps to fill-opacity 0–1) */
  patternOpacity: number
  /** Pattern tile scale as percentage (50–300, default 100) */
  patternScale: number
  /** Custom pattern image data URL (overrides backgroundPattern when set) */
  customPatternUrl: string
  logoUrl: string
  /** Logo X position as percentage (0–100) of the card width */
  logoX: number
  /** Logo Y position as percentage (0–100) of the card height */
  logoY: number
  /** Business card contact fields */
  phone: string
  email: string
  website: string
  address: string
}

export interface Template {
  id: TemplateId
  name: string
  description: string
  category: TemplateCategory
  categoryLabel: string
  cardType: CardType
  occasions?: OccasionTag[]
  defaults: ECardData
}

export interface ColorPreset {
  name: string
  background: string
  accent: string
}
