import type { SlotGameConfig } from '../slots-types'

const PAYLINES_25: number[][] = [
  [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,0,1,2,2], [2,2,1,0,0],
  [0,1,2,1,0], [2,1,0,1,2], [1,0,0,0,1], [1,2,2,2,1], [0,1,0,1,0],
  [2,1,2,1,2], [1,0,1,0,1], [1,2,1,2,1], [0,0,2,0,0], [2,2,0,2,2],
  [0,1,1,1,0], [2,1,1,1,2], [0,2,0,2,0], [2,0,2,0,2], [1,0,2,0,1],
  [1,2,0,2,1], [0,2,2,2,0], [2,0,0,0,2], [0,2,1,2,0], [2,0,1,0,2],
]

export const chilliFiesta: SlotGameConfig = {
  id: 'chilli-fiesta',
  name: 'Chilli Fiesta',
  description: 'Turn up the heat at the Mexican fiesta! Pick from 5 pinatas to reveal instant coin prizes and multipliers.',
  icon: '🌶️',
  theme: {
    backgroundColor: '#1a0f05',
    accentColor: '#ff4500',
    reelBackground: '#2a0f05',
    headerGradient: 'linear-gradient(135deg, #cc0000, #ffcc00)',
    cabinetFrame: 'linear-gradient(180deg, #4a1a0a, #e85020, #4a1a0a)',
    cabinetAccent: '#e85020',
    lobbyImage: '/images/slots/lobby/chilli-fiesta.webp',
    backgroundImage: '/images/slots/backgrounds/chilli-fiesta-bg.webp',
  },
  reels: 5,
  rows: 3,
  symbols: [
    { id: 'sombrero', name: 'Sombrero', icon: '🪇', imagePath: '/images/slots/symbols/chilli-fiesta/sombrero.webp', payouts: { 3: 5, 4: 25, 5: 100 } },
    { id: 'guitar', name: 'Guitar', icon: '🎸', imagePath: '/images/slots/symbols/chilli-fiesta/guitar.webp', payouts: { 3: 4, 4: 20, 5: 80 } },
    { id: 'chilli', name: 'Chilli', icon: '🌶️', imagePath: '/images/slots/symbols/chilli-fiesta/chilli.webp', payouts: { 3: 3, 4: 15, 5: 50 } },
    { id: 'cactus', name: 'Cactus', icon: '🌵', imagePath: '/images/slots/symbols/chilli-fiesta/cactus.webp', payouts: { 3: 2, 4: 10, 5: 40 } },
    { id: 'maracas', name: 'Maracas', icon: '🪇', imagePath: '/images/slots/symbols/chilli-fiesta/maracas.webp', payouts: { 3: 2, 4: 8, 5: 30 } },
    { id: 'ace', name: 'A', icon: '🅰️', imagePath: '/images/slots/symbols/chilli-fiesta/ace.webp', payouts: { 3: 1, 4: 5, 5: 20 } },
    { id: 'king', name: 'K', icon: '👑', imagePath: '/images/slots/symbols/chilli-fiesta/king.webp', payouts: { 3: 1, 4: 4, 5: 15 } },
    { id: 'queen', name: 'Q', icon: '♛', imagePath: '/images/slots/symbols/chilli-fiesta/queen.webp', payouts: { 3: 1, 4: 3, 5: 10 } },
    { id: 'jack', name: 'J', icon: '🃏', imagePath: '/images/slots/symbols/chilli-fiesta/jack.webp', payouts: { 3: 1, 4: 2, 5: 8 } },
    { id: 'wild', name: 'Wild', icon: '💃', imagePath: '/images/slots/symbols/chilli-fiesta/wild.webp', payouts: { 3: 5, 4: 25, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', icon: '🪅', imagePath: '/images/slots/symbols/chilli-fiesta/scatter.webp', payouts: { 3: 2, 4: 5, 5: 20 }, isScatter: true },
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
    type: 'pick_prize',
    triggerCount: 3,
    pickCount: 5,
  },
  rtp: 0.9641,
  minBet: 10,
  maxBet: 10000,
  betSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
}
