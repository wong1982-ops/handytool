import type { TarotCard } from './tarot-types'

export const TAROT_CARDS: TarotCard[] = [
  // ============================================================
  // MAJOR ARCANA (0–21)
  // ============================================================
  {
    id: 0,
    name: { en: 'The Fool', zh: '愚者' },
    arcana: 'major',
    imageUrl: '/tarot/major/00-the-fool.webp',
    meanings: {
      upright: { en: 'A new beginning full of potential and innocence awaits you.', zh: '一个充满潜力和纯真的新开始正等待着你。' },
      reversed: { en: 'Recklessness and poor judgment may lead you astray.', zh: '鲁莽和判断力差可能会使你误入歧途。' },
    },
    keywords: { en: ['beginnings', 'innocence', 'spontaneity'], zh: ['开始', '纯真', '自发'] },
  },
  {
    id: 1,
    name: { en: 'The Magician', zh: '魔术师' },
    arcana: 'major',
    imageUrl: '/tarot/major/01-the-magician.webp',
    meanings: {
      upright: { en: 'You have the power and resources to manifest your desires.', zh: '你拥有实现愿望的力量和资源。' },
      reversed: { en: 'Manipulation or untapped potential is holding you back.', zh: '操控或未开发的潜力正在阻碍你。' },
    },
    keywords: { en: ['manifestation', 'resourcefulness', 'power'], zh: ['显化', '足智多谋', '力量'] },
  },
  {
    id: 2,
    name: { en: 'The High Priestess', zh: '女祭司' },
    arcana: 'major',
    imageUrl: '/tarot/major/02-the-high-priestess.webp',
    meanings: {
      upright: { en: 'Trust your intuition and look beyond the surface for hidden truths.', zh: '相信你的直觉，透过表面寻找隐藏的真相。' },
      reversed: { en: 'Secrets or disconnection from your inner voice may cause confusion.', zh: '秘密或与内心声音的脱节可能会造成困惑。' },
    },
    keywords: { en: ['intuition', 'mystery', 'subconscious'], zh: ['直觉', '神秘', '潜意识'] },
  },
  {
    id: 3,
    name: { en: 'The Empress', zh: '女皇' },
    arcana: 'major',
    imageUrl: '/tarot/major/03-the-empress.webp',
    meanings: {
      upright: { en: 'Abundance, nurturing energy, and creative growth surround you.', zh: '丰盛、滋养的能量和创造性成长环绕着你。' },
      reversed: { en: 'Creative blocks or neglect of self-care may drain your vitality.', zh: '创造力障碍或忽视自我关怀可能会消耗你的活力。' },
    },
    keywords: { en: ['abundance', 'nurturing', 'fertility'], zh: ['丰盛', '滋养', '丰饶'] },
  },
  {
    id: 4,
    name: { en: 'The Emperor', zh: '皇帝' },
    arcana: 'major',
    imageUrl: '/tarot/major/04-the-emperor.webp',
    meanings: {
      upright: { en: 'Structure, authority, and strong leadership guide your path forward.', zh: '结构、权威和强大的领导力引导你前行。' },
      reversed: { en: 'Rigidity or abuse of power may be creating obstacles.', zh: '僵化或滥用权力可能正在制造障碍。' },
    },
    keywords: { en: ['authority', 'structure', 'stability'], zh: ['权威', '结构', '稳定'] },
  },
  {
    id: 5,
    name: { en: 'The Hierophant', zh: '教皇' },
    arcana: 'major',
    imageUrl: '/tarot/major/05-the-hierophant.webp',
    meanings: {
      upright: { en: 'Tradition, spiritual guidance, and conventional wisdom offer direction.', zh: '传统、精神指导和传统智慧为你指引方向。' },
      reversed: { en: 'Challenging the status quo or unconventional paths beckon.', zh: '挑战现状或非传统的道路在召唤你。' },
    },
    keywords: { en: ['tradition', 'guidance', 'conformity'], zh: ['传统', '指导', '遵从'] },
  },
  {
    id: 6,
    name: { en: 'The Lovers', zh: '恋人' },
    arcana: 'major',
    imageUrl: '/tarot/major/06-the-lovers.webp',
    meanings: {
      upright: { en: 'A meaningful connection or important choice about values and relationships arises.', zh: '一段有意义的联系或关于价值观和关系的重要选择出现了。' },
      reversed: { en: 'Disharmony, misalignment, or avoidance of a crucial decision.', zh: '不和谐、不一致或逃避关键决定。' },
    },
    keywords: { en: ['love', 'harmony', 'choices'], zh: ['爱情', '和谐', '选择'] },
  },
  {
    id: 7,
    name: { en: 'The Chariot', zh: '战车' },
    arcana: 'major',
    imageUrl: '/tarot/major/07-the-chariot.webp',
    meanings: {
      upright: { en: 'Willpower and determination drive you toward victory over challenges.', zh: '意志力和决心驱使你战胜挑战走向胜利。' },
      reversed: { en: 'Lack of direction or loss of control may stall your progress.', zh: '缺乏方向或失去控制可能会阻碍你的进步。' },
    },
    keywords: { en: ['determination', 'willpower', 'triumph'], zh: ['决心', '意志力', '胜利'] },
  },
  {
    id: 8,
    name: { en: 'Strength', zh: '力量' },
    arcana: 'major',
    imageUrl: '/tarot/major/08-strength.webp',
    meanings: {
      upright: { en: 'Inner courage, patience, and gentle control tame life\'s challenges.', zh: '内在的勇气、耐心和温柔的控制驯服生活的挑战。' },
      reversed: { en: 'Self-doubt or raw emotions may overwhelm your composure.', zh: '自我怀疑或原始情绪可能会压倒你的镇定。' },
    },
    keywords: { en: ['courage', 'patience', 'compassion'], zh: ['勇气', '耐心', '慈悲'] },
  },
  {
    id: 9,
    name: { en: 'The Hermit', zh: '隐士' },
    arcana: 'major',
    imageUrl: '/tarot/major/09-the-hermit.webp',
    meanings: {
      upright: { en: 'Solitude and introspection illuminate the wisdom you seek within.', zh: '独处和内省照亮你内心寻求的智慧。' },
      reversed: { en: 'Isolation or withdrawal from others may lead to loneliness.', zh: '孤立或远离他人可能会导致孤独。' },
    },
    keywords: { en: ['solitude', 'wisdom', 'introspection'], zh: ['独处', '智慧', '内省'] },
  },
  {
    id: 10,
    name: { en: 'Wheel of Fortune', zh: '命运之轮' },
    arcana: 'major',
    imageUrl: '/tarot/major/10-wheel-of-fortune.webp',
    meanings: {
      upright: { en: 'Fate turns in your favor as cycles of change bring new opportunities.', zh: '命运转向对你有利，变化的循环带来新机遇。' },
      reversed: { en: 'Bad luck or resistance to inevitable change creates struggle.', zh: '厄运或对不可避免变化的抗拒造成挣扎。' },
    },
    keywords: { en: ['destiny', 'cycles', 'turning point'], zh: ['命运', '循环', '转折点'] },
  },
  {
    id: 11,
    name: { en: 'Justice', zh: '正义' },
    arcana: 'major',
    imageUrl: '/tarot/major/11-justice.webp',
    meanings: {
      upright: { en: 'Fairness, truth, and accountability bring balance to your situation.', zh: '公正、真相和责任为你的处境带来平衡。' },
      reversed: { en: 'Dishonesty or unfair treatment may cause imbalance.', zh: '不诚实或不公平待遇可能会造成失衡。' },
    },
    keywords: { en: ['fairness', 'truth', 'accountability'], zh: ['公正', '真相', '责任'] },
  },
  {
    id: 12,
    name: { en: 'The Hanged Man', zh: '倒吊人' },
    arcana: 'major',
    imageUrl: '/tarot/major/12-the-hanged-man.webp',
    meanings: {
      upright: { en: 'Surrender and a shift in perspective reveal new insights through pause.', zh: '放下和视角的转变通过停顿揭示新的洞察。' },
      reversed: { en: 'Stalling, indecision, or resistance to necessary sacrifice.', zh: '拖延、优柔寡断或抗拒必要的牺牲。' },
    },
    keywords: { en: ['surrender', 'perspective', 'pause'], zh: ['放下', '视角', '停顿'] },
  },
  {
    id: 13,
    name: { en: 'Death', zh: '死神' },
    arcana: 'major',
    imageUrl: '/tarot/major/13-death.webp',
    meanings: {
      upright: { en: 'A powerful transformation ends one chapter so a new one can begin.', zh: '强大的转变结束一个篇章，使新篇章得以开始。' },
      reversed: { en: 'Fear of change or clinging to the past prevents renewal.', zh: '对变化的恐惧或执着于过去阻碍了重生。' },
    },
    keywords: { en: ['transformation', 'endings', 'renewal'], zh: ['转变', '结束', '重生'] },
  },
  {
    id: 14,
    name: { en: 'Temperance', zh: '节制' },
    arcana: 'major',
    imageUrl: '/tarot/major/14-temperance.webp',
    meanings: {
      upright: { en: 'Balance, moderation, and patience create harmony in your life.', zh: '平衡、节制和耐心为你的生活创造和谐。' },
      reversed: { en: 'Excess, imbalance, or lack of long-term vision disrupts flow.', zh: '过度、失衡或缺乏长远眼光扰乱了节奏。' },
    },
    keywords: { en: ['balance', 'moderation', 'harmony'], zh: ['平衡', '节制', '和谐'] },
  },
  {
    id: 15,
    name: { en: 'The Devil', zh: '恶魔' },
    arcana: 'major',
    imageUrl: '/tarot/major/15-the-devil.webp',
    meanings: {
      upright: { en: 'Bondage, temptation, or unhealthy attachments hold you captive.', zh: '束缚、诱惑或不健康的依附将你囚禁。' },
      reversed: { en: 'Breaking free from addiction or toxic patterns brings liberation.', zh: '摆脱成瘾或有毒模式带来解放。' },
    },
    keywords: { en: ['bondage', 'temptation', 'shadow'], zh: ['束缚', '诱惑', '阴影'] },
  },
  {
    id: 16,
    name: { en: 'The Tower', zh: '塔' },
    arcana: 'major',
    imageUrl: '/tarot/major/16-the-tower.webp',
    meanings: {
      upright: { en: 'Sudden upheaval shatters false structures to make way for truth.', zh: '突然的剧变摧毁虚假的结构，为真相让路。' },
      reversed: { en: 'Averting disaster or fear of inevitable necessary change.', zh: '避开灾难或对不可避免的必要变化的恐惧。' },
    },
    keywords: { en: ['upheaval', 'revelation', 'awakening'], zh: ['剧变', '揭示', '觉醒'] },
  },
  {
    id: 17,
    name: { en: 'The Star', zh: '星星' },
    arcana: 'major',
    imageUrl: '/tarot/major/17-the-star.webp',
    meanings: {
      upright: { en: 'Hope, inspiration, and serenity shine light on your healing journey.', zh: '希望、灵感和宁静照亮你的疗愈之旅。' },
      reversed: { en: 'Despair, disconnection from faith, or lost inspiration dims your path.', zh: '绝望、与信仰的脱节或失去灵感使你的道路黯淡。' },
    },
    keywords: { en: ['hope', 'inspiration', 'serenity'], zh: ['希望', '灵感', '宁静'] },
  },
  {
    id: 18,
    name: { en: 'The Moon', zh: '月亮' },
    arcana: 'major',
    imageUrl: '/tarot/major/18-the-moon.webp',
    meanings: {
      upright: { en: 'Illusions, fears, and the subconscious mind cloud your clarity.', zh: '幻觉、恐惧和潜意识模糊了你的清晰度。' },
      reversed: { en: 'Release of fear and clarity emerging from confusion.', zh: '恐惧的释放和从困惑中浮现的清晰。' },
    },
    keywords: { en: ['illusion', 'fear', 'subconscious'], zh: ['幻觉', '恐惧', '潜意识'] },
  },
  {
    id: 19,
    name: { en: 'The Sun', zh: '太阳' },
    arcana: 'major',
    imageUrl: '/tarot/major/19-the-sun.webp',
    meanings: {
      upright: { en: 'Joy, success, and vitality radiate warmth into every area of your life.', zh: '喜悦、成功和活力将温暖辐射到你生活的每个领域。' },
      reversed: { en: 'Temporary setbacks or inner child issues may dim your optimism.', zh: '暂时的挫折或内在小孩的问题可能会削弱你的乐观。' },
    },
    keywords: { en: ['joy', 'success', 'vitality'], zh: ['喜悦', '成功', '活力'] },
  },
  {
    id: 20,
    name: { en: 'Judgement', zh: '审判' },
    arcana: 'major',
    imageUrl: '/tarot/major/20-judgement.webp',
    meanings: {
      upright: { en: 'A spiritual awakening or calling summons you to rise and be reborn.', zh: '精神觉醒或召唤召唤你崛起并重生。' },
      reversed: { en: 'Self-doubt or refusal to heed an important inner calling.', zh: '自我怀疑或拒绝倾听重要的内心召唤。' },
    },
    keywords: { en: ['rebirth', 'calling', 'absolution'], zh: ['重生', '召唤', '赦免'] },
  },
  {
    id: 21,
    name: { en: 'The World', zh: '世界' },
    arcana: 'major',
    imageUrl: '/tarot/major/21-the-world.webp',
    meanings: {
      upright: { en: 'Completion, accomplishment, and wholeness mark the end of a significant cycle.', zh: '完成、成就和圆满标志着一个重要周期的结束。' },
      reversed: { en: 'Lack of closure or incomplete goals delay your sense of fulfillment.', zh: '缺乏结局或未完成的目标延迟了你的满足感。' },
    },
    keywords: { en: ['completion', 'accomplishment', 'wholeness'], zh: ['完成', '成就', '圆满'] },
  },

  // ============================================================
  // MINOR ARCANA — WANDS (22–35)
  // ============================================================
  {
    id: 22,
    name: { en: 'Ace of Wands', zh: '权杖王牌' },
    arcana: 'minor',
    suit: 'wands',
    number: 1,
    imageUrl: '/tarot/wands/ace.webp',
    meanings: {
      upright: { en: 'A spark of inspiration ignites a bold new creative venture.', zh: '灵感的火花点燃了一个大胆的新创意事业。' },
      reversed: { en: 'Delays, lack of motivation, or a stifled creative impulse.', zh: '延迟、缺乏动力或被压抑的创造冲动。' },
    },
    keywords: { en: ['inspiration', 'new venture', 'creativity'], zh: ['灵感', '新事业', '创造力'] },
  },
  {
    id: 23,
    name: { en: 'Two of Wands', zh: '权杖二' },
    arcana: 'minor',
    suit: 'wands',
    number: 2,
    imageUrl: '/tarot/wands/02.webp',
    meanings: {
      upright: { en: 'Planning and foresight open doors to future possibilities.', zh: '规划和远见为未来的可能性打开了大门。' },
      reversed: { en: 'Fear of the unknown or poor planning hinders progress.', zh: '对未知的恐惧或糟糕的规划阻碍了进步。' },
    },
    keywords: { en: ['planning', 'foresight', 'decisions'], zh: ['规划', '远见', '决策'] },
  },
  {
    id: 24,
    name: { en: 'Three of Wands', zh: '权杖三' },
    arcana: 'minor',
    suit: 'wands',
    number: 3,
    imageUrl: '/tarot/wands/03.webp',
    meanings: {
      upright: { en: 'Expansion and progress reward your forward-thinking efforts.', zh: '扩展和进步回报了你的前瞻性努力。' },
      reversed: { en: 'Obstacles to growth or frustration with slow returns.', zh: '成长的障碍或对缓慢回报的沮丧。' },
    },
    keywords: { en: ['expansion', 'progress', 'exploration'], zh: ['扩展', '进步', '探索'] },
  },
  {
    id: 25,
    name: { en: 'Four of Wands', zh: '权杖四' },
    arcana: 'minor',
    suit: 'wands',
    number: 4,
    imageUrl: '/tarot/wands/04.webp',
    meanings: {
      upright: { en: 'Celebration, harmony, and a joyful homecoming await you.', zh: '庆祝、和谐和欢乐的团聚等待着你。' },
      reversed: { en: 'Lack of harmony at home or a celebration that feels hollow.', zh: '家庭缺乏和谐或感觉空洞的庆祝。' },
    },
    keywords: { en: ['celebration', 'harmony', 'homecoming'], zh: ['庆祝', '和谐', '团聚'] },
  },
  {
    id: 26,
    name: { en: 'Five of Wands', zh: '权杖五' },
    arcana: 'minor',
    suit: 'wands',
    number: 5,
    imageUrl: '/tarot/wands/05.webp',
    meanings: {
      upright: { en: 'Conflict and competition challenge you to prove your mettle.', zh: '冲突和竞争挑战你证明自己的勇气。' },
      reversed: { en: 'Avoidance of conflict or resolution of ongoing disputes.', zh: '逃避冲突或正在解决持续的争端。' },
    },
    keywords: { en: ['conflict', 'competition', 'tension'], zh: ['冲突', '竞争', '紧张'] },
  },
  {
    id: 27,
    name: { en: 'Six of Wands', zh: '权杖六' },
    arcana: 'minor',
    suit: 'wands',
    number: 6,
    imageUrl: '/tarot/wands/06.webp',
    meanings: {
      upright: { en: 'Victory, public recognition, and well-earned praise uplift you.', zh: '胜利、公众认可和当之无愧的赞誉鼓舞了你。' },
      reversed: { en: 'Ego, arrogance, or fear of public failure undermine your confidence.', zh: '自负、傲慢或对公开失败的恐惧削弱了你的信心。' },
    },
    keywords: { en: ['victory', 'recognition', 'pride'], zh: ['胜利', '认可', '自豪'] },
  },
  {
    id: 28,
    name: { en: 'Seven of Wands', zh: '权杖七' },
    arcana: 'minor',
    suit: 'wands',
    number: 7,
    imageUrl: '/tarot/wands/07.webp',
    meanings: {
      upright: { en: 'Courage and perseverance help you defend your position against opposition.', zh: '勇气和毅力帮助你抵御反对，捍卫自己的立场。' },
      reversed: { en: 'Feeling overwhelmed or giving up ground under pressure.', zh: '感到不堪重负或在压力下节节败退。' },
    },
    keywords: { en: ['perseverance', 'defense', 'challenge'], zh: ['毅力', '防御', '挑战'] },
  },
  {
    id: 29,
    name: { en: 'Eight of Wands', zh: '权杖八' },
    arcana: 'minor',
    suit: 'wands',
    number: 8,
    imageUrl: '/tarot/wands/08.webp',
    meanings: {
      upright: { en: 'Rapid progress and swift action propel events forward with momentum.', zh: '快速进展和迅速行动推动事件向前发展。' },
      reversed: { en: 'Delays, frustration, or scattered energy slow things down.', zh: '延迟、沮丧或分散的精力使事情放慢。' },
    },
    keywords: { en: ['speed', 'momentum', 'swift action'], zh: ['速度', '势头', '迅速行动'] },
  },
  {
    id: 30,
    name: { en: 'Nine of Wands', zh: '权杖九' },
    arcana: 'minor',
    suit: 'wands',
    number: 9,
    imageUrl: '/tarot/wands/09.webp',
    meanings: {
      upright: { en: 'Resilience and determination keep you standing despite past wounds.', zh: '韧性和决心让你尽管有过去的创伤仍然坚持。' },
      reversed: { en: 'Exhaustion, paranoia, or refusal to compromise weaken your stance.', zh: '疲惫、偏执或拒绝妥协削弱了你的立场。' },
    },
    keywords: { en: ['resilience', 'persistence', 'boundaries'], zh: ['韧性', '坚持', '界限'] },
  },
  {
    id: 31,
    name: { en: 'Ten of Wands', zh: '权杖十' },
    arcana: 'minor',
    suit: 'wands',
    number: 10,
    imageUrl: '/tarot/wands/10.webp',
    meanings: {
      upright: { en: 'Heavy burdens and responsibilities weigh on you as you near completion.', zh: '沉重的负担和责任在你接近完成时压着你。' },
      reversed: { en: 'Delegation or release of unnecessary burdens brings relief.', zh: '委派或释放不必要的负担带来了解脱。' },
    },
    keywords: { en: ['burden', 'responsibility', 'hard work'], zh: ['负担', '责任', '努力'] },
  },
  {
    id: 32,
    name: { en: 'Page of Wands', zh: '权杖侍从' },
    arcana: 'minor',
    suit: 'wands',
    number: 11,
    imageUrl: '/tarot/wands/page.webp',
    meanings: {
      upright: { en: 'Enthusiastic exploration and a free-spirited message of discovery arrive.', zh: '充满热情的探索和自由奔放的发现讯息到来。' },
      reversed: { en: 'Lack of direction or hasty decisions without follow-through.', zh: '缺乏方向或仓促决定却没有坚持到底。' },
    },
    keywords: { en: ['exploration', 'enthusiasm', 'discovery'], zh: ['探索', '热情', '发现'] },
  },
  {
    id: 33,
    name: { en: 'Knight of Wands', zh: '权杖骑士' },
    arcana: 'minor',
    suit: 'wands',
    number: 12,
    imageUrl: '/tarot/wands/knight.webp',
    meanings: {
      upright: { en: 'Adventurous energy and passionate pursuit drive bold action forward.', zh: '冒险精神和热情追求推动大胆行动向前。' },
      reversed: { en: 'Impulsiveness, recklessness, or scattered energy stalls progress.', zh: '冲动、鲁莽或分散的精力使进展停滞。' },
    },
    keywords: { en: ['adventure', 'passion', 'boldness'], zh: ['冒险', '热情', '大胆'] },
  },
  {
    id: 34,
    name: { en: 'Queen of Wands', zh: '权杖王后' },
    arcana: 'minor',
    suit: 'wands',
    number: 13,
    imageUrl: '/tarot/wands/queen.webp',
    meanings: {
      upright: { en: 'Confident, charismatic leadership inspires warmth and creative vision.', zh: '自信、有魅力的领导力激发温暖和创造性视野。' },
      reversed: { en: 'Jealousy, selfishness, or demanding behavior pushes others away.', zh: '嫉妒、自私或苛刻的行为将他人推开。' },
    },
    keywords: { en: ['confidence', 'charisma', 'warmth'], zh: ['自信', '魅力', '温暖'] },
  },
  {
    id: 35,
    name: { en: 'King of Wands', zh: '权杖国王' },
    arcana: 'minor',
    suit: 'wands',
    number: 14,
    imageUrl: '/tarot/wands/king.webp',
    meanings: {
      upright: { en: 'Visionary leadership and entrepreneurial spirit command respect and results.', zh: '有远见的领导力和企业家精神赢得尊重和成果。' },
      reversed: { en: 'Tyrannical control or unrealistic expectations damage trust.', zh: '专制控制或不切实际的期望损害了信任。' },
    },
    keywords: { en: ['leadership', 'vision', 'entrepreneurship'], zh: ['领导力', '远见', '创业精神'] },
  },

  // ============================================================
  // MINOR ARCANA — CUPS (36–49)
  // ============================================================
  {
    id: 36,
    name: { en: 'Ace of Cups', zh: '圣杯王牌' },
    arcana: 'minor',
    suit: 'cups',
    number: 1,
    imageUrl: '/tarot/cups/ace.webp',
    meanings: {
      upright: { en: 'A new wave of love, emotional fulfillment, and compassion overflows.', zh: '新的爱的浪潮、情感满足和慈悲之心溢出。' },
      reversed: { en: 'Emotional emptiness or blocked feelings prevent connection.', zh: '情感空虚或被阻塞的感受阻碍了联系。' },
    },
    keywords: { en: ['love', 'compassion', 'new feelings'], zh: ['爱', '慈悲', '新感情'] },
  },
  {
    id: 37,
    name: { en: 'Two of Cups', zh: '圣杯二' },
    arcana: 'minor',
    suit: 'cups',
    number: 2,
    imageUrl: '/tarot/cups/02.webp',
    meanings: {
      upright: { en: 'A mutual attraction and unified partnership form a deep bond.', zh: '相互的吸引和统一的伙伴关系形成了深厚的纽带。' },
      reversed: { en: 'Imbalance in a relationship or a broken connection.', zh: '关系中的不平衡或断裂的联系。' },
    },
    keywords: { en: ['partnership', 'attraction', 'unity'], zh: ['伙伴关系', '吸引', '统一'] },
  },
  {
    id: 38,
    name: { en: 'Three of Cups', zh: '圣杯三' },
    arcana: 'minor',
    suit: 'cups',
    number: 3,
    imageUrl: '/tarot/cups/03.webp',
    meanings: {
      upright: { en: 'Joyful celebration, friendship, and community lift your spirits.', zh: '欢乐的庆祝、友谊和社区提升了你的精神。' },
      reversed: { en: 'Overindulgence, gossip, or exclusion from a social group.', zh: '过度放纵、流言蜚语或被社交圈排斥。' },
    },
    keywords: { en: ['celebration', 'friendship', 'community'], zh: ['庆祝', '友谊', '社区'] },
  },
  {
    id: 39,
    name: { en: 'Four of Cups', zh: '圣杯四' },
    arcana: 'minor',
    suit: 'cups',
    number: 4,
    imageUrl: '/tarot/cups/04.webp',
    meanings: {
      upright: { en: 'Contemplation and apathy cause you to overlook an offered opportunity.', zh: '沉思和冷漠使你忽略了一个提供的机会。' },
      reversed: { en: 'Renewed motivation or acceptance of a previously ignored offer.', zh: '重新的动力或接受之前忽略的提议。' },
    },
    keywords: { en: ['contemplation', 'apathy', 'reevaluation'], zh: ['沉思', '冷漠', '重新评估'] },
  },
  {
    id: 40,
    name: { en: 'Five of Cups', zh: '圣杯五' },
    arcana: 'minor',
    suit: 'cups',
    number: 5,
    imageUrl: '/tarot/cups/05.webp',
    meanings: {
      upright: { en: 'Grief and regret over loss overshadow what still remains.', zh: '对失去的悲伤和遗憾掩盖了仍然存在的东西。' },
      reversed: { en: 'Moving on from grief and finding acceptance after loss.', zh: '从悲伤中走出来，在失去后找到接受。' },
    },
    keywords: { en: ['grief', 'regret', 'loss'], zh: ['悲伤', '遗憾', '失去'] },
  },
  {
    id: 41,
    name: { en: 'Six of Cups', zh: '圣杯六' },
    arcana: 'minor',
    suit: 'cups',
    number: 6,
    imageUrl: '/tarot/cups/06.webp',
    meanings: {
      upright: { en: 'Nostalgia, childhood memories, and innocent joy warm your heart.', zh: '怀旧、童年回忆和纯真的快乐温暖了你的心。' },
      reversed: { en: 'Living in the past or unrealistic romanticization of memories.', zh: '活在过去或对回忆的不切实际的浪漫化。' },
    },
    keywords: { en: ['nostalgia', 'innocence', 'memories'], zh: ['怀旧', '纯真', '回忆'] },
  },
  {
    id: 42,
    name: { en: 'Seven of Cups', zh: '圣杯七' },
    arcana: 'minor',
    suit: 'cups',
    number: 7,
    imageUrl: '/tarot/cups/07.webp',
    meanings: {
      upright: { en: 'Fantasy, wishful thinking, and many choices cloud your judgment.', zh: '幻想、一厢情愿和众多选择模糊了你的判断。' },
      reversed: { en: 'Clarity of purpose emerges from overwhelming options.', zh: '目标的清晰从令人眼花缭乱的选择中浮现。' },
    },
    keywords: { en: ['fantasy', 'illusion', 'choices'], zh: ['幻想', '幻觉', '选择'] },
  },
  {
    id: 43,
    name: { en: 'Eight of Cups', zh: '圣杯八' },
    arcana: 'minor',
    suit: 'cups',
    number: 8,
    imageUrl: '/tarot/cups/08.webp',
    meanings: {
      upright: { en: 'Walking away from something unfulfilling to seek deeper meaning.', zh: '离开不令人满足的事物去寻求更深的意义。' },
      reversed: { en: 'Fear of abandoning the familiar or aimless drifting.', zh: '害怕放弃熟悉的事物或漫无目的地漂泊。' },
    },
    keywords: { en: ['departure', 'searching', 'disillusion'], zh: ['离开', '寻找', '幻灭'] },
  },
  {
    id: 44,
    name: { en: 'Nine of Cups', zh: '圣杯九' },
    arcana: 'minor',
    suit: 'cups',
    number: 9,
    imageUrl: '/tarot/cups/09.webp',
    meanings: {
      upright: { en: 'Wishes fulfilled and deep contentment bring emotional satisfaction.', zh: '愿望实现和深深的满足带来情感上的满意。' },
      reversed: { en: 'Materialism or superficial happiness masks deeper dissatisfaction.', zh: '物质主义或表面的幸福掩盖了更深的不满。' },
    },
    keywords: { en: ['wishes', 'contentment', 'satisfaction'], zh: ['愿望', '满足', '满意'] },
  },
  {
    id: 45,
    name: { en: 'Ten of Cups', zh: '圣杯十' },
    arcana: 'minor',
    suit: 'cups',
    number: 10,
    imageUrl: '/tarot/cups/10.webp',
    meanings: {
      upright: { en: 'Emotional bliss, family harmony, and lasting happiness are yours.', zh: '情感的幸福、家庭的和谐和持久的快乐属于你。' },
      reversed: { en: 'Family discord or unrealistic expectations of domestic bliss.', zh: '家庭不和或对家庭幸福的不切实际的期望。' },
    },
    keywords: { en: ['happiness', 'family', 'harmony'], zh: ['幸福', '家庭', '和谐'] },
  },
  {
    id: 46,
    name: { en: 'Page of Cups', zh: '圣杯侍从' },
    arcana: 'minor',
    suit: 'cups',
    number: 11,
    imageUrl: '/tarot/cups/page.webp',
    meanings: {
      upright: { en: 'A gentle messenger brings creative inspiration and emotional openness.', zh: '温柔的信使带来创造性的灵感和情感的开放。' },
      reversed: { en: 'Emotional immaturity or creative blocks stifle expression.', zh: '情感不成熟或创造力障碍压制了表达。' },
    },
    keywords: { en: ['creativity', 'sensitivity', 'messages'], zh: ['创造力', '敏感', '讯息'] },
  },
  {
    id: 47,
    name: { en: 'Knight of Cups', zh: '圣杯骑士' },
    arcana: 'minor',
    suit: 'cups',
    number: 12,
    imageUrl: '/tarot/cups/knight.webp',
    meanings: {
      upright: { en: 'A romantic idealist follows their heart with charm and grace.', zh: '一位浪漫的理想主义者带着魅力和优雅追随内心。' },
      reversed: { en: 'Moodiness, unrealistic romance, or emotional manipulation.', zh: '情绪化、不切实际的浪漫或情感操控。' },
    },
    keywords: { en: ['romance', 'charm', 'idealism'], zh: ['浪漫', '魅力', '理想主义'] },
  },
  {
    id: 48,
    name: { en: 'Queen of Cups', zh: '圣杯王后' },
    arcana: 'minor',
    suit: 'cups',
    number: 13,
    imageUrl: '/tarot/cups/queen.webp',
    meanings: {
      upright: { en: 'Emotional depth, intuitive wisdom, and compassionate care nurture all.', zh: '情感深度、直觉智慧和慈悲关怀滋养一切。' },
      reversed: { en: 'Emotional codependency or being overwhelmed by others\' feelings.', zh: '情感上的相互依赖或被他人的感受所淹没。' },
    },
    keywords: { en: ['empathy', 'intuition', 'nurturing'], zh: ['同理心', '直觉', '滋养'] },
  },
  {
    id: 49,
    name: { en: 'King of Cups', zh: '圣杯国王' },
    arcana: 'minor',
    suit: 'cups',
    number: 14,
    imageUrl: '/tarot/cups/king.webp',
    meanings: {
      upright: { en: 'Emotional maturity and diplomatic wisdom master the balance of heart and mind.', zh: '情感成熟和外交智慧掌握了心灵与理智的平衡。' },
      reversed: { en: 'Emotional repression or volatility beneath a calm exterior.', zh: '平静外表下的情感压抑或波动。' },
    },
    keywords: { en: ['diplomacy', 'emotional balance', 'wisdom'], zh: ['外交', '情感平衡', '智慧'] },
  },

  // ============================================================
  // MINOR ARCANA — SWORDS (50–63)
  // ============================================================
  {
    id: 50,
    name: { en: 'Ace of Swords', zh: '宝剑王牌' },
    arcana: 'minor',
    suit: 'swords',
    number: 1,
    imageUrl: '/tarot/swords/ace.webp',
    meanings: {
      upright: { en: 'A breakthrough of clarity and truth cuts through confusion.', zh: '清晰和真相的突破穿透了困惑。' },
      reversed: { en: 'Confusion, misinformation, or a clouded mind hinders decisions.', zh: '困惑、错误信息或混乱的头脑阻碍了决策。' },
    },
    keywords: { en: ['clarity', 'truth', 'breakthrough'], zh: ['清晰', '真相', '突破'] },
  },
  {
    id: 51,
    name: { en: 'Two of Swords', zh: '宝剑二' },
    arcana: 'minor',
    suit: 'swords',
    number: 2,
    imageUrl: '/tarot/swords/02.webp',
    meanings: {
      upright: { en: 'A difficult choice requires careful weighing of options in stalemate.', zh: '一个困难的选择需要在僵局中仔细权衡选项。' },
      reversed: { en: 'Information revealed or a decision finally made after indecision.', zh: '信息被揭示或在犹豫不决后终于做出了决定。' },
    },
    keywords: { en: ['indecision', 'stalemate', 'balance'], zh: ['犹豫', '僵局', '平衡'] },
  },
  {
    id: 52,
    name: { en: 'Three of Swords', zh: '宝剑三' },
    arcana: 'minor',
    suit: 'swords',
    number: 3,
    imageUrl: '/tarot/swords/03.webp',
    meanings: {
      upright: { en: 'Heartbreak, sorrow, and emotional pain demand to be felt and released.', zh: '心碎、悲伤和情感的痛苦需要被感受和释放。' },
      reversed: { en: 'Recovery from heartbreak or learning to forgive and heal.', zh: '从心碎中恢复或学会原谅和疗愈。' },
    },
    keywords: { en: ['heartbreak', 'sorrow', 'grief'], zh: ['心碎', '悲伤', '哀痛'] },
  },
  {
    id: 53,
    name: { en: 'Four of Swords', zh: '宝剑四' },
    arcana: 'minor',
    suit: 'swords',
    number: 4,
    imageUrl: '/tarot/swords/04.webp',
    meanings: {
      upright: { en: 'Rest, recovery, and mental retreat restore your depleted energy.', zh: '休息、恢复和精神上的退隐恢复你耗尽的能量。' },
      reversed: { en: 'Restlessness, burnout, or returning to action too soon.', zh: '不安、倦怠或过早地回到行动中。' },
    },
    keywords: { en: ['rest', 'recovery', 'contemplation'], zh: ['休息', '恢复', '沉思'] },
  },
  {
    id: 54,
    name: { en: 'Five of Swords', zh: '宝剑五' },
    arcana: 'minor',
    suit: 'swords',
    number: 5,
    imageUrl: '/tarot/swords/05.webp',
    meanings: {
      upright: { en: 'A hollow victory won through conflict leaves bitterness in its wake.', zh: '通过冲突赢得的空洞胜利留下了苦涩。' },
      reversed: { en: 'Reconciliation or walking away from a no-win situation.', zh: '和解或从无赢局面中抽身。' },
    },
    keywords: { en: ['conflict', 'defeat', 'hostility'], zh: ['冲突', '失败', '敌意'] },
  },
  {
    id: 55,
    name: { en: 'Six of Swords', zh: '宝剑六' },
    arcana: 'minor',
    suit: 'swords',
    number: 6,
    imageUrl: '/tarot/swords/06.webp',
    meanings: {
      upright: { en: 'Transition to calmer waters as you leave difficulties behind.', zh: '当你把困难抛在身后时，过渡到更平静的水域。' },
      reversed: { en: 'Resistance to necessary change or unresolved emotional baggage.', zh: '对必要变化的抗拒或未解决的情感包袱。' },
    },
    keywords: { en: ['transition', 'moving on', 'healing'], zh: ['过渡', '前行', '疗愈'] },
  },
  {
    id: 56,
    name: { en: 'Seven of Swords', zh: '宝剑七' },
    arcana: 'minor',
    suit: 'swords',
    number: 7,
    imageUrl: '/tarot/swords/07.webp',
    meanings: {
      upright: { en: 'Strategy and cunning are needed, but beware of deception.', zh: '需要策略和机智，但要小心欺骗。' },
      reversed: { en: 'Deception exposed or a confession that clears the air.', zh: '欺骗被揭露或坦白使空气清新。' },
    },
    keywords: { en: ['strategy', 'deception', 'cunning'], zh: ['策略', '欺骗', '机智'] },
  },
  {
    id: 57,
    name: { en: 'Eight of Swords', zh: '宝剑八' },
    arcana: 'minor',
    suit: 'swords',
    number: 8,
    imageUrl: '/tarot/swords/08.webp',
    meanings: {
      upright: { en: 'Self-imposed restrictions and negative thinking trap you in limitation.', zh: '自我设限和消极思维将你困在局限中。' },
      reversed: { en: 'Breaking free from mental prison and reclaiming personal power.', zh: '从精神牢笼中挣脱并重新获得个人力量。' },
    },
    keywords: { en: ['restriction', 'imprisonment', 'helplessness'], zh: ['限制', '禁锢', '无助'] },
  },
  {
    id: 58,
    name: { en: 'Nine of Swords', zh: '宝剑九' },
    arcana: 'minor',
    suit: 'swords',
    number: 9,
    imageUrl: '/tarot/swords/09.webp',
    meanings: {
      upright: { en: 'Anxiety, nightmares, and overwhelming worry disturb your peace.', zh: '焦虑、噩梦和压倒性的担忧扰乱了你的平静。' },
      reversed: { en: 'Finding hope after despair or releasing irrational fears.', zh: '在绝望后找到希望或释放非理性的恐惧。' },
    },
    keywords: { en: ['anxiety', 'worry', 'nightmares'], zh: ['焦虑', '担忧', '噩梦'] },
  },
  {
    id: 59,
    name: { en: 'Ten of Swords', zh: '宝剑十' },
    arcana: 'minor',
    suit: 'swords',
    number: 10,
    imageUrl: '/tarot/swords/10.webp',
    meanings: {
      upright: { en: 'A painful ending or betrayal marks rock bottom, but dawn approaches.', zh: '痛苦的结局或背叛标志着谷底，但黎明正在到来。' },
      reversed: { en: 'Recovery from rock bottom and the worst is finally over.', zh: '从谷底恢复，最糟糕的终于结束了。' },
    },
    keywords: { en: ['endings', 'betrayal', 'rock bottom'], zh: ['结局', '背叛', '谷底'] },
  },
  {
    id: 60,
    name: { en: 'Page of Swords', zh: '宝剑侍从' },
    arcana: 'minor',
    suit: 'swords',
    number: 11,
    imageUrl: '/tarot/swords/page.webp',
    meanings: {
      upright: { en: 'Curious intellect and a thirst for truth spark new ideas.', zh: '好奇的智慧和对真相的渴望激发了新想法。' },
      reversed: { en: 'Gossip, deception, or all talk with no follow-through.', zh: '流言、欺骗或光说不做。' },
    },
    keywords: { en: ['curiosity', 'intellect', 'vigilance'], zh: ['好奇', '智慧', '警觉'] },
  },
  {
    id: 61,
    name: { en: 'Knight of Swords', zh: '宝剑骑士' },
    arcana: 'minor',
    suit: 'swords',
    number: 12,
    imageUrl: '/tarot/swords/knight.webp',
    meanings: {
      upright: { en: 'Ambitious drive and sharp intellect charge forward with fierce determination.', zh: '雄心勃勃的驱动力和敏锐的智慧以猛烈的决心向前冲。' },
      reversed: { en: 'Reckless haste or cutting words cause unintended harm.', zh: '鲁莽的仓促或尖锐的言辞造成了意外的伤害。' },
    },
    keywords: { en: ['ambition', 'determination', 'speed'], zh: ['雄心', '决心', '速度'] },
  },
  {
    id: 62,
    name: { en: 'Queen of Swords', zh: '宝剑王后' },
    arcana: 'minor',
    suit: 'swords',
    number: 13,
    imageUrl: '/tarot/swords/queen.webp',
    meanings: {
      upright: { en: 'Clear perception and independent thinking cut through emotional fog.', zh: '清晰的洞察力和独立思考穿透了情感的迷雾。' },
      reversed: { en: 'Cold-heartedness or overly critical judgment pushes others away.', zh: '冷酷无情或过于苛刻的判断将他人推开。' },
    },
    keywords: { en: ['perception', 'independence', 'clarity'], zh: ['洞察力', '独立', '清晰'] },
  },
  {
    id: 63,
    name: { en: 'King of Swords', zh: '宝剑国王' },
    arcana: 'minor',
    suit: 'swords',
    number: 14,
    imageUrl: '/tarot/swords/king.webp',
    meanings: {
      upright: { en: 'Intellectual authority and ethical leadership command respect through reason.', zh: '智慧的权威和道德的领导力通过理性赢得尊重。' },
      reversed: { en: 'Abuse of intellectual power or manipulative, tyrannical thinking.', zh: '滥用智慧力量或操控性的、专制的思维。' },
    },
    keywords: { en: ['authority', 'intellect', 'ethics'], zh: ['权威', '智慧', '道德'] },
  },

  // ============================================================
  // MINOR ARCANA — PENTACLES (64–77)
  // ============================================================
  {
    id: 64,
    name: { en: 'Ace of Pentacles', zh: '星币王牌' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 1,
    imageUrl: '/tarot/pentacles/ace.webp',
    meanings: {
      upright: { en: 'A promising new opportunity for prosperity and material gain appears.', zh: '一个充满希望的繁荣和物质收益的新机会出现了。' },
      reversed: { en: 'A missed financial opportunity or poor planning wastes resources.', zh: '错失的财务机会或糟糕的规划浪费了资源。' },
    },
    keywords: { en: ['opportunity', 'prosperity', 'new venture'], zh: ['机会', '繁荣', '新事业'] },
  },
  {
    id: 65,
    name: { en: 'Two of Pentacles', zh: '星币二' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 2,
    imageUrl: '/tarot/pentacles/02.webp',
    meanings: {
      upright: { en: 'Adaptability and balance help you juggle multiple priorities skillfully.', zh: '适应力和平衡帮助你巧妙地兼顾多个优先事项。' },
      reversed: { en: 'Overwhelm from taking on too much or financial disorganization.', zh: '承担太多导致的不堪重负或财务混乱。' },
    },
    keywords: { en: ['balance', 'adaptability', 'priorities'], zh: ['平衡', '适应力', '优先事项'] },
  },
  {
    id: 66,
    name: { en: 'Three of Pentacles', zh: '星币三' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 3,
    imageUrl: '/tarot/pentacles/03.webp',
    meanings: {
      upright: { en: 'Teamwork, skilled collaboration, and craftsmanship produce excellent results.', zh: '团队合作、熟练的协作和精湛的工艺产生了卓越的成果。' },
      reversed: { en: 'Poor teamwork, lack of skill recognition, or misaligned goals.', zh: '糟糕的团队合作、缺乏技能认可或目标不一致。' },
    },
    keywords: { en: ['teamwork', 'craftsmanship', 'collaboration'], zh: ['团队合作', '工艺', '协作'] },
  },
  {
    id: 67,
    name: { en: 'Four of Pentacles', zh: '星币四' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 4,
    imageUrl: '/tarot/pentacles/04.webp',
    meanings: {
      upright: { en: 'Financial security through conservation, but beware of hoarding.', zh: '通过保守实现财务安全，但要小心囤积。' },
      reversed: { en: 'Generosity after releasing attachment or reckless spending.', zh: '放下执着后的慷慨或鲁莽消费。' },
    },
    keywords: { en: ['security', 'conservation', 'control'], zh: ['安全', '保守', '控制'] },
  },
  {
    id: 68,
    name: { en: 'Five of Pentacles', zh: '星币五' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 5,
    imageUrl: '/tarot/pentacles/05.webp',
    meanings: {
      upright: { en: 'Financial hardship and feeling left out in the cold test your resilience.', zh: '经济困难和被冷落的感觉考验着你的韧性。' },
      reversed: { en: 'Recovery from financial loss or finding help in difficult times.', zh: '从经济损失中恢复或在困难时期找到帮助。' },
    },
    keywords: { en: ['hardship', 'poverty', 'isolation'], zh: ['困难', '贫穷', '孤立'] },
  },
  {
    id: 69,
    name: { en: 'Six of Pentacles', zh: '星币六' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 6,
    imageUrl: '/tarot/pentacles/06.webp',
    meanings: {
      upright: { en: 'Generosity and fair sharing of wealth create balanced exchange.', zh: '慷慨和公平分享财富创造了平衡的交换。' },
      reversed: { en: 'Strings attached to gifts or inequality in giving and receiving.', zh: '礼物附带条件或给予和接受的不平等。' },
    },
    keywords: { en: ['generosity', 'charity', 'sharing'], zh: ['慷慨', '慈善', '分享'] },
  },
  {
    id: 70,
    name: { en: 'Seven of Pentacles', zh: '星币七' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 7,
    imageUrl: '/tarot/pentacles/07.webp',
    meanings: {
      upright: { en: 'Patience during a period of assessment reveals the fruits of your labor.', zh: '在评估期间的耐心揭示了你劳动的成果。' },
      reversed: { en: 'Impatience with slow progress or poor return on investment.', zh: '对缓慢进展的不耐烦或投资回报不佳。' },
    },
    keywords: { en: ['patience', 'assessment', 'investment'], zh: ['耐心', '评估', '投资'] },
  },
  {
    id: 71,
    name: { en: 'Eight of Pentacles', zh: '星币八' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 8,
    imageUrl: '/tarot/pentacles/08.webp',
    meanings: {
      upright: { en: 'Diligent work and mastery of a craft reward your dedicated effort.', zh: '勤奋工作和精通技艺回报了你的专注努力。' },
      reversed: { en: 'Perfectionism, lack of motivation, or misdirected effort.', zh: '完美主义、缺乏动力或方向错误的努力。' },
    },
    keywords: { en: ['diligence', 'mastery', 'skill'], zh: ['勤奋', '精通', '技能'] },
  },
  {
    id: 72,
    name: { en: 'Nine of Pentacles', zh: '星币九' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 9,
    imageUrl: '/tarot/pentacles/09.webp',
    meanings: {
      upright: { en: 'Self-sufficiency, luxury, and refinement reflect your hard-earned success.', zh: '自给自足、奢华和精致反映了你来之不易的成功。' },
      reversed: { en: 'Financial dependence on others or overindulgence in luxury.', zh: '在经济上依赖他人或过度沉溺于奢华。' },
    },
    keywords: { en: ['luxury', 'self-sufficiency', 'refinement'], zh: ['奢华', '自给自足', '精致'] },
  },
  {
    id: 73,
    name: { en: 'Ten of Pentacles', zh: '星币十' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 10,
    imageUrl: '/tarot/pentacles/10.webp',
    meanings: {
      upright: { en: 'Lasting wealth, family legacy, and long-term financial security are established.', zh: '持久的财富、家族遗产和长期财务安全已经建立。' },
      reversed: { en: 'Family financial disputes or loss of a long-standing legacy.', zh: '家庭财务纠纷或失去长期的遗产。' },
    },
    keywords: { en: ['wealth', 'legacy', 'inheritance'], zh: ['财富', '遗产', '继承'] },
  },
  {
    id: 74,
    name: { en: 'Page of Pentacles', zh: '星币侍从' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 11,
    imageUrl: '/tarot/pentacles/page.webp',
    meanings: {
      upright: { en: 'An eager student embraces new skills and practical opportunities.', zh: '一个渴望学习的学生拥抱新技能和实际机会。' },
      reversed: { en: 'Lack of progress, procrastination, or unrealistic financial plans.', zh: '缺乏进展、拖延或不切实际的财务计划。' },
    },
    keywords: { en: ['ambition', 'studiousness', 'opportunity'], zh: ['抱负', '勤学', '机会'] },
  },
  {
    id: 75,
    name: { en: 'Knight of Pentacles', zh: '星币骑士' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 12,
    imageUrl: '/tarot/pentacles/knight.webp',
    meanings: {
      upright: { en: 'Steady, methodical effort and unwavering reliability ensure success.', zh: '稳定、有条不紊的努力和坚定的可靠性确保成功。' },
      reversed: { en: 'Stubbornness, stagnation, or obsessive perfectionism slows you down.', zh: '固执、停滞或强迫性的完美主义拖慢了你。' },
    },
    keywords: { en: ['reliability', 'diligence', 'patience'], zh: ['可靠', '勤奋', '耐心'] },
  },
  {
    id: 76,
    name: { en: 'Queen of Pentacles', zh: '星币王后' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 13,
    imageUrl: '/tarot/pentacles/queen.webp',
    meanings: {
      upright: { en: 'Practical nurturing and financial savvy create a warm, abundant home.', zh: '务实的养育和财务智慧创造了一个温暖、富足的家。' },
      reversed: { en: 'Neglect of home life or financial anxiety despite outward success.', zh: '忽视家庭生活或尽管外在成功却有财务焦虑。' },
    },
    keywords: { en: ['nurturing', 'practicality', 'abundance'], zh: ['养育', '务实', '丰富'] },
  },
  {
    id: 77,
    name: { en: 'King of Pentacles', zh: '星币国王' },
    arcana: 'minor',
    suit: 'pentacles',
    number: 14,
    imageUrl: '/tarot/pentacles/king.webp',
    meanings: {
      upright: { en: 'Wealth mastery and grounded leadership build enduring material success.', zh: '财富掌控和踏实的领导力建立了持久的物质成功。' },
      reversed: { en: 'Greed, materialism, or financial mismanagement erode stability.', zh: '贪婪、物质主义或财务管理不善侵蚀了稳定。' },
    },
    keywords: { en: ['wealth', 'business', 'discipline'], zh: ['财富', '事业', '纪律'] },
  },
]

/**
 * Get a single card by ID.
 * Throws if the card is not found.
 */
export function getCard(id: number): TarotCard {
  const card = TAROT_CARDS[id]
  if (!card) {
    throw new Error(`Tarot card with id ${id} not found`)
  }
  return card
}

/**
 * Draw `count` random cards from the deck using Fisher-Yates shuffle.
 * Each card has a 30% chance of being reversed.
 */
export function drawCards(count: number): { cardId: number; reversed: boolean }[] {
  const indices = Array.from({ length: 78 }, (_, i) => i)

  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return indices.slice(0, count).map((cardId) => ({
    cardId,
    reversed: Math.random() < 0.3,
  }))
}
