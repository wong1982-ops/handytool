// tools/mood-board/types.ts

export type ElementType = 'image' | 'palette' | 'swatch' | 'font' | 'text'

export interface ImageData {
  imageUrl: string
  alt: string
}

export interface PaletteData {
  colors: string[] // 5 hex colors
}

export interface SwatchData {
  color: string // hex
}

export interface FontData {
  fontFamily: string
  category: 'heading' | 'body'
  sampleText: string
}

export interface TextData {
  content: string
  fontSize: number
}

export type ElementData = ImageData | PaletteData | SwatchData | FontData | TextData

export interface BoardElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  data: ElementData
}

export interface Board {
  id: string | null
  title: string
  theme: string
  elements: BoardElement[]
  shared: boolean
  shareId: string | null
  createdAt: string | null
  updatedAt: string | null
}

export const DEFAULT_BOARD: Board = {
  id: null,
  title: 'Untitled Board',
  theme: '',
  elements: [],
  shared: false,
  shareId: null,
  createdAt: null,
  updatedAt: null,
}

export const MAX_ELEMENTS = 30

export const ELEMENT_DEFAULTS: Record<ElementType, { width: number; height: number }> = {
  image: { width: 200, height: 200 },
  palette: { width: 250, height: 60 },
  swatch: { width: 80, height: 80 },
  font: { width: 220, height: 80 },
  text: { width: 160, height: 100 },
}

export const FONT_SUGGESTIONS = [
  { heading: 'Playfair Display', body: 'Inter' },
  { heading: 'Bebas Neue', body: 'Nunito' },
  { heading: 'Merriweather', body: 'Poppins' },
  { heading: 'Montserrat', body: 'Lora' },
  { heading: 'Righteous', body: 'EB Garamond' },
]
