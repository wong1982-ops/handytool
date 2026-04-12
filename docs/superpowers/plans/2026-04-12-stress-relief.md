# Stress Relief Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified Stress Relief Studio with 6 modalities (hub, breathing, meditation, vent journal, fidget toys, sound therapy) + light mood tracking + PWA support, bilingual EN/ZH.

**Architecture:** Single tabbed page at `/tools/stress-relief` with hash-based routing. Persistent SoundMixerProvider context wraps all tabs so ambient sound survives tab switches. Vent journal uses streamed Gemini (privacy: no content logging). Mood tracking via localStorage with optional Supabase cloud sync. PWA via Next.js manifest + service worker.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, Web Audio API (noise generation), HTMLAudio (loops), Gemini 2.5 Flash (vent journal SSE), Supabase (optional mood sync).

**Design spec:** `docs/superpowers/specs/2026-04-11-stress-relief-design.md`

**Audio strategy:**
- White/pink/brown noise + binaural beats: **generated via Web Audio API** at runtime (no files)
- Nature sounds (rain/forest/ocean/fire/wind/thunderstorm): **6 placeholder file paths** in `public/stress-relief/sounds/` — graceful fallback if missing
- Meditation tracks: **Gemini TTS script** generates MP3s once; manifest references the paths; player uses Web Speech API as runtime fallback if MP3 missing

---

### Task 1: Types & Static Data

**Files:**
- Create: `tools/stress-relief/stress-relief-types.ts`
- Create: `tools/stress-relief/breathing/breathing-patterns.ts`
- Create: `tools/stress-relief/meditate/meditate-tracks.ts`
- Create: `tools/stress-relief/sounds/sound-tracks.ts`

- [ ] **Step 1: Create `tools/stress-relief/stress-relief-types.ts`**

```typescript
export type Language = 'en' | 'zh'

export type Modality = 'breathe' | 'meditate' | 'vent' | 'fidget' | 'sounds'
export type TabId = 'hub' | Modality

export interface BilingualText {
  en: string
  zh: string
}

export interface BreathingPhase {
  label: BilingualText
  duration: number  // seconds; 0 means skip
}

export interface BreathingPattern {
  id: string
  name: BilingualText
  description: BilingualText
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  cycles: number    // recommended cycles
}

export interface MeditationTrack {
  id: string
  title: BilingualText
  description: BilingualText
  duration: number   // seconds
  category: 'sleep' | 'anxiety' | 'focus' | 'morning' | 'body-scan'
  audioUrl: string
  script: BilingualText  // fallback for Web Speech API
}

export type SoundCategory = 'nature' | 'noise' | 'binaural'
export type SoundKind =
  | 'rain' | 'forest' | 'ocean' | 'fire' | 'wind' | 'thunderstorm'   // nature
  | 'white' | 'pink' | 'brown'                                       // noise
  | 'alpha' | 'theta' | 'delta'                                      // binaural

export interface SoundTrack {
  id: SoundKind
  label: BilingualText
  category: SoundCategory
  source: 'file' | 'noise' | 'binaural'
  audioUrl?: string         // for source='file'
  noiseType?: 'white' | 'pink' | 'brown'  // for source='noise'
  binauralFreq?: { left: number; right: number }  // for source='binaural'
}

export interface SoundLayerState {
  id: SoundKind
  playing: boolean
  volume: number  // 0-1
}

export interface SoundPreset {
  id: string
  name: string
  layers: SoundLayerState[]
  createdAt: number
}

export interface MoodEntry {
  modality: Modality
  mood: 1 | 2 | 3 | 4 | 5
  timestamp: number
}

export interface VentEntry {
  id: string
  text: string
  response: { validation: string; reframe: string; action: string } | null
  createdAt: number
}
```

- [ ] **Step 2: Create `tools/stress-relief/breathing/breathing-patterns.ts`**

```typescript
import type { BreathingPattern } from '@/tools/stress-relief/stress-relief-types'

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: { en: 'Box Breathing', zh: '方格呼吸' },
    description: { en: 'Equal four-count phases — used by Navy SEALs for focus', zh: '相等的四拍——海豹突击队用以集中注意力' },
    inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, cycles: 6,
  },
  {
    id: '4-7-8',
    name: { en: '4-7-8 Calming', zh: '4-7-8 镇静呼吸' },
    description: { en: 'Inhale 4, hold 7, exhale 8 — falls asleep faster', zh: '吸气 4 秒，屏息 7 秒，呼气 8 秒——加速入睡' },
    inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, cycles: 4,
  },
  {
    id: 'resonant',
    name: { en: 'Resonant (5-5)', zh: '共振呼吸 (5-5)' },
    description: { en: 'Equal 5-second inhale and exhale — heart rate balance', zh: '5 秒吸气和呼气——平衡心率' },
    inhale: 5, holdIn: 0, exhale: 5, holdOut: 0, cycles: 12,
  },
  {
    id: 'energizing',
    name: { en: 'Energizing (6-2)', zh: '活力呼吸 (6-2)' },
    description: { en: 'Long inhale 6, short exhale 2 — for alertness', zh: '长吸 6 秒，短呼 2 秒——提神醒脑' },
    inhale: 6, holdIn: 0, exhale: 2, holdOut: 0, cycles: 10,
  },
  {
    id: 'wim-hof',
    name: { en: 'Wim Hof (Light)', zh: '威姆·霍夫（轻度）' },
    description: { en: 'Power breaths — 2-second inhale, 1-second exhale', zh: '强力呼吸——2 秒吸气，1 秒呼气' },
    inhale: 2, holdIn: 0, exhale: 1, holdOut: 0, cycles: 30,
  },
  {
    id: 'custom',
    name: { en: 'Custom', zh: '自定义' },
    description: { en: 'Set your own phase durations', zh: '自定义每个阶段的时长' },
    inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, cycles: 6,
  },
]

export function getPattern(id: string): BreathingPattern | undefined {
  return BREATHING_PATTERNS.find((p) => p.id === id)
}
```

- [ ] **Step 3: Create `tools/stress-relief/meditate/meditate-tracks.ts`**

```typescript
import type { MeditationTrack } from '@/tools/stress-relief/stress-relief-types'

export const MEDITATION_TRACKS: MeditationTrack[] = [
  {
    id: 'morning-awakening',
    title: { en: 'Morning Awakening', zh: '晨间觉醒' },
    description: { en: 'Start your day with intention and clarity', zh: '以意图和清晰开始你的一天' },
    duration: 300,
    category: 'morning',
    audioUrl: '/stress-relief/audio/morning-awakening.mp3',
    script: {
      en: 'Take a deep breath in. Feel the morning light on your face. Let today begin with intention. Notice your breath, slow and steady. You are calm. You are present. You are ready for whatever today brings.',
      zh: '深吸一口气。感受脸上的晨光。让今天带着意图开始。注意你的呼吸，缓慢而稳定。你很平静。你在当下。你已准备好迎接今天的一切。',
    },
  },
  {
    id: 'anxiety-relief-5',
    title: { en: '5-Min Anxiety Relief', zh: '5 分钟焦虑缓解' },
    description: { en: 'Quick grounding for moments of anxiety', zh: '焦虑时刻的快速接地' },
    duration: 300,
    category: 'anxiety',
    audioUrl: '/stress-relief/audio/anxiety-relief-5.mp3',
    script: {
      en: 'Notice five things you can see. Now four things you can touch. Three things you can hear. Two things you can smell. One thing you can taste. You are here. You are safe. The feeling will pass.',
      zh: '注意你能看到的五样东西。然后是你能触摸到的四样东西。能听到的三样。能闻到的两样。能尝到的一样。你在这里。你很安全。这种感觉会过去的。',
    },
  },
  {
    id: 'body-scan-10',
    title: { en: '10-Min Body Scan', zh: '10 分钟身体扫描' },
    description: { en: 'Release tension from head to toe', zh: '从头到脚释放紧张' },
    duration: 600,
    category: 'body-scan',
    audioUrl: '/stress-relief/audio/body-scan-10.mp3',
    script: {
      en: 'Bring your attention to the top of your head. Notice any tension and let it release. Move your awareness slowly down — your forehead, your jaw, your neck. Continue down through your shoulders, arms, hands. Down through your chest, stomach, hips. Down your legs to your toes. Your whole body is relaxed.',
      zh: '将注意力带到头顶。注意任何紧张并让其释放。慢慢将意识向下移动——你的额头、下颌、脖子。继续向下经过肩膀、手臂、双手。穿过胸部、腹部、臀部。沿着腿部到达脚趾。你的整个身体都放松了。',
    },
  },
  {
    id: 'focus-15',
    title: { en: '15-Min Focus Builder', zh: '15 分钟专注力训练' },
    description: { en: 'Sharpen your concentration', zh: '提升你的专注力' },
    duration: 900,
    category: 'focus',
    audioUrl: '/stress-relief/audio/focus-15.mp3',
    script: {
      en: 'Sit upright. Place your attention on your breath. When thoughts arise, gently return to the breath. There is nothing to do but breathe. With each breath, your mind becomes clearer, sharper, more focused.',
      zh: '坐直。将注意力放在呼吸上。当念头出现时，温柔地回到呼吸。除了呼吸，没有别的事要做。每一次呼吸，你的心都变得更清晰、更敏锐、更专注。',
    },
  },
  {
    id: 'sleep-20',
    title: { en: '20-Min Sleep Drift', zh: '20 分钟入睡引导' },
    description: { en: 'Gentle guidance into restful sleep', zh: '温柔地引导你进入安宁的睡眠' },
    duration: 1200,
    category: 'sleep',
    audioUrl: '/stress-relief/audio/sleep-20.mp3',
    script: {
      en: 'Let your body sink into the bed. Your eyes are heavy. Each breath takes you deeper. Release the day. Release tomorrow. There is only this moment, and it is peaceful. Drift now into sleep.',
      zh: '让你的身体沉入床中。你的眼睛很沉重。每一次呼吸都带你更深入。释放今天。释放明天。只有这一刻，是平静的。现在漂入睡眠吧。',
    },
  },
]

export function getTrack(id: string): MeditationTrack | undefined {
  return MEDITATION_TRACKS.find((t) => t.id === id)
}

export function getTracksByCategory(category: string): MeditationTrack[] {
  if (category === 'all') return MEDITATION_TRACKS
  return MEDITATION_TRACKS.filter((t) => t.category === category)
}
```

