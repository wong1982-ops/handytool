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
