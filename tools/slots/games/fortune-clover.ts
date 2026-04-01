import type { SlotGameConfig } from '../slots-types'

const PAYLINES_25: number[][] = [
  [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,0,1,2,2], [2,2,1,0,0],
  [0,1,2,1,0], [2,1,0,1,2], [1,0,0,0,1], [1,2,2,2,1], [0,1,0,1,0],
  [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1], [0,0,2,0,0], [2,2,0,2,2],
  [0,1,1,1,0], [2,1,1,1,2], [0,2,0,2,0], [2,0,2,0,2], [1,0,2,0,1],
  [1,2,0,2,1], [0,2,2,2,0], [2,0,0,0,2], [0,2,1,2,0], [2,0,1,0,2],
]

export const fortuneClover: SlotGameConfig = {
  id: 'fortune-clover',
  name: 'Fortune Clover',
  description: 'Follow the rainbow to the leprechaun\'s gold! Pick from 4 pots to reveal hidden treasures and coin prizes.',
  icon: '🍀',
  theme: {
    backgroundColor: '#051a0a',
    accentColor: '#ffd700',
    reelBackground: '#051a0a',
    headerGradient: 'linear-gradient(135deg, #228B22, #ffd700)',
    cabinetFrame: 'linear-gradient(180deg, #0a3a1a, #30b060, #0a3a1a)',
    cabinetAccent: '#30b060',
    lobbyImage: '/images/slots/lobby/fortune-clover.webp',
    backgroundImage: '/images/slots/backgrounds/fortune-clover-bg.webp',
  },
  reels: 5,
  rows: 3,
  symbols: [
    { id: 'leprechaun', name: 'Leprechaun', icon: '🧙', imagePath: '/images/slots/symbols/fortune-clover/leprechaun.webp', payouts: { 3: 5, 4: 25, 5: 100 } },
    { id: 'pot', name: 'Pot of Gold', icon: '🏆', imagePath: '/images/slots/symbols/fortune-clover/pot-of-gold.webp', payouts: { 3: 4, 4: 20, 5: 80 } },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈', imagePath: '/images/slots/symbols/fortune-clover/rainbow.webp', payouts: { 3: 3, 4: 15, 5: 50 } },
    { id: 'clover', name: 'Clover', icon: '🍀', imagePath: '/images/slots/symbols/fortune-clover/clover.webp', payouts: { 3: 2, 4: 10, 5: 40 } },
    { id: 'horseshoe', name: 'Horseshoe', icon: '🫏', imagePath: '/images/slots/symbols/fortune-clover/horseshoe.webp', payouts: { 3: 2, 4: 8, 5: 30 } },
    { id: 'ace', name: 'A', icon: '🅰️', imagePath: '/images/slots/symbols/fortune-clover/ace.webp', payouts: { 3: 1, 4: 5, 5: 20 } },
    { id: 'king', name: 'K', icon: '👑', imagePath: '/images/slots/symbols/fortune-clover/king.webp', payouts: { 3: 1, 4: 4, 5: 15 } },
    { id: 'queen', name: 'Q', icon: '♛', imagePath: '/images/slots/symbols/fortune-clover/queen.webp', payouts: { 3: 1, 4: 3, 5: 10 } },
    { id: 'jack', name: 'J', icon: '🃏', imagePath: '/images/slots/symbols/fortune-clover/jack.webp', payouts: { 3: 1, 4: 2, 5: 8 } },
    { id: 'wild', name: 'Wild', icon: '☘️', imagePath: '/images/slots/symbols/fortune-clover/wild.webp', payouts: { 3: 5, 4: 25, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', icon: '🌟', imagePath: '/images/slots/symbols/fortune-clover/scatter.webp', payouts: { 3: 2, 4: 5, 5: 20 }, isScatter: true },
  ],
  reelStrips: [
    [5,6,7,8,1,5,6,3,7,8,0,6,5,8,7,2,6,5,4,8,7,9,6,5,3,8,7,10,6,5,1,8,4,7,5],
    [6,7,8,5,2,6,7,4,8,5,0,7,6,5,8,3,7,6,1,5,8,6,7,10,5,8,9,6,7,5,4,8,6,7,5],
    [7,5,8,6,3,7,5,1,8,6,2,5,7,6,8,4,5,7,0,6,8,10,5,7,6,8,9,5,7,6,3,8,5,7,6],
    [8,6,5,7,4,8,6,2,5,7,3,6,8,7,5,0,6,8,1,7,5,9,6,8,7,5,10,6,8,7,4,5,6,8,5],
    [5,7,6,8,0,5,7,3,6,8,4,7,5,8,6,2,7,5,1,8,6,10,7,5,8,6,9,7,5,8,3,6,7,5,8],
  ],
  paylines: PAYLINES_25,
  specialSymbols: { wild: 'wild', scatter: 'scatter' },
  bonusConfig: {
    type: 'pick_prize',
    triggerCount: 3,
    pickCount: 4,
  },
  rtp: 0.9609,
  minBet: 10,
  maxBet: 10000,
  betSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
}
