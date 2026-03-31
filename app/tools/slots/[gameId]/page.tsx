'use client'
import { use, useState, useRef } from 'react'
import { SlotsProvider, useSlots } from '@/tools/slots/slots-provider'
import { getGameById } from '@/tools/slots/games'
import { ReelBoard } from '@/tools/slots/components/machine/reel-board'
import { BetControls } from '@/tools/slots/components/machine/bet-controls'
import { PaytableModal } from '@/tools/slots/components/machine/paytable-modal'
import { AutoSpinDialog } from '@/tools/slots/components/machine/auto-spin-dialog'
import { BonusOverlay } from '@/tools/slots/components/bonus/bonus-overlay'
import { FreeSpinsBonus } from '@/tools/slots/components/bonus/free-spins-bonus'
import { PickPrizeBonus } from '@/tools/slots/components/bonus/pick-prize-bonus'
import { WheelBonus } from '@/tools/slots/components/bonus/wheel-bonus'
import { ExpandingWildsBonus } from '@/tools/slots/components/bonus/expanding-wilds-bonus'
import { CoinDisplay } from '@/tools/slots/components/lobby/coin-display'
import { CoinShower, type CoinShowerRef } from '@/tools/slots/components/effects/coin-shower'
import { Fireworks, type FireworksRef } from '@/tools/slots/components/effects/fireworks'
import { WinBanner } from '@/tools/slots/components/effects/win-banner'
import { useSpin } from '@/tools/slots/hooks/use-spin'
import type { BonusType, BonusProps, WinTier } from '@/tools/slots/slots-types'
import { getWinTier } from '@/tools/slots/slots-types'
import Link from 'next/link'

const BONUS_COMPONENTS: Record<BonusType, React.ComponentType<BonusProps>> = {
  free_spins: FreeSpinsBonus,
  pick_prize: PickPrizeBonus,
  wheel: WheelBonus,
  expanding_wilds: ExpandingWildsBonus,
}

function GameNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-[#0d0519] text-white">
      <p className="text-lg mb-4">Game not found</p>
      <Link href="/tools/slots" className="text-[#d4a052] hover:underline">Back to Lobby</Link>
    </div>
  )
}

function GameInner({ gameId }: { gameId: string }) {
  const config = getGameById(gameId)

  if (!config) return <GameNotFound />

  return <GamePlayer config={config} />
}

function GamePlayer({ config }: { config: import('@/tools/slots/slots-types').SlotGameConfig }) {
  const { t } = useSlots()
  const [betPerLine, setBetPerLine] = useState(10)
  const [showPaytable, setShowPaytable] = useState(false)
  const [showAutoSpin, setShowAutoSpin] = useState(false)
  const [showBonusOverlay, setShowBonusOverlay] = useState(false)

  const coinShowerRef = useRef<CoinShowerRef>(null)
  const fireworksRef = useRef<FireworksRef>(null)
  const [winBannerVisible, setWinBannerVisible] = useState(false)
  const [lastWinTier, setLastWinTier] = useState<WinTier>('none')
  const [lastWinAmount, setLastWinAmount] = useState(0)

  const {
    spinning, result, bonusActive, totalBet,
    doSpin, onAllReelsStopped, onBonusComplete,
  } = useSpin({ config, betPerLine })

  const handleAllReelsStopped = () => {
    onAllReelsStopped()

    if (result?.totalWin && result.totalWin > 0) {
      const tier = getWinTier(result.totalWin, totalBet)
      setLastWinTier(tier)
      setLastWinAmount(result.totalWin)
      if (tier === 'small') {
        // just symbol highlights
      } else if (tier === 'medium' || tier === 'big') {
        coinShowerRef.current?.fire('big')
        setWinBannerVisible(true)
      } else if (tier === 'mega') {
        coinShowerRef.current?.fire('mega')
        fireworksRef.current?.fire()
        setWinBannerVisible(true)
      }
    }

    if (result?.bonusTriggered) {
      setShowBonusOverlay(true)
    }
  }

  const BonusComponent = BONUS_COMPONENTS[config.bonusConfig.type]

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: config.theme.backgroundImage ? `url(${config.theme.backgroundImage})` : undefined, backgroundColor: config.theme.backgroundColor }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-[#d4a052]/30 bg-[#1a0a2e]/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/tools/slots" className="text-[#f0d080]/80 hover:text-[#f0d080]">&larr;</Link>
          <h1 className="text-lg font-bold text-[#f0d080]">{config.name}</h1>
        </div>
        <CoinDisplay />
      </header>

      {/* Reel area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg relative">
          <ReelBoard
            config={config}
            result={result}
            spinning={spinning}
            onAllReelsStopped={handleAllReelsStopped}
          />

          {/* Effects layer */}
          <CoinShower ref={coinShowerRef} />
          <Fireworks ref={fireworksRef} />
          <WinBanner
            tier={lastWinTier}
            amount={lastWinAmount}
            visible={winBannerVisible}
            onDismiss={() => setWinBannerVisible(false)}
          />
        </div>

        {/* Paytable button */}
        <button
          onClick={() => setShowPaytable(true)}
          className="mt-3 text-xs text-[#d4a052]/60 hover:text-[#f0d080] transition-colors"
        >
          {t.machine.paytable}
        </button>
      </div>

      {/* Controls */}
      <div className="relative z-10 shrink-0 pb-4 px-4 bg-[#0d0519]/80 backdrop-blur-sm">
        <BetControls
          config={config}
          betPerLine={betPerLine}
          lastWin={lastWinAmount}
          onBetChange={setBetPerLine}
          onSpin={doSpin}
          onAutoSpin={() => setShowAutoSpin(true)}
          onMaxBet={() => setBetPerLine(config.betSteps[config.betSteps.length - 1])}
          spinning={spinning}
          autoSpinning={false}
        />
      </div>

      {/* Modals */}
      <PaytableModal config={config} open={showPaytable} onClose={() => setShowPaytable(false)} />
      <AutoSpinDialog open={showAutoSpin} onClose={() => setShowAutoSpin(false)} onStart={() => {}} />

      {/* Bonus */}
      <BonusOverlay visible={showBonusOverlay} onAnimationComplete={() => setShowBonusOverlay(false)} />
      {bonusActive && (
        <BonusComponent
          config={config}
          triggerScatterCount={result?.scatterCount || 3}
          betAmount={betPerLine}
          onComplete={onBonusComplete}
        />
      )}
    </div>
  )
}

export default function SlotGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params)
  return (
    <SlotsProvider>
      <GameInner gameId={gameId} />
    </SlotsProvider>
  )
}
