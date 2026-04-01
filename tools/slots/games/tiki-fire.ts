import type { SlotGameConfig } from '../slots-types'

const PAYLINES_20: number[][] = [
  [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,0,1,2,2], [2,2,1,0,0],
  [0,1,2,1,0], [2,1,0,1,2], [1,0,0,0,1], [1,2,2,2,1], [0,1,0,1,0],
  [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1], [0,0,2,0,0], [2,2,0,2,2],
  [0,1,1,1,0], [2,1,1,1,2], [0,2,0,2,0], [2,0,2,0,2], [1,0,2,0,1],
]

export const tikiFire: SlotGameConfig = {
  id: 'tiki-fire',
  name: 'Tiki Fire',
  description: 'Feel the heat of the tropical islands! Expanding wilds blaze across the reels during free spins for fiery wins.',
  icon: '🌺',
  theme: {
    backgroundColor: '#0a1a0a',
    accentColor: '#ff6b35',
    reelBackground: '#1a0f05',
    headerGradient: 'linear-gradient(135deg, #2d5a1e, #ff6b35)',
    cabinetFrame: 'linear-gradient(180deg, #3a1f0a, #e87830, #3a1f0a)',
    cabinetAccent: '#e87830',
    meterName: 'TIKI BLAZE',
    lobbyImage: '/images/slots/lobby/tiki-fire.webp',
    backgroundImage: '/images/slots/backgrounds/tiki-fire-bg.webp',
  },
  reels: 5,
  rows: 3,
  symbols: [
    { id: 'tiki', name: 'Tiki Mask', icon: '🗿', imagePath: '/images/slots/symbols/tiki-fire/tiki-mask.webp', payouts: { 3: 5, 4: 25, 5: 100 } },
    { id: 'torch', name: 'Torch', icon: '🔥', imagePath: '/images/slots/symbols/tiki-fire/torch.webp', payouts: { 3: 4, 4: 20, 5: 80 } },
    { id: 'parrot', name: 'Parrot', icon: '🦜', imagePath: '/images/slots/symbols/tiki-fire/parrot.webp', payouts: { 3: 3, 4: 15, 5: 50 } },
    { id: 'flower', name: 'Flower', icon: '🌺', imagePath: '/images/slots/symbols/tiki-fire/flower.webp', payouts: { 3: 2, 4: 10, 5: 40 } },
    { id: 'drum', name: 'Drum', icon: '🥁', imagePath: '/images/slots/symbols/tiki-fire/drum.webp', payouts: { 3: 2, 4: 8, 5: 30 } },
    { id: 'ace', name: 'A', icon: '🅰️', imagePath: '/images/slots/symbols/tiki-fire/ace.webp', payouts: { 3: 1, 4: 5, 5: 20 } },
    { id: 'king', name: 'K', icon: '👑', imagePath: '/images/slots/symbols/tiki-fire/king.webp', payouts: { 3: 1, 4: 4, 5: 15 } },
    { id: 'queen', name: 'Q', icon: '♛', imagePath: '/images/slots/symbols/tiki-fire/queen.webp', payouts: { 3: 1, 4: 3, 5: 10 } },
    { id: 'jack', name: 'J', icon: '🃏', imagePath: '/images/slots/symbols/tiki-fire/jack.webp', payouts: { 3: 1, 4: 2, 5: 8 } },
    { id: 'wild', name: 'Wild', icon: '🌋', imagePath: '/images/slots/symbols/tiki-fire/wild.webp', payouts: { 3: 5, 4: 25, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', icon: '🏝️', imagePath: '/images/slots/symbols/tiki-fire/scatter.webp', payouts: { 3: 2, 4: 5, 5: 20 }, isScatter: true },
  ],
  reelStrips: [
    [5,6,7,8,1,5,6,3,7,8,0,6,5,8,7,2,6,5,4,8,7,9,6,5,3,8,7,10,6,5,1,8],
    [6,7,8,5,2,6,7,4,8,5,1,7,6,5,8,3,7,6,0,5,8,6,7,10,5,8,9,6,7,5,4,8],
    [7,5,8,6,3,7,5,0,8,6,2,5,7,6,8,4,5,7,1,6,8,10,5,7,6,8,9,5,7,6,3,8],
    [8,6,5,7,4,8,6,2,5,7,3,6,8,7,5,1,6,8,0,7,5,9,6,8,7,5,10,6,8,7,4,5],
    [5,7,6,8,0,5,7,3,6,8,4,7,5,8,6,2,7,5,1,8,6,10,7,5,8,6,9,7,5,8,3,6],
  ],
  paylines: PAYLINES_20,
  specialSymbols: { wild: 'wild', scatter: 'scatter' },
  bonusConfig: {
    type: 'expanding_wilds',
    triggerCount: 3,
    freeSpinsCount: 8,
  },
  rtp: 0.9621,
  minBet: 10,
  maxBet: 10000,
  betSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
}
