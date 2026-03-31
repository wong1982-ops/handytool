import type { SlotGameConfig } from '../slots-types'
import { wildStampede } from './wild-stampede'
import { nileQueen } from './nile-queen'
import { goldenDragon } from './golden-dragon'
import { tikiFire } from './tiki-fire'
import { oceanTreasure } from './ocean-treasure'
import { lucky88 } from './lucky-88'
import { sakuraGarden } from './sakura-garden'
import { chilliFiesta } from './chilli-fiesta'
import { fortuneClover } from './fortune-clover'
import { safariKing } from './safari-king'

export const ALL_GAMES: SlotGameConfig[] = [
  wildStampede,
  nileQueen,
  goldenDragon,
  tikiFire,
  oceanTreasure,
  lucky88,
  sakuraGarden,
  chilliFiesta,
  fortuneClover,
  safariKing,
]

export function getGameById(id: string): SlotGameConfig | undefined {
  return ALL_GAMES.find((g) => g.id === id)
}

export {
  wildStampede,
  nileQueen,
  goldenDragon,
  tikiFire,
  oceanTreasure,
  lucky88,
  sakuraGarden,
  chilliFiesta,
  fortuneClover,
  safariKing,
}
