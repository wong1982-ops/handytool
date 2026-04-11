# Tarot Card Reading — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/ZH) AI-powered tarot card reading tool with 20+ spreads, immersive shuffle/reveal animations, streamed Gemini interpretations, and reading history with AI trend analysis.

**Architecture:** Wizard + Theater pattern — 3-step wizard (question → spread selection → reading theater). Theater delivers an immersive card shuffle, deal, and reveal experience with streamed AI interpretation. Reading history and trend analysis for logged-in users. Partial offline support (deck/UI work offline, AI features require internet).

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Gemini 2.5 Flash (text interpretation), Gemini Imagen (premium card art), Supabase (reading history), SSE streaming, CSS 3D transforms (card flip animations).

**Design spec:** `docs/superpowers/specs/2026-04-11-tarot-reading-design.md`

---

### Task 1: Types & Static Data

**Files:**
- Create: `tools/tarot/tarot-types.ts`
- Create: `tools/tarot/tarot-cards.ts`
- Create: `tools/tarot/tarot-spreads.ts`

- [ ] **Step 1: Create `tools/tarot/tarot-types.ts`**

```typescript
/* ── Tarot Types ── */

export type WizardStep = 1 | 2 | 3

export type Arcana = 'major' | 'minor'
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'
export type SpreadCategory = 'love' | 'career' | 'finance' | 'growth' | 'general'
export type Language = 'en' | 'zh'

export interface BilingualText {
  en: string
  zh: string
}

export interface TarotCard {
  id: number                       // 0–77
  name: BilingualText
  arcana: Arcana
  suit?: Suit                      // minor arcana only
  number?: number                  // 1(Ace)–14(King), minor only
  imageUrl: string                 // pre-generated base art
  meanings: {
    upright: BilingualText
    reversed: BilingualText
  }
  keywords: { en: string[]; zh: string[] }
}

export interface SpreadPosition {
  label: BilingualText             // e.g. "Past", "Present"
  x: number                       // layout coordinate (% of container)
  y: number
  rotation?: number                // degrees, for angled cards
}

export interface TarotSpread {
  id: string                       // e.g. 'celtic-cross'
  name: BilingualText
  description: BilingualText
  category: SpreadCategory
  cardCount: number
  positions: SpreadPosition[]
}

export interface DrawnCard {
  cardId: number
  positionIndex: number
  reversed: boolean
  customArtUrl?: string
}

export interface CardInterpretation {
  cardId: number
  positionLabel: BilingualText
  text: string                     // streamed from Gemini
}

export interface ReadingResult {
  cards: CardInterpretation[]
  narrative: string
}

export type TheaterStage = 'idle' | 'shuffling' | 'dealing' | 'revealing' | 'complete'

export interface TarotProject {
  // Step 1 — Question
  question: string
  category: SpreadCategory | null
  language: Language

  // Step 2 — Spread
  spreadId: string | null
  recommendedSpreadId: string | null

  // Step 3 — Theater
  drawnCards: DrawnCard[]
  revealedCount: number
  theaterStage: TheaterStage
  interpretation: ReadingResult | null
  streamedText: string              // partial text during streaming

  // UI state
  step: WizardStep
  loading: boolean
  error: string | null
}

export const DEFAULT_PROJECT: TarotProject = {
  question: '',
  category: null,
  language: 'en',
  spreadId: null,
  recommendedSpreadId: null,
  drawnCards: [],
  revealedCount: 0,
  theaterStage: 'idle',
  interpretation: null,
  streamedText: '',
  step: 1,
  loading: false,
  error: null,
}
```

- [ ] **Step 2: Create `tools/tarot/tarot-cards.ts` — all 78 cards**

This file exports a `TAROT_CARDS` array of all 78 cards. Below is the structure — include all 22 Major Arcana and all 56 Minor Arcana (14 per suit: Ace through King).

```typescript
import type { TarotCard } from './tarot-types'

export const TAROT_CARDS: TarotCard[] = [
  // ── Major Arcana (0–21) ──
  {
    id: 0,
    name: { en: 'The Fool', zh: '愚者' },
    arcana: 'major',
    imageUrl: '/tarot/major/00-fool.webp',
    meanings: {
      upright: { en: 'New beginnings, innocence, spontaneity, free spirit', zh: '新的开始、天真、自发性、自由精神' },
      reversed: { en: 'Recklessness, risk-taking, holding back', zh: '鲁莽、冒险、犹豫不决' },
    },
    keywords: { en: ['beginnings', 'innocence', 'adventure'], zh: ['开始', '天真', '冒险'] },
  },
  {
    id: 1,
    name: { en: 'The Magician', zh: '魔术师' },
    arcana: 'major',
    imageUrl: '/tarot/major/01-magician.webp',
    meanings: {
      upright: { en: 'Willpower, desire, resourcefulness, skill', zh: '意志力、欲望、足智多谋、技能' },
      reversed: { en: 'Manipulation, poor planning, untapped talents', zh: '操纵、计划不周、未开发的才能' },
    },
    keywords: { en: ['power', 'skill', 'concentration'], zh: ['力量', '技能', '专注'] },
  },
  // ... (include all 22 Major Arcana: 0 The Fool through 21 The World)
  // ... (include all 56 Minor Arcana: Ace–King of Wands, Cups, Swords, Pentacles)
  // Each minor arcana card follows this pattern:
  // {
  //   id: 22, // 22–35 = Wands, 36–49 = Cups, 50–63 = Swords, 64–77 = Pentacles
  //   name: { en: 'Ace of Wands', zh: '权杖王牌' },
  //   arcana: 'minor',
  //   suit: 'wands',
  //   number: 1,
  //   imageUrl: '/tarot/wands/ace.webp',
  //   meanings: { upright: { en: '...', zh: '...' }, reversed: { en: '...', zh: '...' } },
  //   keywords: { en: [...], zh: [...] },
  // },
]

/** Look up a card by ID */
export function getCard(id: number): TarotCard {
  const card = TAROT_CARDS[id]
  if (!card) throw new Error(`Unknown card ID: ${id}`)
  return card
}

/** Draw N random cards from the deck, each with random upright/reversed */
export function drawCards(count: number): { cardId: number; reversed: boolean }[] {
  const indices = Array.from({ length: 78 }, (_, i) => i)
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, count).map((cardId) => ({
    cardId,
    reversed: Math.random() < 0.3, // 30% chance reversed
  }))
}
```

Generate all 78 cards with authentic tarot names (EN + ZH), meanings, and keywords. Use Gemini knowledge for accurate traditional meanings.

- [ ] **Step 3: Create `tools/tarot/tarot-spreads.ts` — 20+ spreads**

```typescript
import type { TarotSpread } from './tarot-types'

export const TAROT_SPREADS: TarotSpread[] = [
  // ── General ──
  {
    id: 'three-card',
    name: { en: 'Three-Card Spread', zh: '三牌阵' },
    description: { en: 'Past, present, and future — a quick snapshot of your journey', zh: '过去、现在与未来——快速了解你的旅程' },
    category: 'general',
    cardCount: 3,
    positions: [
      { label: { en: 'Past', zh: '过去' }, x: 20, y: 50 },
      { label: { en: 'Present', zh: '现在' }, x: 50, y: 50 },
      { label: { en: 'Future', zh: '未来' }, x: 80, y: 50 },
    ],
  },
  {
    id: 'celtic-cross',
    name: { en: 'Celtic Cross', zh: '凯尔特十字阵' },
    description: { en: 'The most comprehensive spread — 10 cards covering all aspects', zh: '最全面的牌阵——10张牌涵盖所有方面' },
    category: 'general',
    cardCount: 10,
    positions: [
      { label: { en: 'Present', zh: '现在' }, x: 30, y: 50 },
      { label: { en: 'Challenge', zh: '挑战' }, x: 30, y: 50, rotation: 90 },
      { label: { en: 'Foundation', zh: '基础' }, x: 30, y: 80 },
      { label: { en: 'Recent Past', zh: '近期过去' }, x: 10, y: 50 },
      { label: { en: 'Crown', zh: '顶端' }, x: 30, y: 20 },
      { label: { en: 'Near Future', zh: '近期未来' }, x: 50, y: 50 },
      { label: { en: 'Self', zh: '自我' }, x: 75, y: 80 },
      { label: { en: 'Environment', zh: '环境' }, x: 75, y: 60 },
      { label: { en: 'Hopes & Fears', zh: '希望与恐惧' }, x: 75, y: 40 },
      { label: { en: 'Outcome', zh: '结果' }, x: 75, y: 20 },
    ],
  },
  // ... Include 20+ total spreads across all 5 categories:
  // General: Three-Card, Celtic Cross, Five-Card Cross, Star Spread, Horseshoe
  // Love: Lovers Triangle, Venus Spread, Relationship Mirror, Twin Flame, Soulmate Search
  // Career: Career Path, Decision Fork, Success Ladder, Work-Life Balance
  // Finance: Wealth Tree, Money Flow, Investment Compass
  // Growth: Chakra Spread, Shadow Self, Year Ahead, Moon Phases
]

/** Get spreads filtered by category */
export function getSpreadsByCategory(category: string): TarotSpread[] {
  if (category === 'all') return TAROT_SPREADS
  return TAROT_SPREADS.filter((s) => s.category === category)
}

/** Get a single spread by ID */
export function getSpread(id: string): TarotSpread | undefined {
  return TAROT_SPREADS.find((s) => s.id === id)
}
```

