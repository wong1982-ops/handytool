export const CREDIT_PACKS = [
  { id: 'pack_100', credits: 100, label: '100 Credits', priceCents: 500 },
  { id: 'pack_500', credits: 500, label: '500 Credits', priceCents: 2000 },
  { id: 'pack_1000', credits: 1000, label: '1,000 Credits', priceCents: 3500 },
] as const

export type CreditPackId = (typeof CREDIT_PACKS)[number]['id']