- [ ] **Step 4: Create `tools/stress-relief/sounds/sound-tracks.ts`**

```typescript
import type { SoundTrack } from '@/tools/stress-relief/stress-relief-types'

export const SOUND_TRACKS: SoundTrack[] = [
  // Nature
  { id: 'rain', label: { en: 'Rain', zh: '雨声' }, category: 'nature', source: 'file', audioUrl: '/stress-relief/sounds/rain.mp3' },
  { id: 'forest', label: { en: 'Forest', zh: '森林' }, category: 'nature', source: 'file', audioUrl: '/stress-relief/sounds/forest.mp3' },
  { id: 'ocean', label: { en: 'Ocean', zh: '海洋' }, category: 'nature', source: 'file', audioUrl: '/stress-relief/sounds/ocean.mp3' },
  { id: 'fire', label: { en: 'Fireplace', zh: '壁炉' }, category: 'nature', source: 'file', audioUrl: '/stress-relief/sounds/fire.mp3' },
  { id: 'wind', label: { en: 'Wind', zh: '风' }, category: 'nature', source: 'file', audioUrl: '/stress-relief/sounds/wind.mp3' },
  { id: 'thunderstorm', label: { en: 'Thunderstorm', zh: '雷暴' }, category: 'nature', source: 'file', audioUrl: '/stress-relief/sounds/thunderstorm.mp3' },
  // Noise (generated)
  { id: 'white', label: { en: 'White Noise', zh: '白噪音' }, category: 'noise', source: 'noise', noiseType: 'white' },
  { id: 'pink', label: { en: 'Pink Noise', zh: '粉红噪音' }, category: 'noise', source: 'noise', noiseType: 'pink' },
  { id: 'brown', label: { en: 'Brown Noise', zh: '棕色噪音' }, category: 'noise', source: 'noise', noiseType: 'brown' },
  // Binaural (generated)
  { id: 'alpha', label: { en: 'Alpha (Relax)', zh: 'Alpha（放松）' }, category: 'binaural', source: 'binaural', binauralFreq: { left: 200, right: 210 } },
  { id: 'theta', label: { en: 'Theta (Meditate)', zh: 'Theta（冥想）' }, category: 'binaural', source: 'binaural', binauralFreq: { left: 200, right: 206 } },
  { id: 'delta', label: { en: 'Delta (Sleep)', zh: 'Delta（睡眠）' }, category: 'binaural', source: 'binaural', binauralFreq: { left: 100, right: 102 } },
]

export function getSoundTrack(id: string): SoundTrack | undefined {
  return SOUND_TRACKS.find((t) => t.id === id)
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 6: Commit**

```bash
git add tools/stress-relief/stress-relief-types.ts tools/stress-relief/breathing/breathing-patterns.ts tools/stress-relief/meditate/meditate-tracks.ts tools/stress-relief/sounds/sound-tracks.ts
git commit -m "feat(stress-relief): add types, breathing patterns, meditation tracks, and sound tracks"
```

---

### Task 2: i18n Strings

**Files:**
- Create: `tools/stress-relief/i18n/en.ts`
- Create: `tools/stress-relief/i18n/zh.ts`

- [ ] **Step 1: Create `tools/stress-relief/i18n/en.ts`**

```typescript
export const en = {
  pageTitle: 'Stress Relief Studio',
  pageSubtitle: 'A sanctuary for releasing pressure',

  tabs: {
    hub: 'Home',
    breathe: 'Breathe',
    meditate: 'Meditate',
    vent: 'Vent',
    fidget: 'Fidget',
    sounds: 'Sounds',
  },

  hub: {
    title: 'How would you like to release pressure today?',
    breathe: { title: 'Breathing', description: 'Guided breath patterns to calm your nervous system' },
    meditate: { title: 'Meditation', description: 'Guided audio sessions for any need' },
    vent: { title: 'Vent Journal', description: 'Write it out — AI listens and gently reflects back' },
    fidget: { title: 'Fidget Toys', description: 'Simple interactive toys to occupy restless hands' },
    sounds: { title: 'Sound Therapy', description: 'Mix ambient sounds and binaural beats' },
  },

  breathing: {
    pickPattern: 'Choose a pattern',
    inhale: 'Breathe in',
    holdIn: 'Hold',
    exhale: 'Breathe out',
    holdOut: 'Hold',
    cycle: 'Cycle',
    of: 'of',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    customPhases: 'Adjust phase durations',
    seconds: 'sec',
  },

  meditate: {
    library: 'Library',
    favorites: 'Favorites',
    categories: {
      all: 'All', sleep: 'Sleep', anxiety: 'Anxiety', focus: 'Focus', morning: 'Morning', 'body-scan': 'Body Scan',
    },
    play: 'Play',
    pause: 'Pause',
    favorite: 'Favorite',
    unfavorite: 'Unfavorite',
    minutes: 'min',
    voiceFallback: 'Audio file unavailable — using voice synthesis',
  },

  vent: {
    placeholder: 'Let it out…',
    submit: 'Get response',
    submitting: 'Listening…',
    sections: {
      validation: 'I hear you',
      reframe: 'A different angle',
      action: 'Try this',
    },
    pastEntries: 'Past entries',
    clearAll: 'Clear all entries',
    clearConfirm: 'Delete all your past entries?',
    privacy: 'Your entries stay on this device. AI responses are not stored.',
    empty: 'No past entries yet',
  },

  fidget: {
    pickToy: 'Pick a toy',
    toys: {
      bubbleWrap: 'Bubble Wrap',
      zenGarden: 'Zen Garden',
      squishyBall: 'Squishy Ball',
      fidgetSpinner: 'Fidget Spinner',
      kineticSand: 'Kinetic Sand',
      rubberBand: 'Rubber Band',
    },
    bubbleWrap: { popped: 'Popped', reset: 'New sheet' },
    zenGarden: { reset: 'Smooth' },
    squishyBall: { hint: 'Click and hold to squish' },
    fidgetSpinner: { hint: 'Drag to spin' },
    kineticSand: { reset: 'Reset' },
    rubberBand: { hint: 'Click and drag to stretch' },
  },

  sounds: {
    masterVolume: 'Master',
    stopAll: 'Stop all',
    savePreset: 'Save mix',
    presetName: 'Preset name',
    presets: 'Presets',
    categories: { nature: 'Nature', noise: 'Noise', binaural: 'Binaural' },
  },

  mood: {
    question: 'How do you feel now?',
    confirmed: 'Logged',
    options: { 1: 'Worse', 2: 'Down', 3: 'Same', 4: 'Better', 5: 'Great' },
    trends: 'Trends',
    trendsTitle: 'Your last 7 days',
    sessionsThisWeek: 'sessions this week',
    mostUsed: 'Most used',
    none: 'No data yet',
  },

  privacy: {
    notice: 'Your data is private',
  },

  errors: {
    network: 'Network error — check your connection',
    aiUnavailable: 'AI service is temporarily unavailable',
    audioFailed: 'Audio playback failed',
  },

  pwa: {
    installPrompt: 'Install Stress Relief Studio',
    installButton: 'Install',
    dismiss: 'Not now',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}
export type I18nStrings = DeepStringify<typeof en>
```

- [ ] **Step 2: Create `tools/stress-relief/i18n/zh.ts`**

Mirror the EXACT same structure with Chinese translations. Key strings:

```typescript
import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  pageTitle: '减压工作室',
  pageSubtitle: '释放压力的避风港',

  tabs: {
    hub: '主页', breathe: '呼吸', meditate: '冥想', vent: '倾诉', fidget: '玩具', sounds: '声音',
  },

  hub: {
    title: '今天你想如何释放压力？',
    breathe: { title: '呼吸训练', description: '引导式呼吸模式，安抚你的神经系统' },
    meditate: { title: '冥想', description: '满足各种需求的引导音频' },
    vent: { title: '倾诉日记', description: '写出来——AI 倾听并温柔地回应' },
    fidget: { title: '减压玩具', description: '简单的互动玩具，让躁动的双手有事可做' },
    sounds: { title: '声音疗愈', description: '混合环境声音和双耳节拍' },
  },

  breathing: {
    pickPattern: '选择一种模式',
    inhale: '吸气', holdIn: '屏息', exhale: '呼气', holdOut: '屏息',
    cycle: '周期', of: '/', start: '开始', pause: '暂停', resume: '继续', stop: '停止',
    customPhases: '调整阶段时长', seconds: '秒',
  },

  meditate: {
    library: '资料库', favorites: '收藏',
    categories: {
      all: '全部', sleep: '睡眠', anxiety: '焦虑', focus: '专注', morning: '晨间', 'body-scan': '身体扫描',
    },
    play: '播放', pause: '暂停', favorite: '收藏', unfavorite: '取消收藏', minutes: '分钟',
    voiceFallback: '音频文件不可用——使用语音合成',
  },

  vent: {
    placeholder: '说出来吧……',
    submit: '获取回应', submitting: '倾听中……',
    sections: { validation: '我听到了', reframe: '换个角度', action: '试试这个' },
    pastEntries: '过去的条目', clearAll: '清除所有条目', clearConfirm: '删除你所有过去的条目？',
    privacy: '你的条目保留在本设备上。AI 回应不会被存储。',
    empty: '还没有过去的条目',
  },

  fidget: {
    pickToy: '选一个玩具',
    toys: {
      bubbleWrap: '泡泡纸', zenGarden: '禅意花园', squishyBall: '挤压球',
      fidgetSpinner: '指尖陀螺', kineticSand: '动力沙', rubberBand: '橡皮筋',
    },
    bubbleWrap: { popped: '已挤破', reset: '新一张' },
    zenGarden: { reset: '抚平' },
    squishyBall: { hint: '点击并按住以挤压' },
    fidgetSpinner: { hint: '拖动以旋转' },
    kineticSand: { reset: '重置' },
    rubberBand: { hint: '点击并拖动以拉伸' },
  },

  sounds: {
    masterVolume: '主音量', stopAll: '全部停止', savePreset: '保存混音',
    presetName: '混音名称', presets: '预设',
    categories: { nature: '自然', noise: '噪音', binaural: '双耳节拍' },
  },

  mood: {
    question: '你现在感觉如何？', confirmed: '已记录',
    options: { 1: '更差', 2: '低落', 3: '相同', 4: '好转', 5: '很棒' },
    trends: '趋势', trendsTitle: '你的最近 7 天',
    sessionsThisWeek: '本周次数', mostUsed: '最常使用', none: '暂无数据',
  },

  privacy: { notice: '你的数据是隐私的' },

  errors: {
    network: '网络错误——请检查你的连接',
    aiUnavailable: 'AI 服务暂时不可用',
    audioFailed: '音频播放失败',
  },

  pwa: { installPrompt: '安装减压工作室', installButton: '安装', dismiss: '暂不' },
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/stress-relief/i18n/en.ts tools/stress-relief/i18n/zh.ts
git commit -m "feat(stress-relief): add bilingual i18n strings"
```

---

### Task 3: Sound Mixer Context (Persistent Audio)

**Files:**
- Create: `tools/stress-relief/shared/sound-mixer-context.tsx`

This is foundational — many tabs depend on it. The context manages all sound tracks (file-based, generated noise, binaural beats) and persists across tab switches.

- [ ] **Step 1: Create `tools/stress-relief/shared/sound-mixer-context.tsx`**

```typescript
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { SoundKind, SoundLayerState, SoundTrack } from '@/tools/stress-relief/stress-relief-types'
import { SOUND_TRACKS, getSoundTrack } from '@/tools/stress-relief/sounds/sound-tracks'

interface SoundMixerContextValue {
  layers: SoundLayerState[]
  masterVolume: number
  setMasterVolume: (v: number) => void
  toggleLayer: (id: SoundKind) => void
  setLayerVolume: (id: SoundKind, volume: number) => void
  stopAll: () => void
  isAnyPlaying: boolean
}

const SoundMixerContext = createContext<SoundMixerContextValue | null>(null)

interface AudioNode {
  source: 'file' | 'noise' | 'binaural'
  htmlAudio?: HTMLAudioElement
  audioContext?: AudioContext
  noiseNode?: AudioBufferSourceNode
  oscillatorL?: OscillatorNode
  oscillatorR?: OscillatorNode
  gainNode?: GainNode
  merger?: ChannelMergerNode
}

function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.96900 * b2 + w * 0.1538520
      b3 = 0.86650 * b3 + w * 0.3104856
      b4 = 0.55000 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    }
  } else {
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1
      lastOut = (lastOut + 0.02 * w) / 1.02
      data[i] = lastOut * 3.5
    }
  }
  return buffer
}

