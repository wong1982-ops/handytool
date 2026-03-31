import type { SlotGameConfig } from '../slots-types'

const PAYLINES_25: number[][] = [
  [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,0,1,2,2], [2,2,1,0,0],
  [0,1,2,1,0], [2,1,0,1,2], [1,0,0,0,1], [1,2,2,2,1], [0,1,0,1,0],
  [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1], [0,0,2,0,0], [2,2,0,2,2],
  [0,1,1,1,0], [2,1,1,1,2], [0,2,0,2,0], [2,0,2,0,2], [1,0,2,0,1],
  [1,2,0,2,1], [0,2,2,2,0], [2,0,0,0,2], [0,2,1,2,0], [2,0,1,0,2],
]

export const lucky88: SlotGameConfig = {
  id: 'lucky-88',
  name: 'Lucky 88',
  description: 'Fortune favors the bold in this Chinese-themed slot. Spin the lucky wheel for instant coin prizes and big multipliers!',
  icon: '🎰',
  theme: {
    backgroundColor: '#1a0505',
    accentColor: '#ffd700',
    reelBackground: '#2d0a0a',
    headerGradient: 'linear-gradient(135deg, #cc0000, #ffd700)',
    lobbyImage: '/images/slots/lobby/lucky-88.webp',
    backgroundImage: '/images/slots/backgrounds/lucky-88-bg.webp',
  },
  reels: 5,
  rows: 3,
  symbols: [
    { id: 'lantern', name: 'Lantern', icon: '🏮', imagePath: '/images/slots/symbols/lucky-88/lantern.webp', payouts: { 3: 5, 4: 25, 5: 100 } },
    { id: 'lion', name: 'Lion', icon: '🦁', imagePath: '/images/slots/symbols/lucky-88/lion.webp', payouts: { 3: 4, 4: 20, 5: 80 } },
    { id: 'drums', name: 'Drums', icon: '🥁', imagePath: '/images/slots/symbols/lucky-88/drums.webp', payouts: { 3: 3, 4: 15, 5: 50 } },
    { id: 'fan', name: 'Fan', icon: '🪭', imagePath: '/images/slots/symbols/lucky-88/fan.webp', payouts: { 3: 2, 4: 10, 5: 40 } },
    { id: 'firecracker', name: 'Firecracker', icon: '🧨', imagePath: '/images/slots/symbols/lucky-88/firecracker.webp', payouts: { 3: 2, 4: 8, 5: 30 } },
    { id: 'ace', name: 'A', icon: '🅰️', imagePath: '/images/slots/symbols/lucky-88/ace.webp', payouts: { 3: 1, 4: 5, 5: 20 } },
    { id: 'king', name: 'K', icon: '👑', imagePath: '/images/slots/symbols/lucky-88/king.webp', payouts: { 3: 1, 4: 4, 5: 15 } },
    { id: 'queen', name: 'Q', icon: '♛', imagePath: '/images/slots/symbols/lucky-88/queen.webp', payouts: { 3: 1, 4: 3, 5: 10 } },
    { id: 'jack', name: 'J', icon: '🃏', imagePath: '/images/slots/symbols/lucky-88/jack.webp', payouts: { 3: 1, 4: 2, 5: 8 } },
    { id: 'wild', name: 'Wild', icon: '🐲', imagePath: '/images/slots/symbols/lucky-88/wild.webp', payouts: { 3: 5, 4: 25, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', icon: '🧧', imagePath: '/images/slots/symbols/lucky-88/scatter.webp', payouts: { 3: 2, 4: 5, 5: 20 }, isScatter: true },
  ],
  reelStrips: [
    [5,6,7,8,0,5,6,3,7,8,1,6,5,8,7,2,6,5,4,8,7,9,6,5,3,8,7,10,6,5,1,8,4,7],
    [6,7,8,5,2,6,7,4,8,5,1,7,6,5,8,3,7,6,0,5,8,6,7,10,5,8,9,6,7,5,4,8,6,7],
    [7,5,8,6,3,7,5,0,8,6,2,5,7,6,8,4,5,7,1,6,8,10,5,7,6,8,9,5,7,6,3,8,5,7],
    [8,6,5,7,4,8,6,2,5,7,3,6,8,7,5,1,6,8,0,7,5,9,6,8,7,5,10,6,8,7,4,5,6,8],
    [5,7,6,8,1,5,7,3,6,8,4,7,5,8,6,2,7,5,0,8,6,10,7,5,8,6,9,7,5,8,3,6,7,5],
  ],
  paylines: PAYLINES_25,
  specialSymbols: { wild: 'wild', scatter: 'scatter' },
  bonusConfig: {
    type: 'wheel',
    triggerCount: 3,
    wheelSegments: 6,
  },
  rtp: 0.9628,
  minBet: 10,
  maxBet: 10000,
  betSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
}
