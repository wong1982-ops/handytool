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
