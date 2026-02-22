export type TemplateId = 'executive' | 'midnight-pinstripe' | 'tech-blueprint' | 'aura-signature' | 'black-tie-matte' | 'blank'

export type BackgroundPattern = 'arcs' | 'stripes' | 'grid' | 'gradient' | 'solid'

export type TemplateCategory = 'classic-marble' | 'corporate' | 'modernist' | 'ethereal' | 'noir'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

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
  logoOverlay: boolean
}

export interface Template {
  id: TemplateId
  name: string
  description: string
  category: TemplateCategory
  categoryLabel: string
  defaults: ECardData
  backgroundPattern: BackgroundPattern
}

export interface ColorPreset {
  name: string
  background: string
  accent: string
}
