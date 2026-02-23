export type TemplateId = 'executive' | 'midnight-pinstripe' | 'tech-blueprint' | 'aura-signature' | 'black-tie-matte' | 'blank'

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

export type TemplateCategory = 'classic-marble' | 'corporate' | 'modernist' | 'ethereal' | 'noir'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface ECardData {
  template: TemplateId
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
  logoUrl: string
  logoPosition: LogoPosition
}

export interface Template {
  id: TemplateId
  name: string
  description: string
  category: TemplateCategory
  categoryLabel: string
  defaults: ECardData
}

export interface ColorPreset {
  name: string
  background: string
  accent: string
}
