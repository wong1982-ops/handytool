'use client'
import { use, useState } from 'react'
import { SlotsProvider, useSlots } from '@/tools/slots/slots-provider'
import { getGameById } from '@/tools/slots/games'
import { ReelBoard } from '@/tools/slots/components/machine/reel-board'
import { BetControls } from '@/tools/slots/components/machine/bet-controls'
import { WinDisplay } from '@/tools/slots/components/machine/win-display'
import { PaytableModal } from '@/tools/slots/components/machine/paytable-modal'
import { AutoSpinDialog } from '@/tools/slots/components/machine/auto-spin-dialog'
import { BonusOverlay } from '@/tools/slots/components/bonus/bonus-overlay'
import { FreeSpinsBonus } from '@/tools/slots/components/bonus/free-spins-bonus'
import { PickPrizeBonus } from '@/tools/slots/components/bonus/pick-prize-bonus'
import { WheelBonus } from '@/tools/slots/components/bonus/wheel-bonus'
import { ExpandingWildsBonus } from '@/tools/slots/components/bonus/expanding-wilds-bonus'
import { CoinDisplay } from '@/tools/slots/components/lobby/coin-display'
import { useSpin } from '@/tools/slots/hooks/use-spin'
import type { BonusType, BonusProps } from '@/tools/slots/slots-types'
import Link from 'next/link'

const BONUS_COMPONENTS: Record<BonusType, React.ComponentType<BonusProps>> = {
  free_spins: FreeSpinsBonus,
  pick_prize: PickPrizeBonus,
  wheel: WheelBonus,
  expanding_wilds: ExpandingWildsBonus,
}

function GameInner({ gameId }: { gameId: string }) {
  const config = getGameById(gameId)
  const { t } = useSlots()
  const [betPerLine, setBetPerLine] = useState(10)
  const [showPaytable, setShowPaytable] = useState(false)
  const [showAutoSpin, setShowAutoSpin] = useState(false)
  const [showBonusOverlay, setShowBonusOverlay] = useState(false)

  const {
    spinning, result, showWin, bonusActive, totalBet,
    doSpin, onAllReelsStopped, onBonusComplete,
  } = useSpin({ config: config!, betPerLine })

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-gray-950 text-white">
        <p className="text-lg mb-4">Game not found</p>
        <Link href="/tools/slots" className="text-blue-400 hover:underline">Back to Lobby</Link>
      </div>
    )
  }

  const handleAllReelsStopped = () => {
    onAllReelsStopped()
    if (result?.bonusTriggered) {
      setShowBonusOverlay(true)
    }
  }

  const BonusComponent = BONUS_COMPONENTS[config.bonusConfig.type]

  return (
    <div className="flex flex-col h-[100dvh]" style={{ backgroundColor: config.theme.backgroundColor }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800/50 shrink-0" style={{ background: config.theme.headerGradient }}>
        <div className="flex items-center gap-3">
          <Link href="/tools/slots" className="text-white/80 hover:text-white">← </Link>
          <h1 className="text-lg font-bold text-white">{config.name}</h1>
        </div>
        <CoinDisplay />
      </header>

      {/* Reel area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-lg relative">
          <ReelBoard
            config={config}
            result={result}
            spinning={spinning}
            onAllReelsStopped={handleAllReelsStopped}
          />
          <WinDisplay
            winAmount={result?.totalWin || 0}
            totalBet={totalBet}
            visible={showWin}
          />
        </div>

        {/* Paytable button */}
        <button
          onClick={() => setShowPaytable(true)}
          className="mt-3 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          ℹ️ {t.machine.paytable}
        </button>
      </div>

      {/* Controls */}
      <div className="shrink-0 pb-4 px-4" style={{ backgroundColor: config.theme.backgroundColor }}>
        <BetControls
          config={config}
          betPerLine={betPerLine}
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
