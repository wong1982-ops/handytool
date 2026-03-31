import type { SlotGameConfig } from '../slots-types'

const PAYLINES_20: number[][] = [
  [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,0,1,2,2], [2,2,1,0,0],
  [0,1,2,1,0], [2,1,0,1,2], [1,0,0,0,1], [1,2,2,2,1], [0,1,0,1,0],
  [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1], [0,0,2,0,0], [2,2,0,2,2],
  [0,1,1,1,0], [2,1,1,1,2], [0,2,0,2,0], [2,0,2,0,2], [1,0,2,0,1],
]

export const oceanTreasure: SlotGameConfig = {
  id: 'ocean-treasure',
  name: 'Ocean Treasure',
  description: 'Dive deep into the ocean with friendly dolphins. 15 free spins with 2x multiplier await beneath the waves!',
  icon: '🐬',
  theme: {
    backgroundColor: '#051a2d',
    accentColor: '#00bcd4',
    reelBackground: '#0a2540',
    headerGradient: 'linear-gradient(135deg, #006994, #00bcd4)',
    lobbyImage: '/images/slots/lobby/ocean-treasure.webp',
    backgroundImage: '/images/slots/backgrounds/ocean-treasure-bg.webp',
  },
  reels: 5,
  rows: 3,
  symbols: [
    { id: 'dolphin', name: 'Dolphin', icon: '🐬', imagePath: '/images/slots/symbols/ocean-treasure/dolphin.webp', payouts: { 3: 5, 4: 25, 5: 100 } },
    { id: 'seahorse', name: 'Seahorse', icon: '🦑', imagePath: '/images/slots/symbols/ocean-treasure/seahorse.webp', payouts: { 3: 4, 4: 20, 5: 80 } },
    { id: 'turtle', name: 'Turtle', icon: '🐢', imagePath: '/images/slots/symbols/ocean-treasure/turtle.webp', payouts: { 3: 3, 4: 15, 5: 50 } },
    { id: 'wave', name: 'Wave', icon: '🌊', imagePath: '/images/slots/symbols/ocean-treasure/starfish.webp', payouts: { 3: 2, 4: 10, 5: 40 } },
    { id: 'shell', name: 'Shell', icon: '🐚', imagePath: '/images/slots/symbols/ocean-treasure/shell.webp', payouts: { 3: 2, 4: 8, 5: 30 } },
    { id: 'ace', name: 'A', icon: '🅰️', imagePath: '/images/slots/symbols/ocean-treasure/ace.webp', payouts: { 3: 1, 4: 5, 5: 20 } },
    { id: 'king', name: 'K', icon: '👑', imagePath: '/images/slots/symbols/ocean-treasure/king.webp', payouts: { 3: 1, 4: 4, 5: 15 } },
    { id: 'queen', name: 'Q', icon: '♛', imagePath: '/images/slots/symbols/ocean-treasure/queen.webp', payouts: { 3: 1, 4: 3, 5: 10 } },
    { id: 'jack', name: 'J', icon: '🃏', imagePath: '/images/slots/symbols/ocean-treasure/jack.webp', payouts: { 3: 1, 4: 2, 5: 8 } },
    { id: 'wild', name: 'Wild', icon: '🧜', imagePath: '/images/slots/symbols/ocean-treasure/wild.webp', payouts: { 3: 5, 4: 25, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', icon: '🔱', imagePath: '/images/slots/symbols/ocean-treasure/scatter.webp', payouts: { 3: 2, 4: 5, 5: 20 }, isScatter: true },
  ],
  reelStrips: [
    [5,6,7,8,1,5,6,3,7,8,0,6,5,8,7,2,6,5,4,8,7,9,6,5,3,8,7,10,6,5,1,8],
    [6,7,8,5,2,6,7,4,8,5,0,7,6,5,8,3,7,6,1,5,8,6,7,10,5,8,9,6,7,5,4,8],
    [7,5,8,6,3,7,5,1,8,6,2,5,7,6,8,4,5,7,0,6,8,10,5,7,6,8,9,5,7,6,3,8],
    [8,6,5,7,4,8,6,2,5,7,3,6,8,7,5,0,6,8,1,7,5,9,6,8,7,5,10,6,8,7,4,5],
    [5,7,6,8,0,5,7,3,6,8,4,7,5,8,6,2,7,5,1,8,6,10,7,5,8,6,9,7,5,8,3,6],
  ],
  paylines: PAYLINES_20,
  specialSymbols: { wild: 'wild', scatter: 'scatter' },
  bonusConfig: {
    type: 'free_spins',
    triggerCount: 3,
    freeSpinsCount: 15,
    multiplier: 2,
  },
  rtp: 0.9607,
  minBet: 10,
  maxBet: 10000,
  betSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
}
