export const CREDIT_PACKS = [
  { id: 'pack_800', credits: 800, label: '800 Credits', priceCents: 500 },
  { id: 'pack_3550', credits: 3550, label: '3,550 Credits', priceCents: 2000 },
  { id: 'pack_10000', credits: 10000, label: '10,000 Credits', priceCents: 5000 },
] as const

export type CreditPackId = (typeof CREDIT_PACKS)[number]['id']
