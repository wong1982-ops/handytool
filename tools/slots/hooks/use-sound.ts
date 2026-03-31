'use client'

import { useRef, useCallback } from 'react'
import { useSlots } from '../slots-provider'

const SOUNDS = {
  spin: '/sounds/slots/spin.mp3',
  reelStop: '/sounds/slots/reel-stop.mp3',
  winSmall: '/sounds/slots/win-small.mp3',
  winBig: '/sounds/slots/win-big.mp3',
  winMega: '/sounds/slots/win-mega.mp3',
  bonusTrigger: '/sounds/slots/bonus-trigger.mp3',
  coinCredit: '/sounds/slots/coin-credit.mp3',
  buttonClick: '/sounds/slots/button-click.mp3',
} as const

type SoundName = keyof typeof SOUNDS

export function useSound() {
  const { player } = useSlots()
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())

  const play = useCallback((name: SoundName) => {
    if (!player.soundEnabled) return
    if (typeof window === 'undefined') return

    const src = SOUNDS[name]
    let audio = audioCache.current.get(src)

    if (!audio) {
      audio = new Audio(src)
      audioCache.current.set(src, audio)
    }

    audio.currentTime = 0
    audio.play().catch(() => {
      // Auto-play blocked, ignore
    })
  }, [player.soundEnabled])

  return { play }
}
