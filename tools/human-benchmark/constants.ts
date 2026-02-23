import React from 'react'
import type { TestConfig } from './types'

export const STORAGE_KEY = 'human-benchmark-scores'

export const TEST_CONFIGS: TestConfig[] = [
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    description:
      'Test your visual reflexes by clicking as fast as you can when the screen turns green.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
      }),
    ),
    iconBg: 'bg-blue-900/30',
    iconColor: 'text-blue-400',
    iconBgLight: 'bg-blue-100',
    iconColorLight: 'text-blue-600',
    gameBgColor: '#dc2626',
    unit: 'ms',
    lowerIsBetter: true,
  },
  {
    id: 'sequence-memory',
    name: 'Sequence Memory',
    description:
      'Remember an ever-increasing pattern of squares being lit up on a grid.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
      }),
    ),
    iconBg: 'bg-purple-900/30',
    iconColor: 'text-purple-400',
    iconBgLight: 'bg-purple-100',
    iconColorLight: 'text-purple-600',
    gameBgColor: '#7c3aed',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'aim-trainer',
    name: 'Aim Trainer',
    description:
      'Hit the targets as fast as you can. Measures your precision and speed.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M12 2.25v2.25m0 15v2.25M2.25 12h2.25m15 0h2.25M6.17 6.17l1.59 1.59m8.48 8.48 1.59 1.59m0-11.66-1.59 1.59m-8.48 8.48-1.59 1.59M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z',
      }),
    ),
    iconBg: 'bg-red-900/30',
    iconColor: 'text-red-400',
    iconBgLight: 'bg-red-100',
    iconColorLight: 'text-red-600',
    gameBgColor: '#16a34a',
    unit: 'ms',
    lowerIsBetter: true,
  },
  {
    id: 'number-memory',
    name: 'Number Memory',
    description:
      'Remember the longest number possible. Each level adds one digit to the sequence.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.6 19.5m-4.2-19.5-3.6 19.5',
      }),
    ),
    iconBg: 'bg-amber-900/30',
    iconColor: 'text-amber-400',
    iconBgLight: 'bg-amber-100',
    iconColorLight: 'text-amber-600',
    gameBgColor: '#2563eb',
    unit: 'digits',
    lowerIsBetter: false,
  },
  {
    id: 'verbal-memory',
    name: 'Verbal Memory',
    description:
      "Keep track of which words you've seen before. Avoid words you haven't seen yet.",
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'm10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495A18.023 18.023 0 0 1 3.75 7.488',
      }),
    ),
    iconBg: 'bg-emerald-900/30',
    iconColor: 'text-emerald-400',
    iconBgLight: 'bg-emerald-100',
    iconColorLight: 'text-emerald-600',
    gameBgColor: '#d97706',
    unit: 'score',
    lowerIsBetter: false,
  },
  {
    id: 'chimp-test',
    name: 'Chimp Test',
    description:
      'Are you smarter than a chimpanzee? Memorize a numbered grid then click hidden tiles.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M10.5 1.5c-1.5 0-3 1.5-3 3s.5 2.5 1 3c-2 .5-3.5 2-3.5 4 0 2.5 2 4 4.5 4h.5v4.5c0 1.5 1 2.5 2 2.5s2-1 2-2.5V15.5h.5c2.5 0 4.5-1.5 4.5-4 0-2-1.5-3.5-3.5-4 .5-.5 1-1.5 1-3s-1.5-3-3-3c-.8 0-1.5.3-2 .8-.5-.5-1.2-.8-2-.8Zm-.5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
      }),
    ),
    iconBg: 'bg-orange-900/30',
    iconColor: 'text-orange-400',
    iconBgLight: 'bg-orange-100',
    iconColorLight: 'text-orange-600',
    gameBgColor: '#db2777',
    unit: 'numbers',
    lowerIsBetter: false,
  },
  {
    id: 'visual-memory',
    name: 'Visual Memory',
    description:
      'Remember a grid of squares and reproduce the pattern correctly as it grows.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z',
      }),
    ),
    iconBg: 'bg-cyan-900/30',
    iconColor: 'text-cyan-400',
    iconBgLight: 'bg-cyan-100',
    iconColorLight: 'text-cyan-600',
    gameBgColor: '#0d9488',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'typing',
    name: 'Typing',
    description:
      'Measure your typing speed (Words Per Minute) and accuracy with a random paragraph.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M6.75 7.5h10.5m-10.5 3h10.5m-10.5 3h4.5M3.75 4.5h16.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z',
      }),
    ),
    iconBg: 'bg-indigo-900/30',
    iconColor: 'text-indigo-400',
    iconBgLight: 'bg-indigo-100',
    iconColorLight: 'text-indigo-600',
    gameBgColor: '#4f46e5',
    unit: 'WPM',
    lowerIsBetter: false,
  },
]
