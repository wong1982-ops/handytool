import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  pageTitle: '工具箱赌场',
  pageDescription: '免费畅玩老虎机，真实赌场体验',

  lobby: {
    title: '工具箱赌场',
    dailyBonus: '每日奖励',
    dayStreak: '连续第 {day} 天！',
    claim: '领取 {amount}',
    claimed: '已领取！{hours}小时后再来',
    tabs: {
      lobby: '大厅',
      friends: '好友',
      leaderboard: '排行榜',
      gifts: '礼物',
      shop: '商店',
    },
  },

  machine: {
    spin: '旋转',
    stop: '停止',
    auto: '自动',
    maxBet: '最大注',
    lines: '线',
    ways: '路',
    betPerLine: '每线注额',
    totalBet: '总注额',
    win: '赢',
    bigWin: '大赢！',
    megaWin: '超级大赢！',
    bonus: '奖金！',
    freeSpins: '免费旋转',
    paytable: '赔率表',
    insufficientCoins: '金币不足！',
    autoSpins: '自动旋转',
    spinsRemaining: '剩余 {count} 次',
    stopOnWin: '大赢时停止',
    stopOnBonus: '触发奖金时停止',
  },

  bonus: {
    freeSpinsAwarded: '获得 {count} 次免费旋转！',
    multiplier: '{x}倍乘数',
    retrigger: '再次触发！+{count} 次',
    pickPrize: '选择 {count} 个物品！',
    wheelSpin: '转动转盘！',
    expandingWilds: '扩展百搭！',
    totalWin: '奖金总计：{amount}',
    spinRemaining: '剩余 {count} 次',
  },

  social: {
    friends: '好友',
    addFriend: '添加好友',
    usernamePlaceholder: '输入用户名',
    sendRequest: '发送请求',
    pending: '待确认',
    accept: '接受',
    decline: '拒绝',
    online: '在线',
    offline: '离线',
    noFriends: '还没有好友，快去添加吧！',

    leaderboard: '排行榜',
    weekly: '本周',
    allTime: '历史',
    friendsOnly: '好友',
    rank: '排名',
    coinsWon: '赢得金币',
    biggestWin: '最大赢额',

    gifts: '礼物',
    sendGift: '送礼',
    claimAll: '全部领取',
    giftSent: '礼物已发送！',
    noGifts: '暂无礼物',
    giftAmount: '1,000 金币',
  },

  shop: {
    title: '金币商店',
    buy: '购买',
    bonus: '+{percent}% 额外',
    popular: '热门',
    bestValue: '最划算',
  },

  settings: {
    sound: '音效',
    signIn: '登录以保存进度',
  },
} as const