function createAudioNode(track: SoundTrack, volume: number): AudioNode | null {
  if (typeof window === 'undefined') return null

  if (track.source === 'file' && track.audioUrl) {
    const audio = new Audio(track.audioUrl)
    audio.loop = true
    audio.volume = volume
    audio.play().catch(() => { /* user gesture required; will retry on next interaction */ })
    return { source: 'file', htmlAudio: audio }
  }

  if (track.source === 'noise' && track.noiseType) {
    const ctx = new AudioContext()
    const noiseNode = ctx.createBufferSource()
    noiseNode.buffer = createNoiseBuffer(ctx, track.noiseType)
    noiseNode.loop = true
    const gainNode = ctx.createGain()
    gainNode.gain.value = volume
    noiseNode.connect(gainNode).connect(ctx.destination)
    noiseNode.start()
    return { source: 'noise', audioContext: ctx, noiseNode, gainNode }
  }

  if (track.source === 'binaural' && track.binauralFreq) {
    const ctx = new AudioContext()
    const oscL = ctx.createOscillator()
    const oscR = ctx.createOscillator()
    oscL.frequency.value = track.binauralFreq.left
    oscR.frequency.value = track.binauralFreq.right
    oscL.type = 'sine'
    oscR.type = 'sine'
    const merger = ctx.createChannelMerger(2)
    const gainNode = ctx.createGain()
    gainNode.gain.value = volume * 0.3 // binaural beats should be quieter
    oscL.connect(merger, 0, 0)
    oscR.connect(merger, 0, 1)
    merger.connect(gainNode).connect(ctx.destination)
    oscL.start()
    oscR.start()
    return { source: 'binaural', audioContext: ctx, oscillatorL: oscL, oscillatorR: oscR, gainNode, merger }
  }

  return null
}

function destroyAudioNode(node: AudioNode): void {
  if (node.htmlAudio) {
    node.htmlAudio.pause()
    node.htmlAudio.src = ''
  }
  if (node.noiseNode) {
    try { node.noiseNode.stop() } catch { /* already stopped */ }
  }
  if (node.oscillatorL) {
    try { node.oscillatorL.stop() } catch { /* already stopped */ }
  }
  if (node.oscillatorR) {
    try { node.oscillatorR.stop() } catch { /* already stopped */ }
  }
  if (node.audioContext) {
    node.audioContext.close().catch(() => { /* ignore */ })
  }
}

function setNodeVolume(node: AudioNode, volume: number): void {
  if (node.htmlAudio) node.htmlAudio.volume = volume
  if (node.gainNode) {
    node.gainNode.gain.value = node.source === 'binaural' ? volume * 0.3 : volume
  }
}

export function SoundMixerProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<SoundLayerState[]>(
    SOUND_TRACKS.map((t) => ({ id: t.id, playing: false, volume: 0.5 }))
  )
  const [masterVolume, setMasterVolume] = useState(1)
  const audioNodesRef = useRef<Map<SoundKind, AudioNode>>(new Map())

  const toggleLayer = useCallback((id: SoundKind) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const newPlaying = !l.playing
        if (newPlaying) {
          const track = getSoundTrack(id)
          if (track) {
            const node = createAudioNode(track, l.volume * masterVolume)
            if (node) audioNodesRef.current.set(id, node)
          }
        } else {
          const node = audioNodesRef.current.get(id)
          if (node) {
            destroyAudioNode(node)
            audioNodesRef.current.delete(id)
          }
        }
        return { ...l, playing: newPlaying }
      })
    )
  }, [masterVolume])

  const setLayerVolume = useCallback((id: SoundKind, volume: number) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const node = audioNodesRef.current.get(id)
        if (node) setNodeVolume(node, volume * masterVolume)
        return { ...l, volume }
      })
    )
  }, [masterVolume])

  const stopAll = useCallback(() => {
    audioNodesRef.current.forEach((node) => destroyAudioNode(node))
    audioNodesRef.current.clear()
    setLayers((prev) => prev.map((l) => ({ ...l, playing: false })))
  }, [])

  // Update all volumes when master changes
  useEffect(() => {
    layers.forEach((l) => {
      const node = audioNodesRef.current.get(l.id)
      if (node && l.playing) setNodeVolume(node, l.volume * masterVolume)
    })
  }, [masterVolume, layers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioNodesRef.current.forEach((node) => destroyAudioNode(node))
      audioNodesRef.current.clear()
    }
  }, [])

  const isAnyPlaying = layers.some((l) => l.playing)

  return (
    <SoundMixerContext.Provider
      value={{ layers, masterVolume, setMasterVolume, toggleLayer, setLayerVolume, stopAll, isAnyPlaying }}
    >
      {children}
    </SoundMixerContext.Provider>
  )
}