Generate all 20+ spreads with authentic names, descriptions (EN + ZH), and position layouts with x/y coordinates that visually match the traditional layout shapes.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors in the new files.

- [ ] **Step 5: Commit**

```bash
git add tools/tarot/tarot-types.ts tools/tarot/tarot-cards.ts tools/tarot/tarot-spreads.ts
git commit -m "feat(tarot): add types, 78-card deck data, and 20+ spread definitions"
```

---

### Task 2: i18n Strings

**Files:**
- Create: `tools/tarot/i18n/en.ts`
- Create: `tools/tarot/i18n/zh.ts`

- [ ] **Step 1: Create `tools/tarot/i18n/en.ts`**

```typescript
export const en = {
  // Page
  pageTitle: 'Tarot Card Reading',
  pageSubtitle: 'AI-powered tarot readings for insight and clarity',

  // Tabs
  tabs: {
    create: 'New Reading',
    history: 'My Readings',
  },

  // Step labels
  steps: {
    question: 'Ask',
    spread: 'Choose Spread',
    reading: 'Your Reading',
  },

  stepSubtitles: {
    question: 'What would you like guidance on?',
    spread: 'Choose a spread for your reading',
    reading: 'Your cards are being revealed',
  },

  // Categories
  categories: {
    all: 'All',
    general: 'General',
    love: 'Love',
    career: 'Career',
    finance: 'Finance',
    growth: 'Growth',
  },

  // Question step
  questionStep: {
    placeholder: 'Type your question or describe your situation...',
    orChooseCategory: 'Or choose a life area',
    recommendSpread: 'Let AI choose the best spread',
    next: 'Choose Spread',
  },

  // Spread step
  spreadStep: {
    recommended: 'Recommended for you',
    cards: 'cards',
    select: 'Select',
    back: 'Back',
    startReading: 'Start Reading',
  },

  // Theater
  theater: {
    shuffling: 'Shuffling the deck...',
    dealing: 'Dealing your cards...',
    revealing: 'Revealing your destiny...',
    cardInterpretation: 'Card Interpretation',
    holisticNarrative: 'Overall Reading',
    saveReading: 'Save Reading',
    newReading: 'New Reading',
    generateArt: 'Generate Unique Art',
    reversed: 'Reversed',
    position: 'Position',
  },

  // History
  history: {
    empty: 'No saved readings yet',
    emptyHint: 'Start a new reading and save it to see it here',
    analyzeTrends: 'Analyze My Trends',
    trendsMinimum: 'Need at least 5 saved readings for trend analysis',
    filterByCategory: 'Filter by category',
    deleteConfirm: 'Delete this reading?',
  },

  // Trends
  trends: {
    title: 'Your Tarot Trends',
    loading: 'Analyzing your reading patterns...',
    recurringThemes: 'Recurring Themes',
    frequentCards: 'Frequent Cards',
    insights: 'Insights',
  },

  // Errors
  errors: {
    network: 'Network error — please check your connection',
    aiUnavailable: 'AI service is temporarily unavailable',
    generationFailed: 'Reading generation failed — please try again',
    offlineAi: 'Connect to the internet for your AI reading',
    loginToSave: 'Log in to save your reading',
    insufficientCredits: 'Insufficient credits for this reading',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}
export type I18nStrings = DeepStringify<typeof en>
```

- [ ] **Step 2: Create `tools/tarot/i18n/zh.ts`**

Mirror the exact same structure with Chinese translations:

```typescript
import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  pageTitle: '塔罗牌占卜',
  pageSubtitle: 'AI驱动的塔罗占卜，洞察未来',

  tabs: {
    create: '新占卜',
    history: '我的记录',
  },

  steps: {
    question: '提问',
    spread: '选择牌阵',
    reading: '占卜结果',
  },

  stepSubtitles: {
    question: '你想获得什么方面的指引？',
    spread: '为你的占卜选择一个牌阵',
    reading: '你的牌正在揭示',
  },

  categories: {
    all: '全部',
    general: '综合',
    love: '爱情',
    career: '事业',
    finance: '财运',
    growth: '成长',
  },

  questionStep: {
    placeholder: '输入你的问题或描述你的情况...',
    orChooseCategory: '或选择一个生活领域',
    recommendSpread: '让AI为你推荐最佳牌阵',
    next: '选择牌阵',
  },

  spreadStep: {
    recommended: '为你推荐',
    cards: '张牌',
    select: '选择',
    back: '返回',
    startReading: '开始占卜',
  },

  theater: {
    shuffling: '正在洗牌...',
    dealing: '正在发牌...',
    revealing: '正在揭示你的命运...',
    cardInterpretation: '牌义解读',
    holisticNarrative: '综合解读',
    saveReading: '保存占卜',
    newReading: '新占卜',
    generateArt: '生成专属牌面',
    reversed: '逆位',
    position: '位置',
  },

  history: {
    empty: '暂无保存的占卜记录',
    emptyHint: '开始一次新的占卜并保存，即可在此查看',
    analyzeTrends: '分析我的趋势',
    trendsMinimum: '需要至少5次保存的占卜才能进行趋势分析',
    filterByCategory: '按类别筛选',
    deleteConfirm: '确定删除这条占卜记录？',
  },

  trends: {
    title: '你的塔罗趋势',
    loading: '正在分析你的占卜模式...',
    recurringThemes: '反复出现的主题',
    frequentCards: '高频牌',
    insights: '洞察',
  },

  errors: {
    network: '网络错误——请检查你的连接',
    aiUnavailable: 'AI服务暂时不可用',
    generationFailed: '占卜生成失败——请重试',
    offlineAi: '请连接互联网以获取AI占卜',
    loginToSave: '登录以保存你的占卜',
    insufficientCredits: '积分不足，无法进行占卜',
  },
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add tools/tarot/i18n/en.ts tools/tarot/i18n/zh.ts
git commit -m "feat(tarot): add bilingual i18n strings (EN + ZH)"
```

---

### Task 3: Wizard Shell & Question Step

**Files:**
- Create: `tools/tarot/tarot-wizard.tsx`
- Create: `tools/tarot/question-step.tsx`
- Create: `app/tools/tarot/page.tsx`

- [ ] **Step 1: Create `tools/tarot/tarot-wizard.tsx`**

Wizard container with step indicator, tab toggle, and step routing. Follow the Logo Generator wizard pattern exactly:

