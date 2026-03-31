import type { SlotGameConfig } from '../slots-types'

const PAYLINES_25: number[][] = [
  [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,0,1,2,2], [2,2,1,0,0],
  [0,1,2,1,0], [2,1,0,1,2], [1,0,0,0,1], [1,2,2,2,1], [0,1,0,1,0],
  [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1], [0,0,2,0,0], [2,2,0,2,2],
  [0,1,1,1,0], [2,1,1,1,2], [0,2,0,2,0], [2,0,2,0,2], [1,0,2,0,1],
  [1,2,0,2,1], [0,2,2,2,0], [2,0,0,0,2], [0,2,1,2,0], [2,0,1,0,2],
]

const PAYLINES_50: number[][] = [
  ...PAYLINES_25,
  [0,0,1,0,0], [2,2,1,2,2], [0,1,0,0,1], [2,1,2,2,1], [1,1,0,1,1],
  [1,1,2,1,1], [0,2,1,0,2], [2,0,1,2,0], [0,0,0,1,2], [2,2,2,1,0],
  [1,0,0,1,2], [1,2,2,1,0], [0,1,2,2,1], [2,1,0,0,1], [0,0,2,1,0],
  [2,2,0,1,2], [1,0,1,2,1], [1,2,1,0,1], [0,2,0,0,2], [2,0,2,2,0],
  [0,1,1,0,1], [2,1,1,2,1], [1,0,2,1,0], [1,2,0,1,2], [0,2,2,0,0],
]

export const safariKing: SlotGameConfig = {
  id: 'safari-king',
  name: 'Safari King',
  description: 'Rule the African savanna as the king of beasts! 50 paylines with retriggerable free spins and 2x multipliers.',
  icon: '🦁',
  theme: {
    backgroundColor: '#1a1505',
    accentColor: '#daa520',
    reelBackground: '#2d2510',
    headerGradient: 'linear-gradient(135deg, #8B6914, #DAA520)',
    lobbyImage: '/images/slots/lobby/safari-king.webp',
    backgroundImage: '/images/slots/backgrounds/safari-king-bg.webp',
  },
  reels: 5,
  rows: 3,
  symbols: [
    { id: 'lion', name: 'Lion', icon: '🦁', imagePath: '/images/slots/symbols/safari-king/lion.webp', payouts: { 3: 5, 4: 25, 5: 100 } },
    { id: 'elephant', name: 'Elephant', icon: '🐘', imagePath: '/images/slots/symbols/safari-king/elephant.webp', payouts: { 3: 4, 4: 20, 5: 80 } },
    { id: 'zebra', name: 'Zebra', icon: '🦓', imagePath: '/images/slots/symbols/safari-king/zebra.webp', payouts: { 3: 3, 4: 15, 5: 50 } },
    { id: 'giraffe', name: 'Giraffe', icon: '🦒', imagePath: '/images/slots/symbols/safari-king/giraffe.webp', payouts: { 3: 2, 4: 10, 5: 40 } },
    { id: 'diamond', name: 'Diamond', icon: '💎', imagePath: '/images/slots/symbols/safari-king/diamond.webp', payouts: { 3: 2, 4: 8, 5: 30 } },
    { id: 'ace', name: 'A', icon: '🅰️', imagePath: '/images/slots/symbols/safari-king/ace.webp', payouts: { 3: 1, 4: 5, 5: 20 } },
    { id: 'king', name: 'K', icon: '👑', imagePath: '/images/slots/symbols/safari-king/king.webp', payouts: { 3: 1, 4: 4, 5: 15 } },
    { id: 'queen', name: 'Q', icon: '♛', imagePath: '/images/slots/symbols/safari-king/queen.webp', payouts: { 3: 1, 4: 3, 5: 10 } },
    { id: 'jack', name: 'J', icon: '🃏', imagePath: '/images/slots/symbols/safari-king/jack.webp', payouts: { 3: 1, 4: 2, 5: 8 } },
    { id: 'wild', name: 'Wild', icon: '🌍', imagePath: '/images/slots/symbols/safari-king/wild.webp', payouts: { 3: 5, 4: 25, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', icon: '🌳', imagePath: '/images/slots/symbols/safari-king/scatter.webp', payouts: { 3: 2, 4: 5, 5: 20 }, isScatter: true },
  ],
  reelStrips: [
    [5,6,7,8,0,5,6,3,7,8,1,6,5,8,7,2,6,5,4,8,7,9,6,5,3,8,7,10,6,5,1,8,4,7,5,6],
    [6,7,8,5,2,6,7,4,8,5,0,7,6,5,8,3,7,6,1,5,8,6,7,10,5,8,9,6,7,5,4,8,6,7,8,5],
    [7,5,8,6,3,7,5,1,8,6,2,5,7,6,8,4,5,7,0,6,8,10,5,7,6,8,9,5,7,6,3,8,5,7,6,8],
    [8,6,5,7,4,8,6,2,5,7,3,6,8,7,5,0,6,8,1,7,5,9,6,8,7,5,10,6,8,7,4,5,6,8,7,5],
    [5,7,6,8,1,5,7,3,6,8,4,7,5,8,6,2,7,5,0,8,6,10,7,5,8,6,9,7,5,8,3,6,7,5,8,6],
  ],
  paylines: PAYLINES_50,
  specialSymbols: { wild: 'wild', scatter: 'scatter' },
  bonusConfig: {
    type: 'free_spins',
    triggerCount: 3,
    freeSpinsCount: 10,
    multiplier: 2,
    retriggerable: true,
  },
  rtp: 0.9637,
  minBet: 10,
  maxBet: 10000,
  betSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
}