export function useSoundMixer(): SoundMixerContextValue {
  const ctx = useContext(SoundMixerContext)
  if (!ctx) throw new Error('useSoundMixer must be used within SoundMixerProvider')
  return ctx
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/stress-relief/shared/sound-mixer-context.tsx
git commit -m "feat(stress-relief): add persistent sound mixer context with noise/binaural generation"
```

---

### Task 4: Mood Storage & Check-in Component

**Files:**
- Create: `tools/stress-relief/shared/mood-storage.ts`
- Create: `tools/stress-relief/shared/mood-checkin.tsx`

- [ ] **Step 1: Create `tools/stress-relief/shared/mood-storage.ts`**

```typescript
import type { MoodEntry, Modality } from '@/tools/stress-relief/stress-relief-types'

const STORAGE_KEY = 'stress-relief:moods'

export function loadMoods(): MoodEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMood(modality: Modality, mood: 1 | 2 | 3 | 4 | 5): void {
  if (typeof window === 'undefined') return
  try {
    const entries = loadMoods()
    entries.push({ modality, mood, timestamp: Date.now() })
    // Keep last 200 entries only
    const trimmed = entries.slice(-200)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    /* ignore quota errors */
  }
}

export function clearMoods(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function getRecentMoods(days: number): MoodEntry[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return loadMoods().filter((m) => m.timestamp >= cutoff)
}

export function getMoodTrends(days: number): {
  total: number
  byModality: Record<string, number>
  mostUsed: Modality | null
  averageMood: number
} {
  const recent = getRecentMoods(days)
  const byModality: Record<string, number> = {}
  let moodSum = 0
  recent.forEach((m) => {
    byModality[m.modality] = (byModality[m.modality] || 0) + 1
    moodSum += m.mood
  })
  let mostUsed: Modality | null = null
  let max = 0
  Object.entries(byModality).forEach(([k, v]) => {
    if (v > max) {
      max = v
      mostUsed = k as Modality
    }
  })
  return {
    total: recent.length,
    byModality,
    mostUsed,
    averageMood: recent.length > 0 ? moodSum / recent.length : 0,
  }
}
```

- [ ] **Step 2: Create `tools/stress-relief/shared/mood-checkin.tsx`**

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { Modality } from '@/tools/stress-relief/stress-relief-types'
import { saveMood } from '@/tools/stress-relief/shared/mood-storage'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface MoodCheckinProps {
  modality: Modality
  t: I18nStrings
}

const MOOD_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string }[] = [
  { value: 1, emoji: '😢' },
  { value: 2, emoji: '😟' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😌' },
]

export function MoodCheckin({ modality, t }: MoodCheckinProps) {
  const [confirmed, setConfirmed] = useState(false)

  const handleClick = useCallback((value: 1 | 2 | 3 | 4 | 5) => {
    saveMood(modality, value)
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 1500)
  }, [modality])

  if (confirmed) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center text-sm text-green-700 dark:text-green-300 font-medium animate-fade-in">
        ✓ {t.mood.confirmed}
      </div>
    )
  }

  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">{t.mood.question}</p>
      <div className="flex justify-center gap-2">
        {MOOD_OPTIONS.map(({ value, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            className="flex items-center justify-center w-12 h-12 text-2xl rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
            aria-label={`Mood ${value}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/stress-relief/shared/mood-storage.ts tools/stress-relief/shared/mood-checkin.tsx
git commit -m "feat(stress-relief): add mood storage helpers and check-in component"
```

---

### Task 5: Studio Shell with Tab Routing

**Files:**
- Create: `tools/stress-relief/stress-relief-studio.tsx`
- Create: `tools/stress-relief/hub-tab.tsx`

- [ ] **Step 1: Create `tools/stress-relief/hub-tab.tsx`**

```typescript
'use client'

import type { Modality } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface HubTabProps {
  onSelect: (modality: Modality) => void
  t: I18nStrings
}

const TILES: { id: Modality; emoji: string; gradient: string }[] = [
  { id: 'breathe', emoji: '🌬️', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'meditate', emoji: '🧘', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'vent', emoji: '💬', gradient: 'from-orange-500 to-red-500' },
  { id: 'fidget', emoji: '🪀', gradient: 'from-pink-500 to-rose-500' },
  { id: 'sounds', emoji: '🎵', gradient: 'from-teal-500 to-green-500' },
]

export function HubTab({ onSelect, t }: HubTabProps) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
        {t.hub.title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map(({ id, emoji, gradient }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`group p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white text-left shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all min-h-[120px] cursor-pointer`}
          >
            <div className="text-4xl mb-2">{emoji}</div>
            <h3 className="text-lg font-bold mb-1">{t.hub[id].title}</h3>
            <p className="text-sm opacity-90">{t.hub[id].description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `tools/stress-relief/stress-relief-studio.tsx`**

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TabId, Language, Modality } from '@/tools/stress-relief/stress-relief-types'
import { en } from '@/tools/stress-relief/i18n/en'
import { zh } from '@/tools/stress-relief/i18n/zh'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
import { SoundMixerProvider, useSoundMixer } from '@/tools/stress-relief/shared/sound-mixer-context'
import { HubTab } from '@/tools/stress-relief/hub-tab'
import { BreathingTab } from '@/tools/stress-relief/breathing/breathing-tab'
import { MeditateTab } from '@/tools/stress-relief/meditate/meditate-tab'
import { VentTab } from '@/tools/stress-relief/vent/vent-tab'
import { FidgetTab } from '@/tools/stress-relief/fidget/fidget-tab'
import { SoundsTab } from '@/tools/stress-relief/sounds/sounds-tab'

const VALID_TABS: TabId[] = ['hub', 'breathe', 'meditate', 'vent', 'fidget', 'sounds']

function StudioInner() {
  const [tab, setTab] = useState<TabId>('hub')
  const [language, setLanguage] = useState<Language>('en')
  const t: I18nStrings = language === 'zh' ? zh : en
  const { isAnyPlaying, stopAll } = useSoundMixer()

  // Hash-based routing
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = () => {
      const hash = window.location.hash.slice(1) as TabId
      if (VALID_TABS.includes(hash)) setTab(hash)
      else if (window.location.hash === '') setTab('hub')
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const switchTab = useCallback((next: TabId) => {
    setTab(next)
    if (typeof window !== 'undefined') {
      window.location.hash = next === 'hub' ? '' : next
    }
  }, [])

  const handleSelectModality = useCallback((m: Modality) => {
    switchTab(m)
  }, [switchTab])

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          {t.pageTitle}
        </h1>
        <div className="flex items-center gap-2">
          {isAnyPlaying && (
            <button
              type="button"
              onClick={stopAll}
              className="px-3 py-1.5 text-xs rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40 min-h-[44px] cursor-pointer"
              aria-label="Stop all sounds"
            >
              🔊 ⏸
            </button>
          )}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[44px] cursor-pointer"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.pageSubtitle}</p>

      {/* Tab nav */}
      <nav className="flex flex-wrap gap-1.5 mb-6 p-1.5 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700">
        {VALID_TABS.map((id) => {
          const isActive = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchTab(id)}
              className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabs[id]}
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      {tab === 'hub' && <HubTab onSelect={handleSelectModality} t={t} />}
      {tab === 'breathe' && <BreathingTab language={language} t={t} />}
      {tab === 'meditate' && <MeditateTab language={language} t={t} />}
      {tab === 'vent' && <VentTab language={language} t={t} />}
      {tab === 'fidget' && <FidgetTab language={language} t={t} />}
      {tab === 'sounds' && <SoundsTab language={language} t={t} />}
    </div>
  )
}

export default function StressReliefStudio() {
  return (
    <SoundMixerProvider>
      <StudioInner />
    </SoundMixerProvider>
  )
}
```

- [ ] **Step 3: Create placeholder stubs for all tabs (will be replaced in later tasks)**

Create these stub files so the studio compiles:

`tools/stress-relief/breathing/breathing-tab.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function BreathingTab({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="text-center text-slate-400 py-12">Breathing — coming soon</div>
}
```

`tools/stress-relief/meditate/meditate-tab.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function MeditateTab({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="text-center text-slate-400 py-12">Meditate — coming soon</div>
}
```

`tools/stress-relief/vent/vent-tab.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function VentTab({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="text-center text-slate-400 py-12">Vent — coming soon</div>
}
```

`tools/stress-relief/fidget/fidget-tab.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function FidgetTab({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="text-center text-slate-400 py-12">Fidget — coming soon</div>
}
```

`tools/stress-relief/sounds/sounds-tab.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function SoundsTab({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="text-center text-slate-400 py-12">Sounds — coming soon</div>
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 5: Commit**

```bash
git add tools/stress-relief/stress-relief-studio.tsx tools/stress-relief/hub-tab.tsx tools/stress-relief/breathing/breathing-tab.tsx tools/stress-relief/meditate/meditate-tab.tsx tools/stress-relief/vent/vent-tab.tsx tools/stress-relief/fidget/fidget-tab.tsx tools/stress-relief/sounds/sounds-tab.tsx
git commit -m "feat(stress-relief): add studio shell with tab routing and hub"
```

---

### Task 6: Page Route & SEO Layout

**Files:**
- Create: `app/tools/stress-relief/page.tsx`
- Create: `app/tools/stress-relief/layout.tsx`

- [ ] **Step 1: Create `app/tools/stress-relief/page.tsx`**

```typescript
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import StressReliefStudio from '@/tools/stress-relief/stress-relief-studio'

export default function StressReliefPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-6 px-4 bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-5xl">
        <div className="mb-4">
          <ToolBreadcrumb toolName="Stress Relief Studio" toolSlug="stress-relief" />
        </div>
        <StressReliefStudio />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/tools/stress-relief/layout.tsx`**

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stress Relief Studio — Breathing, Meditation, Vent Journal & More | Toolk1t',
  description:
    'A free wellness hub: guided breathing exercises, meditation tracks, AI-powered vent journal, fidget toys, and ambient sound therapy. Bilingual EN/ZH. Privacy-first.',
  keywords: [
    'stress relief', 'breathing exercises', 'meditation', 'vent journal',
    'fidget toys', 'sound therapy', 'wellness', 'anxiety relief',
    '减压', '冥想', '呼吸训练',
  ],
  openGraph: {
    title: 'Stress Relief Studio',
    description: 'A sanctuary for releasing pressure — breathing, meditation, vent journal, fidget toys, and sound therapy.',
    type: 'website',
  },
}

export default function StressReliefLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

- [ ] **Step 3: Verify TypeScript compiles and build runs**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add app/tools/stress-relief/page.tsx app/tools/stress-relief/layout.tsx
git commit -m "feat(stress-relief): add page route and SEO layout"
```

---

### Task 7: Breathing Tab — Animated Circle

**Files:**
- Create: `tools/stress-relief/breathing/breathing-circle.tsx`

- [ ] **Step 1: Create `tools/stress-relief/breathing/breathing-circle.tsx`**

```typescript
'use client'

import { useEffect, useState, useRef } from 'react'

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle'

interface BreathingCircleProps {
  phase: Phase
  phaseDuration: number  // seconds
  active: boolean
}

export function BreathingCircle({ phase, phaseDuration, active }: BreathingCircleProps) {
  const [scale, setScale] = useState(0.5)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active || phase === 'idle') {
      setScale(0.5)
      return
    }
    startTimeRef.current = null
    const targetScale = phase === 'inhale' ? 1.0 : phase === 'exhale' ? 0.5 : null

    if (targetScale === null) {
      // hold phase — stay at current scale
      return
    }

    const startScale = scale
    const animate = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now
      const elapsed = (now - startTimeRef.current) / 1000
      const progress = Math.min(elapsed / phaseDuration, 1)
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      setScale(startScale + (targetScale - startScale) * eased)
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseDuration, active])

  const colorClass =
    phase === 'inhale' ? 'from-cyan-400 to-blue-500'
      : phase === 'exhale' ? 'from-purple-400 to-pink-500'
        : 'from-slate-400 to-slate-500'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {/* Outer ring */}
      <div
        className="absolute rounded-full border-2 border-slate-200 dark:border-slate-700"
        style={{ width: 280, height: 280 }}
      />
      {/* Animated circle */}
      <div
        className={`absolute rounded-full bg-gradient-to-br ${colorClass} transition-colors duration-500`}
        style={{
          width: 240,
          height: 240,
          transform: `scale(${scale})`,
          opacity: 0.7,
          filter: 'blur(2px)',
        }}
      />
      {/* Solid inner circle */}
      <div
        className={`absolute rounded-full bg-gradient-to-br ${colorClass} transition-colors duration-500`}
        style={{
          width: 200,
          height: 200,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/stress-relief/breathing/breathing-circle.tsx
git commit -m "feat(stress-relief): add animated breathing circle component"
```

---

### Task 8: Breathing Tab Implementation

**Files:**
- Replace: `tools/stress-relief/breathing/breathing-tab.tsx`

- [ ] **Step 1: Replace `tools/stress-relief/breathing/breathing-tab.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Language, BreathingPattern } from '@/tools/stress-relief/stress-relief-types'
import { BREATHING_PATTERNS } from '@/tools/stress-relief/breathing/breathing-patterns'
import { BreathingCircle } from '@/tools/stress-relief/breathing/breathing-circle'
import { MoodCheckin } from '@/tools/stress-relief/shared/mood-checkin'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle'

interface BreathingTabProps {
  language: Language
  t: I18nStrings
}

export function BreathingTab({ language, t }: BreathingTabProps) {
  const [pattern, setPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0])
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [cycle, setCycle] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const phaseDuration =
    phase === 'inhale' ? pattern.inhale
      : phase === 'holdIn' ? pattern.holdIn
        : phase === 'exhale' ? pattern.exhale
          : phase === 'holdOut' ? pattern.holdOut
            : 0

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      const order: Phase[] = ['inhale', 'holdIn', 'exhale', 'holdOut']
      const idx = order.indexOf(current)
      const next = order[(idx + 1) % 4]

      // Skip phases with 0 duration
      let nextNonZero = next
      let attempts = 0
      while (
        attempts < 4 &&
        ((nextNonZero === 'inhale' && pattern.inhale === 0) ||
          (nextNonZero === 'holdIn' && pattern.holdIn === 0) ||
          (nextNonZero === 'exhale' && pattern.exhale === 0) ||
          (nextNonZero === 'holdOut' && pattern.holdOut === 0))
      ) {
        const i = order.indexOf(nextNonZero)
        nextNonZero = order[(i + 1) % 4]
        attempts++
      }

      // Increment cycle when we complete an exhale (or come back to inhale from exhale)
      if (current === 'exhale' || (current === 'holdOut' && pattern.holdOut > 0)) {
        if (nextNonZero === 'inhale') {
          setCycle((c) => c + 1)
        }
      }

      return nextNonZero
    })
  }, [pattern])

  // Phase timer
  useEffect(() => {
    if (!running || phase === 'idle' || phaseDuration === 0) return
    if (cycle >= pattern.cycles) {
      setRunning(false)
      setPhase('idle')
      return
    }
    timeoutRef.current = setTimeout(() => {
      advancePhase()
    }, phaseDuration * 1000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [running, phase, phaseDuration, cycle, pattern.cycles, advancePhase])

  const handleStart = useCallback(() => {
    setCycle(0)
    setPhase('inhale')
    setRunning(true)
  }, [])

  const handlePause = useCallback(() => {
    setRunning(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleResume = useCallback(() => {
    setRunning(true)
  }, [])

  const handleStop = useCallback(() => {
    setRunning(false)
    setPhase('idle')
    setCycle(0)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const phaseLabel =
    phase === 'inhale' ? t.breathing.inhale
      : phase === 'holdIn' ? t.breathing.holdIn
        : phase === 'exhale' ? t.breathing.exhale
          : phase === 'holdOut' ? t.breathing.holdOut
            : ''

  return (
    <div className="space-y-6">
      {/* Pattern picker */}
      <div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
          {t.breathing.pickPattern}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BREATHING_PATTERNS.map((p) => {
            const isActive = pattern.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setPattern(p); handleStop() }}
                className={`p-3 rounded-xl text-left transition-all min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-[#131a23] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
                }`}
              >
                <p className="text-sm font-semibold">{p.name[language]}</p>
                <p className={`text-xs mt-0.5 ${isActive ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
                  {p.description[language]}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Breathing circle */}
      <div className="flex flex-col items-center">
        <BreathingCircle phase={phase} phaseDuration={phaseDuration} active={running} />

        {/* Phase label */}
        <p className="mt-6 text-2xl font-bold text-slate-900 dark:text-white min-h-[2rem]">
          {phaseLabel}
        </p>

        {/* Cycle counter */}
        {running && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.breathing.cycle} {cycle + 1} {t.breathing.of} {pattern.cycles}
          </p>
        )}

        {/* Controls */}
        <div className="flex gap-2 mt-6">
          {!running && phase === 'idle' && (
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:opacity-90 min-h-[44px] cursor-pointer"
            >
              {t.breathing.start}
            </button>
          )}
          {running && (
            <button
              type="button"
              onClick={handlePause}
              className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold min-h-[44px] cursor-pointer"
            >
              {t.breathing.pause}
            </button>
          )}
          {!running && phase !== 'idle' && (
            <button
              type="button"
              onClick={handleResume}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:opacity-90 min-h-[44px] cursor-pointer"
            >
              {t.breathing.resume}
            </button>
          )}
          {phase !== 'idle' && (
            <button
              type="button"
              onClick={handleStop}
              className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold min-h-[44px] cursor-pointer"
            >
              {t.breathing.stop}
            </button>
          )}
        </div>
      </div>

      <MoodCheckin modality="breathe" t={t} />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/stress-relief/breathing/breathing-tab.tsx
git commit -m "feat(stress-relief): implement breathing tab with phase timer and patterns"
```

---

### Task 9: Meditate Player + Tab

**Files:**
- Create: `tools/stress-relief/meditate/meditate-player.tsx`
- Create: `tools/stress-relief/meditate/meditate-favorites.ts`
- Replace: `tools/stress-relief/meditate/meditate-tab.tsx`

- [ ] **Step 1: Create `tools/stress-relief/meditate/meditate-favorites.ts`**

```typescript
const STORAGE_KEY = 'stress-relief:meditate-favorites'

export function loadFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  return loadFavorites().includes(id)
}

export function toggleFavorite(id: string): boolean {
  const favorites = loadFavorites()
  const idx = favorites.indexOf(id)
  if (idx >= 0) {
    favorites.splice(idx, 1)
  } else {
    favorites.push(id)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    /* ignore */
  }
  return idx < 0
}
```

- [ ] **Step 2: Create `tools/stress-relief/meditate/meditate-player.tsx`**

```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Language, MeditationTrack } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface MeditatePlayerProps {
  track: MeditationTrack
  language: Language
  t: I18nStrings
}

export function MeditatePlayer({ track, language, t }: MeditatePlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [usingTts, setUsingTts] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Try to load the audio file; on error fall back to TTS
  useEffect(() => {
    setPlaying(false)
    setCurrentTime(0)
    setUsingTts(false)

    const audio = new Audio(track.audioUrl)
    audioRef.current = audio

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => setPlaying(false)
    const handleError = () => {
      audioRef.current = null
      setUsingTts(true)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      if (ttsUtteranceRef.current && typeof window !== 'undefined') {
        window.speechSynthesis.cancel()
      }
    }
  }, [track])

  const handlePlayPause = useCallback(() => {
    if (usingTts) {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      if (playing) {
        window.speechSynthesis.cancel()
        setPlaying(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(track.script[language])
        utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US'
        utterance.rate = 0.85
        utterance.pitch = 0.95
        utterance.onend = () => setPlaying(false)
        ttsUtteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setPlaying(true)
      }
      return
    }

    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [playing, usingTts, track, language])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = track.duration > 0 ? (currentTime / track.duration) * 100 : 0

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{track.title[language]}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{track.description[language]}</p>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(track.duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handlePlayPause}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:opacity-90 min-h-[44px] cursor-pointer"
        >
          {playing ? t.meditate.pause : t.meditate.play}
        </button>
      </div>

      {usingTts && (
        <p className="mt-3 text-xs text-center text-slate-400 italic">{t.meditate.voiceFallback}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace `tools/stress-relief/meditate/meditate-tab.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Language, MeditationTrack } from '@/tools/stress-relief/stress-relief-types'
import { MEDITATION_TRACKS, getTracksByCategory } from '@/tools/stress-relief/meditate/meditate-tracks'
import { loadFavorites, toggleFavorite } from '@/tools/stress-relief/meditate/meditate-favorites'
import { MeditatePlayer } from '@/tools/stress-relief/meditate/meditate-player'
import { MoodCheckin } from '@/tools/stress-relief/shared/mood-checkin'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

type Category = 'all' | 'sleep' | 'anxiety' | 'focus' | 'morning' | 'body-scan'
const CATEGORIES: Category[] = ['all', 'sleep', 'anxiety', 'focus', 'morning', 'body-scan']

interface MeditateTabProps {
  language: Language
  t: I18nStrings
}

export function MeditateTab({ language, t }: MeditateTabProps) {
  const [category, setCategory] = useState<Category>('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selected, setSelected] = useState<MeditationTrack | null>(null)

  useEffect(() => {
    setFavorites(loadFavorites())
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id)
    setFavorites(loadFavorites())
  }, [])

  const tracks = getTracksByCategory(category)

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[44px] cursor-pointer ${
              category === c
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                : 'bg-white dark:bg-[#131a23] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400'
            }`}
          >
            {t.meditate.categories[c]}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div className="grid gap-3">
        {tracks.map((track) => {
          const isFav = favorites.includes(track.id)
          const isSelected = selected?.id === track.id
          return (
            <div
              key={track.id}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                  : 'bg-white dark:bg-[#131a23] border-slate-200 dark:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelected(track)}
                className="flex-1 text-left min-h-[44px] cursor-pointer"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{track.title[language]}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{track.description[language]}</p>
                <p className="text-[10px] text-purple-500 mt-1">{Math.round(track.duration / 60)} {t.meditate.minutes}</p>
              </button>
              <button
                type="button"
                onClick={() => handleToggleFavorite(track.id)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] cursor-pointer text-xl"
                aria-label={isFav ? t.meditate.unfavorite : t.meditate.favorite}
              >
                {isFav ? '⭐' : '☆'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Player */}
      {selected && <MeditatePlayer track={selected} language={language} t={t} />}

      <MoodCheckin modality="meditate" t={t} />
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 5: Commit**

```bash
git add tools/stress-relief/meditate/meditate-favorites.ts tools/stress-relief/meditate/meditate-player.tsx tools/stress-relief/meditate/meditate-tab.tsx
git commit -m "feat(stress-relief): implement meditate tab with player and favorites"
```

---

### Task 10: Vent Journal API Route

**Files:**
- Create: `app/api/v1/stress-relief/vent/route.ts`

- [ ] **Step 1: Create `app/api/v1/stress-relief/vent/route.ts`**

```typescript
import { z } from 'zod'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  entry: z.string().min(1).max(2000),
  language: z.enum(['en', 'zh']).default('en'),
})

interface VentResponse {
  validation: string
  reframe: string
  action: string
}

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

function buildPrompt(entry: string, language: 'en' | 'zh'): string {
  const langInstruction = language === 'zh'
    ? 'Respond entirely in Simplified Chinese (简体中文).'
    : 'Respond entirely in English.'

  return `You are a compassionate, empathetic listener. The user is venting about something stressful or upsetting. Your job is to make them feel heard and gently help them.

User's vent:
"""
${entry}
"""

${langInstruction}

Respond with EXACTLY this JSON structure:
{
  "validation": "<2-3 sentences acknowledging their feelings without judgment. Start with phrases like 'That sounds...' or 'It makes complete sense that...'>",
  "reframe": "<2-3 sentences offering a different perspective gently, not dismissing their feelings. Start with phrases like 'And yet...' or 'One thing to consider...'>",
  "action": "<1-2 sentences suggesting one small concrete action they could take right now. Could be a breathing exercise, fidget toy, sound therapy, or anything practical.>"
}

Be warm, never preachy. Return ONLY the JSON, no markdown fences, no extra text.`
}

function stripCodeFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
}

export async function POST(request: Request) {
  // PRIVACY: This route MUST NOT log the entry content. Only error messages and metadata.
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const prompt = buildPrompt(parsed.data.entry, parsed.data.language)

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseEvent(data)))
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  validation: { type: 'STRING' },
                  reframe: { type: 'STRING' },
                  action: { type: 'STRING' },
                },
                required: ['validation', 'reframe', 'action'],
              },
            },
          }),
        })

        if (!response.ok) {
          // Privacy: only log status and length, not content
          console.error('vent: Gemini API error', response.status)
          send({ type: 'error', message: 'AI request failed' })
          return
        }

        const data = await response.json()
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

        let result: VentResponse
        try {
          result = JSON.parse(stripCodeFences(rawText)) as VentResponse
        } catch {
          send({ type: 'error', message: 'AI returned malformed response' })
          return
        }

        send({ type: 'response', ...result })
        send({ type: 'done' })
      } catch (err) {
        // Privacy: log only error type, not full message which could include user content
        const errType = err instanceof Error ? err.name : 'unknown'
        console.error('vent: stream error', errType)
        send({ type: 'error', message: 'Unexpected error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/stress-relief/vent/route.ts
git commit -m "feat(stress-relief): add vent journal API route with privacy-first Gemini streaming"
```

---

### Task 11: Vent Journal Tab UI

**Files:**
- Create: `tools/stress-relief/vent/vent-storage.ts`
- Replace: `tools/stress-relief/vent/vent-tab.tsx`

- [ ] **Step 1: Create `tools/stress-relief/vent/vent-storage.ts`**

```typescript
import type { VentEntry } from '@/tools/stress-relief/stress-relief-types'

const STORAGE_KEY = 'stress-relief:vent-entries'

export function loadEntries(): VentEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEntry(entry: VentEntry): void {
  if (typeof window === 'undefined') return
  try {
    const entries = loadEntries()
    entries.unshift(entry)
    // Keep last 50
    const trimmed = entries.slice(0, 50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    /* ignore */
  }
}

export function clearAllEntries(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 2: Replace `tools/stress-relief/vent/vent-tab.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Language, VentEntry } from '@/tools/stress-relief/stress-relief-types'
import { loadEntries, saveEntry, clearAllEntries } from '@/tools/stress-relief/vent/vent-storage'
import { MoodCheckin } from '@/tools/stress-relief/shared/mood-checkin'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface VentTabProps {
  language: Language
  t: I18nStrings
}

export function VentTab({ language, t }: VentTabProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<{ validation: string; reframe: string; action: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<VentEntry[]>([])

  useEffect(() => {
    setEntries(loadEntries())
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/v1/stress-relief/vent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: text, language }),
      })

      if (!res.ok || !res.body) {
        setError(t.errors.aiUnavailable)
        setSubmitting(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'response') {
              const newResponse = {
                validation: event.validation,
                reframe: event.reframe,
                action: event.action,
              }
              setResponse(newResponse)
              const entry: VentEntry = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                text,
                response: newResponse,
                createdAt: Date.now(),
              }
              saveEntry(entry)
              setEntries(loadEntries())
            } else if (event.type === 'error') {
              setError(event.message || t.errors.aiUnavailable)
            }
          } catch {
            /* skip malformed */
          }
        }
      }
    } catch {
      setError(t.errors.network)
    } finally {
      setSubmitting(false)
    }
  }, [text, submitting, language, t])

  const handleClearAll = useCallback(() => {
    if (!window.confirm(t.vent.clearConfirm)) return
    clearAllEntries()
    setEntries([])
  }, [t])

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-300 text-center">
        🔒 {t.vent.privacy}
      </div>

      {/* Vent input */}
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.vent.placeholder}
          rows={6}
          maxLength={2000}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a23] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">{text.length}/2000</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
          >
            {submitting ? t.vent.submitting : t.vent.submit}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
            <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-2">💙 {t.vent.sections.validation}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{response.validation}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">🔄 {t.vent.sections.reframe}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{response.reframe}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✨ {t.vent.sections.action}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{response.action}</p>
          </div>
        </div>
      )}

      {/* Past entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.vent.pastEntries}</h3>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:underline min-h-[44px] cursor-pointer"
            >
              {t.vent.clearAll}
            </button>
          )}
        </div>
        {entries.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-4">{t.vent.empty}</p>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 10).map((e) => (
              <details key={e.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700">
                <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer min-h-[44px]">
                  {new Date(e.createdAt).toLocaleString()}
                </summary>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-wrap">{e.text}</p>
              </details>
            ))}
          </div>
        )}
      </div>

      <MoodCheckin modality="vent" t={t} />
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/stress-relief/vent/vent-storage.ts tools/stress-relief/vent/vent-tab.tsx
git commit -m "feat(stress-relief): implement vent journal tab with streaming AI and local storage"
```

---

### Task 12: Sounds Tab + Mixer Tile

**Files:**
- Create: `tools/stress-relief/sounds/sound-mixer-tile.tsx`
- Replace: `tools/stress-relief/sounds/sounds-tab.tsx`

- [ ] **Step 1: Create `tools/stress-relief/sounds/sound-mixer-tile.tsx`**

```typescript
'use client'

import type { SoundTrack, Language } from '@/tools/stress-relief/stress-relief-types'
import { useSoundMixer } from '@/tools/stress-relief/shared/sound-mixer-context'

interface SoundMixerTileProps {
  track: SoundTrack
  language: Language
}

const SOUND_EMOJI: Record<string, string> = {
  rain: '🌧️', forest: '🌲', ocean: '🌊', fire: '🔥', wind: '💨', thunderstorm: '⛈️',
  white: '⬜', pink: '🌸', brown: '🟫',
  alpha: '🧠', theta: '💭', delta: '😴',
}

export function SoundMixerTile({ track, language }: SoundMixerTileProps) {
  const { layers, toggleLayer, setLayerVolume } = useSoundMixer()
  const layer = layers.find((l) => l.id === track.id)
  if (!layer) return null

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        layer.playing
          ? 'bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 border-teal-300 dark:border-teal-700'
          : 'bg-white dark:bg-[#131a23] border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{SOUND_EMOJI[track.id] || '🎵'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{track.label[language]}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleLayer(track.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium min-h-[44px] cursor-pointer ${
            layer.playing
              ? 'bg-teal-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
          aria-label={layer.playing ? 'Stop' : 'Play'}
        >
          {layer.playing ? '⏸' : '▶'}
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={layer.volume}
        onChange={(e) => setLayerVolume(track.id, parseFloat(e.target.value))}
        className="w-full accent-teal-500 cursor-pointer"
        aria-label={`${track.label[language]} volume`}
      />
    </div>
  )
}
```

- [ ] **Step 2: Replace `tools/stress-relief/sounds/sounds-tab.tsx`**

```typescript
'use client'

import { useMemo } from 'react'
import type { Language, SoundCategory } from '@/tools/stress-relief/stress-relief-types'
import { SOUND_TRACKS } from '@/tools/stress-relief/sounds/sound-tracks'
import { useSoundMixer } from '@/tools/stress-relief/shared/sound-mixer-context'
import { SoundMixerTile } from '@/tools/stress-relief/sounds/sound-mixer-tile'
import { MoodCheckin } from '@/tools/stress-relief/shared/mood-checkin'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface SoundsTabProps {
  language: Language
  t: I18nStrings
}

export function SoundsTab({ language, t }: SoundsTabProps) {
  const { masterVolume, setMasterVolume, stopAll, isAnyPlaying } = useSoundMixer()

  const grouped = useMemo(() => {
    const groups: Record<SoundCategory, typeof SOUND_TRACKS> = { nature: [], noise: [], binaural: [] }
    SOUND_TRACKS.forEach((t) => groups[t.category].push(t))
    return groups
  }, [])

  return (
    <div className="space-y-6">
      {/* Master volume + stop all */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.sounds.masterVolume}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="flex-1 accent-teal-500 cursor-pointer"
          aria-label={t.sounds.masterVolume}
        />
        {isAnyPlaying && (
          <button
            type="button"
            onClick={stopAll}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 min-h-[44px] cursor-pointer"
          >
            {t.sounds.stopAll}
          </button>
        )}
      </div>

      {/* Sound categories */}
      {(Object.keys(grouped) as SoundCategory[]).map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            {t.sounds.categories[category]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grouped[category].map((track) => (
              <SoundMixerTile key={track.id} track={track} language={language} />
            ))}
          </div>
        </div>
      ))}

      <MoodCheckin modality="sounds" t={t} />
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/stress-relief/sounds/sound-mixer-tile.tsx tools/stress-relief/sounds/sounds-tab.tsx
git commit -m "feat(stress-relief): implement sounds tab with multi-layer mixer"
```

---

### Task 13: Fidget Tab Shell + Bubble Wrap Toy

**Files:**
- Create: `tools/stress-relief/fidget/toys/bubble-wrap.tsx`
- Replace: `tools/stress-relief/fidget/fidget-tab.tsx`

- [ ] **Step 1: Create `tools/stress-relief/fidget/toys/bubble-wrap.tsx`**

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface BubbleWrapProps {
  language: Language
  t: I18nStrings
}

const ROWS = 8
const COLS = 12
const TOTAL = ROWS * COLS

export function BubbleWrap({ language: _language, t }: BubbleWrapProps) {
  const [popped, setPopped] = useState<Set<number>>(new Set())

  const handlePop = useCallback((idx: number) => {
    if (popped.has(idx)) return
    setPopped((prev) => new Set(prev).add(idx))
    // Optional: play pop sound
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
        osc.connect(gain).connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
        setTimeout(() => ctx.close(), 200)
      } catch {
        /* ignore */
      }
    }
  }, [popped])

  const handleReset = useCallback(() => {
    setPopped(new Set())
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.fidget.bubbleWrap.popped}: {popped.size}/{TOTAL}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 min-h-[44px] cursor-pointer"
        >
          {t.fidget.bubbleWrap.reset}
        </button>
      </div>
      <div
        className="grid gap-1 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-900"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: TOTAL }).map((_, idx) => {
          const isPopped = popped.has(idx)
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePop(idx)}
              className={`aspect-square rounded-full transition-all duration-150 ${
                isPopped
                  ? 'bg-pink-100 dark:bg-pink-950 scale-90'
                  : 'bg-gradient-to-br from-pink-300 to-pink-400 hover:scale-105 shadow-md'
              }`}
              aria-label={`Bubble ${idx + 1}`}
              disabled={isPopped}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `tools/stress-relief/fidget/fidget-tab.tsx`**

```typescript
'use client'

import { useState } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import { BubbleWrap } from '@/tools/stress-relief/fidget/toys/bubble-wrap'
import { ZenGarden } from '@/tools/stress-relief/fidget/toys/zen-garden'
import { SquishyBall } from '@/tools/stress-relief/fidget/toys/squishy-ball'
import { FidgetSpinner } from '@/tools/stress-relief/fidget/toys/fidget-spinner'
import { KineticSand } from '@/tools/stress-relief/fidget/toys/kinetic-sand'
import { RubberBand } from '@/tools/stress-relief/fidget/toys/rubber-band'
import { MoodCheckin } from '@/tools/stress-relief/shared/mood-checkin'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

type Toy = 'bubbleWrap' | 'zenGarden' | 'squishyBall' | 'fidgetSpinner' | 'kineticSand' | 'rubberBand'

interface FidgetTabProps {
  language: Language
  t: I18nStrings
}

const TOY_OPTIONS: { id: Toy; emoji: string }[] = [
  { id: 'bubbleWrap', emoji: '🫧' },
  { id: 'zenGarden', emoji: '🪨' },
  { id: 'squishyBall', emoji: '⚪' },
  { id: 'fidgetSpinner', emoji: '🌀' },
  { id: 'kineticSand', emoji: '🏖️' },
  { id: 'rubberBand', emoji: '➿' },
]

export function FidgetTab({ language, t }: FidgetTabProps) {
  const [selected, setSelected] = useState<Toy>('bubbleWrap')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{t.fidget.pickToy}</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TOY_OPTIONS.map(({ id, emoji }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all min-h-[44px] cursor-pointer ${
                selected === id
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-white dark:bg-[#131a23] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-pink-400'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium text-center">{t.fidget.toys[id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-[#0f1620] border border-slate-200 dark:border-slate-700">
        {selected === 'bubbleWrap' && <BubbleWrap language={language} t={t} />}
        {selected === 'zenGarden' && <ZenGarden language={language} t={t} />}
        {selected === 'squishyBall' && <SquishyBall language={language} t={t} />}
        {selected === 'fidgetSpinner' && <FidgetSpinner language={language} t={t} />}
        {selected === 'kineticSand' && <KineticSand language={language} t={t} />}
        {selected === 'rubberBand' && <RubberBand language={language} t={t} />}
      </div>

      <MoodCheckin modality="fidget" t={t} />
    </div>
  )
}
```

- [ ] **Step 3: Create stub files for the other 5 toys (replaced in Task 14)**

`tools/stress-relief/fidget/toys/zen-garden.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function ZenGarden({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="p-8 text-center text-slate-400">Zen Garden — coming soon</div>
}
```

`tools/stress-relief/fidget/toys/squishy-ball.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function SquishyBall({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="p-8 text-center text-slate-400">Squishy Ball — coming soon</div>
}
```

`tools/stress-relief/fidget/toys/fidget-spinner.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function FidgetSpinner({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="p-8 text-center text-slate-400">Fidget Spinner — coming soon</div>
}
```

`tools/stress-relief/fidget/toys/kinetic-sand.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function KineticSand({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="p-8 text-center text-slate-400">Kinetic Sand — coming soon</div>
}
```

`tools/stress-relief/fidget/toys/rubber-band.tsx`:
```typescript
'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function RubberBand({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="p-8 text-center text-slate-400">Rubber Band — coming soon</div>
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 5: Commit**

```bash
git add tools/stress-relief/fidget/
git commit -m "feat(stress-relief): add fidget tab shell and bubble wrap toy"
```

---

### Task 14: Remaining 5 Fidget Toys

**Files:**
- Replace: `tools/stress-relief/fidget/toys/zen-garden.tsx`
- Replace: `tools/stress-relief/fidget/toys/squishy-ball.tsx`
- Replace: `tools/stress-relief/fidget/toys/fidget-spinner.tsx`
- Replace: `tools/stress-relief/fidget/toys/kinetic-sand.tsx`
- Replace: `tools/stress-relief/fidget/toys/rubber-band.tsx`

- [ ] **Step 1: Replace `tools/stress-relief/fidget/toys/zen-garden.tsx` (canvas drawing)**

```typescript
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface ZenGardenProps {
  language: Language
  t: I18nStrings
}

export function ZenGarden({ language: _language, t }: ZenGardenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sandy background
    canvas.width = canvas.offsetWidth
    canvas.height = 360
    ctx.fillStyle = '#f5e6c8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Subtle texture
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgba(${200 + Math.random() * 30}, ${180 + Math.random() * 30}, ${140 + Math.random() * 30}, 0.3)`
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1)
    }
  }, [resetKey])

  const draw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (lastPointRef.current) {
      ctx.strokeStyle = '#c4a574'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Parallel lines for "rake" effect
      ctx.strokeStyle = '#a88a55'
      ctx.lineWidth = 1
      for (let offset = -8; offset <= 8; offset += 4) {
        if (offset === 0) continue
        ctx.beginPath()
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y + offset)
        ctx.lineTo(x, y + offset)
        ctx.stroke()
      }
    }
    lastPointRef.current = { x, y }
  }, [])

  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    drawingRef.current = true
    const pt = getPoint(e)
    if (pt) lastPointRef.current = pt
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return
    const pt = getPoint(e)
    if (pt) draw(pt.x, pt.y)
  }

  const handleEnd = () => {
    drawingRef.current = false
    lastPointRef.current = null
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 min-h-[44px] cursor-pointer"
        >
          {t.fidget.zenGarden.reset}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="w-full h-[360px] rounded-xl cursor-crosshair touch-none"
      />
    </div>
  )
}
```

- [ ] **Step 2: Replace `tools/stress-relief/fidget/toys/squishy-ball.tsx`**

```typescript
'use client'

import { useState } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface SquishyBallProps {
  language: Language
  t: I18nStrings
}

export function SquishyBall({ language: _language, t }: SquishyBallProps) {
  const [squishing, setSquishing] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4 py-8 select-none">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t.fidget.squishyBall.hint}</p>
      <button
        type="button"
        onMouseDown={() => setSquishing(true)}
        onMouseUp={() => setSquishing(false)}
        onMouseLeave={() => setSquishing(false)}
        onTouchStart={() => setSquishing(true)}
        onTouchEnd={() => setSquishing(false)}
        className="rounded-full bg-gradient-to-br from-pink-300 via-pink-400 to-rose-500 shadow-2xl transition-transform duration-100 cursor-pointer min-h-[44px] min-w-[44px]"
        style={{
          width: 200,
          height: 200,
          transform: squishing ? 'scale(0.7) scaleY(0.6)' : 'scale(1)',
          boxShadow: squishing ? 'inset 0 8px 16px rgba(0,0,0,0.3)' : '0 20px 40px rgba(255,100,150,0.4)',
        }}
        aria-label="Squish ball"
      />
    </div>
  )
}
```

- [ ] **Step 3: Replace `tools/stress-relief/fidget/toys/fidget-spinner.tsx`**

```typescript
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface FidgetSpinnerProps {
  language: Language
  t: I18nStrings
}

export function FidgetSpinner({ language: _language, t }: FidgetSpinnerProps) {
  const [angle, setAngle] = useState(0)
  const velocityRef = useRef(0)
  const draggingRef = useRef(false)
  const lastAngleRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const animate = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      setAngle((a) => a + velocityRef.current)
      velocityRef.current *= 0.985 // friction
      rafRef.current = requestAnimationFrame(animate)
    } else {
      velocityRef.current = 0
    }
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const getAngle = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current
    if (!container) return 0
    const rect = container.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY
    return Math.atan2(y - cy, x - cx) * (180 / Math.PI)
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    draggingRef.current = true
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    velocityRef.current = 0
    lastAngleRef.current = getAngle(e)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingRef.current) return
    const newAngle = getAngle(e)
    let diff = newAngle - lastAngleRef.current
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    setAngle((a) => a + diff)
    velocityRef.current = diff
    lastAngleRef.current = newAngle
  }

  const handleEnd = () => {
    draggingRef.current = false
    if (Math.abs(velocityRef.current) > 0.1) {
      rafRef.current = requestAnimationFrame(animate)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 select-none">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t.fidget.fidgetSpinner.hint}</p>
      <div
        ref={containerRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="relative cursor-grab active:cursor-grabbing"
        style={{ width: 220, height: 220 }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{ transform: `rotate(${angle}deg)`, transition: draggingRef.current ? 'none' : undefined }}
        >
          <circle cx="110" cy="110" r="20" fill="#888" />
          {[0, 120, 240].map((rot) => (
            <g key={rot} transform={`rotate(${rot} 110 110)`}>
              <ellipse cx="110" cy="40" rx="36" ry="40" fill="url(#grad)" />
              <circle cx="110" cy="40" r="14" fill="#444" />
            </g>
          ))}
          <defs>
            <radialGradient id="grad">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `tools/stress-relief/fidget/toys/kinetic-sand.tsx`**

```typescript
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface KineticSandProps {
  language: Language
  t: I18nStrings
}

const PARTICLE_COUNT = 600
const HEIGHT = 360

interface Particle { x: number; y: number; vx: number; vy: number }

export function KineticSand({ language: _language, t }: KineticSandProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number; pressed: boolean }>({ x: 0, y: 0, pressed: false })
  const rafRef = useRef<number | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const initParticles = useCallback((width: number) => {
    particlesRef.current = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: HEIGHT - 30 + Math.random() * 25,
        vx: 0,
        vy: 0,
      })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = HEIGHT
    initParticles(canvas.width)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const tick = () => {
      ctx.fillStyle = '#fef3c7'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p) => {
        // Mouse interaction
        if (mouseRef.current.pressed) {
          const dx = p.x - mouseRef.current.x
          const dy = p.y - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 40 && dist > 0) {
            const force = (40 - dist) / 40
            p.vx += (dx / dist) * force * 2
            p.vy += (dy / dist) * force * 2
          }
        }
        // Gravity
        p.vy += 0.2
        // Apply velocity
        p.x += p.vx
        p.y += p.vy
        // Friction
        p.vx *= 0.92
        p.vy *= 0.92
        // Floor
        if (p.y > HEIGHT - 2) {
          p.y = HEIGHT - 2
          p.vy *= -0.2
          p.vx *= 0.85
        }
        // Walls
        if (p.x < 2) { p.x = 2; p.vx *= -0.3 }
        if (p.x > canvas.width - 2) { p.x = canvas.width - 2; p.vx *= -0.3 }

        ctx.fillStyle = '#d4a373'
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3)
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [resetKey, initParticles])

  const updateMouse = (e: React.MouseEvent | React.TouchEvent, pressed?: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    mouseRef.current.x = x
    mouseRef.current.y = y
    if (pressed !== undefined) mouseRef.current.pressed = pressed
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 min-h-[44px] cursor-pointer"
        >
          {t.fidget.kineticSand.reset}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => updateMouse(e, true)}
        onMouseMove={(e) => updateMouse(e)}
        onMouseUp={(e) => updateMouse(e, false)}
        onMouseLeave={(e) => updateMouse(e, false)}
        onTouchStart={(e) => updateMouse(e, true)}
        onTouchMove={(e) => updateMouse(e)}
        onTouchEnd={(e) => updateMouse(e, false)}
        className="w-full rounded-xl cursor-crosshair touch-none"
        style={{ height: HEIGHT }}
      />
    </div>
  )
}
```

- [ ] **Step 5: Replace `tools/stress-relief/fidget/toys/rubber-band.tsx`**

```typescript
'use client'

import { useState, useRef, useCallback } from 'react'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'

interface RubberBandProps {
  language: Language
  t: I18nStrings
}

export function RubberBand({ language: _language, t }: RubberBandProps) {
  const [point, setPoint] = useState<{ x: number; y: number }>({ x: 200, y: 180 })
  const [snapping, setSnapping] = useState(false)
  const draggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const center = { x: 200, y: 180 }

  const handleStart = useCallback(() => {
    draggingRef.current = true
    setSnapping(false)
  }, [])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingRef.current) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    // Limit stretch
    const dx = x - center.x
    const dy = y - center.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 150
    if (dist > maxDist) {
      const scale = maxDist / dist
      setPoint({ x: center.x + dx * scale, y: center.y + dy * scale })
    } else {
      setPoint({ x, y })
    }
  }, [])

  const handleEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setSnapping(true)
    setPoint(center)
    setTimeout(() => setSnapping(false), 300)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 py-4 select-none">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t.fidget.rubberBand.hint}</p>
      <div
        ref={containerRef}
        className="relative bg-slate-100 dark:bg-slate-900 rounded-xl"
        style={{ width: 400, height: 360 }}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <svg width="400" height="360" className="absolute inset-0">
          {/* Anchor points */}
          <circle cx="50" cy="180" r="8" fill="#94a3b8" />
          <circle cx="350" cy="180" r="8" fill="#94a3b8" />
          {/* Rubber band */}
          <path
            d={`M 50 180 Q ${point.x} ${point.y} 350 180`}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            style={{ transition: snapping ? 'all 0.3s cubic-bezier(0.4, 2, 0.6, 1)' : undefined }}
          />
          {/* Drag handle */}
          <circle
            cx={point.x}
            cy={point.y}
            r="14"
            fill="#dc2626"
            style={{ cursor: 'grab', transition: snapping ? 'all 0.3s cubic-bezier(0.4, 2, 0.6, 1)' : undefined }}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          />
        </svg>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 7: Commit**

```bash
git add tools/stress-relief/fidget/toys/zen-garden.tsx tools/stress-relief/fidget/toys/squishy-ball.tsx tools/stress-relief/fidget/toys/fidget-spinner.tsx tools/stress-relief/fidget/toys/kinetic-sand.tsx tools/stress-relief/fidget/toys/rubber-band.tsx
git commit -m "feat(stress-relief): implement remaining 5 fidget toys (zen garden, squishy, spinner, kinetic sand, rubber band)"
```

---

### Task 15: Tool Catalog Registration

**Files:**
- Modify: `lib/tools.tsx`

- [ ] **Step 1: Add stress-relief entry to tools array**

Open `lib/tools.tsx` and add this entry **before the closing `]`** of the `tools` array (after the formatter entry):

```typescript
  {
    name: 'Stress Relief Studio',
    href: '/tools/stress-relief',
    description: 'Breathing, meditation, vent journal, fidget toys & sound therapy',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    color: 'from-purple-500 to-pink-500',
  },
```

- [ ] **Step 2: Verify TypeScript compiles and full build runs**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`
Then: `pnpm build 2>&1 | grep -E "stress-relief|error" | head -10`
Expected: `/tools/stress-relief` and `/api/v1/stress-relief/vent` appear in the route list.

- [ ] **Step 3: Commit**

```bash
git add lib/tools.tsx
git commit -m "feat(stress-relief): register in tool catalog"
```

---

### Task 16: E2E Browser Test

**Files:**
- Create: `e2e/stress-relief.spec.ts`

- [ ] **Step 1: Create `e2e/stress-relief.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Stress Relief Studio', () => {
  test('hub page loads with all 5 modality tiles', async ({ page }) => {
    await page.goto('/tools/stress-relief')
    await page.waitForLoadState('networkidle')

    // 5 modality tile buttons (the 5 hub tiles)
    await expect(page.getByRole('button', { name: /Breathing/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Meditation/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Vent Journal/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Fidget Toys/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Sound Therapy/ }).first()).toBeVisible()
  })

  test('switches to breathing tab via hash navigation', async ({ page }) => {
    await page.goto('/tools/stress-relief#breathe')
    await page.waitForLoadState('networkidle')

    // Pattern picker visible
    await expect(page.getByText(/Choose a pattern/i)).toBeVisible()
    // Start button visible
    await expect(page.getByRole('button', { name: /Start/i }).first()).toBeVisible()
  })

  test('fidget tab shows bubble wrap by default', async ({ page }) => {
    await page.goto('/tools/stress-relief#fidget')
    await page.waitForLoadState('networkidle')

    // Bubble wrap toy bubbles are present (96 bubbles)
    const bubbles = page.getByRole('button', { name: /^Bubble \d+$/ })
    expect(await bubbles.count()).toBeGreaterThan(50)
  })

  test('pops a bubble in bubble wrap', async ({ page }) => {
    await page.goto('/tools/stress-relief#fidget')
    await page.waitForLoadState('networkidle')

    const firstBubble = page.getByRole('button', { name: 'Bubble 1' })
    await firstBubble.click()
    // After clicking, the bubble button is disabled
    await expect(firstBubble).toBeDisabled()
  })

  test('vent journal shows privacy notice and textarea', async ({ page }) => {
    await page.goto('/tools/stress-relief#vent')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/stay on this device/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Let it out/i)).toBeVisible()
  })

  test('switches to Chinese language', async ({ page }) => {
    await page.goto('/tools/stress-relief')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: '中文' }).click()
    await expect(page.locator('h1').first()).toContainText('减压工作室')
  })
})
```

- [ ] **Step 2: Run E2E tests**

```bash
pnpm exec playwright test e2e/stress-relief.spec.ts --workers=1 --reporter=line
```

Expected: All 6 tests pass. If any fail, fix the implementation and re-run.

- [ ] **Step 3: Commit**

```bash
git add -f e2e/stress-relief.spec.ts
git commit -m "test(stress-relief): add E2E browser tests for hub, breathing, fidget, vent, i18n"
```

---

## Self-Review Notes

**Spec coverage:**
- ✅ Hub page with 5 tiles (Task 5)
- ✅ Breathing exercises with 6 patterns (Tasks 1, 7, 8)
- ✅ Meditation library + player + favorites (Tasks 1, 9)
- ✅ Vent journal with empathetic AI (Tasks 10, 11)
- ✅ 6 fidget toys (Tasks 13, 14)
- ✅ Sound therapy with mixer (Tasks 1, 3, 12)
- ✅ Light mood tracking (Task 4, used in all modality tabs)
- ✅ Bilingual EN + ZH (Task 2)
- ✅ Privacy-conscious (Task 10 explicitly avoids logging)
- ✅ Tab routing with hash (Task 5)
- ✅ Persistent SoundMixerProvider (Task 3)
- ✅ Catalog registration (Task 15)
- ✅ E2E test (Task 16)

**Deferred (acknowledged in plan):**
- PWA manifest + service worker
- Mood cloud sync (Supabase migration + API)
- Audio asset generation script for meditation/nature sounds
- Trends panel UI for mood visualization

These are valid future enhancements but not blocking v1. The audio fallback strategy (Web Speech API for meditation, Web Audio API for noise/binaural) means the tool works without external assets on day one.

**Type consistency:** All shared types defined in Task 1, used consistently. `Modality`, `BilingualText`, `I18nStrings`, `SoundKind` etc. match across all tasks.