```typescript
'use client'

import { useState, useCallback } from 'react'
import { TarotProject, DEFAULT_PROJECT, WizardStep, Language } from '@/tools/tarot/tarot-types'
import { useDraft } from '@/lib/hooks/use-draft'
import { QuestionStep } from '@/tools/tarot/question-step'
import { SpreadStep } from '@/tools/tarot/spread-step'
import { ReadingTheater } from '@/tools/tarot/reading-theater'
import { HistoryTab } from '@/tools/tarot/history-tab'
import { en } from '@/tools/tarot/i18n/en'
import { zh } from '@/tools/tarot/i18n/zh'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

type Tab = 'create' | 'history'

const STEPS: WizardStep[] = [1, 2, 3]

export default function TarotWizard() {
  const [project, setProject] = useState<TarotProject>(DEFAULT_PROJECT)
  const [activeTab, setActiveTab] = useState<Tab>('create')
  const draft = useDraft('tarot:draft', project, setProject, ['loading', 'error', 'streamedText'])

  const t: I18nStrings = project.language === 'zh' ? zh : en
  const stepLabels = [t.steps.question, t.steps.spread, t.steps.reading]
  const stepSubtitles: Record<WizardStep, string> = {
    1: t.stepSubtitles.question,
    2: t.stepSubtitles.spread,
    3: t.stepSubtitles.reading,
  }

  const handleBack = useCallback(() => {
    setProject((p) => {
      if (p.step <= 1) return p
      return { ...p, step: (p.step - 1) as WizardStep, error: null }
    })
  }, [])

  const handleStartOver = useCallback(() => {
    draft.clear()
    setProject(DEFAULT_PROJECT)
    setActiveTab('create')
  }, [draft])

  const handleLanguageToggle = useCallback(() => {
    setProject((p) => ({ ...p, language: p.language === 'en' ? 'zh' : 'en' }))
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title + language toggle */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center tracking-tight">
          Tarot{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400">
            Reading
          </span>
        </h1>
        <button
          type="button"
          onClick={handleLanguageToggle}
          className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle language"
        >
          {project.language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-[#a6abb5] text-center max-w-sm mx-auto mb-6">
        {activeTab === 'history' ? t.tabs.history : stepSubtitles[project.step]}
      </p>

      {/* Tab toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-50 dark:bg-[#131a23] rounded-xl p-1 flex gap-1 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'create'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-slate-400 dark:text-[#70767f] hover:text-white'
            }`}
          >
            {t.tabs.create}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'history'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-slate-400 dark:text-[#70767f] hover:text-white'
            }`}
          >
            {t.tabs.history}
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <HistoryTab language={project.language} />
      ) : (
        <>
          {/* Step indicator — same pattern as Logo Generator */}
          <nav aria-label="Wizard progress" className="mb-10">
            <ol className="hidden sm:flex items-center justify-center gap-0">
              {STEPS.map((s, i) => {
                const isCompleted = s < project.step
                const isCurrent = s === project.step
                return (
                  <li key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-purple-500 border-purple-500'
                            : isCurrent
                              ? 'border-purple-500 text-purple-500'
                              : 'border-slate-300 dark:border-slate-600 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold">{s}</span>
                        )}
                      </div>
                      <span className={`mt-1.5 text-xs font-medium ${isCurrent ? 'text-purple-500' : 'text-slate-400'}`}>
                        {stepLabels[i]}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 mt-[-18px] ${isCompleted ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                  </li>
                )
              })}
            </ol>
            {/* Mobile: simple step text */}
            <p className="sm:hidden text-center text-xs text-slate-400">
              {t.steps.question} {project.step} / {STEPS.length} — {stepLabels[project.step - 1]}
            </p>
          </nav>

          {/* Error banner */}
          {project.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {project.error}
            </div>
          )}

          {/* Step content */}
          {project.step === 1 && (
            <QuestionStep project={project} setProject={setProject} t={t} />
          )}
          {project.step === 2 && (
            <SpreadStep project={project} setProject={setProject} t={t} onBack={handleBack} />
          )}
          {project.step === 3 && (
            <ReadingTheater project={project} setProject={setProject} t={t} onStartOver={handleStartOver} />
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `tools/tarot/question-step.tsx`**

```typescript
'use client'

import { useCallback } from 'react'
import type { TarotProject, SpreadCategory } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

const CATEGORIES: { id: SpreadCategory; icon: string }[] = [
  { id: 'general', icon: '🌟' },
  { id: 'love', icon: '❤️' },
  { id: 'career', icon: '💼' },
  { id: 'finance', icon: '💰' },
  { id: 'growth', icon: '🌱' },
]

interface Props {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
}

