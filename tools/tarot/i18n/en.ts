export const en = {
  pageTitle: 'Tarot Card Reading',
  pageSubtitle: 'AI-powered tarot readings for insight and clarity',

  tabs: {
    create: 'New Reading',
    history: 'My Readings',
  },

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

  categories: {
    all: 'All',
    general: 'General',
    love: 'Love',
    career: 'Career',
    finance: 'Finance',
    growth: 'Growth',
  },

  questionStep: {
    placeholder: 'Type your question or describe your situation...',
    orChooseCategory: 'Or choose a life area',
    recommendSpread: 'Let AI choose the best spread',
    next: 'Choose Spread',
  },

  spreadStep: {
    recommended: 'Recommended for you',
    cards: 'cards',
    select: 'Select',
    back: 'Back',
    startReading: 'Start Reading',
  },

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

  history: {
    empty: 'No saved readings yet',
    emptyHint: 'Start a new reading and save it to see it here',
    analyzeTrends: 'Analyze My Trends',
    trendsMinimum: 'Need at least 5 saved readings for trend analysis',
    filterByCategory: 'Filter by category',
    deleteConfirm: 'Delete this reading?',
  },

  trends: {
    title: 'Your Tarot Trends',
    loading: 'Analyzing your reading patterns...',
    recurringThemes: 'Recurring Themes',
    frequentCards: 'Frequent Cards',
    insights: 'Insights',
  },

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
