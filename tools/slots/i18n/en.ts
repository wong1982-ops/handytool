export const en = {
  pageTitle: 'Toolk1t Casino',
  pageDescription: 'Free-to-play slot machines with authentic casino experience',

  lobby: {
    title: 'Toolk1t Casino',
    dailyBonus: 'Daily Bonus',
    dayStreak: 'Day {day} Streak!',
    claim: 'Claim {amount}',
    claimed: 'Claimed! Next in {hours}h',
    tabs: {
      lobby: 'Lobby',
      friends: 'Friends',
      leaderboard: 'Leaderboard',
      gifts: 'Gifts',
      shop: 'Shop',
    },
  },

  machine: {
    spin: 'SPIN',
    stop: 'STOP',
    auto: 'Auto',
    maxBet: 'Max Bet',
    lines: 'Lines',
    ways: 'Ways',
    betPerLine: 'Bet/Line',
    totalBet: 'Total Bet',
    win: 'WIN',
    bigWin: 'BIG WIN!',
    megaWin: 'MEGA WIN!',
    bonus: 'BONUS!',
    freeSpins: 'FREE SPINS',
    paytable: 'Paytable',
    insufficientCoins: 'Not enough coins!',
    autoSpins: 'Auto Spins',
    spinsRemaining: '{count} spins remaining',
    stopOnWin: 'Stop on big win',
    stopOnBonus: 'Stop on bonus',
  },

  bonus: {
    freeSpinsAwarded: '{count} Free Spins!',
    multiplier: '{x}x Multiplier',
    retrigger: 'Retrigger! +{count} spins',
    pickPrize: 'Pick {count} items!',
    wheelSpin: 'Spin the Wheel!',
    expandingWilds: 'Expanding Wilds!',
    totalWin: 'Bonus Total: {amount}',
    spinRemaining: '{count} spins left',
  },

  social: {
    friends: 'Friends',
    addFriend: 'Add Friend',
    usernamePlaceholder: 'Enter username',
    sendRequest: 'Send Request',
    pending: 'Pending',
    accept: 'Accept',
    decline: 'Decline',
    online: 'Online',
    offline: 'Offline',
    noFriends: 'No friends yet. Add some!',

    leaderboard: 'Leaderboard',
    weekly: 'Weekly',
    allTime: 'All Time',
    friendsOnly: 'Friends',
    rank: 'Rank',
    coinsWon: 'Coins Won',
    biggestWin: 'Biggest Win',

    gifts: 'Gifts',
    sendGift: 'Send Gift',
    claimAll: 'Claim All',
    giftSent: 'Gift sent!',
    noGifts: 'No gifts to claim',
    giftAmount: '1,000 coins',
  },

  shop: {
    title: 'Coin Shop',
    buy: 'Buy',
    bonus: '+{percent}% bonus',
    popular: 'Popular',
    bestValue: 'Best Value',
  },

  settings: {
    sound: 'Sound Effects',
    signIn: 'Sign in to save progress',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type I18nStrings = DeepStringify<typeof en>
