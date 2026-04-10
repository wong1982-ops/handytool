import type { SpreadCategory, TarotSpread } from './tarot-types'

export const TAROT_SPREADS: TarotSpread[] = [
  // ============================================================
  // GENERAL (5)
  // ============================================================
  {
    id: 'three-card',
    name: { en: 'Three-Card Spread', zh: '三牌阵' },
    description: {
      en: 'A quick reading covering past, present, and future for any question.',
      zh: '一个涵盖过去、现在和未来的快速解读，适用于任何问题。',
    },
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
    description: {
      en: 'The classic 10-card spread offering deep insight into any complex situation.',
      zh: '经典的十牌阵，为任何复杂情况提供深入洞察。',
    },
    category: 'general',
    cardCount: 10,
    positions: [
      { label: { en: 'Present', zh: '现在' }, x: 30, y: 50 },
      { label: { en: 'Challenge', zh: '挑战' }, x: 30, y: 50, rotation: 90 },
      { label: { en: 'Foundation', zh: '基础' }, x: 30, y: 82 },
      { label: { en: 'Recent Past', zh: '近期过去' }, x: 10, y: 50 },
      { label: { en: 'Crown', zh: '意识' }, x: 30, y: 18 },
      { label: { en: 'Near Future', zh: '近期未来' }, x: 50, y: 50 },
      { label: { en: 'Self', zh: '自我' }, x: 75, y: 82 },
      { label: { en: 'Environment', zh: '环境' }, x: 75, y: 61 },
      { label: { en: 'Hopes & Fears', zh: '希望与恐惧' }, x: 75, y: 39 },
      { label: { en: 'Outcome', zh: '结果' }, x: 75, y: 18 },
    ],
  },
  {
    id: 'five-card-cross',
    name: { en: 'Five-Card Cross', zh: '五牌十字阵' },
    description: {
      en: 'A balanced spread exploring your situation from four directions plus center.',
      zh: '一个从四个方向加中心探索你情况的平衡牌阵。',
    },
    category: 'general',
    cardCount: 5,
    positions: [
      { label: { en: 'Present', zh: '现在' }, x: 50, y: 50 },
      { label: { en: 'Left (Past)', zh: '左（过去）' }, x: 20, y: 50 },
      { label: { en: 'Right (Future)', zh: '右（未来）' }, x: 80, y: 50 },
      { label: { en: 'Above (Conscious)', zh: '上（意识）' }, x: 50, y: 20 },
      { label: { en: 'Below (Subconscious)', zh: '下（潜意识）' }, x: 50, y: 80 },
    ],
  },
  {
    id: 'star-spread',
    name: { en: 'Star Spread', zh: '星星阵' },
    description: {
      en: 'A six-card star pattern revealing the full picture of your question from multiple angles.',
      zh: '一个六牌星形图案，从多个角度揭示你问题的全貌。',
    },
    category: 'general',
    cardCount: 6,
    positions: [
      { label: { en: 'Core Issue', zh: '核心问题' }, x: 50, y: 50 },
      { label: { en: 'Desire', zh: '渴望' }, x: 50, y: 10 },
      { label: { en: 'Strength', zh: '力量' }, x: 84, y: 35 },
      { label: { en: 'Weakness', zh: '弱点' }, x: 84, y: 70 },
      { label: { en: 'Past Influence', zh: '过去影响' }, x: 16, y: 70 },
      { label: { en: 'Guidance', zh: '指引' }, x: 16, y: 35 },
    ],
  },
  {
    id: 'horseshoe',
    name: { en: 'Horseshoe Spread', zh: '马蹄阵' },
    description: {
      en: 'A seven-card arc tracing the arc of your situation from past to outcome.',
      zh: '一个七牌弧形，追溯你的情况从过去到结果的弧线。',
    },
    category: 'general',
    cardCount: 7,
    positions: [
      { label: { en: 'Past', zh: '过去' }, x: 10, y: 75 },
      { label: { en: 'Present', zh: '现在' }, x: 20, y: 45 },
      { label: { en: 'Hidden Influences', zh: '隐藏影响' }, x: 30, y: 20 },
      { label: { en: 'Obstacles', zh: '障碍' }, x: 50, y: 12 },
      { label: { en: 'Environment', zh: '环境' }, x: 70, y: 20 },
      { label: { en: 'Advice', zh: '建议' }, x: 80, y: 45 },
      { label: { en: 'Outcome', zh: '结果' }, x: 90, y: 75 },
    ],
  },

  // ============================================================
  // LOVE (5)
  // ============================================================
  {
    id: 'lovers-triangle',
    name: { en: 'Lovers Triangle', zh: '恋人三角阵' },
    description: {
      en: 'A three-card triangle exploring the dynamic between two people and their connection.',
      zh: '一个三牌三角形，探索两个人之间的动态及他们的联系。',
    },
    category: 'love',
    cardCount: 3,
    positions: [
      { label: { en: 'You', zh: '你' }, x: 25, y: 70 },
      { label: { en: 'Partner', zh: '伴侣' }, x: 75, y: 70 },
      { label: { en: 'The Relationship', zh: '关系' }, x: 50, y: 20 },
    ],
  },
  {
    id: 'venus-spread',
    name: { en: 'Venus Spread', zh: '维纳斯阵' },
    description: {
      en: 'A five-card spread channeling the goddess of love for romantic insight.',
      zh: '一个五牌阵，引导爱之女神的力量获取浪漫洞察。',
    },
    category: 'love',
    cardCount: 5,
    positions: [
      { label: { en: 'Your Heart', zh: '你的心' }, x: 50, y: 50 },
      { label: { en: 'What You Desire', zh: '你的渴望' }, x: 50, y: 15 },
      { label: { en: 'What Blocks Love', zh: '阻碍爱的因素' }, x: 85, y: 50 },
      { label: { en: 'What Nurtures Love', zh: '滋养爱的因素' }, x: 15, y: 50 },
      { label: { en: 'Love Outcome', zh: '爱情结果' }, x: 50, y: 85 },
    ],
  },
  {
    id: 'relationship-mirror',
    name: { en: 'Relationship Mirror', zh: '关系镜像阵' },
    description: {
      en: 'A six-card spread mirroring how each person sees themselves and their partner.',
      zh: '一个六牌阵，镜像反映每个人如何看待自己和伴侣。',
    },
    category: 'love',
    cardCount: 6,
    positions: [
      { label: { en: 'How You See Yourself', zh: '你如何看自己' }, x: 25, y: 25 },
      { label: { en: 'How Partner Sees Themselves', zh: '伴侣如何看自己' }, x: 75, y: 25 },
      { label: { en: 'How You See Partner', zh: '你如何看伴侣' }, x: 25, y: 50 },
      { label: { en: 'How Partner Sees You', zh: '伴侣如何看你' }, x: 75, y: 50 },
      { label: { en: 'Your Shared Strength', zh: '共同优势' }, x: 25, y: 75 },
      { label: { en: 'Growth Together', zh: '共同成长' }, x: 75, y: 75 },
    ],
  },
  {
    id: 'twin-flame',
    name: { en: 'Twin Flame', zh: '双生火焰阵' },
    description: {
      en: 'A seven-card spread exploring the deep spiritual bond between twin flames.',
      zh: '一个七牌阵，探索双生火焰之间深层的灵性纽带。',
    },
    category: 'love',
    cardCount: 7,
    positions: [
      { label: { en: 'Your Energy', zh: '你的能量' }, x: 20, y: 30 },
      { label: { en: 'Their Energy', zh: '对方的能量' }, x: 80, y: 30 },
      { label: { en: 'Your Lesson', zh: '你的课题' }, x: 20, y: 60 },
      { label: { en: 'Their Lesson', zh: '对方的课题' }, x: 80, y: 60 },
      { label: { en: 'Connection', zh: '连接' }, x: 50, y: 25 },
      { label: { en: 'Challenge', zh: '挑战' }, x: 50, y: 50 },
      { label: { en: 'Union Potential', zh: '结合潜力' }, x: 50, y: 80 },
    ],
  },
  {
    id: 'soulmate-search',
    name: { en: 'Soulmate Search', zh: '灵魂伴侣探索阵' },
    description: {
      en: 'A five-card spread to guide you toward finding your soulmate.',
      zh: '一个五牌阵，指引你找到你的灵魂伴侣。',
    },
    category: 'love',
    cardCount: 5,
    positions: [
      { label: { en: 'Where You Are', zh: '你的现状' }, x: 50, y: 80 },
      { label: { en: 'What You Need', zh: '你需要什么' }, x: 20, y: 55 },
      { label: { en: 'What to Release', zh: '需要放下什么' }, x: 80, y: 55 },
      { label: { en: 'How to Attract Love', zh: '如何吸引爱' }, x: 30, y: 25 },
      { label: { en: 'Your Soulmate Energy', zh: '灵魂伴侣能量' }, x: 70, y: 25 },
    ],
  },

  // ============================================================
  // CAREER (4)
  // ============================================================
  {
    id: 'career-path',
    name: { en: 'Career Path', zh: '职业道路阵' },
    description: {
      en: 'A five-card spread illuminating your professional direction and potential.',
      zh: '一个五牌阵，照亮你的职业方向和潜力。',
    },
    category: 'career',
    cardCount: 5,
    positions: [
      { label: { en: 'Current Position', zh: '当前位置' }, x: 15, y: 75 },
      { label: { en: 'Skills & Strengths', zh: '技能与优势' }, x: 30, y: 50 },
      { label: { en: 'Challenges Ahead', zh: '前方挑战' }, x: 50, y: 35 },
      { label: { en: 'Opportunities', zh: '机会' }, x: 70, y: 50 },
      { label: { en: 'Career Destination', zh: '职业目标' }, x: 85, y: 75 },
    ],
  },
  {
    id: 'decision-fork',
    name: { en: 'Decision Fork', zh: '决策岔路阵' },
    description: {
      en: 'A five-card spread to help you choose between two paths at a crossroad.',
      zh: '一个五牌阵，帮助你在十字路口选择两条道路之一。',
    },
    category: 'career',
    cardCount: 5,
    positions: [
      { label: { en: 'The Situation', zh: '当前情况' }, x: 50, y: 80 },
      { label: { en: 'Path A', zh: '道路A' }, x: 25, y: 45 },
      { label: { en: 'Path A Outcome', zh: '道路A结果' }, x: 15, y: 15 },
      { label: { en: 'Path B', zh: '道路B' }, x: 75, y: 45 },
      { label: { en: 'Path B Outcome', zh: '道路B结果' }, x: 85, y: 15 },
    ],
  },
  {
    id: 'success-ladder',
    name: { en: 'Success Ladder', zh: '成功阶梯阵' },
    description: {
      en: 'A four-card ascending spread mapping your steps toward professional success.',
      zh: '一个四牌上升阵，映射你迈向职业成功的步伐。',
    },
    category: 'career',
    cardCount: 4,
    positions: [
      { label: { en: 'Foundation', zh: '基础' }, x: 50, y: 85 },
      { label: { en: 'Next Step', zh: '下一步' }, x: 50, y: 62 },
      { label: { en: 'Growth Phase', zh: '成长阶段' }, x: 50, y: 38 },
      { label: { en: 'Achievement', zh: '成就' }, x: 50, y: 15 },
    ],
  },
  {
    id: 'work-life-balance',
    name: { en: 'Work-Life Balance', zh: '工作生活平衡阵' },
    description: {
      en: 'A six-card spread examining the harmony between your work and personal life.',
      zh: '一个六牌阵，审视你工作和个人生活之间的和谐。',
    },
    category: 'career',
    cardCount: 6,
    positions: [
      { label: { en: 'Work Energy', zh: '工作能量' }, x: 25, y: 25 },
      { label: { en: 'Work Challenge', zh: '工作挑战' }, x: 25, y: 55 },
      { label: { en: 'Work Advice', zh: '工作建议' }, x: 25, y: 85 },
      { label: { en: 'Life Energy', zh: '生活能量' }, x: 75, y: 25 },
      { label: { en: 'Life Challenge', zh: '生活挑战' }, x: 75, y: 55 },
      { label: { en: 'Life Advice', zh: '生活建议' }, x: 75, y: 85 },
    ],
  },

  // ============================================================
  // FINANCE (3)
  // ============================================================
  {
    id: 'wealth-tree',
    name: { en: 'Wealth Tree', zh: '财富之树阵' },
    description: {
      en: 'A five-card tree-shaped spread revealing the roots and fruits of your financial life.',
      zh: '一个五牌树形阵，揭示你财务生活的根基和成果。',
    },
    category: 'finance',
    cardCount: 5,
    positions: [
      { label: { en: 'Roots (Foundation)', zh: '根（基础）' }, x: 50, y: 85 },
      { label: { en: 'Trunk (Current State)', zh: '树干（现状）' }, x: 50, y: 60 },
      { label: { en: 'Left Branch (Income)', zh: '左枝（收入）' }, x: 25, y: 30 },
      { label: { en: 'Right Branch (Expenses)', zh: '右枝（支出）' }, x: 75, y: 30 },
      { label: { en: 'Crown (Growth)', zh: '树冠（成长）' }, x: 50, y: 10 },
    ],
  },
  {
    id: 'money-flow',
    name: { en: 'Money Flow', zh: '金钱流动阵' },
    description: {
      en: 'A four-card horizontal flow showing how money enters, stays, and leaves your life.',
      zh: '一个四牌水平流动阵，展示金钱如何进入、停留和离开你的生活。',
    },
    category: 'finance',
    cardCount: 4,
    positions: [
      { label: { en: 'Source', zh: '来源' }, x: 12, y: 50 },
      { label: { en: 'Inflow', zh: '流入' }, x: 37, y: 50 },
      { label: { en: 'Retention', zh: '留存' }, x: 63, y: 50 },
      { label: { en: 'Outflow', zh: '流出' }, x: 88, y: 50 },
    ],
  },
  {
    id: 'investment-compass',
    name: { en: 'Investment Compass', zh: '投资罗盘阵' },
    description: {
      en: 'A five-card compass guiding your investment decisions in four directions.',
      zh: '一个五牌罗盘，在四个方向上指导你的投资决策。',
    },
    category: 'finance',
    cardCount: 5,
    positions: [
      { label: { en: 'Current Portfolio', zh: '当前投资组合' }, x: 50, y: 50 },
      { label: { en: 'North (Growth)', zh: '北（增长）' }, x: 50, y: 12 },
      { label: { en: 'East (Opportunity)', zh: '东（机会）' }, x: 88, y: 50 },
      { label: { en: 'South (Risk)', zh: '南（风险）' }, x: 50, y: 88 },
      { label: { en: 'West (Security)', zh: '西（安全）' }, x: 12, y: 50 },
    ],
  },

  // ============================================================
  // GROWTH (5)
  // ============================================================
  {
    id: 'chakra-spread',
    name: { en: 'Chakra Spread', zh: '脉轮阵' },
    description: {
      en: 'A seven-card vertical spread aligned to the seven chakra energy centers.',
      zh: '一个七牌垂直阵，与七个脉轮能量中心对齐。',
    },
    category: 'growth',
    cardCount: 7,
    positions: [
      { label: { en: 'Root (Security)', zh: '根轮（安全）' }, x: 50, y: 90 },
      { label: { en: 'Sacral (Creativity)', zh: '脐轮（创造力）' }, x: 50, y: 77 },
      { label: { en: 'Solar Plexus (Power)', zh: '太阳轮（力量）' }, x: 50, y: 64 },
      { label: { en: 'Heart (Love)', zh: '心轮（爱）' }, x: 50, y: 50 },
      { label: { en: 'Throat (Expression)', zh: '喉轮（表达）' }, x: 50, y: 37 },
      { label: { en: 'Third Eye (Intuition)', zh: '眉心轮（直觉）' }, x: 50, y: 24 },
      { label: { en: 'Crown (Spirituality)', zh: '顶轮（灵性）' }, x: 50, y: 10 },
    ],
  },
  {
    id: 'shadow-self',
    name: { en: 'Shadow Self', zh: '暗影自我阵' },
    description: {
      en: 'A five-card spread illuminating hidden aspects of yourself for deeper self-awareness.',
      zh: '一个五牌阵，照亮你自身隐藏的方面，以获得更深的自我意识。',
    },
    category: 'growth',
    cardCount: 5,
    positions: [
      { label: { en: 'Conscious Self', zh: '意识自我' }, x: 50, y: 20 },
      { label: { en: 'Shadow Aspect', zh: '暗影面' }, x: 50, y: 80 },
      { label: { en: 'What You Deny', zh: '你否认的' }, x: 20, y: 50 },
      { label: { en: 'What It Teaches', zh: '它教导的' }, x: 80, y: 50 },
      { label: { en: 'Integration', zh: '整合' }, x: 50, y: 50 },
    ],
  },
  {
    id: 'year-ahead',
    name: { en: 'Year Ahead', zh: '未来一年阵' },
    description: {
      en: 'A twelve-card circle with one card per month plus a theme card at center.',
      zh: '一个十二牌圆形阵，每月一牌加上中心的主题牌。',
    },
    category: 'growth',
    cardCount: 13,
    positions: [
      { label: { en: 'Year Theme', zh: '年度主题' }, x: 50, y: 50 },
      { label: { en: 'January', zh: '一月' }, x: 50, y: 8 },
      { label: { en: 'February', zh: '二月' }, x: 72, y: 14 },
      { label: { en: 'March', zh: '三月' }, x: 86, y: 30 },
      { label: { en: 'April', zh: '四月' }, x: 92, y: 50 },
      { label: { en: 'May', zh: '五月' }, x: 86, y: 70 },
      { label: { en: 'June', zh: '六月' }, x: 72, y: 86 },
      { label: { en: 'July', zh: '七月' }, x: 50, y: 92 },
      { label: { en: 'August', zh: '八月' }, x: 28, y: 86 },
      { label: { en: 'September', zh: '九月' }, x: 14, y: 70 },
      { label: { en: 'October', zh: '十月' }, x: 8, y: 50 },
      { label: { en: 'November', zh: '十一月' }, x: 14, y: 30 },
      { label: { en: 'December', zh: '十二月' }, x: 28, y: 14 },
    ],
  },
  {
    id: 'moon-phases',
    name: { en: 'Moon Phases', zh: '月相阵' },
    description: {
      en: 'A five-card crescent spread aligned to the lunar cycle for timing and reflection.',
      zh: '一个五牌新月形阵，与月亮周期对齐，用于时间和反思。',
    },
    category: 'growth',
    cardCount: 5,
    positions: [
      { label: { en: 'New Moon (Intention)', zh: '新月（意图）' }, x: 10, y: 50 },
      { label: { en: 'Waxing (Growth)', zh: '上弦（成长）' }, x: 30, y: 25 },
      { label: { en: 'Full Moon (Culmination)', zh: '满月（顶点）' }, x: 50, y: 15 },
      { label: { en: 'Waning (Release)', zh: '下弦（释放）' }, x: 70, y: 25 },
      { label: { en: 'Dark Moon (Rest)', zh: '暗月（休息）' }, x: 90, y: 50 },
    ],
  },
  {
    id: 'life-purpose',
    name: { en: 'Life Purpose', zh: '人生目标阵' },
    description: {
      en: 'A six-card spread to help uncover your deeper calling and soul mission.',
      zh: '一个六牌阵，帮助揭示你更深层的使命和灵魂任务。',
    },
    category: 'growth',
    cardCount: 6,
    positions: [
      { label: { en: 'Who You Are', zh: '你是谁' }, x: 50, y: 85 },
      { label: { en: 'Your Gifts', zh: '你的天赋' }, x: 20, y: 60 },
      { label: { en: 'Your Passion', zh: '你的热情' }, x: 80, y: 60 },
      { label: { en: 'What the World Needs', zh: '世界需要什么' }, x: 20, y: 30 },
      { label: { en: 'Your Mission', zh: '你的使命' }, x: 80, y: 30 },
      { label: { en: 'Life Purpose', zh: '人生目标' }, x: 50, y: 10 },
    ],
  },
]

/**
 * Get all spreads belonging to a specific category.
 */
export function getSpreadsByCategory(category: string): TarotSpread[] {
  if (category === 'all') return TAROT_SPREADS
  return TAROT_SPREADS.filter((s) => s.category === (category as SpreadCategory))
}

/**
 * Get a single spread by ID.
 */
export function getSpread(id: string): TarotSpread | undefined {
  return TAROT_SPREADS.find((s) => s.id === id)
}