export function QuestionStep({ project, setProject, t }: Props) {
  const handleCategoryClick = useCallback((cat: SpreadCategory) => {
    setProject((p) => ({
      ...p,
      category: p.category === cat ? null : cat,
    }))
  }, [setProject])

  const handleNext = useCallback(() => {
    setProject((p) => ({ ...p, step: 2, error: null }))
  }, [setProject])

  const canProceed = project.question.trim().length > 0 || project.category !== null

  return (
    <div className="space-y-8">
      {/* Question input */}
      <div>
        <textarea
          value={project.question}
          onChange={(e) => setProject((p) => ({ ...p, question: e.target.value }))}
          placeholder={t.questionStep.placeholder}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a23] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{project.question.length}/500</p>
      </div>

      {/* Category pills */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          {t.questionStep.orChooseCategory}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleCategoryClick(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                project.category === id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-[#131a23] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{icon}</span>
              <span>{t.categories[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="px-8 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] cursor-pointer bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.questionStep.next}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/tools/tarot/page.tsx`**

```typescript
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import TarotWizard from '@/tools/tarot/tarot-wizard'

export const metadata: Metadata = {
  title: 'Tarot Card Reading — AI-Powered Divination | Toolk1t',
  description:
    'Get personalized AI tarot card readings. Choose from 20+ spreads, draw cards with immersive animations, and receive insightful interpretations powered by Gemini AI.',
}

export default function TarotPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Tarot Card Reading" toolSlug="tarot" />
        </div>
        <TarotWizard />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Create placeholder stubs for unbuilt components**

Create minimal placeholder components so the wizard compiles. These will be replaced in subsequent tasks:

`tools/tarot/spread-step.tsx`:
```typescript
'use client'
import type { TarotProject } from './tarot-types'
import type { I18nStrings } from './i18n/en'

interface Props {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onBack: () => void
}

export function SpreadStep({ t, onBack }: Props) {
  return (
    <div className="text-center text-slate-400">
      <p>Spread selection — coming soon</p>
      <button type="button" onClick={onBack} className="mt-4 text-purple-500 underline min-h-[44px]">{t.spreadStep.back}</button>
    </div>
  )
}
```

`tools/tarot/reading-theater.tsx`:
```typescript
'use client'
import type { TarotProject } from './tarot-types'
import type { I18nStrings } from './i18n/en'

interface Props {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onStartOver: () => void
}

export function ReadingTheater({ t, onStartOver }: Props) {
  return (
    <div className="text-center text-slate-400">
      <p>Reading theater — coming soon</p>
      <button type="button" onClick={onStartOver} className="mt-4 text-purple-500 underline min-h-[44px]">{t.theater.newReading}</button>
    </div>
  )
}
```

`tools/tarot/history-tab.tsx`:
```typescript
'use client'
import type { Language } from './tarot-types'

export function HistoryTab({ language: _language }: { language: Language }) {
  return <div className="text-center text-slate-400 py-12">History — coming soon</div>
}
```

- [ ] **Step 5: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -30`

- [ ] **Step 6: Commit**

```bash
git add tools/tarot/tarot-wizard.tsx tools/tarot/question-step.tsx tools/tarot/spread-step.tsx tools/tarot/reading-theater.tsx tools/tarot/history-tab.tsx app/tools/tarot/page.tsx
git commit -m "feat(tarot): add wizard shell, question step, and page route"
```

---

### Task 4: Spread Selection Step

**Files:**
- Replace: `tools/tarot/spread-step.tsx`
- Create: `tools/tarot/spread-card.tsx`

- [ ] **Step 1: Create `tools/tarot/spread-card.tsx`**

A card tile showing spread name, card count, description, and a miniature layout preview:

```typescript
'use client'

import type { TarotSpread, Language } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface Props {
  spread: TarotSpread
  language: Language
  selected: boolean
  recommended: boolean
  onClick: () => void
  t: I18nStrings
}

export function SpreadCard({ spread, language, selected, recommended, onClick, t }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all min-h-[44px] cursor-pointer ${
        selected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a23] hover:border-purple-300 dark:hover:border-purple-700'
      }`}
    >
      {recommended && (
        <span className="absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-full">
          {t.spreadStep.recommended}
        </span>
      )}

      {/* Miniature layout preview */}
      <div className="relative w-full h-20 mb-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
        {spread.positions.map((pos, i) => (
          <div
            key={i}
            className="absolute w-3 h-4 rounded-[2px] bg-purple-400/60 dark:bg-purple-500/50 border border-purple-300 dark:border-purple-600"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${pos.rotation || 0}deg)`,
            }}
          />
        ))}
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
        {spread.name[language]}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
        {spread.description[language]}
      </p>
      <span className="inline-block mt-2 text-[11px] font-medium text-purple-500">
        {spread.cardCount} {t.spreadStep.cards}
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Replace `tools/tarot/spread-step.tsx` with full implementation**

```typescript
'use client'

import { useCallback, useMemo, useState } from 'react'
import type { TarotProject, SpreadCategory } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'
import { TAROT_SPREADS, getSpreadsByCategory } from '@/tools/tarot/tarot-spreads'
import { SpreadCard } from '@/tools/tarot/spread-card'

const FILTER_CATEGORIES: (SpreadCategory | 'all')[] = ['all', 'general', 'love', 'career', 'finance', 'growth']

interface Props {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onBack: () => void
}

export function SpreadStep({ project, setProject, t, onBack }: Props) {
  const [filterCategory, setFilterCategory] = useState<SpreadCategory | 'all'>(
    project.category ?? 'all'
  )

  const filteredSpreads = useMemo(
    () => getSpreadsByCategory(filterCategory),
    [filterCategory],
  )

  const handleSelectSpread = useCallback((spreadId: string) => {
    setProject((p) => ({ ...p, spreadId }))
  }, [setProject])

  const handleStartReading = useCallback(() => {
    if (!project.spreadId) return
    setProject((p) => ({ ...p, step: 3, error: null }))
  }, [project.spreadId, setProject])

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[44px] cursor-pointer ${
              filterCategory === cat
                ? 'bg-purple-500 text-white'
                : 'bg-slate-100 dark:bg-[#131a23] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.categories[cat]}
          </button>
        ))}
      </div>

      {/* Spread grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredSpreads.map((spread) => (
          <SpreadCard
            key={spread.id}
            spread={spread}
            language={project.language}
            selected={project.spreadId === spread.id}
            recommended={project.recommendedSpreadId === spread.id}
            onClick={() => handleSelectSpread(spread.id)}
            t={t}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {t.spreadStep.back}
        </button>
        <button
          type="button"
          onClick={handleStartReading}
          disabled={!project.spreadId}
          className="px-8 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] cursor-pointer bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.spreadStep.startReading}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add tools/tarot/spread-step.tsx tools/tarot/spread-card.tsx
git commit -m "feat(tarot): add spread selection step with category filters and layout previews"
```

---

### Task 5: Card Flip Animation Component

**Files:**
- Create: `tools/tarot/card-flip.tsx`

- [ ] **Step 1: Create `tools/tarot/card-flip.tsx`**

A single tarot card with 3D flip animation, reversed indicator, and glow effect for active card:

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { TarotCard } from '@/tools/tarot/tarot-types'

interface Props {
  card: TarotCard
  reversed: boolean
  revealed: boolean
  active: boolean
  revealDelay?: number           // ms delay before auto-flip
  onClick?: () => void
}

export function CardFlip({ card, reversed, revealed, active, revealDelay = 0, onClick }: Props) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (revealed && !flipped) {
      const timer = setTimeout(() => setFlipped(true), revealDelay)
      return () => clearTimeout(timer)
    }
  }, [revealed, flipped, revealDelay])

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 ${
        active ? 'scale-105 z-10' : 'scale-100'
      }`}
      style={{ perspective: '800px', width: '80px', height: '120px' }}
      aria-label={flipped ? card.name.en : 'Unrevealed card'}
    >
      {/* Glow effect for active card */}
      {active && (
        <div
          className="absolute -inset-1 rounded-xl opacity-60 blur-md"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
        />
      )}

      <div
        className="relative w-full h-full transition-transform duration-600 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card back */}
        <div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 border border-purple-500/30 flex items-center justify-center shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-12 h-16 rounded border border-purple-400/30 flex items-center justify-center">
            <span className="text-purple-300 text-lg">✦</span>
          </div>
        </div>

        {/* Card front */}
        <div
          className={`absolute inset-0 rounded-lg overflow-hidden border shadow-lg ${
            active ? 'border-purple-400' : 'border-slate-300 dark:border-slate-600'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: `rotateY(180deg) ${reversed ? 'rotate(180deg)' : ''}`,
          }}
        >
          {/* Card image */}
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-1">
            <img
              src={card.imageUrl}
              alt={card.name.en}
              className="w-full h-3/4 object-contain"
              loading="lazy"
            />
            <p className="text-[8px] font-medium text-slate-700 dark:text-slate-300 text-center mt-0.5 leading-tight truncate w-full">
              {card.name.en}
            </p>
          </div>

          {/* Reversed badge */}
          {reversed && (
            <div className="absolute top-1 right-1 px-1 py-0.5 text-[7px] font-bold bg-red-500 text-white rounded">
              R
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add tools/tarot/card-flip.tsx
git commit -m "feat(tarot): add 3D card flip animation component"
```

---

### Task 6: Reading API Route (Streamed Gemini Interpretation)

**Files:**
- Create: `app/api/v1/tarot/reading/route.ts`

- [ ] **Step 1: Create `app/api/v1/tarot/reading/route.ts`**

Streamed SSE route following the story/refine pattern:

```typescript
import { API_ERRORS, getAuthUserId, apiError } from '@/lib/api/response'
import { z } from 'zod'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  spreadId: z.string().min(1),
  spreadName: z.string().min(1),
  question: z.string().max(500).default(''),
  language: z.enum(['en', 'zh']).default('en'),
  cards: z.array(z.object({
    cardId: z.number().int().min(0).max(77),
    positionLabel: z.string(),
    cardName: z.string(),
    reversed: z.boolean(),
    meaning: z.string(),
  })).min(1).max(15),
})

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

function buildPrompt(input: z.infer<typeof schema>): string {
  const lang = input.language === 'zh' ? 'Chinese (简体中文)' : 'English'
  const cardDescriptions = input.cards
    .map((c, i) => `Position ${i + 1} — ${c.positionLabel}: ${c.cardName} (${c.reversed ? 'Reversed' : 'Upright'})`)
    .join('\n')

  return `You are a wise and empathetic tarot reader. Provide a complete reading in ${lang}.

Spread: ${input.spreadName}
Question: ${input.question || 'General guidance'}

Cards drawn:
${cardDescriptions}

Respond in this exact JSON format:
{
  "cards": [
    { "position": "Position label", "cardName": "Card name", "interpretation": "2-3 sentence interpretation for this card in this position" }
  ],
  "narrative": "A flowing 3-5 sentence holistic narrative tying all cards together into a cohesive reading that addresses the querent's question"
}

Be insightful, specific, and encouraging. Connect the cards to each other and to the question. Do not repeat card meanings verbatim — interpret them in context.`
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  // Allow anonymous readings but rate-limit differently
  // (rate limiting handled at middleware level)

  if (!GEMINI_API_KEY) {
    return apiError('AI service not configured', 'AI_NOT_CONFIGURED', 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)
  }

  const prompt = buildPrompt(parsed.data)

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
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          }),
        })

        if (!response.ok) {
          const err = await response.text()
          console.error('Gemini API error:', err)
          send({ type: 'error', message: 'AI generation failed' })
          controller.close()
          return
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Parse the JSON response
        let result: { cards: { position: string; cardName: string; interpretation: string }[]; narrative: string }
        try {
          result = JSON.parse(text)
        } catch {
          // If JSON parsing fails, send the raw text as narrative
          send({ type: 'done', cards: [], narrative: text })
          controller.close()
          return
        }

        // Stream card interpretations one by one (simulated streaming for <5s feel)
        for (let i = 0; i < result.cards.length; i++) {
          send({ type: 'card', index: i, ...result.cards[i] })
        }

        // Send narrative
        send({ type: 'narrative', text: result.narrative })

        // Send completion
        send({ type: 'done', userId: userId || null })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('tarot/reading: AI call failed —', message)
        send({ type: 'error', message: 'Reading failed. Please try again.' })
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

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/tarot/reading/route.ts
git commit -m "feat(tarot): add streamed reading API route with Gemini interpretation"
```

---

### Task 7: Recommend-Spread API Route

**Files:**
- Create: `app/api/v1/tarot/recommend-spread/route.ts`

- [ ] **Step 1: Create `app/api/v1/tarot/recommend-spread/route.ts`**

Lightweight Gemini call — question in, spread ID out:

```typescript
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { TAROT_SPREADS } from '@/tools/tarot/tarot-spreads'

export const maxDuration = 15

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  question: z.string().min(1).max(500),
  language: z.enum(['en', 'zh']).default('en'),
})

export async function POST(request: Request) {
  // No auth required for spread recommendation
  if (!GEMINI_API_KEY) {
    return apiError('AI service not configured', 'AI_NOT_CONFIGURED', 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)
  }

  const spreadList = TAROT_SPREADS.map((s) => `- ${s.id}: ${s.name.en} (${s.cardCount} cards, ${s.category}) — ${s.description.en}`).join('\n')

  const prompt = `You are a tarot expert. Given the user's question, recommend the single best tarot spread from this list.

Available spreads:
${spreadList}

User's question: "${parsed.data.question}"

Respond with ONLY a JSON object: { "spreadId": "<id>", "reason": "<1 sentence why this spread fits>" }
Respond in ${parsed.data.language === 'zh' ? 'Chinese for the reason field' : 'English'}.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini recommend error:', err)
      return apiError('AI recommendation failed', 'AI_ERROR', 502)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let result: { spreadId: string; reason: string }
    try {
      result = JSON.parse(text)
    } catch {
      // Fallback: recommend three-card spread
      return apiSuccess({ spreadId: 'three-card', reason: 'A versatile spread for any question' })
    }

    // Validate the spread ID exists
    const validSpread = TAROT_SPREADS.find((s) => s.id === result.spreadId)
    if (!validSpread) {
      return apiSuccess({ spreadId: 'three-card', reason: result.reason || 'A versatile spread for any question' })
    }

    return apiSuccess(result)
  } catch (e) {
    console.error('Recommend spread error:', e)
    return apiError('AI service error', 'AI_ERROR', 500)
  }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/tarot/recommend-spread/route.ts
git commit -m "feat(tarot): add AI spread recommendation API route"
```

---

### Task 8: Reading Theater (Immersive Experience)

**Files:**
- Replace: `tools/tarot/reading-theater.tsx`
- Create: `tools/tarot/shuffle-animation.tsx`
- Create: `tools/tarot/interpretation-panel.tsx`

- [ ] **Step 1: Create `tools/tarot/shuffle-animation.tsx`**

A CSS-animated card shuffle effect:

```typescript
'use client'

import { useEffect, useState } from 'react'

interface Props {
  onComplete: () => void
  duration?: number // ms
}

export function ShuffleAnimation({ onComplete, duration = 2500 }: Props) {
  const [phase, setPhase] = useState<'shuffle' | 'gather'>('shuffle')

  useEffect(() => {
    const gatherTimer = setTimeout(() => setPhase('gather'), duration * 0.7)
    const doneTimer = setTimeout(onComplete, duration)
    return () => {
      clearTimeout(gatherTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete, duration])

  // Render 7 cards in a fan that shuffles
  const cardCount = 7
  return (
    <div className="relative w-full h-48 flex items-center justify-center" aria-label="Shuffling cards">
      {Array.from({ length: cardCount }).map((_, i) => {
        const baseRotation = (i - Math.floor(cardCount / 2)) * 8
        const isShuffling = phase === 'shuffle'
        return (
          <div
            key={i}
            className="absolute w-16 h-24 rounded-lg bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 border border-purple-500/30 shadow-lg"
            style={{
              transform: isShuffling
                ? `rotate(${baseRotation + Math.sin(Date.now() / 200 + i) * 15}deg) translateY(${Math.sin(i * 0.8) * 10}px)`
                : `rotate(0deg) translateX(${(i - Math.floor(cardCount / 2)) * 3}px)`,
              transition: 'transform 0.5s ease-in-out',
              animationDelay: `${i * 100}ms`,
              zIndex: i,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-purple-300 text-sm">✦</span>
            </div>
          </div>
        )
      })}

      {/* Glow underneath */}
      <div className="absolute bottom-0 w-32 h-8 bg-purple-500/20 rounded-full blur-xl" />
    </div>
  )
}
```

- [ ] **Step 2: Create `tools/tarot/interpretation-panel.tsx`**

Panel showing card-by-card interpretations and narrative:

```typescript
'use client'

import type { CardInterpretation, Language } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface Props {
  cardInterpretations: CardInterpretation[]
  narrative: string
  activeCardIndex: number | null
  language: Language
  t: I18nStrings
}

export function InterpretationPanel({ cardInterpretations, narrative, activeCardIndex, language, t }: Props) {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Card interpretations */}
      {cardInterpretations.map((interp, i) => (
        <div
          key={i}
          className={`p-3 rounded-xl transition-all duration-300 ${
            activeCardIndex === i
              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700'
              : 'bg-slate-50 dark:bg-[#131a23] border border-transparent'
          }`}
          style={{
            animation: 'fadeIn 0.4s ease-out',
            animationDelay: `${i * 150}ms`,
            animationFillMode: 'backwards',
          }}
        >
          <p className="text-xs font-semibold text-purple-500 mb-1">
            {interp.positionLabel[language]}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {interp.text}
          </p>
        </div>
      ))}

      {/* Holistic narrative */}
      {narrative && (
        <div
          className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">
            {t.theater.holisticNarrative}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {narrative}
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace `tools/tarot/reading-theater.tsx` with full implementation**

```typescript
'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import type { TarotProject, DrawnCard, CardInterpretation, TheaterStage } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'
import { getSpread } from '@/tools/tarot/tarot-spreads'
import { getCard, drawCards } from '@/tools/tarot/tarot-cards'
import { CardFlip } from '@/tools/tarot/card-flip'
import { ShuffleAnimation } from '@/tools/tarot/shuffle-animation'
import { InterpretationPanel } from '@/tools/tarot/interpretation-panel'

interface Props {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onStartOver: () => void
}

export function ReadingTheater({ project, setProject, t, onStartOver }: Props) {
  const [stage, setStage] = useState<TheaterStage>('idle')
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [cardInterpretations, setCardInterpretations] = useState<CardInterpretation[]>([])
  const [narrative, setNarrative] = useState('')
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  const spread = getSpread(project.spreadId!)

  // Auto-start on mount
  useEffect(() => {
    if (startedRef.current || !spread) return
    startedRef.current = true
    setStage('shuffling')
  }, [spread])

  // After shuffle → deal cards
  const handleShuffleComplete = useCallback(() => {
    if (!spread) return
    const drawn = drawCards(spread.cardCount).map((c, i) => ({
      ...c,
      positionIndex: i,
    }))
    setDrawnCards(drawn)
    setStage('dealing')

    // After dealing animation (cardCount * 200ms + buffer) → start revealing
    setTimeout(() => {
      setStage('revealing')
      startReading(drawn)
    }, spread.cardCount * 200 + 500)
  }, [spread])

  // Fetch AI interpretation
  const startReading = useCallback(async (cards: DrawnCard[]) => {
    if (!spread) return

    const payload = {
      spreadId: spread.id,
      spreadName: spread.name[project.language],
      question: project.question,
      language: project.language,
      cards: cards.map((dc) => {
        const card = getCard(dc.cardId)
        return {
          cardId: dc.cardId,
          positionLabel: spread.positions[dc.positionIndex].label[project.language],
          cardName: card.name[project.language],
          reversed: dc.reversed,
          meaning: dc.reversed
            ? card.meanings.reversed[project.language]
            : card.meanings.upright[project.language],
        }
      }),
    }

    try {
      const res = await fetch('/api/v1/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setError(t.errors.generationFailed)
        setStage('complete')
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setError(t.errors.generationFailed)
        setStage('complete')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let revealIdx = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const json = line.slice(6)
          try {
            const event = JSON.parse(json)

            if (event.type === 'card') {
              // Reveal the card
              setRevealedCount(revealIdx + 1)
              setActiveCardIndex(revealIdx)
              setCardInterpretations((prev) => [
                ...prev,
                {
                  cardId: cards[revealIdx].cardId,
                  positionLabel: spread.positions[revealIdx].label,
                  text: event.interpretation,
                },
              ])
              revealIdx++
            } else if (event.type === 'narrative') {
              setNarrative(event.text)
              setActiveCardIndex(null)
            } else if (event.type === 'error') {
              setError(event.message)
            } else if (event.type === 'done') {
              setStage('complete')
            }
          } catch {
            // skip malformed events
          }
        }
      }

      setStage('complete')
    } catch {
      setError(t.errors.network)
      setStage('complete')
    }
  }, [spread, project.question, project.language, t])

  if (!spread) return null

  return (
    <div className="space-y-6">
      {/* Shuffle animation */}
      {stage === 'shuffling' && (
        <div className="flex flex-col items-center gap-4">
          <ShuffleAnimation onComplete={handleShuffleComplete} />
          <p className="text-sm text-purple-400 animate-pulse">{t.theater.shuffling}</p>
        </div>
      )}

      {/* Card spread layout */}
      {(stage === 'dealing' || stage === 'revealing' || stage === 'complete') && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cards area */}
          <div className="flex-1">
            <div className="relative w-full" style={{ minHeight: '280px' }}>
              {drawnCards.map((dc, i) => {
                const pos = spread.positions[dc.positionIndex]
                const card = getCard(dc.cardId)
                return (
                  <div
                    key={i}
                    className="absolute transition-all duration-500"
                    style={{
                      left: `calc(${pos.x}% - 40px)`,
                      top: `calc(${pos.y}% - 60px)`,
                      opacity: stage === 'dealing' ? 0 : 1,
                      transform: stage === 'dealing'
                        ? 'translateY(-40px) scale(0.8)'
                        : 'translateY(0) scale(1)',
                      transitionDelay: `${i * 200}ms`,
                    }}
                  >
                    <CardFlip
                      card={card}
                      reversed={dc.reversed}
                      revealed={i < revealedCount}
                      active={activeCardIndex === i}
                      revealDelay={i * 500}
                      onClick={() => setActiveCardIndex(i)}
                    />
                    {/* Position label */}
                    <p className="text-[9px] text-center text-slate-400 mt-1 truncate w-20">
                      {pos.label[project.language]}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Status text */}
            {stage === 'dealing' && (
              <p className="text-sm text-purple-400 text-center animate-pulse mt-4">{t.theater.dealing}</p>
            )}
            {stage === 'revealing' && (
              <p className="text-sm text-purple-400 text-center animate-pulse mt-4">{t.theater.revealing}</p>
            )}
          </div>

          {/* Interpretation panel */}
          {cardInterpretations.length > 0 && (
            <div className="lg:w-80 shrink-0">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                {t.theater.cardInterpretation}
              </h2>
              <InterpretationPanel
                cardInterpretations={cardInterpretations}
                narrative={narrative}
                activeCardIndex={activeCardIndex}
                language={project.language}
                t={t}
              />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Action buttons */}
      {stage === 'complete' && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={onStartOver}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {t.theater.newReading}
          </button>
          <button
            type="button"
            onClick={() => {
              // TODO: Task 10 will implement save
              alert(t.errors.loginToSave)
            }}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] cursor-pointer bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90"
          >
            {t.theater.saveReading}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -30`

- [ ] **Step 5: Commit**

```bash
git add tools/tarot/reading-theater.tsx tools/tarot/shuffle-animation.tsx tools/tarot/interpretation-panel.tsx
git commit -m "feat(tarot): add immersive reading theater with shuffle, deal, and reveal animations"
```

---

### Task 9: AI Spread Recommendation Integration

**Files:**
- Modify: `tools/tarot/question-step.tsx`

- [ ] **Step 1: Add recommend-spread API call to question-step.tsx**

Add a "Let AI choose" button that calls the recommend-spread API and auto-navigates to step 2 with the recommended spread highlighted:

Add these imports and a loading state:
```typescript
import { useState } from 'react'
```

Add state and handler inside the component:
```typescript
const [recommending, setRecommending] = useState(false)

const handleRecommend = useCallback(async () => {
  if (!project.question.trim()) return
  setRecommending(true)
  try {
    const res = await fetch('/api/v1/tarot/recommend-spread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: project.question, language: project.language }),
    })
    const json = await res.json()
    if (res.ok && json.data?.spreadId) {
      setProject((p) => ({
        ...p,
        recommendedSpreadId: json.data.spreadId,
        spreadId: json.data.spreadId,
        step: 2,
        error: null,
      }))
    } else {
      setProject((p) => ({ ...p, step: 2, error: null }))
    }
  } catch {
    setProject((p) => ({ ...p, step: 2, error: null }))
  } finally {
    setRecommending(false)
  }
}, [project.question, project.language, setProject])
```

Add this button below the category pills, before the "Next" button:
```tsx
{project.question.trim().length > 0 && (
  <button
    type="button"
    onClick={handleRecommend}
    disabled={recommending}
    className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
  >
    {recommending ? '...' : `✨ ${t.questionStep.recommendSpread}`}
  </button>
)}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add tools/tarot/question-step.tsx
git commit -m "feat(tarot): integrate AI spread recommendation in question step"
```

---

### Task 10: Supabase Migration & Save/Load API Routes

**Files:**
- Create: `supabase/migrations/046_tarot_readings.sql`
- Create: `app/api/v1/tarot/history/route.ts`

- [ ] **Step 1: Create `supabase/migrations/046_tarot_readings.sql`**

```sql
-- Tarot reading history for logged-in users
CREATE TABLE IF NOT EXISTS public.tarot_readings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL,
  spread_id     TEXT NOT NULL,
  question      TEXT NOT NULL DEFAULT '',
  language      TEXT NOT NULL DEFAULT 'en',
  category      TEXT,
  cards         JSONB NOT NULL DEFAULT '[]',
  interpretation JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for user's reading history (newest first)
CREATE INDEX IF NOT EXISTS idx_tarot_readings_user
  ON public.tarot_readings (user_id, created_at DESC);

-- Row Level Security
ALTER TABLE public.tarot_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own tarot readings"
  ON public.tarot_readings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own tarot readings"
  ON public.tarot_readings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own tarot readings"
  ON public.tarot_readings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.tarot_readings TO authenticated;
```

- [ ] **Step 2: Create `app/api/v1/tarot/history/route.ts`**

```typescript
import { NextRequest } from 'next/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const saveSchema = z.object({
  spreadId: z.string().min(1),
  question: z.string().max(500).default(''),
  language: z.enum(['en', 'zh']).default('en'),
  category: z.string().optional(),
  cards: z.array(z.object({
    cardId: z.number(),
    positionIndex: z.number(),
    reversed: z.boolean(),
    customArtUrl: z.string().optional(),
  })),
  interpretation: z.object({
    cards: z.array(z.object({
      cardId: z.number(),
      positionLabel: z.object({ en: z.string(), zh: z.string() }),
      text: z.string(),
    })),
    narrative: z.string(),
  }),
})

// POST — save a reading
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON', 'VALIDATION_ERROR', 400)
  }

  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tarot_readings')
    .insert({
      user_id: userId,
      spread_id: parsed.data.spreadId,
      question: parsed.data.question,
      language: parsed.data.language,
      category: parsed.data.category,
      cards: parsed.data.cards,
      interpretation: parsed.data.interpretation,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Save tarot reading error:', error)
    return apiError('Failed to save reading', 'DB_ERROR', 500)
  }

  return apiSuccess({ id: data.id })
}

// GET — list user's readings
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)

  const supabase = await createClient()
  let query = supabase
    .from('tarot_readings')
    .select('id, spread_id, question, language, category, cards, interpretation, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('List tarot readings error:', error)
    return apiError('Failed to load readings', 'DB_ERROR', 500)
  }

  return apiSuccess({ readings: data })
}

// DELETE — remove a reading
export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return apiError('id is required', 'VALIDATION_ERROR', 400)

  const supabase = await createClient()
  const { error } = await supabase
    .from('tarot_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Delete tarot reading error:', error)
    return apiError('Failed to delete reading', 'DB_ERROR', 500)
  }

  return apiSuccess({ deleted: true })
}
```

- [ ] **Step 3: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/046_tarot_readings.sql app/api/v1/tarot/history/route.ts
git commit -m "feat(tarot): add Supabase migration and history save/load/delete API routes"
```

---

### Task 11: History Tab & Reading Detail

**Files:**
- Replace: `tools/tarot/history-tab.tsx`
- Create: `tools/tarot/history-card.tsx`
- Create: `tools/tarot/reading-detail.tsx`

- [ ] **Step 1: Create `tools/tarot/history-card.tsx`**

```typescript
'use client'

import type { Language, SpreadCategory } from '@/tools/tarot/tarot-types'
import { getSpread } from '@/tools/tarot/tarot-spreads'

interface SavedReading {
  id: string
  spread_id: string
  question: string
  category: SpreadCategory | null
  created_at: string
  cards: { cardId: number; positionIndex: number; reversed: boolean }[]
}

interface Props {
  reading: SavedReading
  language: Language
  onClick: () => void
  onDelete: () => void
}

export function HistoryCard({ reading, language, onClick, onDelete }: Props) {
  const spread = getSpread(reading.spread_id)
  const date = new Date(reading.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#131a23] border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
      <button
        type="button"
        onClick={onClick}
        className="flex-1 text-left min-h-[44px] cursor-pointer"
      >
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {spread?.name[language] || reading.spread_id}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
          {reading.question || '—'}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] text-slate-400">{date}</span>
          <span className="text-[11px] text-purple-400">{reading.cards.length} cards</span>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        aria-label="Delete reading"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Replace `tools/tarot/history-tab.tsx` with full implementation**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Language, SpreadCategory } from '@/tools/tarot/tarot-types'
import { en } from '@/tools/tarot/i18n/en'
import { zh } from '@/tools/tarot/i18n/zh'
import { HistoryCard } from '@/tools/tarot/history-card'

interface SavedReading {
  id: string
  spread_id: string
  question: string
  category: SpreadCategory | null
  created_at: string
  cards: { cardId: number; positionIndex: number; reversed: boolean }[]
  interpretation: { cards: { text: string }[]; narrative: string }
}

export function HistoryTab({ language }: { language: Language }) {
  const t = language === 'zh' ? zh : en
  const [readings, setReadings] = useState<SavedReading[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReading, setSelectedReading] = useState<SavedReading | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/v1/tarot/history')
        if (res.ok) {
          const json = await res.json()
          setReadings(json.data?.readings || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t.history.deleteConfirm)) return
    try {
      await fetch(`/api/v1/tarot/history?id=${id}`, { method: 'DELETE' })
      setReadings((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // silent
    }
  }, [t])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-400">{t.history.empty}</p>
        <p className="text-sm text-slate-400 mt-1">{t.history.emptyHint}</p>
      </div>
    )
  }

  // If a reading is selected, show its detail
  if (selectedReading) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedReading(null)}
          className="text-sm text-purple-500 hover:underline min-h-[44px] cursor-pointer"
        >
          &larr; {t.spreadStep.back}
        </button>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedReading.question || '—'}</p>
          {selectedReading.interpretation.cards?.map((c, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#131a23]">
              <p className="text-sm text-slate-700 dark:text-slate-300">{c.text}</p>
            </div>
          ))}
          {selectedReading.interpretation.narrative && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">{t.theater.holisticNarrative}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReading.interpretation.narrative}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {readings.map((r) => (
        <HistoryCard
          key={r.id}
          reading={r}
          language={language}
          onClick={() => setSelectedReading(r)}
          onDelete={() => handleDelete(r.id)}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Wire save button in reading-theater.tsx**

In `tools/tarot/reading-theater.tsx`, replace the `alert(t.errors.loginToSave)` placeholder in the save button with:

```typescript
const handleSave = useCallback(async () => {
  if (!spread) return
  try {
    const res = await fetch('/api/v1/tarot/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadId: spread.id,
        question: project.question,
        language: project.language,
        category: project.category,
        cards: drawnCards,
        interpretation: {
          cards: cardInterpretations,
          narrative,
        },
      }),
    })
    if (res.ok) {
      // Visual feedback — disable button
      setSaved(true)
    } else {
      const json = await res.json()
      if (res.status === 401) {
        setError(t.errors.loginToSave)
      } else {
        setError(json.error || t.errors.generationFailed)
      }
    }
  } catch {
    setError(t.errors.network)
  }
}, [spread, project, drawnCards, cardInterpretations, narrative, t])
```

Add `const [saved, setSaved] = useState(false)` to the component state. Update the save button:

```tsx
<button
  type="button"
  onClick={handleSave}
  disabled={saved}
  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] cursor-pointer bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90 disabled:opacity-60"
>
  {saved ? '✓' : t.theater.saveReading}
</button>
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add tools/tarot/history-tab.tsx tools/tarot/history-card.tsx tools/tarot/reading-theater.tsx
git commit -m "feat(tarot): add reading history tab with save, load, and delete"
```

---

### Task 12: Trends API Route & Panel

**Files:**
- Create: `app/api/v1/tarot/trends/route.ts`
- Create: `tools/tarot/trends-panel.tsx`
- Modify: `tools/tarot/history-tab.tsx`

- [ ] **Step 1: Create `app/api/v1/tarot/trends/route.ts`**

```typescript
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  if (!GEMINI_API_KEY) {
    return apiError('AI service not configured', 'AI_NOT_CONFIGURED', 503)
  }

  const supabase = await createClient()
  const { data: readings, error } = await supabase
    .from('tarot_readings')
    .select('spread_id, question, cards, interpretation, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Trends fetch error:', error)
    return apiError('Failed to load readings', 'DB_ERROR', 500)
  }

  if (!readings || readings.length < 5) {
    return apiError('Need at least 5 readings for trend analysis', 'INSUFFICIENT_DATA', 400)
  }

  // Build summary for Gemini
  const summary = readings.map((r, i) => {
    const cards = (r.cards as { cardId: number; reversed: boolean }[])
      .map((c) => `Card ${c.cardId}${c.reversed ? ' (R)' : ''}`)
      .join(', ')
    return `Reading ${i + 1} (${r.created_at}): Spread: ${r.spread_id}, Q: "${r.question || 'general'}", Cards: ${cards}`
  }).join('\n')

  const prompt = `You are a tarot trend analyst. Analyze these ${readings.length} tarot readings for a single person and identify patterns.

${summary}

Respond as JSON:
{
  "frequentCards": ["card name 1", "card name 2", "card name 3"],
  "recurringThemes": ["theme 1", "theme 2", "theme 3"],
  "insights": ["insight 1 (2 sentences max)", "insight 2", "insight 3"],
  "narrative": "A 3-4 sentence summary of the overall trajectory and what the cards suggest about this person's journey"
}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini trends error:', err)
      return apiError('AI analysis failed', 'AI_ERROR', 502)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let result
    try {
      result = JSON.parse(text)
    } catch {
      return apiError('Failed to parse AI response', 'AI_ERROR', 502)
    }

    return apiSuccess(result)
  } catch (e) {
    console.error('Trends error:', e)
    return apiError('AI service error', 'AI_ERROR', 500)
  }
}
```

- [ ] **Step 2: Create `tools/tarot/trends-panel.tsx`**

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { Language } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface TrendsData {
  frequentCards: string[]
  recurringThemes: string[]
  insights: string[]
  narrative: string
}

interface Props {
  language: Language
  readingCount: number
  t: I18nStrings
}

export function TrendsPanel({ language, readingCount, t }: Props) {
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/tarot/trends')
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
      } else {
        setError(json.error || 'Analysis failed')
      }
    } catch {
      setError(t.errors.network)
    } finally {
      setLoading(false)
    }
  }, [t])

  if (readingCount < 5) {
    return (
      <p className="text-xs text-slate-400 text-center py-2">{t.history.trendsMinimum}</p>
    )
  }

  if (!data) {
    return (
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
      >
        {loading ? '...' : `✨ ${t.history.analyzeTrends}`}
      </button>
    )
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
      <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300">{t.trends.title}</h3>

      {data.frequentCards.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">{t.trends.frequentCards}</p>
          <div className="flex flex-wrap gap-1">
            {data.frequentCards.map((c) => (
              <span key={c} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.recurringThemes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">{t.trends.recurringThemes}</p>
          <div className="flex flex-wrap gap-1">
            {data.recurringThemes.map((th) => (
              <span key={th} className="px-2 py-0.5 text-xs rounded-full bg-pink-100 dark:bg-pink-800/40 text-pink-700 dark:text-pink-300">
                {th}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.insights.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">{t.trends.insights}</p>
          <ul className="space-y-1">
            {data.insights.map((ins, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-400">• {ins}</li>
            ))}
          </ul>
        </div>
      )}

      {data.narrative && (
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">{data.narrative}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Integrate TrendsPanel into history-tab.tsx**

Add import and render above the reading list:

```typescript
import { TrendsPanel } from '@/tools/tarot/trends-panel'
```

Add before the readings list `{readings.map(...)}`):
```tsx
<TrendsPanel language={language} readingCount={readings.length} t={t} />
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/tarot/trends/route.ts tools/tarot/trends-panel.tsx tools/tarot/history-tab.tsx
git commit -m "feat(tarot): add AI trend analysis across reading history"
```

---

### Task 13: Tool Catalog Registration & SEO Layout

**Files:**
- Modify: `lib/tools.tsx`
- Create: `app/tools/tarot/layout.tsx`

- [ ] **Step 1: Add tarot to tool catalog in `lib/tools.tsx`**

Add before the closing `]` of the `tools` array:

```typescript
{
  name: 'Tarot Card Reading',
  href: '/tools/tarot',
  description: 'AI-powered tarot readings with 20+ spreads',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  color: 'from-purple-500 to-pink-400',
},
```

- [ ] **Step 2: Create `app/tools/tarot/layout.tsx`**

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarot Card Reading — AI-Powered Divination | Toolk1t',
  description:
    'Get personalized AI tarot card readings with 20+ spreads. Draw cards, watch immersive reveal animations, and receive Gemini AI interpretations in English and Chinese.',
  keywords: ['tarot', 'card reading', 'divination', 'AI tarot', 'tarot spread', 'fortune telling', '塔罗牌', '占卜'],
  openGraph: {
    title: 'Tarot Card Reading — AI-Powered Divination',
    description: 'Get personalized AI tarot card readings with 20+ spreads, immersive animations, and bilingual interpretations.',
    type: 'website',
  },
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

- [ ] **Step 3: Remove duplicate metadata from `app/tools/tarot/page.tsx`**

Since metadata is now in `layout.tsx`, remove the `export const metadata` from `page.tsx` (it will be inherited from the layout).

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add lib/tools.tsx app/tools/tarot/layout.tsx app/tools/tarot/page.tsx
git commit -m "feat(tarot): register in tool catalog and add SEO layout"
```

---

### Task 14: Generate Base Deck Card Art (Gemini Imagen)

**Files:**
- Create: `scripts/generate-tarot-art.ts`

- [ ] **Step 1: Create `scripts/generate-tarot-art.ts`**

A standalone Node script that generates all 78 card images using Gemini Imagen and saves them to `public/tarot/`:

```typescript
/**
 * Generate tarot card artwork using Gemini Imagen.
 * Run: GEMINI_API_KEY=xxx npx tsx scripts/generate-tarot-art.ts
 *
 * Saves to: public/tarot/major/ and public/tarot/{suit}/
 * Skips cards that already have images.
 */

import fs from 'fs'
import path from 'path'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('Set GEMINI_API_KEY env var')
  process.exit(1)
}

const MODEL = 'gemini-3.1-flash-image-preview'

interface CardDef {
  id: number
  name: string
  arcana: 'major' | 'minor'
  suit?: string
  filename: string
  outDir: string
}

// Build card definitions (same order as tarot-cards.ts)
function buildCardDefs(): CardDef[] {
  const cards: CardDef[] = []

  // Major Arcana names
  const majorNames = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
    'Judgement', 'The World',
  ]

  for (let i = 0; i < majorNames.length; i++) {
    cards.push({
      id: i,
      name: majorNames[i],
      arcana: 'major',
      filename: `${String(i).padStart(2, '0')}-${majorNames[i].toLowerCase().replace(/\s+/g, '-')}.webp`,
      outDir: 'public/tarot/major',
    })
  }

  // Minor Arcana
  const suits = ['wands', 'cups', 'swords', 'pentacles']
  const ranks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King']

  let id = 22
  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push({
        id,
        name: `${rank} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        arcana: 'minor',
        suit,
        filename: `${rank.toLowerCase()}.webp`,
        outDir: `public/tarot/${suit}`,
      })
      id++
    }
  }

  return cards
}

async function generateImage(card: CardDef): Promise<Buffer> {
  const style = 'art nouveau illustration with rich jewel tones, gold leaf accents, intricate borders, mystical atmosphere'
  const prompt = `Create a tarot card illustration for "${card.name}". Style: ${style}. The image should be vertical (portrait orientation, 2:3 aspect ratio), showing the card imagery without any text or borders — just the inner illustration. Make it visually stunning and suitable as a tarot card face.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No parts in response')

  for (const part of parts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) return Buffer.from(imageData, 'base64')
  }

  throw new Error('No image in response')
}

async function main() {
  const cards = buildCardDefs()
  let generated = 0
  let skipped = 0
  let failed = 0

  for (const card of cards) {
    const outPath = path.join(card.outDir, card.filename)

    // Skip if already exists
    if (fs.existsSync(outPath)) {
      skipped++
      continue
    }

    fs.mkdirSync(card.outDir, { recursive: true })

    try {
      console.log(`Generating ${card.name} (${card.id}/77)...`)
      const buffer = await generateImage(card)
      fs.writeFileSync(outPath, buffer)
      generated++
      console.log(`  ✓ Saved ${outPath}`)

      // Rate limit: 1 request per 2 seconds
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      failed++
      console.error(`  ✗ Failed ${card.name}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${failed} failed`)
}

main()
```

- [ ] **Step 2: Create placeholder card back image**

Create `public/tarot/card-back.svg` — a simple SVG card back design:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#553C9A"/>
      <stop offset="100%" style="stop-color:#44337A"/>
    </linearGradient>
  </defs>
  <rect width="200" height="300" rx="12" fill="url(#bg)"/>
  <rect x="10" y="10" width="180" height="280" rx="8" fill="none" stroke="#9F7AEA" stroke-width="1" opacity="0.3"/>
  <circle cx="100" cy="150" r="40" fill="none" stroke="#9F7AEA" stroke-width="1" opacity="0.5"/>
  <text x="100" y="158" text-anchor="middle" fill="#9F7AEA" font-size="32" opacity="0.6">✦</text>
</svg>
```

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-tarot-art.ts public/tarot/card-back.svg
git commit -m "feat(tarot): add card art generation script and placeholder card back"
```

---

### Task 15: Premium Card Art API Route

**Files:**
- Create: `app/api/v1/tarot/generate-card-art/route.ts`

- [ ] **Step 1: Create `app/api/v1/tarot/generate-card-art/route.ts`**

```typescript
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { z } from 'zod'

export const maxDuration = 30

const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

const schema = z.object({
  cardId: z.number().int().min(0).max(77),
  cardName: z.string().min(1),
  question: z.string().max(500).default(''),
  spreadContext: z.string().max(200).default(''),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  if (!GEMINI_API_KEY) {
    return apiError('AI service not configured', 'AI_NOT_CONFIGURED', 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)
  }

  const { cardName, question, spreadContext } = parsed.data

  const prompt = `Create a unique, personalized tarot card illustration for "${cardName}". 
This card was drawn in the context of: "${question || 'general guidance'}".
Spread context: ${spreadContext || 'personal reading'}.

Style: Art nouveau with rich jewel tones, gold leaf accents, mystical atmosphere.
Make the imagery reflect the specific question/context while staying true to the card's traditional symbolism.
Vertical portrait orientation (2:3 aspect ratio). No text or borders — just the inner illustration.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini image error:', err)
      return apiError('Image generation failed', 'AI_ERROR', 502)
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) return apiError('No image generated', 'AI_ERROR', 502)

    let imageBuffer: Buffer | null = null
    for (const part of parts) {
      const imageData = part.inlineData?.data || part.inline_data?.data
      if (imageData) {
        imageBuffer = Buffer.from(imageData, 'base64')
        break
      }
    }

    if (!imageBuffer) return apiError('No image in response', 'AI_ERROR', 502)

    // Upload to R2
    const key = `tarot-custom/${userId}/${Date.now()}-card${parsed.data.cardId}.webp`
    const imageUrl = await uploadToR2(imageBuffer, key, 'image/webp')

    return apiSuccess({ imageUrl })
  } catch (e) {
    console.error('Tarot art generation error:', e)
    return apiError('Image service error', 'AI_ERROR', 500)
  }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/tarot/generate-card-art/route.ts
git commit -m "feat(tarot): add premium personalized card art generation API route"
```

---

### Task 16: E2E Browser Test

**Files:**
- This task uses the `webapp-testing` skill to verify the tool works end-to-end in a browser.

- [ ] **Step 1: Start the dev server**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev` (if not already running)

- [ ] **Step 2: Use `webapp-testing` skill to verify**

Test the following flows in the browser:

1. Navigate to `/tools/tarot` — page loads with breadcrumb, wizard, and step 1 visible
2. Type a question in the textarea — character count updates
3. Click a category pill — it highlights, clicking again deselects
4. Click "Choose Spread" — step 2 loads with spread grid
5. Click a spread card — it highlights with purple border
6. Click "Back" — returns to step 1 with question preserved
7. Toggle language — labels switch between EN and ZH
8. Click "My Readings" tab — shows empty state for anonymous users
9. Verify 44px min touch targets on all buttons
10. Verify mobile responsiveness at 375px width

- [ ] **Step 3: Fix any issues found during testing**

- [ ] **Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix(tarot): browser testing fixes"
```
